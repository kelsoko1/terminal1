import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      // Get all DSE brokers
      const brokers = await prisma.dseBroker.findMany({
        orderBy: {
          name: 'asc'
        },
        include: {
          services: true,
          features: true,
          ratings: true
        }
      });

      // Format brokers data
      const formattedBrokers = brokers.map(broker => ({
        id: broker.id,
        name: broker.name,
        code: broker.code,
        minimumDeposit: broker.minimumDeposit,
        tradingFees: broker.tradingFees,
        services: broker.services.map(service => service.name),
        features: {
          onlineTrading: broker.features.onlineTrading,
          mobileApp: broker.features.mobileApp,
          research: broker.features.research,
          marginTrading: broker.features.marginTrading,
          advisoryServices: broker.features.advisoryServices
        },
        ratings: {
          execution: broker.ratings.execution,
          research: broker.ratings.research,
          platform: broker.ratings.platform,
          support: broker.ratings.support
        }
      }));

      return res.status(200).json(formattedBrokers);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('DSE brokers API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
