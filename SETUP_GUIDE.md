# Mainyard - Quick Setup Guide

## Prerequisites

- Node.js 18+ (with pnpm or npm)
- PostgreSQL database
- Stripe account (for payments)

## Step 1: Install Dependencies

```bash
pnpm install
# or
npm install
```

## Step 2: Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/booking_platform"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-string-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (get from https://dashboard.stripe.com)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Platform Settings
NEXT_PUBLIC_PLATFORM_FEE_PERCENT=10
```

### Generate NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Step 3: Set Up Database

Push the Prisma schema to your database:

```bash
pnpm db:push
```

## Step 4: Seed Sample Data (Optional)

Populate the database with test data:

```bash
pnpm db:seed
```

**Test Credentials After Seeding:**
- Admin: `admin@example.com` / `admin123`
- Resident: `resident1@example.com` / `password123`
- Customer: `customer1@example.com` / `password123`

## Step 5: Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` in your browser.

## Project Structure Overview

```
app/                    # Next.js App Router pages
├── page.tsx           # Landing page
├── residents/         # Browse residents
├── resident/[slug]/   # Resident profile
├── dashboard/         # Resident dashboard
├── admin/             # Admin dashboard
├── book/[id]/         # Booking flow
└── api/               # API routes

components/            # Reusable React components
lib/                   # Utilities (auth, stripe, prisma)
server/actions/        # Server Actions
prisma/                # Database schema & migrations
```

## Key Features

### 1. User Authentication
- Email/password signup and signin
- Role-based access (Admin, Resident, Customer)
- JWT-based sessions with NextAuth

### 2. Resident Management
- Create and edit profiles
- Set weekly availability
- Manage booking status
- View earnings

### 3. Booking System
- Browse available residents
- Select date and time slots
- Stripe payment processing
- Booking confirmation

### 4. Admin Dashboard
- Approve/reject residents
- Feature residents
- View platform statistics
- Manage all bookings

## Common Tasks

### View Database

```bash
pnpm db:studio
```

Opens Prisma Studio at `http://localhost:5555`

### Build for Production

```bash
pnpm build
pnpm start
```

### Reset Database

```bash
pnpm db:push --force-reset
```

⚠️ Warning: This deletes all data!

## Stripe Integration

### Test Cards

| Card | Use | Number |
|------|-----|--------|
| Visa | Success | 4242 4242 4242 4242 |
| Visa | Decline | 4000 0000 0000 0002 |
| Amex | Success | 3782 822463 10005 |

**Expiry:** Any future date  
**CVC:** Any 3 digits

### Webhook Testing

For local development, use Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Troubleshooting

### Database Connection Error

- Verify PostgreSQL is running
- Check `DATABASE_URL` in `.env.local`
- Ensure database exists

### NextAuth Issues

- Generate a new `NEXTAUTH_SECRET`
- Clear browser cookies
- Check `NEXTAUTH_URL` matches your domain

### Stripe Errors

- Verify API keys are correct
- Check Stripe account is in test mode
- Ensure webhook secret is configured

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Set environment variables
4. Deploy

### Other Platforms

1. Set all environment variables
2. Run `pnpm build`
3. Run `pnpm start`

## Support

- Check README.md for detailed documentation
- Review Prisma docs: https://www.prisma.io/docs/
- NextAuth docs: https://next-auth.js.org/
- Stripe docs: https://stripe.com/docs

## Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Set up database
4. ✅ Seed test data
5. ✅ Start development server
6. 🔄 Explore the application
7. 🚀 Customize for your needs

Happy coding! 🎉
