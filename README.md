# ApexValue PMO Advisor

A freemium PMO consulting platform that provides access to a curated knowledge base for use with Google NotebookLM.

**Business Model:**
- Free: Registration + NotebookLM workflow guidance
- Paid: Access to curated PMO knowledge base (one-time purchase)

## Tech Stack

- **Frontend:** Vanilla HTML/CSS/JS (single page app)
- **Backend:** Vercel Serverless Functions
- **Database:** Neon Postgres
- **Payments:** Stripe (one-time checkout)
- **Auth:** JWT tokens

## Setup Instructions

### 1. Create Neon Database

1. Go to [neon.tech](https://neon.tech) → Create account / Sign in
2. Create new project (note the name, e.g., `apexvalue-db`)
3. Copy the connection string

### 2. Run Database Schema

In Neon's SQL Editor, run:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  has_purchased BOOLEAN DEFAULT false,
  purchased_at TIMESTAMP,
  stripe_customer_id VARCHAR(255),
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id);
```

### 3. Create Stripe Product

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Products → Add Product
   - Name: "PMO Knowledge Base"
   - Price: $49 (or your price) - **One-time**
3. Copy the Price ID (starts with `price_`)

### 4. Set Up Stripe Webhook

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
4. Copy the Signing Secret (starts with `whsec_`)

### 5. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | `postgres://...` | Neon connection string |
| `JWT_SECRET` | `your-32-char-secret` | Random string for JWT signing |
| `STRIPE_SECRET_KEY` | `sk_test_...` or `sk_live_...` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Stripe webhook signing secret |
| `STRIPE_PRICE_ID` | `price_...` | Your product's price ID |
| `APP_URL` | `https://your-domain.vercel.app` | Your app URL |

### 6. Update Frontend Config

In `public/index.html`, update the CONFIG object:

```javascript
const CONFIG = {
    GOOGLE_DRIVE_LINK: 'https://drive.google.com/drive/folders/YOUR_FOLDER_ID',
    PRICE_DISPLAY: '$49'
};
```

### 7. Set Up Google Drive

1. Create a folder in Google Drive
2. Upload your PMO knowledge base PDFs
3. Share folder: "Anyone with link can view"
4. Copy the folder link
5. Update `GOOGLE_DRIVE_LINK` in the frontend config

### 8. Deploy to Vercel

```bash
# Install dependencies
npm install

# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/apexvalue-advisor.git
git push -u origin main

# Connect to Vercel
# Go to vercel.com → Import → Select your repo
```

## Project Structure

```
apexvalue-advisor/
├── api/
│   ├── auth/
│   │   ├── register.js    # User registration
│   │   ├── login.js       # User login
│   │   └── me.js          # Get current user
│   ├── checkout/
│   │   └── create-session.js  # Stripe checkout
│   ├── webhooks/
│   │   └── stripe.js      # Stripe webhook handler
│   └── health.js          # Health check endpoint
├── lib/
│   └── auth.js            # JWT utilities
├── public/
│   └── index.html         # Frontend SPA
├── package.json
├── vercel.json
└── README.md
```

## Testing

### Test Cards (Stripe Test Mode)

| Card | Result |
|------|--------|
| 4242 4242 4242 4242 | Success |
| 4000 0000 0000 0002 | Declined |

Use any future expiry date and any 3-digit CVC.

### API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/register` | POST | No | Create account |
| `/api/auth/login` | POST | No | Sign in |
| `/api/auth/me` | GET | Yes | Get current user |
| `/api/checkout/create-session` | POST | Yes | Create Stripe checkout |
| `/api/webhooks/stripe` | POST | No | Stripe webhook |
| `/api/health` | GET | No | Health check |

## Going Live

1. Switch Stripe to live mode (use `sk_live_` key)
2. Update webhook endpoint in Stripe for production URL
3. Create new webhook secret for production
4. Update environment variables in Vercel

## Support

Built by Sylvain PMO Consulting
