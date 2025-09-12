'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card } from '@/components/ui/card';

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
  hideOnMobile?: boolean;
  priorityOnMobile?: number; // Lower number = higher priority
}

interface ResponsiveDataTableProps {
  data: any[];
  columns: Column[];
  title?: string;
  emptyMessage?: string;
  className?: string;
  onRowClick?: (row: any) => void;
  isLoading?: boolean;
}

export function ResponsiveDataTable({
  data,
  columns,
  title,
  emptyMessage = 'No data available',
  className = '',
  onRowClick,
  isLoading = false
}: ResponsiveDataTableProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Column[]>(columns);
  
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      
      if (mobile) {
        // On mobile, filter out columns marked to hide and sort by priority
        const mobileColumns = columns
          .filter(col => !col.hideOnMobile)
          .sort((a, b) => {
            const aPriority = a.priorityOnMobile ?? 999;
            const bPriority = b.priorityOnMobile ?? 999;
            return aPriority - bPriority;
          })
          .slice(0, 3); // Limit to 3 columns on mobile for better readability
        
        setVisibleColumns(mobileColumns);
      } else {
        setVisibleColumns(columns);
      }
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [columns]);

  return (
    <Card className={`${className} overflow-hidden mobile-card`}>
      {title && (
        <div className="p-3 sm:p-4 border-b">
          <h3 className="text-base sm:text-lg font-medium">{title}</h3>
        </div>
      )}
      
      <div className="financial-table-container">
        <Table>
          <TableHeader>
            <TableRow>
              {visibleColumns.map((column) => (
                <TableHeader 
                  key={column.key}
                  className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'}`}
                >
                  {column.label}
                </TableHeader>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(3).fill(0).map((_, index) => (
                <TableRow key={`loading-${index}`}>
                  {visibleColumns.map((column) => (
                    <TableCell 
                      key={`loading-${index}-${column.key}`}
                      className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'}`}
                    >
                      <div className="h-4 bg-muted rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length > 0 ? (
              data.map((row, rowIndex) => (
                <TableRow 
                  key={rowIndex}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                >
                  {visibleColumns.map((column) => (
                    <TableCell 
                      key={`${rowIndex}-${column.key}`}
                      className={`${isMobile ? 'px-2 py-2 text-xs' : 'px-4 py-3 text-sm'}`}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell 
                  colSpan={visibleColumns.length} 
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {isMobile && columns.length > visibleColumns.length && (
        <div className="p-2 text-xs text-center text-muted-foreground border-t">
          Swipe horizontally to see more data
        </div>
      )}
    </Card>
  );
}
