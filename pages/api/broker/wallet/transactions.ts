import { NextApiRequest, NextApiResponse } from 'next';
import { adminDb, adminAuth } from '@/lib/firebase/admin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get Firebase ID token from Authorization header
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ')
      ? authHeader.replace('Bearer ', '')
      : null;
    if (!idToken) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    // Verify token and get user
    let decoded;
    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
    // Fetch user doc from Firestore
    const userSnap = await adminDb.collection('users').doc(decoded.uid).get();
    const userData = userSnap.data();
    if (!userData || (!userData.roles?.includes('BROKER') && !userData.roles?.includes('ADMIN'))) {
      return res.status(403).json({ error: 'Forbidden: Broker access required' });
    }

    if (req.method === 'GET') {
      // Get all broker transactions
      const txSnap = await adminDb.collection('brokerTransactions').orderBy('createdAt', 'desc').get();
      interface BrokerTransaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  createdAt: any;
  [key: string]: any;
}
const transactions = txSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as BrokerTransaction));
      // Calculate wallet summary
      let totalDeposits = 0;
      let totalDisbursements = 0;
      transactions.forEach(tx => {
        if (tx.type === 'DEPOSIT' && tx.status === 'COMPLETED') {
          totalDeposits += Number(tx.amount || 0);
        } else if (tx.type === 'DISBURSEMENT' && tx.status === 'COMPLETED') {
          totalDisbursements += Number(tx.amount || 0);
        }
      });
      const balance = totalDeposits - totalDisbursements;
      // Split deposits/disbursements
      const deposits = transactions.filter(tx => tx.type === 'DEPOSIT');
      const disbursements = transactions.filter(tx => tx.type === 'DISBURSEMENT');
      // Add last deposit/disbursement date
      const lastDeposit = deposits.length > 0 && deposits[0].createdAt ? (typeof deposits[0].createdAt.toDate === 'function' ? deposits[0].createdAt.toDate().toISOString() : deposits[0].createdAt) : null;
      const lastDisbursement = disbursements.length > 0 && disbursements[0].createdAt ? (typeof disbursements[0].createdAt.toDate === 'function' ? disbursements[0].createdAt.toDate().toISOString() : disbursements[0].createdAt) : null;
      return res.status(200).json({
        balance,
        totalDeposits,
        totalDisbursements,
        deposits,
        disbursements,
        lastDepositDate: lastDeposit,
        lastDisbursementDate: lastDisbursement
      });
    }
    // Only GET is implemented. Add POST logic for new transactions as needed.
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    return res.status(500).json({ error: 'Internal Server Error', details: (err as Error).message });
  }
}
