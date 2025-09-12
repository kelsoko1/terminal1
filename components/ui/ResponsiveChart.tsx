'use client';

import { useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';

interface ResponsiveChartProps {
  children: React.ReactNode;
  title?: string;
  height?: number;
  mobileHeight?: number;
  className?: string;
  showLegend?: boolean;
  legendPosition?: 'top' | 'bottom';
}

export function ResponsiveChart({
  children,
  title,
  height = 400,
  mobileHeight = 250,
  className = '',
  showLegend = true,
  legendPosition = 'bottom'
}: ResponsiveChartProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [chartHeight, setChartHeight] = useState(height);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setChartHeight(mobile ? mobileHeight : height);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, [height, mobileHeight]);

  return (
    <Card className={`p-3 sm:p-4 ${className} mobile-card`}>
      {title && (
        <div className="mb-2 sm:mb-4">
          <h3 className="text-base sm:text-lg font-medium">{title}</h3>
        </div>
      )}
      
      <div 
        ref={containerRef}
        className="mobile-chart-container"
        style={{ 
          height: `${chartHeight}px`,
          transition: 'height 0.3s ease'
        }}
      >
        {children}
      </div>
      
      {showLegend && legendPosition === 'bottom' && (
        <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs sm:text-sm">
          {/* Legend content would be passed as children or through props */}
        </div>
      )}
    </Card>
  );
}
