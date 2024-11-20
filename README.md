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

- Node.js 18.17 or later
- PostgreSQL
- A Google OAuth application for authentication

### Local Development

1. Clone the repository:

```bash
git clone git@github.com:Simsz/metinypm.git
cd metinypm
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tinypm"

# NextAuth
NEXTAUTH_URL="http://localhost:3131"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

4. Set up the database:

```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:

```bash
npm run dev
```

Visit `http://localhost:3131` to see your application.

## Production Deployment

### Server Prerequisites

- Node.js 18.17 or later
- PM2 for process management
- Caddy web server
- PostgreSQL
- Git

### Deployment Steps

1. Set up your server and clone the repository:

```bash
mkdir -p /var/www
cd /var/www
git clone git@github.com:Simsz/metinypm.git
cd metinypm
```

2. Install global dependencies:

```bash
npm install -g pm2
```

3. Create `.env.production`:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/tinypm"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-production-secret"

# Google OAuth
GOOGLE_CLIENT_ID="your-production-client-id"
GOOGLE_CLIENT_SECRET="your-production-client-secret"
```

4. Configure Caddy (example configuration):

```caddyfile
your-domain.com {
    reverse_proxy localhost:3000
    encode gzip
}
```

5. Set up deployment script:

```bash
chmod +x deploy.sh
./deploy.sh
```

6. Set up PM2 to run on startup:

```bash
pm2 startup
pm2 save
```

### Updating Production

To update your production deployment:

```bash
cd /var/www/metinypm
./deploy.sh
```

## Project Structure

```
metinypm/
├── app/
│   ├── api/            # API routes
│   ├── components/     # React components
│   ├── types/          # TypeScript types
│   └── [...]/          # Page routes
├── prisma/
│   └── schema.prisma   # Database schema
├── public/             # Static files
└── lib/                # Utility functions
```

## Environment Variables

| Variable               | Description                          |
| ---------------------- | ------------------------------------ |
| `DATABASE_URL`         | PostgreSQL connection URL            |
| `NEXTAUTH_URL`         | Full URL of your site                |
| `NEXTAUTH_SECRET`      | Random string for session encryption |
| `GOOGLE_CLIENT_ID`     | Google OAuth client ID               |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret           |

## Contributing

While this is a personal project, issues and pull requests are welcome. Please follow the existing code style and add unit tests for any new or changed functionality.

## License

None, all rights reserved.

## Acknowledgments

Created by [Zach Sims](https://zachsi.ms/). Built with Next.js, Tailwind CSS, and other amazing open-source projects.

---

© TinyPM
