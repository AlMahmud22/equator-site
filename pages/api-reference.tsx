import Head from 'next/head'
import { motion } from 'framer-motion'
import { Code, Copy, ExternalLink, Book } from 'lucide-react'
import Layout from '@/components/Layout'
import { useScrollReveal } from '@/hooks/useAnimations'

const endpoints = [
  {
    method: 'POST',
    endpoint: '/api/v1/chatbot/send',
    description: 'Send a message to the chatbot and receive a response',
    parameters: [
      { name: 'message', type: 'string', required: true, description: 'The message to send' },
      { name: 'context', type: 'string', required: false, description: 'Session context ID' },
      { name: 'model', type: 'string', required: false, description: 'AI model to use' },
    ],
  },
  {
    method: 'GET',
    endpoint: '/api/v1/models',
    description: 'List available AI models',
    parameters: [
      { name: 'type', type: 'string', required: false, description: 'Filter by model type' },
      { name: 'limit', type: 'number', required: false, description: 'Number of results to return' },
    ],
  },
  {
    method: 'POST',
    endpoint: '/api/v1/playground/execute',
    description: 'Execute code in the AI Playground',
    parameters: [
      { name: 'code', type: 'string', required: true, description: 'Code to execute' },
      { name: 'language', type: 'string', required: true, description: 'Programming language' },
      { name: 'model_id', type: 'string', required: false, description: 'Specific model to use' },
    ],
  },
]

const codeExamples = {
  javascript: `// JavaScript Example
const response = await fetch('/api/v1/chatbot/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-api-key'
  },
  body: JSON.stringify({
    message: 'Hello, how can you help me?',
    context: 'user-session-123'
  })
});

const data = await response.json();
console.log(data.response);`,
  
  python: `# Python Example
import requests

url = "https://api.equators.tech/v1/chatbot/send"
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer your-api-key"
}
data = {
    "message": "Hello, how can you help me?",
    "context": "user-session-123"
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result["response"])`,

  curl: `# cURL Example
curl -X POST https://api.equators.tech/v1/chatbot/send \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer your-api-key" \\
  -d '{
    "message": "Hello, how can you help me?",
    "context": "user-session-123"
  }'`
}

export default function APIReferencePage() {
  const heroRef = useScrollReveal()

  return (
    <Layout
      title="API Reference - Equators Developer Documentation"
      description="Complete API reference for Equators applications. Endpoints, parameters, and code examples for developers."
    >
      <Head>
        <meta property="og:title" content="API Reference - Equators Developer Documentation" />
        <meta property="og:description" content="Complete API reference for Equators applications. Endpoints, parameters, and code examples for developers." />
        <meta property="og:type" content="website" />
      </Head>

      {/* Hero Section */}
      <section className="pt-20 lg:pt-24 section-padding bg-gradient-to-br from-secondary-950 via-secondary-900 to-primary-950/50">
        <div className="container-custom">
          <motion.div
            ref={heroRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              API <span className="text-gradient">Reference</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-12 leading-relaxed">
              Complete reference documentation for the Equators API. Build powerful integrations 
              with our desktop applications using RESTful endpoints.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="btn-primary">
                <Book className="w-4 h-4 mr-2" />
                Get Started
              </button>
              <button className="btn-ghost">
                <ExternalLink className="w-4 h-4 mr-2" />
                View on GitHub
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Authentication */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-8 text-center">
              <span className="text-gradient">Authentication</span>
            </h2>
            
            <div className="card">
              <h3 className="text-xl font-semibold text-white mb-4">API Key Authentication</h3>
              <p className="text-secondary-300 mb-6">
                All API requests require authentication using an API key. Include your API key in the Authorization header:
              </p>
              
              <div className="bg-secondary-950 rounded-lg border border-secondary-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-secondary-800 border-b border-secondary-700">
                  <span className="text-secondary-300 text-sm font-mono">Authorization Header</span>
                  <button className="text-secondary-400 hover:text-white transition-colors duration-200">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4">
                  <code className="text-secondary-200 font-mono text-sm">
                    Authorization: Bearer your-api-key-here
                  </code>
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <p className="text-blue-300 text-sm">
                  <strong>Note:</strong> You can generate API keys from your dashboard after creating an account.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* API Endpoints */}
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
              API <span className="text-gradient">Endpoints</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              Comprehensive list of available endpoints with parameters and usage examples.
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto space-y-8">
            {endpoints.map((endpoint, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                    endpoint.method === 'GET' 
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {endpoint.method}
                  </span>
                  <code className="text-secondary-200 font-mono text-lg">
                    {endpoint.endpoint}
                  </code>
                </div>
                
                <p className="text-secondary-300 mb-6">{endpoint.description}</p>
                
                <h4 className="text-white font-semibold mb-4">Parameters</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-secondary-800">
                        <th className="text-left py-2 text-secondary-300">Name</th>
                        <th className="text-left py-2 text-secondary-300">Type</th>
                        <th className="text-left py-2 text-secondary-300">Required</th>
                        <th className="text-left py-2 text-secondary-300">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {endpoint.parameters.map((param, paramIndex) => (
                        <tr key={paramIndex} className="border-b border-secondary-800/50">
                          <td className="py-2 text-primary-400 font-mono">{param.name}</td>
                          <td className="py-2 text-secondary-300">{param.type}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 text-xs rounded ${
                              param.required 
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}>
                              {param.required ? 'Required' : 'Optional'}
                            </span>
                          </td>
                          <td className="py-2 text-secondary-300">{param.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Code Examples */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Code <span className="text-gradient">Examples</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              Ready-to-use code examples in multiple programming languages.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              {Object.entries(codeExamples).map(([language, code], index) => (
                <motion.div
                  key={language}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-secondary-950 rounded-lg border border-secondary-800 overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 bg-secondary-800 border-b border-secondary-700">
                    <div className="flex items-center space-x-2">
                      <Code className="w-4 h-4 text-primary-400" />
                      <span className="text-secondary-200 font-medium capitalize">{language}</span>
                    </div>
                    <button className="text-secondary-400 hover:text-white transition-colors duration-200">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-secondary-200 font-mono text-xs leading-relaxed">
                      <code>{code}</code>
                    </pre>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SDKs and Libraries */}
      <section className="section-padding bg-secondary-950">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              SDKs & <span className="text-gradient">Libraries</span>
            </h2>
            <p className="text-lg text-secondary-300 mb-8">
              Official SDKs and community libraries to make integration even easier.
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: 'JavaScript/Node.js', version: 'v2.1.0' },
                { name: 'Python', version: 'v1.8.0' },
                { name: 'Go', version: 'v1.2.0' },
              ].map((sdk, index) => (
                <div key={index} className="card text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">{sdk.name}</h3>
                  <p className="text-secondary-400 text-sm mb-4">{sdk.version}</p>
                  <button className="btn-ghost w-full">Download</button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}
