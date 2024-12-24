# 🦢 tiny.pm

A beautiful, minimal link-in-bio tool built with Next.js 14, TypeScript, and Tailwind CSS. Live at [https://tinypm.vercel.app](https://tinypm.vercel.app)

## Features

- 🎨 Clean, minimal UI with smooth animations
- 🔐 Secure Google OAuth authentication
- 🔄 Real-time link management with drag-and-drop reordering
- 📊 Click tracking for links
- ⚡️ Optimized for speed and performance
- 🌗 Beautiful design with custom branding
- 🔍 SEO optimized
- 📱 Fully responsive design
- 💳 Stripe integration for premium features
- 🔒 Secure environment configuration
- 🌐 Custom domain support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Payments**: Stripe
- **Deployment**: Vercel
- **Components**: Custom components with shadcn/ui
- **State Management**: Zustand
- **Forms**: React Hook Form with Zod validation

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tinypm"

# Authentication
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID="price_..."
NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID="price_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Getting Started

### Prerequisites

- Node.js 20.0.0 or later
- PostgreSQL
- A Google OAuth application for authentication
- A Stripe account for payments

### Installation

1. Clone the repository:
```bash
git clone https://github.com/donwolfonline/tinypm.git
cd tinypm
```

2. Install dependencies:
```bash
npm install
```

3. Set up your environment variables:
   - Copy `.env.example` to `.env.local`
   - Fill in all required environment variables

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Development

### Code Structure

- `app/` - Next.js app router pages and layouts
- `components/` - Reusable React components
- `lib/` - Utility functions and configuration
  - `config/` - Environment and service configuration
  - `utils/` - Helper functions
  - `db/` - Database schema and utilities
- `public/` - Static assets
- `styles/` - Global CSS and Tailwind configuration

### Key Features

1. **Authentication**
   - Google OAuth integration
   - Secure session management
   - Protected routes

2. **Link Management**
   - Create, update, and delete links
   - Drag-and-drop reordering
   - Real-time updates

3. **Premium Features**
   - Stripe integration for subscriptions
   - Monthly and yearly billing options
   - Secure webhook handling

4. **Custom Domains**
   - Domain verification
   - SSL/TLS configuration
   - DNS management

## Deployment

The application is deployed on Vercel. To deploy your own instance:

1. Fork the repository
2. Create a new project on Vercel
3. Connect your repository
4. Configure environment variables
5. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

[Frederick Dineen](https://github.com/donwolfonline)

## Support

For support, email [support@tiny.pm](mailto:support@tiny.pm) or join our [Discord community](https://discord.gg/tinypm).
