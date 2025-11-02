# Equators Platform

Official Equators brand website and API platform - Showcase and distribute desktop apps.

## 📁 Project Structure

This monorepo is organized into two main directories:

```
equators-site/
├── frontend/          # Next.js frontend application
│   ├── components/    # React components
│   ├── pages/         # Next.js pages and API routes
│   ├── styles/        # CSS and Tailwind styles
│   ├── public/        # Static assets
│   ├── lib/           # Utility libraries
│   ├── hooks/         # Custom React hooks
│   ├── types/         # TypeScript type definitions
│   ├── server.js      # Custom Next.js server
│   └── package.json   # Frontend dependencies
│
└── backend/           # Express backend API (optional)
    ├── src/
    │   ├── models/    # Database models
    │   ├── routes/    # API route handlers
    │   ├── controllers/ # Business logic
    │   └── config/    # Configuration files
    ├── server.js      # Express server entry point
    └── package.json   # Backend dependencies
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file (copy from `.env.example`):
   ```bash
   cp .env.example .env.local
   ```

4. Configure your environment variables in `.env.local`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Setup (Optional)

The backend is a standalone Express server that can be used for additional API services.

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Backend API will be available at [http://localhost:5000](http://localhost:5000)

## 📦 Available Scripts

### Frontend

- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `npm start` - Start production server with custom server.js
- `npm run start:next` - Start production server with Next.js built-in server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier

### Backend

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run start:pm2` - Start with PM2 process manager

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **NextAuth.js** - Authentication
- **Framer Motion** - Animations
- **MongoDB** - Database (via Next.js API routes)

### Backend
- **Express.js** - Web framework
- **MongoDB/Mongoose** - Database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration

## 🔧 Architecture

### Current Setup

The project uses Next.js with API routes for most backend functionality. The `frontend/pages/api` directory contains all API endpoints that handle:
- Authentication
- User management
- Project management
- OAuth flows
- Database operations

### Optional Backend

The standalone Express backend (`backend/`) is available for:
- Microservices architecture
- Additional API services
- Separate scaling of backend services
- WebSocket servers
- Background jobs

## 🌐 Deployment

### Frontend Deployment (Vercel)

```bash
cd frontend
npm run build
# Deploy to Vercel or your preferred hosting
```

### Backend Deployment

```bash
cd backend
npm install --production
npm start
# Or use PM2 for production
npm run start:pm2
```

## 🔐 Environment Variables

### Frontend (.env.local)
- `NEXTAUTH_URL` - Your application URL
- `NEXTAUTH_SECRET` - Secret for NextAuth.js (min 32 chars)
- `MONGODB_URI` - MongoDB connection string
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` - OAuth credentials
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - OAuth credentials

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `FRONTEND_URL` - Frontend URL for CORS
- `JWT_SECRET` - Secret for JWT tokens

## 📝 Development Workflow

1. **Frontend Development**: Work primarily in the `frontend/` directory
2. **API Routes**: Add new API endpoints in `frontend/pages/api/`
3. **Backend Services**: Use `backend/` for additional standalone services
4. **Database Models**: Keep models in `backend/src/models/` (shared)
5. **Environment**: Keep separate `.env` files for frontend and backend

## 🤝 Contributing

1. Create a feature branch
2. Make your changes in the appropriate directory (frontend/backend)
3. Test both frontend and backend if changes affect both
4. Submit a pull request

## 📄 License

MIT

## 👥 Authors

Axios - Equators Team

---

**Note**: The backend is optional and can be used when you need services separate from Next.js API routes. Most functionality is currently handled by Next.js API routes in the frontend.
