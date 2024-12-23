# 🦢 tiny.pm

A beautiful, minimal link-in-bio tool built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🎨 Clean, minimal UI with smooth animations
- 🔐 Secure Google OAuth authentication
- 🔄 Real-time link management with drag-and-drop reordering
- 📊 Click tracking for links
- ⚡️ Optimized for speed and performance
- 🌗 Beautiful design with custom branding
- 🔍 SEO optimized
- 📱 Fully responsive design

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Deployment**: Node.js with PM2
- **Server**: Caddy (reverse proxy)
- **Components**: Custom components with shadcn/ui

## Getting Started

### Prerequisites

- Node.js 20.0.0 or later
- PostgreSQL
- A Google OAuth application for authentication

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

3. Create a `.env.local` file with the following variables:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/tinypm"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
```

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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

[Frederick Dineen](https://github.com/donwolfonline)
