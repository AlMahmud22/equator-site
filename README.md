# Equators - Desktop Applications Suite

Equators is a local-first desktop software suite for AI, chatbots, and productivity apps.

## 🌟 Features

- **Modern Design**: Inspired by zeytal.com with scroll-reactive animations like xe.works
- **Product Showcase**: Dedicated pages for Equators Chatbot, AI Playground, and Browser
- **Download System**: Direct downloads for Windows (.exe), macOS (.dmg), and Linux (.AppImage)
- **Authentication**: Login/register system for unified user accounts
- **News & Updates**: Blog-style news section for announcements and changelogs
- **Responsive Design**: Fully responsive across all device sizes

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion & ScrollReveal
- **Icons**: Lucide React
- **Fonts**: Inter & JetBrains Mono
- **Build**: Modern ES6+ with full TypeScript support

## 📦 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/equators-site.git
   cd equators-site
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗️ Project Structure

```
equators-site/
├── components/           # React components
│   ├── Navbar/          # Navigation component
│   ├── Hero/            # Hero section
│   ├── Product/         # Product showcase
│   ├── Footer/          # Footer component
│   └── Layout/          # Layout wrapper
├── pages/               # Next.js pages
│   ├── products/        # Product pages
│   ├── auth/           # Authentication pages
│   ├── about.tsx       # About page
│   ├── news.tsx        # News page
│   └── index.tsx       # Homepage
├── public/              # Static assets
│   ├── images/         # Images and graphics
│   └── downloads/      # Downloadable files
├── styles/             # CSS and styling
├── utils/              # Utility functions
├── hooks/              # Custom React hooks
├── config/             # Configuration files
└── data/               # Static data
```

## 🎨 Design System

The website uses a carefully crafted design system with:

- **Colors**: Primary (blue), Secondary (gray), Accent (purple)
- **Typography**: Inter for body text, JetBrains Mono for code
- **Components**: Reusable button variants, cards, and animations
- **Spacing**: Consistent spacing using Tailwind's scale
- **Responsive**: Mobile-first approach with breakpoints

## 🚀 Deployment

The site is optimized for deployment on:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **DigitalOcean** (as mentioned in requirements)
- Any static hosting provider

Build for production:
```bash
npm run build
npm start
```

## 📝 Content Management

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

**Equators Team** - Building the future of desktop software
