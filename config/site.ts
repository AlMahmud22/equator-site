export const siteConfig = {
  name: 'Equators',
  title: 'Equators - Privacy-Focused AI Desktop Suite',
  description: 'Secure, decentralized AI applications: Privacy-first Chatbot, open-architecture AI Playground, and freedom-focused Browser. Built for digital sovereignty.',
  url: 'https://equators.com',
  ogImage: '/images/og-image.jpg',
  
  // Navigation links
  navigation: [
    {
      name: 'Home',
      href: '/',
    },
    {
      name: 'Products',
      href: '/products',
      children: [
        {
          name: 'Chatbot',
          href: '/products/chatbot',
          description: 'Your on-device AI companion, built for data security'
        },
        {
          name: 'AI Playground',
          href: '/products/ai-playground',
          description: 'Explore open-architecture ML, safe and private'
        },
        {
          name: 'Browser',
          href: '/products/browser',
          description: 'Decentralized web browsing with maximum privacy'
        }
      ]
    },
    {
      name: 'Resources',
      href: '#',
      children: [
        {
          name: 'Documentation',
          href: '/documentation',
          description: 'Developer guides and tutorials'
        },
        {
          name: 'API Reference',
          href: '/api-reference',
          description: 'Complete API documentation'
        },
        {
          name: 'Help Center',
          href: '/help-center',
          description: 'Knowledge base and FAQs'
        },
        {
          name: 'Status',
          href: '/status',
          description: 'System status and uptime'
        }
      ]
    },
    {
      name: 'Company',
      href: '#',
      children: [
        {
          name: 'About Us',
          href: '/about',
          description: 'Learn about our mission and team'
        },
        {
          name: 'News',
          href: '/news',
          description: 'Latest updates and announcements'
        },
        {
          name: 'Careers',
          href: '/careers',
          description: 'Join our growing team'
        },
        {
          name: 'Contact',
          href: '/contact',
          description: 'Get in touch with us'
        }
      ]
    },
  ],

  // Social links
  social: {
    twitter: 'https://twitter.com/equators',
    github: 'https://github.com/equators',
    discord: 'https://discord.gg/equators',
    youtube: 'https://youtube.com/@equators',
  },

  // Contact information
  contact: {
    email: 'hello@equators.com',
    support: 'support@equators.com',
  },

  // Feature flags
  features: {
    auth: true,
    downloads: true,
    newsletter: true,
    darkMode: true,
  },
}

export const products = [
  {
    id: 'chatbot',
    name: 'Equators Chatbot',
    tagline: 'Privacy-First AI Companion',
    description: 'Your on-device AI companion that processes conversations locally, ensuring complete data sovereignty and privacy.',
    longDescription: `
      Experience true AI freedom with Equators Chatbot. Our privacy-first AI assistant runs entirely on your device, 
      with zero data transmission to external servers. Built on open-architecture principles, it provides intelligent 
      responses while maintaining complete user control over your conversations and data.
      
      Features include local processing, encrypted storage, context awareness, multi-language support, and 
      customizable privacy settings that put you in complete control.
    `,
    icon: '🤖',
    image: '/images/products/chatbot-hero.jpg',
    screenshots: [
      '/images/products/chatbot-screenshot-1.jpg',
      '/images/products/chatbot-screenshot-2.jpg',
      '/images/products/chatbot-screenshot-3.jpg',
    ],
    features: [
      'Local Processing',
      'Zero Data Transmission',
      'Encrypted Storage',
      'Open Architecture',
      'Privacy Controls',
      'Offline Operations',
    ],
    downloads: {
      windows: '/downloads/equators-chatbot/v1.0.1/equators-chatbot-setup.exe',
      mac: '/downloads/equators-chatbot/v1.0.1/equators-chatbot.dmg',
      linux: '/downloads/equators-chatbot/v1.0.1/equators-chatbot.AppImage',
    },
    version: '1.0.1',
    releaseDate: '2024-12-15',
    size: '145 MB',
    requirements: {
      os: 'Windows 10+, macOS 11+, Ubuntu 18.04+',
      ram: '4 GB RAM',
      storage: '200 MB available space',
    },
  },
  {
    id: 'ai-playground',
    name: 'Equators AI Playground',
    tagline: 'Open-Architecture AI Lab',
    description: 'Explore open-architecture ML models safely and privately on your own hardware with complete data control.',
    longDescription: `
      Unleash your AI creativity with Equators AI Playground. This secure, decentralized platform lets you experiment 
      with cutting-edge AI models while maintaining complete control over your data and computational resources. 
      Built on open-source principles with transparent algorithms.
      
      Perfect for researchers, developers, and AI enthusiasts who demand privacy, security, and freedom to explore 
      without vendor lock-in or data harvesting concerns.
    `,
    icon: '🧪',
    image: '/images/products/ai-playground-hero.jpg',
    screenshots: [
      '/images/products/ai-playground-screenshot-1.jpg',
      '/images/products/ai-playground-screenshot-2.jpg',
      '/images/products/ai-playground-screenshot-3.jpg',
    ],
    features: [
      'Open-Source Models',
      'Local Processing',
      'Data Sovereignty',
      'Transparent Algorithms',
      'Privacy-First Design',
      'Decentralized Computing',
    ],
    downloads: {
      windows: '/downloads/equators-ai-playground/v1.0.1/equators-ai-playground-setup.exe',
      mac: '/downloads/equators-ai-playground/v1.0.1/equators-ai-playground.dmg',
      linux: '/downloads/equators-ai-playground/v1.0.1/equators-ai-playground.AppImage',
    },
    version: '1.0.1',
    releaseDate: '2024-12-10',
    size: '280 MB',
    requirements: {
      os: 'Windows 10+, macOS 11+, Ubuntu 20.04+',
      ram: '8 GB RAM',
      storage: '500 MB available space',
      gpu: 'Recommended: CUDA-compatible GPU',
    },
  },
  {
    id: 'browser',
    name: 'Equators Browser',
    tagline: 'Decentralized Web Freedom',
    description: 'A decentralized, privacy-first web browser with built-in security features and complete user sovereignty.',
    longDescription: `
      Reclaim your digital freedom with Equators Browser. Built on decentralized principles, this privacy-first browser 
      eliminates tracking, blocks surveillance, and gives you complete control over your online experience. 
      Features encrypted connections, distributed networking, and AI-powered security.
      
      Experience the web as it should be: free, private, and under your complete control. No data harvesting, 
      no corporate surveillance, no restrictions on your digital sovereignty.
    `,
    icon: '🌐',
    image: '/images/products/browser-hero.jpg',
    screenshots: [
      '/images/products/browser-screenshot-1.jpg',
      '/images/products/browser-screenshot-2.jpg',
      '/images/products/browser-screenshot-3.jpg',
    ],
    features: [
      'Decentralized Architecture',
      'Zero Tracking',
      'Encrypted Connections',
      'AI-Powered Security',
      'Distributed Networking',
      'Complete User Control',
    ],
    downloads: {
      windows: '/downloads/equators-browser/v1.0.1/equators-browser-setup.exe',
      mac: '/downloads/equators-browser/v1.0.1/equators-browser.dmg',
      linux: '/downloads/equators-browser/v1.0.1/equators-browser.AppImage',
    },
    version: '1.0.1',
    releaseDate: '2024-12-20',
    size: '95 MB',
    requirements: {
      os: 'Windows 10+, macOS 10.15+, Ubuntu 18.04+',
      ram: '2 GB RAM',
      storage: '150 MB available space',
    },
  },
]

export type Product = typeof products[0]
