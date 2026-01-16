# Mainyard - Community Booking Platform

A modern MVP booking platform built with Next.js 16+, TypeScript, Tailwind CSS, Prisma, PostgreSQL, NextAuth, and Stripe.

## Features

### 🎯 Core Functionality
- **Resident Profiles**: Each resident can manage their profile, availability, and booking settings
- **Booking System**: Customers can browse residents and book available time slots
- **Payment Processing**: Integrated Stripe checkout with automatic fee calculation
- **Role-Based Access**: Admin, Resident, and Customer roles with appropriate permissions
- **Availability Management**: Weekly recurring availability with time slot generation

### 👥 User Roles
- **Admin**: Approve/reject residents, feature profiles, view analytics
- **Resident**: Manage profile, set availability, view bookings and earnings
- **Customer**: Browse residents, book time slots, manage bookings

## Tech Stack

- **Frontend**: React 19, Next.js 16+ (App Router)
- **Styling**: Tailwind CSS
- **Backend**: Next.js Server Actions
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with email/password
- **Payments**: Stripe
- **Language**: TypeScript

## Project Structure

```
booking-platform/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── residents/
│   │   └── page.tsx               # Browse residents
│   ├── resident/[slug]/
│   │   └── page.tsx               # Resident profile
│   ├── dashboard/
│   │   └── resident/
│   │       └── page.tsx           # Resident dashboard
│   ├── admin/
│   │   └── page.tsx               # Admin dashboard
│   ├── book/[residentId]/
│   │   └── page.tsx               # Booking flow
│   ├── auth/
│   │   ├── signin/page.tsx        # Sign in page
│   │   └── signup/page.tsx        # Sign up page
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts  # User registration
│   │   │   └── [...nextauth]/route.ts
│   │   ├── resident/[id]/route.ts # Get resident data
│   │   └── checkout/route.ts      # Stripe checkout
│   └── globals.css                # Global styles
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ResidentCard.tsx
│   └── ...
├── lib/
│   ├── prisma.ts                  # Prisma client
│   ├── auth.ts                    # NextAuth config
│   ├── stripe.ts                  # Stripe utilities
│   └── utils.ts                   # Helper functions
├── server/
│   └── actions/
│       ├── bookingActions.ts      # Booking server actions
│       ├── residentActions.ts     # Resident server actions
│       └── adminActions.ts        # Admin server actions
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.js                    # Seed script
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Stripe account (for payment processing)

### Installation

1. **Clone and install dependencies**:
```bash
cd booking-platform
pnpm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/booking_platform"
NEXTAUTH_SECRET="your-secret-key-here-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_PLATFORM_FEE_PERCENT=10
```

3. **Set up the database**:
```bash
pnpm db:push
```

4. **Seed sample data** (optional):
```bash
pnpm db:seed
```

5. **Start development server**:
```bash
pnpm dev
```

Visit `http://localhost:3000` in your browser.

## Database Schema

### User
- `id`: Unique identifier
- `email`: Email address (unique)
- `password`: Hashed password
- `name`: User's name
- `image`: Profile image URL
- `role`: CUSTOMER | RESIDENT | ADMIN
- `emailVerified`: Email verification timestamp
- `createdAt`, `updatedAt`: Timestamps

### ResidentProfile
- `id`: Unique identifier
- `userId`: Reference to User
- `slug`: URL-friendly identifier
- `bio`: Short biography
- `description`: Detailed description
- `price`: Hourly rate
- `images`: Array of image URLs
- `bookingEnabled`: Whether accepting bookings
- `approved`: Admin approval status
- `featured`: Featured status
- `createdAt`, `updatedAt`: Timestamps

### Availability
- `id`: Unique identifier
- `residentId`: Reference to ResidentProfile
- `dayOfWeek`: 0-6 (Sunday-Saturday)
- `startTime`: HH:mm format
- `endTime`: HH:mm format
- `createdAt`, `updatedAt`: Timestamps

### Booking
- `id`: Unique identifier
- `residentId`: Reference to ResidentProfile
- `customerId`: Reference to User (customer)
- `date`: Booking date
- `timeSlot`: HH:mm format
- `status`: PENDING | CONFIRMED | COMPLETED | CANCELLED
- `notes`: Optional notes
- `createdAt`, `updatedAt`: Timestamps

### Payment
- `id`: Unique identifier
- `bookingId`: Reference to Booking
- `residentId`: Reference to ResidentProfile
- `stripePaymentId`: Stripe payment intent ID
- `amount`: Total amount in cents
- `platformFee`: Platform fee in cents
- `residentEarnings`: Resident earnings in cents
- `status`: PENDING | COMPLETED | FAILED | REFUNDED
- `createdAt`, `updatedAt`: Timestamps

## Server Actions

### Booking Actions (`server/actions/bookingActions.ts`)
- `createBooking()`: Create a new booking
- `confirmBooking()`: Confirm a pending booking
- `cancelBooking()`: Cancel a booking
- `getAvailableSlots()`: Get available time slots for a date
- `getResidentBookings()`: Get bookings for a resident
- `getCustomerBookings()`: Get bookings for a customer

### Resident Actions (`server/actions/residentActions.ts`)
- `createResidentProfile()`: Create resident profile
- `updateResidentProfile()`: Update profile details
- `addProfileImage()`: Add image to profile
- `removeProfileImage()`: Remove image from profile
- `setAvailability()`: Set availability for a day
- `removeAvailability()`: Remove availability for a day
- `getResidentProfile()`: Get current user's profile

### Admin Actions (`server/actions/adminActions.ts`)
- `approveResident()`: Approve a resident
- `rejectResident()`: Reject a resident
- `featureResident()`: Feature/unfeature a resident
- `getPendingResidents()`: Get pending approvals
- `getAllResidents()`: Get all residents
- `getAllBookings()`: Get all bookings
- `getAdminStats()`: Get platform statistics

## API Routes

### Authentication
- `POST /api/auth/register`: Register new user
- `POST /api/auth/[...nextauth]`: NextAuth endpoints

### Data
- `GET /api/resident/[id]`: Get resident profile
- `POST /api/checkout`: Create Stripe checkout session

## Pages

### Public Pages
- `/`: Landing page
- `/residents`: Browse all residents
- `/resident/[slug]`: Resident profile page
- `/auth/signin`: Sign in page
- `/auth/signup`: Sign up page

### Protected Pages
- `/dashboard/resident`: Resident dashboard
- `/admin`: Admin dashboard
- `/book/[residentId]`: Booking flow

## Authentication Flow

1. User signs up with email/password
2. Password is hashed with bcryptjs
3. NextAuth creates JWT session
4. User is redirected based on role:
   - Residents → `/dashboard/resident`
   - Admins → `/admin`
   - Customers → `/residents`

## Booking Flow

1. Customer browses residents on `/residents`
2. Clicks "Book Now" on resident profile
3. Selects date and available time slot
4. Proceeds to Stripe checkout
5. Payment is processed
6. Booking is confirmed
7. Resident receives notification

## Payment Processing

- **Amount**: Resident's hourly rate
- **Platform Fee**: 10% (configurable via `NEXT_PUBLIC_PLATFORM_FEE_PERCENT`)
- **Resident Earnings**: 90% of booking amount
- **Payment Gateway**: Stripe

## Development

### Database Commands
```bash
# Push schema changes
pnpm db:push

# Open Prisma Studio
pnpm db:studio

# Run seed script
pnpm db:seed
```

### Build & Deploy
```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `NEXTAUTH_SECRET` | Secret for JWT signing | `your-secret-key-min-32-chars` |
| `NEXTAUTH_URL` | Application URL | `http://localhost:3000` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key | `pk_test_...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |
| `NEXT_PUBLIC_PLATFORM_FEE_PERCENT` | Platform fee percentage | `10` |

## Testing

### Test Credentials (After Seeding)
- **Admin**: admin@example.com / admin123
- **Resident**: resident1@example.com / password123
- **Customer**: customer1@example.com / password123

### Stripe Test Cards
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## Future Enhancements

- [ ] Email notifications
- [ ] Review and rating system
- [ ] Recurring bookings
- [ ] Calendar integration
- [ ] Payment history and invoices
- [ ] Resident analytics
- [ ] Booking cancellation policies
- [ ] Dispute resolution
- [ ] Multi-currency support
- [ ] Mobile app

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
