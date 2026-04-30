import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory log for demonstration (replace with DB in production)
const activityLog: any[] = [];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const activity = req.body;
    activityLog.push(activity);
    // In production, save to database
    return res.status(200).json({ success: true });
  }
  if (req.method === 'GET') {
    // Return the last 50 activities
    return res.status(200).json({ activities: activityLog.slice(-50).reverse() });
  }
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
