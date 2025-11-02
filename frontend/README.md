# Equators - Privacy-Focused Software Portfolio

Equators is a professional portfolio showcasing privacy-focused desktop applications and web tools with secure authentication and download management.

## 🌟 Features

- **Product Showcase**: Browse desktop applications, web tools, and security utilities
- **Secure Authentication**: OAuth login via Google/GitHub for download access
- **Protected Downloads**: Download links restricted to authenticated users only
- **Public Browsing**: All products can be viewed without authentication
- **Responsive Design**: Fully responsive across all device sizes
- **Production Ready**: Optimized build with PM2 deployment

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Database**: MongoDB with NextAuth adapter
- **Authentication**: NextAuth.js with OAuth providers
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Deployment**: PM2 process manager

## 📦 Production Setup

### Prerequisites

- Node.js 18+
- MongoDB database
- Google OAuth app credentials
- GitHub OAuth app credentials

### Installation

1. Clone and install:

   ```bash
   git clone <repository-url>
   cd equators-site
   npm install --legacy-peer-deps
   ```

2. Configure environment variables:

   ```bash
   cp .env.local.example .env.production
   # Edit .env.production with your values
   ```

3. Build and deploy:
   ```bash
   npm run build
   pm2 start equators-site
   ```

### Environment Variables

Required in `.env.production`:

```bash
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-secret-32-chars-min
NEXTAUTH_URL=https://your-domain.com
GITHUB_CLIENT_ID=your-github-id
GITHUB_CLIENT_SECRET=your-github-secret
GOOGLE_CLIENT_ID=your-google-id
GOOGLE_CLIENT_SECRET=your-google-secret
```

## 🏗️ Project Structure

```
equators-site/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── profile/         # Profile management
│   ├── Navbar/          # Navigation
│   ├── Hero/            # Hero section
│   ├── Product/         # Product showcase
│   └── Layout/          # Layout wrapper
├── pages/               # Next.js pages
│   ├── products/        # Product pages
│   ├── auth/            # Login/consent pages
│   ├── api/             # API routes
│   ├── profile.tsx      # User profile
│   ├── settings.tsx     # User settings
│   └── index.tsx        # Homepage
├── lib/                 # Core utilities
├── modules/             # Database & auth modules
├── config/              # Site configuration
└── public/              # Static assets
```

## 🚀 Deployment Commands

For production server:

```bash
git pull origin main
npm install --legacy-peer-deps
npm run build
pm2 start equators-site
```

## 📋 Features

- **Public Access**: Browse all products without login
- **Protected Downloads**: Login required for file downloads
- **OAuth Authentication**: Google & GitHub login
- **User Profiles**: Basic profile management
- **Download Tracking**: Monitor download activity
- **Responsive Design**: Mobile-friendly interface

- Product information is managed in `config/site.ts`
- Navigation links and site metadata in the same config file
- Easy to update without touching components

## 🔧 Customization

The website is built with modularity in mind:

1. **Colors**: Update the Tailwind config for brand colors
2. **Content**: Modify `config/site.ts` for all site content
3. **Components**: Each component is self-contained and reusable
4. **Animations**: Easily adjustable timing and effects

## 📱 Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Design inspiration from [zeytal.com](https://zeytal.com)
- Animation inspiration from [xe.works](https://xe.works)
- Built with modern web technologies and best practices

---

**Axios** - Building the future of desktop software
