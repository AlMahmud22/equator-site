export const siteConfig = {
  name: 'Equators',
  title: 'Equators - Digital Workshop | Privacy-First Tools & Projects',
  description: 'Welcome to my digital workshop! I build privacy-first applications: Secure Chatbot, AI Playground, and Privacy Browser. Open-source tools that put users first.',
  url: 'https://equators.tech',
  ogImage: '/images/og-image.jpg',
  
  // Navigation links
  navigation: [
    {
      name: 'Home',
      href: '/',
    },
    {
      name: 'Projects',
      href: '/products',
      children: [
        {
          name: 'Chatbot',
          href: '/products/chatbot',
          description: 'Privacy-first AI companion with local processing'
        },
        {
          name: 'AI Playground',
          href: '/products/ai-playground',
          description: 'Secure ML experimentation platform'
        },
        {
          name: 'Browser',
          href: '/products/browser',
          description: 'Decentralized web browsing with maximum privacy'
        }
      ]
    },
    {
      name: 'Tools',
      href: '#',
      children: [
        {
          name: 'Models Hub',
          href: '/models',
          description: 'Browse and download AI models'
        },
        {
          name: 'Test Auth',
          href: '/test-chatbot-auth',
          description: 'Test OAuth integration with desktop apps'
        },
      ]
    },
    {
      name: 'Downloads',
      href: '/products',
    },
    {
      name: 'Contact',
      href: '/contact',
    },
  ],

  // Social links
  social: {
    twitter: 'https://twitter.com/yourhandle',
    github: 'https://github.com/yourusername',
    discord: 'https://discord.gg/equators',
    youtube: 'https://youtube.com/@equators',
    linkedin: 'https://linkedin.com/in/yourprofile',
  },

  // Contact information
  contact: {
    email: 'hello@equators.tech',
    personal: 'your.name@email.com',
  },

  // Feature flags
  features: {
    auth: true,
    downloads: true,
    newsletter: true,
    darkMode: true,
  },
}

export const projects = [
  {
    id: 'privacy-chatbot',
    name: 'Privacy Chatbot',
    category: 'Desktop Apps',
    tagline: 'Local AI Assistant',
    description: 'A privacy-first AI chatbot that runs entirely on your device with zero data transmission.',
    techStack: ['Electron', 'Python', 'Ollama', 'React'],
    longDescription: `
      Built this privacy-focused AI assistant to address the growing concerns about data privacy in AI tools. 
      It processes all conversations locally using open-source models, ensuring your data never leaves your device.
      
      Key innovations: Local model inference, encrypted conversation storage, zero-dependency networking, 
      and a clean React-based interface that prioritizes user experience and data sovereignty.
    `,
    icon: '🤖',
    image: '/images/products/chatbot-hero.jpg',
    screenshots: [
      '/images/products/chatbot-screenshot-1.jpg',
      '/images/products/chatbot-screenshot-2.jpg',
      '/images/products/chatbot-screenshot-3.jpg',
    ],
    features: [
      'Runs Completely Offline',
      'Multiple AI Models',
      'Encrypted Storage',
      'Open Source',
      'Cross-Platform',
      'Custom Themes',
    ],
    links: {
      github: 'https://github.com/AlMahmud22/privacy-chatbot',
      demo: '/demo/chatbot',
      download: '/downloads/equators-chatbot/v2.1.0/',
    },
    downloads: {
      windows: '/downloads/equators-chatbot/v2.1.0/privacy-chatbot-setup.exe',
      mac: '/downloads/equators-chatbot/v2.1.0/privacy-chatbot.dmg',
      linux: '/downloads/equators-chatbot/v2.1.0/privacy-chatbot.AppImage',
    },
    version: '2.1.0',
    createdDate: '2024-08-15',
    lastUpdate: '2024-12-20',
    size: '145 MB',
    stats: {
      downloads: '2.3k',
      stars: 42,
      forks: 8,
    },
    requirements: {
      os: 'Windows 10+, macOS 11+, Ubuntu 18.04+',
      ram: '4 GB RAM',
      storage: '200 MB available space',
    },
  },
  {
    id: 'ai-playground',
    name: 'AI Model Playground',
    category: 'Desktop Apps',
    tagline: 'Local AI Experimentation',
    description: 'Experiment with open-source AI models locally without sending data to external services.',
    techStack: ['Python', 'PyQt6', 'HuggingFace', 'ONNX', 'OpenCV'],
    longDescription: `
      Created this tool to democratize AI experimentation. It allows researchers and developers to test various 
      AI models locally without privacy concerns or API costs. Built with a focus on ease of use and performance.
      
      Features local model management, performance benchmarking, custom fine-tuning capabilities, and export 
      functionality for production use. Perfect for AI enthusiasts who value privacy and want hands-on experience.
    `,
    icon: '🧪',
    image: '/images/products/ai-playground-hero.jpg',
    screenshots: [
      '/images/products/ai-playground-screenshot-1.jpg',
      '/images/products/ai-playground-screenshot-2.jpg',
      '/images/products/ai-playground-screenshot-3.jpg',
    ],
    features: [
      'Local Model Testing',
      'Performance Benchmarks',
      'Custom Fine-tuning',
      'No API Dependencies',
      'Export Capabilities',
      'GPU Acceleration',
    ],
    links: {
      github: 'https://github.com/AlMahmud22/ai-playground',
      demo: '/demo/ai-playground',
      download: '/downloads/equators-ai-playground/v1.8.2/',
    },
    downloads: {
      windows: '/downloads/equators-ai-playground/v1.8.2/ai-playground-setup.exe',
      mac: '/downloads/equators-ai-playground/v1.8.2/ai-playground.dmg',
      linux: '/downloads/equators-ai-playground/v1.8.2/ai-playground.AppImage',
    },
    version: '1.8.2',
    createdDate: '2024-07-10',
    lastUpdate: '2024-12-18',
    size: '280 MB',
    stats: {
      downloads: '1.8k',
      stars: 67,
      forks: 15,
    },
    requirements: {
      os: 'Windows 10+, macOS 11+, Ubuntu 20.04+',
      ram: '8 GB RAM',
      storage: '500 MB available space',
      gpu: 'Recommended: CUDA-compatible GPU',
    },
  },
  {
    id: 'privacy-browser',
    name: 'Privacy Browser',
    category: 'Desktop Apps',
    tagline: 'Decentralized Web Browser',
    description: 'A web browser built on decentralized principles with advanced privacy protection and tracking prevention.',
    techStack: ['Chromium', 'C++', 'JavaScript', 'WebRTC', 'Tor'],
    longDescription: `
      Developed this browser to provide true digital freedom through decentralized web browsing. Built on Chromium 
      but heavily modified to remove tracking, add Tor integration, and implement decentralized networking protocols.
      
      Features automatic ad blocking, tracker prevention, built-in VPN, decentralized DNS resolution, and peer-to-peer 
      content delivery. Designed for users who prioritize privacy and want to browse the web without surveillance.
    `,
    icon: '🌐',
    image: '/images/products/browser-hero.jpg',
    screenshots: [
      '/images/products/browser-screenshot-1.jpg',
      '/images/products/browser-screenshot-2.jpg',
      '/images/products/browser-screenshot-3.jpg',
    ],
    features: [
      'Built-in Tor Support',
      'Automatic Ad Blocking',
      'Decentralized DNS',
      'P2P Content Delivery',
      'No User Tracking',
      'Advanced Encryption',
    ],
    links: {
      github: 'https://github.com/AlMahmud22/privacy-browser',
      demo: '/demo/browser',
      download: '/downloads/equators-browser/v3.2.1/',
    },
    downloads: {
      windows: '/downloads/equators-browser/v3.2.1/privacy-browser-setup.exe',
      mac: '/downloads/equators-browser/v3.2.1/privacy-browser.dmg',
      linux: '/downloads/equators-browser/v3.2.1/privacy-browser.AppImage',
    },
    version: '3.2.1',
    createdDate: '2024-05-20',
    lastUpdate: '2024-12-22',
    size: '320 MB',
    stats: {
      downloads: '5.7k',
      stars: 128,
      forks: 34,
    },
    requirements: {
      os: 'Windows 10+, macOS 11+, Ubuntu 18.04+',
      ram: '6 GB RAM',
      storage: '400 MB available space',
    },
  },
  {
    id: 'file-encrypt',
    name: 'SecureVault',
    category: 'Scripts/Tools',
    tagline: 'File Encryption Utility',
    description: 'A command-line tool for military-grade file encryption with steganography capabilities.',
    techStack: ['Go', 'AES-256', 'CLI', 'Cryptography'],
    longDescription: `
      Built this encryption tool to provide bulletproof file security with advanced features like steganography 
      and secure deletion. Uses military-grade AES-256 encryption with custom key derivation functions.
      
      Perfect for developers, journalists, and privacy enthusiasts who need secure file storage. Features include 
      batch encryption, hidden volume creation, secure key generation, and cross-platform compatibility.
    `,
    icon: '🔒',
    image: '/images/products/encrypt-hero.jpg',
    screenshots: [
      '/images/products/encrypt-screenshot-1.jpg',
      '/images/products/encrypt-screenshot-2.jpg',
    ],
    features: [
      'AES-256 Encryption',
      'Steganography Support',
      'Batch Operations',
      'Secure Key Generation',
      'Hidden Volumes',
      'Cross-Platform CLI',
    ],
    links: {
      github: 'https://github.com/AlMahmud22/secure-vault',
      demo: null,
      download: 'https://github.com/AlMahmud22/secure-vault/releases',
    },
    downloads: {
      windows: 'https://github.com/AlMahmud22/secure-vault/releases/download/v2.1.3/securevault-windows.exe',
      mac: 'https://github.com/AlMahmud22/secure-vault/releases/download/v2.1.3/securevault-macos',
      linux: 'https://github.com/AlMahmud22/secure-vault/releases/download/v2.1.3/securevault-linux',
    },
    version: '2.1.3',
    createdDate: '2024-09-12',
    lastUpdate: '2024-12-19',
    size: '12 MB',
    stats: {
      downloads: '892',
      stars: 23,
      forks: 5,
    },
    requirements: {
      os: 'Any OS with Go runtime',
      ram: '1 GB RAM',
      storage: '50 MB available space',
    },
  },
  {
    id: 'network-scanner',
    name: 'NetScope',
    category: 'Scripts/Tools',
    tagline: 'Network Discovery Tool',
    description: 'A fast, lightweight network scanner for security auditing and network discovery.',
    techStack: ['Python', 'Nmap', 'Threading', 'JSON'],
    longDescription: `
      Created this network scanner to help security professionals and network administrators discover devices 
      and services on their networks. Features multithreaded scanning, port detection, and service enumeration.
      
      Built with performance in mind, it can scan large networks quickly while providing detailed information 
      about discovered hosts. Includes vulnerability checking and export capabilities for further analysis.
    `,
    icon: '🔍',
    image: '/images/products/scanner-hero.jpg',
    screenshots: [
      '/images/products/scanner-screenshot-1.jpg',
      '/images/products/scanner-screenshot-2.jpg',
    ],
    features: [
      'Multithreaded Scanning',
      'Port Detection',
      'Service Enumeration',
      'Vulnerability Checks',
      'Export Reports',
      'Fast Performance',
    ],
    links: {
      github: 'https://github.com/AlMahmud22/netscope',
      demo: null,
      download: 'https://github.com/AlMahmud22/netscope/releases',
    },
    downloads: {
      windows: 'https://github.com/AlMahmud22/netscope/releases/download/v1.4.2/netscope-windows.exe',
      mac: 'https://github.com/AlMahmud22/netscope/releases/download/v1.4.2/netscope-macos',
      linux: 'https://github.com/AlMahmud22/netscope/releases/download/v1.4.2/netscope-linux',
    },
    version: '1.4.2',
    createdDate: '2024-10-05',
    lastUpdate: '2024-12-21',
    size: '8 MB',
    stats: {
      downloads: '1.2k',
      stars: 31,
      forks: 7,
    },
    requirements: {
      os: 'Windows 10+, macOS 11+, Linux',
      ram: '2 GB RAM',
      storage: '100 MB available space',
    },
  },
]

// Project categories for filtering
export const projectCategories = [
  {
    id: 'all',
    name: 'All Projects',
    count: 5,
  },
  {
    id: 'desktop-apps',
    name: 'Desktop Apps',
    count: 3,
  },
  {
    id: 'scripts-tools',
    name: 'Scripts/Tools',
    count: 2,
  },
  {
    id: 'web-tools',
    name: 'Web Tools',
    count: 0,
  },
  {
    id: 'mobile-apps',
    name: 'Mobile Apps',
    count: 0,
  },
]

export type Project = typeof projects[0]
export type Product = Project
export const products = projects
