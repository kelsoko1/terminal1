'use client';

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { Progress } from '@/components/ui/progress';

interface AllocationItem {
  name: string;
  value: number;
  color: string;
}

interface MobilePortfolioAllocationProps {
  data: AllocationItem[];
  formatCurrency: (value: number) => string;
  totalPortfolioValue: number;
}

export function MobilePortfolioAllocation({
  data,
  formatCurrency,
  totalPortfolioValue
}: MobilePortfolioAllocationProps) {
  // Sort data by value descending
  const sortedData = [...data].sort((a, b) => b.value - a.value);
  
  return (
    <div className="space-y-3 md:space-y-4">
      <div className="h-[200px] md:h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              wrapperStyle={{ fontSize: '10px', marginTop: '10px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-2 mt-2">
        {sortedData.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">{item.name}</span>
              <div className="text-right">
                <div>{formatCurrency(totalPortfolioValue * (item.value / 100))}</div>
                <div className="text-xs text-muted-foreground">{item.value.toFixed(1)}%</div>
              </div>
            </div>
            <Progress value={item.value} className="h-2" indicatorClassName={`bg-[${item.color}]`} />
          </div>
        ))}
      </div>
      
      <div className="border rounded-lg p-3 mt-4">
        <h4 className="text-sm font-medium mb-2">Diversification Tips</h4>
        <ul className="text-xs md:text-sm space-y-2 list-disc pl-4">
          {data.length === 0 && (
            <li>Start building your portfolio by adding some assets.</li>
          )}
          {data.length === 1 && (
            <li>Consider diversifying your portfolio by adding more assets to reduce risk.</li>
          )}
          {data.length > 0 && data.sort((a, b) => b.value - a.value)[0].value > 50 && (
            <li>Your portfolio is heavily concentrated in {data.sort((a, b) => b.value - a.value)[0].name}. Consider reducing this position to lower risk.</li>
          )}
          {data.length > 0 && data.length < 5 && (
            <li>Adding more assets from different sectors could improve diversification.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
