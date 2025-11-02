# Equators Backend

Backend API server for the Equators platform.

## Tech Stack

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **CORS** - Cross-origin resource sharing

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env` file in the backend folder with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_secret_key_minimum_32_characters
   NODE_ENV=development
   PORT=5000
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Run in production:**
   ```bash
   npm start
   ```

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run start:pm2` - Start with PM2 process manager
- `npm run stop:pm2` - Stop PM2 process
- `npm run restart:pm2` - Restart PM2 process
- `npm run logs:pm2` - View PM2 logs

## Project Structure

```
backend/
├── src/
│   ├── models/          # Mongoose models
│   ├── routes/          # API routes
│   ├── controllers/     # Route controllers
│   └── config/          # Configuration files
├── server.js            # Main server file
├── .env                 # Environment variables
└── package.json         # Dependencies
```

## API Endpoints

The backend will typically run on `http://localhost:5000` (or configured PORT).

## Notes

- Ensure MongoDB is running and accessible
- Keep `.env` file secure and never commit it to version control
- Use PM2 for production deployments for better process management
