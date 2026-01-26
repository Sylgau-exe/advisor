import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const result = await sql`SELECT NOW() as time`;
    return res.status(200).json({ 
      status: 'healthy', 
      database: 'connected',
      time: result.rows[0].time 
    });
  } catch (error) {
    return res.status(500).json({ 
      status: 'unhealthy', 
      error: error.message 
    });
  }
}
