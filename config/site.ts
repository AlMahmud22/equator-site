export const siteConfig = {
  name: 'Equators',
  title: 'Equators - Full-Stack Developer | Web3, Security & WordPress Specialist',
  description: 'Professional software developer specializing in Web3 applications, cybersecurity tools, mobile development, and WordPress solutions. Explore my comprehensive project portfolio.',
  url: 'https://equators.tech',
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
        // Desktop Apps
        {
          name: 'AI Chatbot',
          href: '/products/privacy-chatbot',
          description: 'Privacy-first AI companion with local processing'
        },
        {
          name: 'Privacy Browser',
          href: '/products/privacy-browser',
          description: 'Decentralized web browsing with maximum privacy'
        },
        {
          name: 'Hacker Notes App',
          href: '/products/hacker-notes-app',
          description: 'Cybersecurity note-taking for pentesters'
        },
        {
          name: 'AI Text Summarizer',
          href: '/products/summarizer-app',
          description: 'Intelligent document processing tool'
        },
        // Web Apps
        {
          name: 'Token Swap Interface',
          href: '/products/token-swap-interface',
          description: 'DeFi token exchange on testnet'
        },
        {
          name: 'Ethereum Wallet Dashboard',
          href: '/products/eth-wallet-dashboard',
          description: 'Comprehensive Web3 portfolio tracker'
        },
        // Mobile Apps
        {
          name: 'Mobile Web3 Wallet',
          href: '/products/mobile-web3-wallet',
          description: 'Native mobile crypto wallet + NFT explorer'
        },
        // Security Tools
        {
          name: 'Bug Bounty Reporter',
          href: '/products/bugreport-builder',
          description: 'Professional security report generator'
        },
        {
          name: 'Web Vulnerability Scanner',
          href: '/products/simple-web-recon-cli',
          description: 'CLI security scanner for web apps'
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
    youtube: 'https://youtube.com/@equators',
    linkedin: 'https://www.linkedin.com/in/sadik-al-mahmud-058638326/',
  },

  // Contact information
  contact: {
    email: 'al.mahmud@equators.tech',
    personal: 'al.mahmud@equators.tech',
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
  // EXISTING PROJECTS - KEEP AS IS
  {
    id: 'privacy-chatbot',
    name: 'AI Chatbot',
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
    image: '/images/latest/equators-chatbot.png',
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
    status: 'Production Ready',
    createdDate: '2024-08-15',
    lastUpdate: '2024-12-20',
    size: '145 MB',
    stats: {
      downloads: '4.2k',
      stars: 89,
      forks: 23,
    },
    requirements: {
      os: 'Windows 10+, macOS 11+, Ubuntu 18.04+',
      ram: '4 GB RAM',
      storage: '200 MB available space',
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
    image: '/images/latest/equators browser.png',
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
    status: 'Production Ready',
    createdDate: '2024-05-20',
    lastUpdate: '2024-12-22',
    size: '320 MB',
    stats: {
      downloads: '3.1k',
      stars: 67,
      forks: 18,
    },
    requirements: {
      os: 'Windows 10+, macOS 11+, Ubuntu 20.04+',
      ram: '4 GB RAM',
      storage: '400 MB available space',
    },
  },

  // NEW DESKTOP / CLI APPS
  {
    id: 'hacker-notes-app',
    name: 'Hacker Notes App (PWA)',
    category: 'Desktop Apps',
    tagline: 'Cybersecurity Note-Taking',
    description: 'A cybersecurity-focused note-taking app for penetration testers and bug bounty hunters. Add, delete, search, and organize reconnaissance notes, vulnerability findings, and methodology steps.',
    techStack: ['React', 'LocalStorage', 'PWA', 'Tailwind CSS'],
    longDescription: `
      Developed specifically for cybersecurity professionals who need organized, searchable note-taking during penetration tests and bug bounty hunts. 
      Works completely offline as a Progressive Web App with no data transmission.
      
      Features categorized note organization, advanced search capabilities, export options for reporting, and templates for common vulnerability types. 
      Perfect for maintaining detailed reconnaissance notes and methodology documentation.
    `,
    icon: '🔒',
    image: '/images/latest/hacker notes app (PWA).png',
    screenshots: [
      '/images/products/hacker-notes-screenshot-1.jpg',
      '/images/products/hacker-notes-screenshot-2.jpg',
      '/images/products/hacker-notes-screenshot-3.jpg',
    ],
    features: [
      'Offline Functionality',
      'Advanced Search',
      'Categorized Notes',
      'Export Options',
      'Vulnerability Templates',
      'Cross-Platform PWA',
    ],
    links: {
      github: 'https://github.com/AlMahmud22/hacker-notes-app',
      demo: 'https://notes.equators.tech',
      download: 'https://notes.equators.tech',
    },
    downloads: {
      web: 'https://notes.equators.tech',
      pwa: 'Install via browser',
    },
    version: '1.0.0',
    status: 'In Development',
    createdDate: '2024-11-01',
    lastUpdate: '2024-12-20',
    size: '5 MB',
    stats: {
      downloads: '1.2k',
      stars: 45,
      forks: 12,
    },
    requirements: {
      os: 'Web (PWA), works on all devices',
      ram: '1 GB RAM',
      storage: '10 MB available space',
    },
  },
  {
    id: 'summarizer-app',
    name: 'AI-Powered Text Summarizer',
    category: 'Desktop Apps',
    tagline: 'Intelligent Document Processing',
    description: 'Intelligent text summarization tool that transforms lengthy articles, documents, or research papers into concise bullet-point summaries using advanced AI models.',
    techStack: ['React', 'LLM API', 'Node.js', 'Tailwind CSS'],
    longDescription: `
      Built to solve the information overload problem faced by researchers, students, and professionals. Uses advanced AI models to analyze and 
      summarize lengthy content while preserving key insights and maintaining context.
      
      Features multi-format input support, customizable summary lengths, batch processing capabilities, and export options for various formats. 
      Perfect for quickly processing research papers, articles, and documentation.
    `,
    icon: '📝',
    image: '/images/latest/Ai power text summarizer mini app.png',
    screenshots: [
      '/images/products/summarizer-screenshot-1.jpg',
      '/images/products/summarizer-screenshot-2.jpg',
      '/images/products/summarizer-screenshot-3.jpg',
    ],
    features: [
      'Multi-format Input',
      'Customizable Length',
      'Export Options',
      'Batch Processing',
      'AI-Powered Analysis',
      'Context Preservation',
    ],
    links: {
      github: 'https://github.com/AlMahmud22/summarizer-app',
      demo: '/demo/summarizer',
      download: '/downloads/summarizer-app/v1.2.0/',
    },
    downloads: {
      windows: '/downloads/summarizer-app/v1.2.0/summarizer-setup.exe',
      mac: '/downloads/summarizer-app/v1.2.0/summarizer.dmg',
      linux: '/downloads/summarizer-app/v1.2.0/summarizer.AppImage',
    },
    version: '1.2.0',
    status: 'Beta Testing',
    createdDate: '2024-09-15',
    lastUpdate: '2024-12-18',
    size: '180 MB',
    stats: {
      downloads: '2.8k',
      stars: 73,
      forks: 15,
    },
    requirements: {
      os: 'Windows 10+, macOS 11+, Ubuntu 18.04+',
      ram: '4 GB RAM',
      storage: '250 MB available space',
    },
  },

  // WEB APPS / WEB3 SECTION
  {
    id: 'token-swap-interface',
    name: 'Token Swap Interface (Testnet)',
    category: 'Web Apps',
    tagline: 'DeFi Token Exchange',
    description: 'Decentralized token exchange interface similar to Uniswap. Swap ERC20 tokens on testnet with real-time price feeds, liquidity pools, and slippage protection.',
    techStack: ['React', 'Ethers.js', 'Solidity', 'Web3.js'],
    longDescription: `
      Educational DeFi platform built to demonstrate decentralized exchange functionality on Ethereum testnet. Features real-time price feeds, 
      automated market maker logic, and comprehensive transaction handling.
      
      Includes MetaMask integration, multiple testnet support, transaction history tracking, and slippage protection. 
      Perfect for learning blockchain development and understanding DeFi mechanics.
    `,
    icon: '🔄',
    image: '/images/latest/Token Swap Interface (TestNet).png',
    screenshots: [
      '/images/products/token-swap-screenshot-1.jpg',
      '/images/products/token-swap-screenshot-2.jpg',
      '/images/products/token-swap-screenshot-3.jpg',
    ],
    features: [
      'MetaMask Integration',
      'Real-time Pricing',
      'Transaction History',
      'Multiple Testnets',
      'Slippage Protection',
      'Liquidity Pools',
    ],
    links: {
      github: 'https://github.com/AlMahmud22/token-swap-interface',
      demo: 'https://swap.equators.tech',
      download: 'https://swap.equators.tech',
    },
    downloads: {
      web: 'https://swap.equators.tech',
    },
    version: '2.0.0',
    status: 'Live on Testnet',
    createdDate: '2024-06-01',
    lastUpdate: '2024-12-15',
    size: '8 MB',
    stats: {
      downloads: '3.7k',
      stars: 91,
      forks: 24,
    },
    requirements: {
      os: 'Web Application',
      browser: 'MetaMask Extension Required',
      network: 'Ethereum Testnet Access',
    },
  },
  {
    id: 'eth-wallet-dashboard',
    name: 'Ethereum Wallet Dashboard',
    category: 'Web Apps',
    tagline: 'Web3 Portfolio Tracker',
    description: 'Comprehensive Web3 wallet interface for viewing Ethereum holdings, transaction history, NFT collections, and DeFi positions. Supports multiple wallets and ENS name resolution.',
    techStack: ['React', 'Ethers.js', 'Web3.js', 'Tailwind CSS'],
    longDescription: `
      Professional-grade wallet dashboard built for serious Web3 users who need comprehensive portfolio tracking across multiple wallets and protocols. 
      Features real-time balance updates, DeFi position tracking, and NFT collection management.
      
      Includes ENS name resolution, multi-wallet support, transaction analysis, and DeFi protocol integration. 
      Perfect for investors and developers who need detailed insights into their Web3 activities.
    `,
    icon: '💰',
    image: '/images/latest/Ethereum Wallet.png',
    screenshots: [
      '/images/products/wallet-dashboard-screenshot-1.jpg',
      '/images/products/wallet-dashboard-screenshot-2.jpg',
      '/images/products/wallet-dashboard-screenshot-3.jpg',
    ],
    features: [
      'Multi-wallet Support',
      'NFT Gallery',
      'Transaction Tracking',
      'ENS Integration',
      'DeFi Portfolio View',
      'Real-time Updates',
    ],
    links: {
      github: 'https://github.com/AlMahmud22/eth-wallet-dashboard',
      demo: 'https://wallet.equators.tech',
      download: 'https://wallet.equators.tech',
    },
    downloads: {
      web: 'https://wallet.equators.tech',
    },
    version: '1.5.0',
    status: 'Production Ready',
    createdDate: '2024-07-20',
    lastUpdate: '2024-12-22',
    size: '12 MB',
    stats: {
      downloads: '4.8k',
      stars: 124,
      forks: 31,
    },
    requirements: {
      os: 'Web Application',
      browser: 'Modern Browser with Web3 Support',
      network: 'Ethereum Mainnet/Testnet Access',
    },
  },

  // MOBILE APPS SECTION
  {
    id: 'mobile-web3-wallet',
    name: 'Mobile Web3 Wallet + NFT Explorer',
    category: 'Mobile Apps',
    tagline: 'Native Mobile Crypto Wallet',
    description: 'Native mobile application for managing cryptocurrency wallets and exploring NFT collections. Connect via MetaMask or WalletConnect to view balances, send transactions, and browse NFT metadata.',
    techStack: ['React Native', 'Ethers.js', 'IPFS', 'WalletConnect'],
    longDescription: `
      Full-featured mobile wallet application built with React Native for seamless iOS and Android compatibility. 
      Features WalletConnect integration, NFT metadata viewing, and comprehensive transaction management.
      
      Includes biometric security, push notifications for transactions, offline NFT viewing, and multi-chain support. 
      Designed for users who want professional-grade Web3 functionality on mobile devices.
    `,
    icon: '📱',
    image: '/images/latest/Gemini_Generated_Image_kcai0kcai0kcai0k.png',
    screenshots: [
      '/images/products/mobile-wallet-screenshot-1.jpg',
      '/images/products/mobile-wallet-screenshot-2.jpg',
      '/images/products/mobile-wallet-screenshot-3.jpg',
    ],
    features: [
      'WalletConnect Integration',
      'NFT Metadata Viewing',
      'Transaction Signing',
      'Biometric Security',
      'Multi-chain Support',
      'Push Notifications',
    ],
    links: {
      github: 'https://github.com/AlMahmud22/mobile-web3-wallet',
      demo: '/demo/mobile-wallet',
      download: '/downloads/mobile-wallet/',
    },
    downloads: {
      ios: 'App Store (Coming Soon)',
      android: 'Google Play (Coming Soon)',
    },
    version: '1.0.0',
    status: 'App Store Review',
    createdDate: '2024-08-01',
    lastUpdate: '2024-12-10',
    size: '45 MB',
    stats: {
      downloads: '1.5k',
      stars: 56,
      forks: 11,
    },
    requirements: {
      os: 'iOS 13+, Android 8.0+',
      ram: '3 GB RAM',
      storage: '100 MB available space',
    },
  },

]

// SECURITY TOOLS - Hidden from main showcase but accessible via direct links
const toolProducts = [
  {
    id: 'bugreport-builder',
    name: 'Bug Bounty Report Generator',
    category: 'Security Tools',
    tagline: 'Professional Security Reports',
    description: 'Automated tool for generating professional bug bounty reports with CVSS scoring, vulnerability classification, and PDF export capabilities.',
    techStack: ['React', 'jsPDF', 'Node.js', 'Tailwind CSS'],
    longDescription: `
      Streamline your bug bounty reporting process with this comprehensive report generator. Features automatic CVSS calculation, 
      vulnerability templates, and professional PDF formatting for consistent, high-quality submissions.
      
      Includes pre-built templates for common vulnerabilities, custom branding options, and export capabilities for multiple formats. 
      Perfect for security researchers who want to focus on finding bugs, not formatting reports.
    `,
    icon: '🛡️',
    image: '/images/latest/bug bounty report generator.png',
    screenshots: [
      '/images/products/bugreport-screenshot-1.jpg',
      '/images/products/bugreport-screenshot-2.jpg',
      '/images/products/bugreport-screenshot-3.jpg',
    ],
    features: [
      'CVSS Calculator',
      'PDF Export',
      'Vulnerability Templates',
      'Custom Branding',
      'Batch Processing',
      'Professional Formatting',
    ],
    links: {
      github: 'https://github.com/AlMahmud22/bugreport-builder',
      demo: '/demo/bugreport',
      download: '/downloads/bugreport-builder/v1.0.0/',
    },
    downloads: {
      windows: '/downloads/bugreport-builder/v1.0.0/bugreport-setup.exe',
      mac: '/downloads/bugreport-builder/v1.0.0/bugreport.dmg',
      linux: '/downloads/bugreport-builder/v1.0.0/bugreport.AppImage',
    },
    version: '1.0.0',
    status: 'Production Ready',
    createdDate: '2024-10-01',
    lastUpdate: '2024-12-15',
    size: '85 MB',
    stats: {
      downloads: '2.1k',
      stars: 67,
      forks: 14,
    },
    requirements: {
      os: 'Windows 10+, macOS 11+, Ubuntu 18.04+',
      ram: '2 GB RAM',
      storage: '100 MB available space',
    },
    isToolProduct: true,
  },
  {
    id: 'simple-web-recon-cli',
    name: 'Web Vulnerability Scanner',
    category: 'Security Tools',
    tagline: 'CLI Security Scanner',
    description: 'Command-line web vulnerability scanner for identifying common security issues, SSL problems, and configuration weaknesses in web applications.',
    techStack: ['Python', 'CLI', 'SSL/TLS', 'HTTP'],
    longDescription: `
      Lightweight yet powerful command-line scanner designed for quick security assessments of web applications. 
      Features automated detection of common vulnerabilities, SSL/TLS configuration issues, and misconfigurations.
      
      Includes subdomain enumeration, directory brute-forcing, header analysis, and vulnerability scoring. 
      Perfect for security audits, penetration testing, and continuous security monitoring.
    `,
    icon: '🔍',
    image: '/images/latest/web vulnerability scanner.png',
    screenshots: [
      '/images/products/scanner-screenshot-1.jpg',
      '/images/products/scanner-screenshot-2.jpg',
      '/images/products/scanner-screenshot-3.jpg',
    ],
    features: [
      'Subdomain Enumeration',
      'Directory Brute Force',
      'SSL/TLS Analysis',
      'Header Inspection',
      'Vulnerability Scoring',
      'JSON/XML Export',
    ],
    links: {
      github: 'https://github.com/AlMahmud22/simple-web-recon-cli',
      demo: '/demo/scanner',
      download: '/downloads/web-scanner/v2.0.0/',
    },
    downloads: {
      windows: '/downloads/web-scanner/v2.0.0/scanner.exe',
      mac: '/downloads/web-scanner/v2.0.0/scanner-mac',
      linux: '/downloads/web-scanner/v2.0.0/scanner-linux',
    },
    version: '2.0.0',
    status: 'Production Ready',
    createdDate: '2024-09-01',
    lastUpdate: '2024-12-18',
    size: '15 MB',
    stats: {
      downloads: '3.4k',
      stars: 92,
      forks: 21,
    },
    requirements: {
      os: 'Windows 10+, macOS 10.15+, Linux (any)',
      ram: '1 GB RAM',
      storage: '50 MB available space',
      runtime: 'Python 3.8+',
    },
    isToolProduct: true,
  },
]

// Combine main projects with tool products for individual page access
export const allProducts = [...projects, ...toolProducts]

// Project categories for filtering
export const projectCategories = [
  { id: 'all', name: 'All Projects', count: 7 },
  { id: 'desktop-apps', name: 'Desktop Apps', count: 2 },
  { id: 'web-apps', name: 'Web Apps', count: 2 },
  { id: 'mobile-apps', name: 'Mobile Apps', count: 1 },
  { id: 'security-tools', name: 'Security Tools', count: 2 },
]

// Tech stack tags for filtering
export const techStacks = [
  'React', 'Node.js', 'TypeScript', 'Next.js', 'Tailwind CSS',
  'Electron', 'Python', 'React Native', 'Solidity', 'Web3.js',
  'Ethers.js', 'MongoDB', 'PHP', 'WordPress', 'WooCommerce',
  'SCSS', 'JavaScript', 'Ollama', 'LLM API', 'PWA',
  'Chromium', 'C++', 'Tor', 'IPFS', 'WalletConnect',
  'jsPDF', 'Markdown', 'Axios', 'CLI', 'CSS Grid', 'AJAX'
]

export type Project = typeof projects[0]
export type Product = Project
export const products = allProducts  // Include both main projects and tools for individual pages

// Export main projects separately for showcase (without tools)
export const mainProjects = projects
