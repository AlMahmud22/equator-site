import Head from 'next/head'
import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, XCircle, Clock, Zap, Globe } from 'lucide-react'
import Layout from '@/components/Layout'
import { useScrollReveal } from '@/shared/hooks/useAnimations'

const services = [
  {
    name: 'Privacy Chatbot',
    status: 'operational',
    uptime: '99.9%',
    responseTime: '45ms',
    description: 'AI-powered conversational assistant',
  },
  {
    name: 'AI Playground',
    status: 'operational',
    uptime: '99.8%',
    responseTime: '120ms',
    description: 'Interactive AI experimentation platform',
  },
  {
    name: 'Privacy Browser',
    status: 'operational',
    uptime: '99.9%',
    responseTime: '30ms',
    description: 'Privacy-focused web browser',
  },
  {
    name: 'Authentication Service',
    status: 'operational',
    uptime: '99.95%',
    responseTime: '25ms',
    description: 'User authentication and authorization',
  },
  {
    name: 'API Gateway',
    status: 'operational',
    uptime: '99.9%',
    responseTime: '15ms',
    description: 'RESTful API endpoints',
  },
  {
    name: 'CDN & Downloads',
    status: 'operational',
    uptime: '99.99%',
    responseTime: '50ms',
    description: 'Content delivery and software downloads',
  },
]

const incidents = [
  {
    date: '2024-12-20',
    title: 'Resolved: Brief API Gateway Slowdown',
    status: 'resolved',
    duration: '15 minutes',
    description: 'API responses were slower than usual due to increased traffic. Issue resolved by scaling infrastructure.',
  },
  {
    date: '2024-12-15',
    title: 'Resolved: Chatbot Service Intermittent Issues',
    status: 'resolved',
    duration: '45 minutes',
    description: 'Some users experienced timeout errors when using the chatbot. Fixed by restarting affected services.',
  },
  {
    date: '2024-12-10',
    title: 'Resolved: Scheduled Maintenance',
    status: 'resolved',
    duration: '2 hours',
    description: 'Planned maintenance to upgrade database infrastructure. All services restored.',
  },
]

const upcomingMaintenance = [
  {
    date: '2024-12-28',
    time: '02:00 - 04:00 UTC',
    title: 'Database Performance Optimization',
    description: 'Planned maintenance to optimize database performance. Minimal service impact expected.',
    affected: ['API Gateway', 'Authentication Service'],
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'operational':
      return <CheckCircle className="w-5 h-5 text-green-400" />
    case 'degraded':
      return <AlertCircle className="w-5 h-5 text-yellow-400" />
    case 'outage':
      return <XCircle className="w-5 h-5 text-red-400" />
    default:
      return <Clock className="w-5 h-5 text-gray-400" />
  }
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'operational':
      return 'text-green-400'
    case 'degraded':
      return 'text-yellow-400'
    case 'outage':
      return 'text-red-400'
    default:
      return 'text-gray-400'
  }
}

export default function StatusPage() {
  const heroRef = useScrollReveal()

  return (
    <Layout
      title="Status - System Health"
      description="Real-time status and uptime information for all services and applications."
    >
      <Head>
        <meta property="og:title" content="Status - System Health" />
        <meta property="og:description" content="Real-time status and uptime information for all services and applications." />
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
              System <span className="text-gradient">Status</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-12 leading-relaxed">
              Real-time status and performance metrics for all services. 
              Stay informed about system health and planned maintenance.
            </p>
            
            {/* Overall Status */}
            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-green-500/20 border border-green-500/30 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-green-300 font-semibold">All Systems Operational</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Service Status */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Service <span className="text-gradient">Status</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              Current operational status of all equator services and applications.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-4">
            {services.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(service.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                      <p className="text-sm text-secondary-400">{service.description}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8 text-sm">
                    <div className="text-center">
                      <div className="text-secondary-400">Uptime</div>
                      <div className="text-white font-semibold">{service.uptime}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-secondary-400">Response</div>
                      <div className="text-white font-semibold">{service.responseTime}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-secondary-400">Status</div>
                      <div className={`font-semibold capitalize ${getStatusColor(service.status)}`}>
                        {service.status}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="section-padding bg-secondary-950">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Performance <span className="text-gradient">Metrics</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              Key performance indicators across our infrastructure over the last 30 days.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-8 h-8" />,
                title: 'Average Response Time',
                value: '45ms',
                change: '-12%',
                positive: true,
              },
              {
                icon: <CheckCircle className="w-8 h-8" />,
                title: 'Uptime',
                value: '99.95%',
                change: '+0.05%',
                positive: true,
              },
              {
                icon: <Globe className="w-8 h-8" />,
                title: 'Global Coverage',
                value: '99.9%',
                change: 'Stable',
                positive: true,
              },
            ].map((metric, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="w-16 h-16 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary-400">{metric.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{metric.title}</h3>
                <div className="text-3xl font-bold text-gradient mb-2">{metric.value}</div>
                <div className={`text-sm ${metric.positive ? 'text-green-400' : 'text-red-400'}`}>
                  {metric.change} from last month
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Recent <span className="text-gradient">Incidents</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              History of recent issues and their resolutions.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {incidents.map((incident, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-start space-x-4">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white">{incident.title}</h3>
                      <div className="text-sm text-secondary-400">{incident.date}</div>
                    </div>
                    <div className="flex items-center space-x-4 mb-3 text-sm text-secondary-400">
                      <span>Duration: {incident.duration}</span>
                      <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded">
                        {incident.status}
                      </span>
                    </div>
                    <p className="text-secondary-300">{incident.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upcoming Maintenance */}
      <section className="section-padding bg-secondary-950">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Scheduled <span className="text-gradient">Maintenance</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              Planned maintenance windows and system updates.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {upcomingMaintenance.length > 0 ? (
              <div className="space-y-6">
                {upcomingMaintenance.map((maintenance, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="card border-l-4 border-l-yellow-500"
                  >
                    <div className="flex items-start space-x-4">
                      <Clock className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-white">{maintenance.title}</h3>
                          <div className="text-sm text-secondary-400">{maintenance.date}</div>
                        </div>
                        <div className="text-sm text-yellow-400 mb-3">{maintenance.time}</div>
                        <p className="text-secondary-300 mb-3">{maintenance.description}</p>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-secondary-400">Affected services:</span>
                          <div className="flex space-x-2">
                            {maintenance.affected.map((service, serviceIndex) => (
                              <span
                                key={serviceIndex}
                                className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded"
                              >
                                {service}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center py-12"
              >
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Scheduled Maintenance</h3>
                <p className="text-secondary-300">All systems are running smoothly with no planned maintenance.</p>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Stay <span className="text-gradient">Informed</span>
            </h2>
            <p className="text-lg text-secondary-300 mb-8">
              Subscribe to status updates and be the first to know about incidents and maintenance.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
              />
              <button className="btn-primary px-6">Subscribe</button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  )
}
