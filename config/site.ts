export const siteConfig = {
  name: 'equator',
  title: 'equator - Full-Stack Developer | Web3, Security & WordPress Specialist',
  description: 'Professional software developer specializing in Web3 applications, cybersecurity tools, mobile development, and WordPress solutions. Explore my comprehensive project portfolio.',
  url: 'https://equator.tech',
  ogImage: '/images/og-image.jpg',
  
  // Navigation links
  navigation: [
    {
      name: 'Home',
      href: '/',
    },
    {
      name: 'Community',
      href: '/projects',
    },
    {
      name: 'Portfolio',
      href: '/products',
      children: [
        {
          name: 'Gecko Chatbot',
          href: '/products/gecko-chatbot',
          description: 'AI-powered desktop assistant'
        },
        {
          name: 'PhishGuard Desktop App',
          href: '/products/phishguard',
          description: 'Advanced phishing detection & URL scanner'
        },
      ]
    },
    {
      name: 'Contact',
      href: '/contact',
    },
  ],

  // Social links
  social: {
    X: 'https://x.com/SAMahmud11',
    github: 'https://github.com/AlMahmud22',
    discord: 'https://discord.gg/bgaEx4BN',
    youtube: 'https://youtube.com/@equator',
    linkedin: 'https://www.linkedin.com/in/sadik-al-mahmud-058638326/',
  },

  // Contact information
  contact: {
    email: 'al.mahmud@equator.tech',
    personal: 'al.mahmud@equator.tech',
    phone: '+601161320832',
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
    id: 'gecko-chatbot',
    name: 'Gecko Chatbot',
    category: 'Desktop Apps',
    tagline: 'AI-Powered Desktop Assistant',
    description: 'Intelligent desktop chatbot powered by multiple AI models. Features local processing, conversation history, and a modern interface for seamless AI interactions.',
    techStack: ['Electron', 'React', 'Node.js', 'AI/ML', 'TypeScript'],
    longDescription: `
      Gecko Chatbot is a sophisticated desktop application that brings AI conversation capabilities directly to your desktop. 
      Built with modern web technologies and packaged as a native application, it provides seamless integration with your workflow.
      
      The application supports multiple AI models, maintains conversation history, and features a clean, intuitive interface. 
      Whether you're coding, researching, or brainstorming, Gecko is your intelligent companion for productivity.
      
      Key features include model switching, conversation management, syntax highlighting for code responses, 
      customizable themes, and export capabilities. Built with privacy in mind and optimized for performance.
    `,
    icon: '🦎',
    image: '/images/products/gecko/chat UI main welcome page.png',
    screenshots: [
      '/images/products/gecko/chat UI main welcome page.png',
      '/images/products/gecko/Chat UI.png',
      '/images/products/gecko/Chat UI_respond to prompt.png',
      '/images/products/gecko/chat UI- respond to prompt 2.png',
      '/images/products/gecko/chat ui_ thinking.png',
      '/images/products/gecko/models page.png',
      '/images/products/gecko/settings page.png',
    ],
    features: [
      'Multiple AI Model Support',
      'Conversation History',
      'Syntax Highlighting',
      'Cross-Platform Support',
      'Modern UI/UX',
      'Export Conversations',
      'Customizable Themes',
      'Offline Capability',
    ],
    links: {
      github: 'https://github.com/AlMahmud22/gecko-chatbot',
      demo: null,
      download: '/downloads/products/gecko/',
    },
    downloads: {
      windows: '/downloads/products/gecko/gecko-chatbot-setup.exe.txt',
      mac: '/downloads/products/gecko/gecko-chatbot.dmg.txt',
      linux: '/downloads/products/gecko/gecko-chatbot.AppImage.txt',
    },
    version: '1.0.0',
    status: 'Production Ready',
    createdDate: '2024-10-01',
    lastUpdate: '2025-02-20',
    size: '120 MB',
    stats: {
      downloads: '2.5k',
      stars: 145,
      forks: 28,
    },
    requirements: {
      os: 'Windows 10+, macOS 11+, Ubuntu 20.04+',
      ram: '4 GB RAM',
      storage: '200 MB available space',
    },
  },
  {
    id: 'phishguard',
    name: 'PhishGuard Desktop App',
    category: 'Desktop Apps',
    tagline: 'Advanced Phishing Detection & URL Scanner',
    description: 'Comprehensive desktop security tool for detecting phishing attacks, scanning suspicious URLs, and protecting against online threats with real-time analysis.',
    techStack: ['Electron', 'React', 'Node.js', 'Security APIs', 'TypeScript'],
    longDescription: `
      PhishGuard is a powerful desktop security application designed to protect users from phishing attacks and malicious URLs. 
      It combines multiple security analysis engines with an intuitive interface to provide comprehensive threat detection.
      
      The application features real-time URL scanning, detailed security reports, scan history tracking, and integration with 
      leading security services like VirusTotal and URLScan.io. Built for security professionals and everyday users alike.
      
      PhishGuard analyzes URLs for suspicious patterns, checks against known threat databases, performs comprehensive 
      diagnostics, and provides actionable security recommendations. Your first line of defense against online threats.
    `,
    icon: '🛡️',
    image: '/images/products/phishguard/Dashboard.png',
    screenshots: [
      '/images/products/phishguard/Dashboard.png',
      '/images/products/phishguard/Scan URL page.png',
      '/images/products/phishguard/Scan url urlscan.io page 2.png',
      '/images/products/phishguard/scan history page.png',
      '/images/products/phishguard/Diagnostics page.png',
      '/images/products/phishguard/Settings page.png',
    ],
    features: [
      'Real-time URL Scanning',
      'Multi-Engine Analysis',
      'Scan History Tracking',
      'VirusTotal Integration',
      'URLScan.io Integration',
      'Detailed Security Reports',
      'Threat Intelligence',
      'Offline Pattern Detection',
    ],
    links: {
      github: 'https://github.com/AlMahmud22/psm1_phishguard',
      demo: null,
      download: '/downloads/products/phishguard/',
    },
    downloads: {
      windows: '/downloads/products/phishguard/phishguard-setup.exe.txt',
      mac: '/downloads/products/phishguard/phishguard.dmg.txt',
      linux: '/downloads/products/phishguard/phishguard.AppImage.txt',
    },
    version: '1.0.0',
    status: 'Production Ready',
    createdDate: '2024-09-15',
    lastUpdate: '2025-02-20',
    size: '95 MB',
    stats: {
      downloads: '1.8k',
      stars: 98,
      forks: 19,
    },
    requirements: {
      os: 'Windows 10+, macOS 11+, Ubuntu 20.04+',
      ram: '4 GB RAM',
      storage: '150 MB available space',
    },
  },
]

// Project categories for filtering
export const projectCategories = [
  { id: 'all', name: 'All Projects', count: 2 },
  { id: 'desktop-apps', name: 'Desktop Apps', count: 2 },
]

// Tech stack tags for filtering
export const techStacks = [
  'React', 'Node.js', 'TypeScript', 'Electron', 'AI/ML', 'Security APIs'
]

export type Project = typeof projects[0]
export type Product = Project
export const products = projects  // Main products array
export const mainProjects = projects  // Export for showcase
