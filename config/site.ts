export const siteConfig = {
  name: 'Equators',
  title: 'Equators - Desktop Applications Suite',
  description: 'Discover and download powerful desktop applications including Equators Chatbot, AI Playground, and Browser.',
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
          description: 'AI-powered conversational assistant'
        },
        {
          name: 'AI Playground',
          href: '/products/ai-playground',
          description: 'Interactive AI experimentation platform'
        },
        {
          name: 'Browser',
          href: '/products/browser',
          description: 'Privacy-focused web browser'
        }
      ]
    },
    {
      name: 'News',
      href: '/news',
    },
    {
      name: 'About',
      href: '/about',
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
    tagline: 'AI-Powered Conversations',
    description: 'An intelligent chatbot that understands context and provides helpful responses for various tasks.',
    longDescription: `
      Experience the future of AI conversation with Equators Chatbot. Our advanced AI assistant is designed to understand context, 
      provide intelligent responses, and help you with a wide range of tasks from creative writing to technical support.
      
      Features include natural language processing, context awareness, multi-language support, and seamless integration 
      with your workflow.
    `,
    icon: '🤖',
    image: '/images/products/chatbot-hero.jpg',
    screenshots: [
      '/images/products/chatbot-screenshot-1.jpg',
      '/images/products/chatbot-screenshot-2.jpg',
      '/images/products/chatbot-screenshot-3.jpg',
    ],
    features: [
      'Natural Language Processing',
      'Context-Aware Responses',
      'Multi-Language Support',
      'Custom Training',
      'API Integration',
      'Offline Mode',
    ],
    downloads: {
      windows: 'equators-chatbot-setup.exe',
      mac: 'equators-chatbot.dmg',
      linux: 'equators-chatbot.AppImage',
    },
    version: '2.1.0',
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
    tagline: 'Experiment with AI',
    description: 'A comprehensive platform for experimenting with various AI models and machine learning algorithms.',
    longDescription: `
      Dive deep into the world of artificial intelligence with Equators AI Playground. This powerful platform provides 
      an intuitive interface for experimenting with cutting-edge AI models, from language models to computer vision.
      
      Perfect for researchers, developers, and AI enthusiasts who want to explore, test, and prototype AI solutions 
      without the complexity of setting up infrastructure.
    `,
    icon: '🧪',
    image: '/images/products/ai-playground-hero.jpg',
    screenshots: [
      '/images/products/ai-playground-screenshot-1.jpg',
      '/images/products/ai-playground-screenshot-2.jpg',
      '/images/products/ai-playground-screenshot-3.jpg',
    ],
    features: [
      'Multiple AI Models',
      'Visual Interface',
      'Code Generation',
      'Model Comparison',
      'Export Results',
      'Collaboration Tools',
    ],
    downloads: {
      windows: 'equators-ai-playground-setup.exe',
      mac: 'equators-ai-playground.dmg',
      linux: 'equators-ai-playground.AppImage',
    },
    version: '1.8.2',
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
    tagline: 'Privacy-First Browsing',
    description: 'A fast, secure, and privacy-focused web browser with built-in AI features.',
    longDescription: `
      Browse the web with confidence using Equators Browser. Built from the ground up with privacy and security 
      as core principles, while integrating AI features that enhance your browsing experience.
      
      Features advanced tracking protection, built-in VPN, AI-powered search suggestions, and seamless synchronization 
      across all your devices.
    `,
    icon: '🌐',
    image: '/images/products/browser-hero.jpg',
    screenshots: [
      '/images/products/browser-screenshot-1.jpg',
      '/images/products/browser-screenshot-2.jpg',
      '/images/products/browser-screenshot-3.jpg',
    ],
    features: [
      'Privacy Protection',
      'Built-in VPN',
      'AI Search',
      'Ad Blocker',
      'Sync Across Devices',
      'Extensions Support',
    ],
    downloads: {
      windows: 'equators-browser-setup.exe',
      mac: 'equators-browser.dmg',
      linux: 'equators-browser.AppImage',
    },
    version: '3.2.1',
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
