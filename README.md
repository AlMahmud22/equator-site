# Equators Application Platform


official Equators brand website and API platform - Showcase and distribute desktop apps with modern Next.js App Router architecture.

## 🚀 Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

Modern Next.js 15 App Router with unified frontend/backend:

```
equator-site/
├── app/                      # App Router (Frontend + Backend)
│   ├── (auth)/              # Authentication pages
│   ├── (marketing)/         # Public pages
│   ├── (dashboard)/         # Protected pages
│   ├── api/                 # Backend API routes
│   ├── layout.tsx
│   └── page.tsx
│
├── components/              # React components
├── lib/                     # Core utilities
│   ├── auth/               # Auth config
│   ├── db/                 # Database & models
│   └── security/           # Security utilities
│
├── hooks/                   # React hooks
├── types/                   # TypeScript types
├── styles/                  # Global styles
├── public/                  # Static assets
├── middleware.ts            # Edge middleware
└── package.json
```

## 🛠️ Tech Stack

- **Next.js 15** - App Router
- **TypeScript** - Type safety
- **MongoDB** - Database
- **NextAuth.js** - Authentication
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

## 📦 Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm start            # Production server
npm run lint         # Linting
npm run type-check   # Type checking
```

## 🔐 Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-min-32-characters
MONGODB_URI=mongodb://localhost:27017/equators
GITHUB_CLIENT_ID=your-github-id
GITHUB_CLIENT_SECRET=your-github-secret
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

## 📝 License

MIT
