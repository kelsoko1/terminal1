# Production Cleanup Guide

This document outlines the steps to remove all demo/mock data from the application and prepare it for production deployment.

## 1. Database Configuration

- [x] Remove mock database implementation files
- [x] Update database index to use PostgreSQL only
- [x] Set `USE_MOCK_DB=false` in environment configuration

## 2. Component Cleanup

The following components need to be updated to use real data from the API instead of mock data:

### Social Components
- [ ] `components/social/TikTokStyleFeed.tsx`
- [ ] `components/social/TraderProfile.tsx`
- [ ] `components/social/UserProfileDialog.tsx`

### Trading Components
- [ ] `components/trading/BondTrading.tsx`
- [ ] `components/trading/ChartWidget.tsx`
- [ ] `components/trading/CommodityFutureTrading.tsx`
- [ ] `components/trading/CommodityTrading.tsx`
- [ ] `components/trading/FundTrading.tsx`
- [ ] `components/trading/FxFutureTrading.tsx`
- [ ] `components/trade/Chart.tsx`

### Broker Components
- [ ] `components/broker/accounting/DisbursementManagement.tsx`
- [ ] `components/broker/ads/AdsManagement.tsx`
- [ ] `components/broker/challenges/*`
- [ ] `components/broker/commodities/*`
- [ ] `components/broker/funds/FundManagement.tsx`
- [ ] `components/broker/fx/*`
- [ ] `components/broker/HRManagement.tsx`
- [ ] `components/broker/organizations/OrganizationManagement.tsx`

### Research Components
- [ ] `components/research/CompanyAnalysis.tsx`
- [ ] `components/research/EconomicCalendar.tsx`
- [ ] `components/research/MarketInsights.tsx`
- [ ] `components/research/ResearchBackoffice.tsx`
- [ ] `components/research/ResearchReports.tsx`
- [ ] `components/research/SectorAnalysis.tsx`

### Market Components
- [ ] `components/MarketOverview.tsx`
- [ ] `components/markets/MarketCalendar.tsx`

### Pages
- [ ] `app/portfolio/page.tsx`
- [ ] `app/trade/page.tsx`

## 3. Implementation Strategy

For each component that uses mock data, follow these steps:

1. **Identify the mock data** - Look for hardcoded arrays or objects that represent mock data
2. **Create API endpoints** - Implement proper API endpoints in the `/pages/api/` directory
3. **Update components** - Replace the mock data with API calls using `fetch`, `axios`, or your preferred HTTP client
4. **Add loading states** - Implement proper loading states while data is being fetched
5. **Add error handling** - Implement error handling for API calls

## 4. Example Transformation

### Before:
```tsx
// Mock data for commodities
const commodities = [
  { id: 1, name: 'Gold', price: 1800.50 },
  { id: 2, name: 'Silver', price: 25.75 },
  // ...more mock data
];

function CommodityList() {
  return (
    <div>
      {commodities.map(commodity => (
        <div key={commodity.id}>
          <h3>{commodity.name}</h3>
          <p>${commodity.price}</p>
        </div>
      ))}
    </div>
  );
}
```

### After:
```tsx
import { useState, useEffect } from 'react';
import { Commodity } from '../../types';

function CommodityList() {
  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    async function fetchCommodities() {
      try {
        setLoading(true);
        const response = await fetch('/api/commodities');
        
        if (!response.ok) {
          throw new Error('Failed to fetch commodities');
        }
        
        const data = await response.json();
        setCommodities(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching commodities:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCommodities();
  }, []);
  
  if (loading) return <div>Loading commodities...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {commodities.map(commodity => (
        <div key={commodity.id}>
          <h3>{commodity.name}</h3>
          <p>${commodity.price}</p>
        </div>
      ))}
    </div>
  );
}
```

## 5. Using the Local Database for Development

While removing mock data, you can leverage the local database solution we've implemented for development purposes:

1. Initialize the local database: `npm run local:setup`
2. Use the database services from `lib/database/databaseService.ts` in your components
3. The system will automatically switch between local and remote databases based on connectivity

## 6. Testing

After removing all mock data:

1. Test the application in offline mode to ensure it works with the local database
2. Test synchronization when coming back online
3. Test all components to ensure they're fetching real data
4. Verify that no hardcoded mock data remains in the codebase

## 7. Deployment Checklist

Before deploying to production:

- [ ] Verify all mock data has been removed
- [ ] Ensure all API endpoints are properly implemented
- [ ] Set `USE_MOCK_DB=false` in production environment
- [ ] Configure proper database connection strings
- [ ] Enable proper error logging
- [ ] Set up monitoring for API endpoints
- [ ] Test the application thoroughly in a staging environment
