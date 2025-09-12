'use client'

import { useSearchParams } from 'next/navigation';
import { 
  BrokerDashboard, 
  ClientManagement, 
  AccountingManagement,
  HRManagement,
  Reports,
  TransactionHistory
} from '@/components/broker';
import { StockManagement } from '@/components/broker/stocks/StockManagement';
import { BondManagement } from '@/components/broker/bonds/BondManagement';
import { FundManagement } from '@/components/broker/funds/FundManagement';
import { FuturesManagement } from '@/components/broker/commodities/FuturesManagement';
import { SubscriptionManagement } from '@/components/broker/subscriptions/SubscriptionManagement';
import { AdsManagement } from '@/components/broker/ads/AdsManagement';
import { ChallengeManagement } from '@/components/broker/challenges/ChallengeManagement';
import { OrganizationManagement } from '@/components/broker/organizations/OrganizationManagement';

export default function BrokerDashboardPage() {
  const searchParams = useSearchParams();
  const tab = searchParams ? searchParams.get('tab') : undefined;

  let content;
  switch (tab) {
    case 'organizations':
      content = <OrganizationManagement />; break;
    case 'clients':
      content = <ClientManagement />; break;
    case 'stocks':
      content = <StockManagement />; break;
    case 'challenges':
      content = <ChallengeManagement />; break;
    case 'bonds':
      content = <BondManagement />; break;
    case 'funds':
      content = <FundManagement />; break;
    case 'futures':
      content = <FuturesManagement />; break;
    case 'subscriptions':
      content = <SubscriptionManagement />; break;
    case 'ads':
      content = <AdsManagement />; break;
    case 'research':
      content = <div><h1 className="text-2xl font-bold mb-6">Research</h1><p>Research functionality coming soon.</p></div>; break;
    case 'reports':
      content = <Reports />; break;
    case 'hr':
      content = <HRManagement />; break;
    case 'accounting':
      content = <AccountingManagement />; break;
    default:
      content = <BrokerDashboard />;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-full md:max-w-5xl">
      {content}
    </div>
  );
}