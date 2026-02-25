import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { 
  Download, 
  Github, 
  ArrowLeft, 
  MessageSquare, 
  Zap, 
  Shield, 
  Monitor,
  Code,
  Star
} from 'lucide-react';
import Layout from '@/components/Layout';
import OSIcon from '@/components/OSIcon';
import SimpleDownloadButton from '@/components/SimpleDownloadButton';

const GeckoChatbotPage = () => {
  const router = useRouter();
  const downloadTriggered = useRef(false);
  const product = {
    id: 'gecko-chatbot',
    name: 'Gecko Chatbot',
    version: '1.0.0',
    tagline: 'AI-Powered Desktop Assistant',
    description: 'Intelligent desktop chatbot powered by multiple AI models. Features local processing, conversation history, and a modern interface for seamless AI interactions.',
    githubUrl: 'https://github.com/AlMahmud22/gecko-chatbot',
    
    screenshots: [
      {
        src: '/images/products/gecko/chat UI main welcome page.png',
        title: 'Welcome Screen',
        description: 'Clean and intuitive welcome interface'
      },
      {
        src: '/images/products/gecko/Chat UI.png',
        title: 'Chat Interface',
        description: 'Modern chat interface with syntax highlighting'
      },
      {
        src: '/images/products/gecko/Chat UI_respond to prompt.png',
        title: 'AI Response',
        description: 'Intelligent responses with formatted output'
      },
      {
        src: '/images/products/gecko/chat UI- respond to prompt 2.png',
        title: 'Conversation Flow',
        description: 'Seamless multi-turn conversations'
      },
      {
        src: '/images/products/gecko/chat ui_ thinking.png',
        title: 'Thinking Mode',
        description: 'Real-time thinking indicators'
      },
      {
        src: '/images/products/gecko/models page.png',
        title: 'Model Selection',
        description: 'Choose from multiple AI models'
      },
      {
        src: '/images/products/gecko/settings page.png',
        title: 'Settings',
        description: 'Customize your experience'
      },
    ],

    features: [
      {
        icon: <MessageSquare className="w-6 h-6" />,
        title: 'Multiple AI Models',
        description: 'Switch between different AI models for various tasks and preferences.'
      },
      {
        icon: <Zap className="w-6 h-6" />,
        title: 'Fast Performance',
        description: 'Optimized for speed with efficient resource management.'
      },
      {
        icon: <Shield className="w-6 h-6" />,
        title: 'Conversation History',
        description: 'Keep track of all your conversations with organized history.'
      },
      {
        icon: <Monitor className="w-6 h-6" />,
        title: 'Cross-Platform',
        description: 'Available for Windows, macOS, and Linux systems.'
      },
      {
        icon: <Code className="w-6 h-6" />,
        title: 'Syntax Highlighting',
        description: 'Beautiful code formatting for technical discussions.'
      },
      {
        icon: <Star className="w-6 h-6" />,
        title: 'Modern UI/UX',
        description: 'Clean, intuitive interface designed for productivity.'
      },
    ],

    techStack: ['Electron', 'React', 'Node.js', 'AI/ML', 'TypeScript'],
    
    downloads: {
      windows: '/downloads/products/gecko/gecko-chatbot-setup.exe.txt',
      mac: '/downloads/products/gecko/gecko-chatbot.dmg.txt',
      linux: '/downloads/products/gecko/gecko-chatbot.AppImage.txt',
    },
  };

  // Auto-download on page load if download parameter is present
  useEffect(() => {
    if (router.query.download === 'windows' && !downloadTriggered.current) {
      downloadTriggered.current = true;
      // Trigger download after a short delay to let page load
      setTimeout(() => {
        const link = document.createElement('a');
        link.href = product.downloads.windows;
        link.download = 'gecko-chatbot-setup.exe.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }, 500);
    }
  }, [router.query.download, product.downloads.windows]);

  return (
    <Layout
      title={`${product.name} - ${product.tagline}`}
      description={product.description}
    >
      <Head>
        <meta property="og:title" content={`${product.name} - AI Desktop Assistant`} />
        <meta property="og:description" content={product.description} />
        <meta property="og:image" content={product.screenshots[0].src} />
      </Head>

      {/* Hero Section */}
      <section className="pt-20 lg:pt-24 section-padding bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto"
          >
            {/* Breadcrumb */}
            <nav className="flex items-center text-sm text-secondary-400 mb-8">
              <Link href="/" className="hover:text-white transition-colors duration-200">
                Home
              </Link>
              <span className="mx-2">/</span>
              <Link href="/products" className="hover:text-white transition-colors duration-200">
                Products
              </Link>
              <span className="mx-2">/</span>
              <span className="text-primary-400">{product.name}</span>
            </nav>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Product Info */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="flex items-center mb-4"
                >
                  <div className="text-4xl mr-4">🦎</div>
                  <div className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-sm text-primary-300">
                    v{product.version}
                  </div>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="text-4xl lg:text-5xl font-bold text-white mb-4"
                >
                  {product.name}
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-xl text-primary-400 font-medium mb-6"
                >
                  {product.tagline}
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className="text-lg text-secondary-300 mb-8 leading-relaxed"
                >
                  {product.description}
                </motion.p>

                {/* Download Buttons */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4 mb-6"
                >
                  <SimpleDownloadButton
                    href={product.downloads.windows}
                    label="Download for Windows"
                    className="btn-primary text-lg px-8 py-4 group"
                  />
                  
                  <Link 
                    href={product.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary text-lg px-8 py-4 group flex items-center justify-center"
                  >
                    <Github className="w-5 h-5 mr-2" />
                    View on GitHub
                  </Link>
                </motion.div>

                {/* Other Platforms */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="flex items-center gap-4"
                >
                  <span className="text-sm text-secondary-400">Also available for:</span>
                  <a 
                    href={product.downloads.mac} 
                    className="text-secondary-300 hover:text-white transition-colors"
                    download
                  >
                    macOS
                  </a>
                  <a 
                    href={product.downloads.linux} 
                    className="text-secondary-300 hover:text-white transition-colors"
                    download
                  >
                    Linux
                  </a>
                </motion.div>
              </div>

              {/* Hero Image */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="relative"
              >
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src={product.screenshots[0].src}
                    alt={product.screenshots[0].title}
                    width={800}
                    height={600}
                    className="w-full h-auto"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section-padding bg-secondary-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Key <span className="text-gradient">Features</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              Everything you need for productive AI conversations.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {product.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover"
              >
                <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center mb-4 text-primary-400">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-secondary-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshots Gallery */}
      <section className="section-padding bg-secondary-950">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              See It In <span className="text-gradient">Action</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              Explore the interface and features through these screenshots.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {product.screenshots.map((screenshot, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={screenshot.src}
                    alt={screenshot.title}
                    width={600}
                    height={400}
                    className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="font-semibold mb-1">{screenshot.title}</h4>
                    <p className="text-sm text-gray-300">{screenshot.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8">
              Built With Modern <span className="text-gradient">Technologies</span>
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {product.techStack.map((tech, index) => (
                <div
                  key={index}
                  className="px-6 py-3 bg-secondary-800 rounded-full text-white border border-secondary-700"
                >
                  {tech}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Download Section */}
      <section className="section-padding bg-gradient-to-br from-primary-950/50 to-accent-950/50">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Ready to Get <span className="text-gradient">Started?</span>
            </h2>
            <p className="text-lg text-secondary-300 mb-8">
              Download Gecko Chatbot for your platform and start having intelligent conversations today.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="card-hover text-center">
                <OSIcon os="windows" size={48} className="mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-4">Windows</h3>
                <SimpleDownloadButton
                  href={product.downloads.windows}
                  label="Download"
                  className="btn-primary w-full"
                />
              </div>
              
              <div className="card-hover text-center">
                <OSIcon os="macos" size={48} className="mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-4">macOS</h3>
                <SimpleDownloadButton
                  href={product.downloads.mac}
                  label="Download"
                  className="btn-primary w-full"
                />
              </div>
              
              <div className="card-hover text-center">
                <OSIcon os="linux" size={48} className="mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-4">Linux</h3>
                <SimpleDownloadButton
                  href={product.downloads.linux}
                  label="Download"
                  className="btn-primary w-full"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Back to Products */}
      <section className="py-8 bg-secondary-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Link href="/products" className="btn-ghost group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
              Back to All Products
            </Link>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default GeckoChatbotPage;
