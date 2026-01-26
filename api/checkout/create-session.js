import Stripe from 'stripe';
import { sql } from '@vercel/postgres';
import { verifyToken } from '../../lib/auth.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const payload = verifyToken(authHeader.substring(7));
  if (!payload) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  try {
    const userResult = await sql`
      SELECT email, stripe_customer_id, has_purchased FROM users WHERE id = ${payload.userId}
    `;
    const user = userResult.rows[0];

    if (user.has_purchased) {
      return res.status(400).json({ error: 'Already purchased' });
    }

    let customerId = user.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: payload.userId.toString() }
      });
      customerId = customer.id;

      await sql`
        UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${payload.userId}
      `;
    }

    // One-time payment (not subscription)
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin || process.env.APP_URL}/?payment=success`,
      cancel_url: `${req.headers.origin || process.env.APP_URL}/?payment=cancelled`,
      metadata: {
        userId: payload.userId.toString()
      }
    });

    return res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
}
