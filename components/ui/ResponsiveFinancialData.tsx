'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@/lib/utils/currency';
import { getValueColor, getMarketStatus } from '@/lib/utils/market-colors';

interface ResponsiveFinancialDataProps {
  value: number;
  type?: 'currency' | 'percentage' | 'number';
  change?: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showChangeIndicator?: boolean;
  precision?: number;
  className?: string;
}

export function ResponsiveFinancialData({
  value,
  type = 'currency',
  change,
  label,
  size = 'md',
  showChangeIndicator = true,
  precision = 2,
  className = '',
}: ResponsiveFinancialDataProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIfMobile = () => setIsMobile(window.innerWidth < 640);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  const formatValue = () => {
    if (type === 'currency') {
      return formatCurrency(value);
    } else if (type === 'percentage') {
      return `${value.toFixed(precision)}%`;
    } else {
      return value.toLocaleString(undefined, { maximumFractionDigits: precision });
    }
  };

  const getChangeColor = () => {
    if (!change) return '';
    // Use the market-colors utility to determine the appropriate color
    return getValueColor(change, getMarketStatus());
  };

  const getChangeIndicator = () => {
    if (!change) return '';
    return change >= 0 ? '+' : '';
  };

  const getSizeClasses = () => {
    if (isMobile) {
      if (size === 'lg') return 'text-base sm:text-xl';
      if (size === 'md') return 'text-sm sm:text-base';
      return 'text-xs sm:text-sm';
    }
    
    if (size === 'lg') return 'text-xl';
    if (size === 'md') return 'text-base';
    return 'text-sm';
  };

  return (
    <div className={`financial-data-container ${className}`}>
      <div className={`financial-data ${getSizeClasses()} font-medium`}>
        {formatValue()}
        
        {change !== undefined && showChangeIndicator && (
          <span className={`ml-2 ${getChangeColor()} ${isMobile ? 'text-xs sm:text-sm' : 'text-sm'}`}>
            {getChangeIndicator()}{change.toFixed(precision)}%
          </span>
        )}
      </div>
      
      {label && (
        <div className={`financial-label ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground mt-1`}>
          {label}
        </div>
      )}
    </div>
  );
}
