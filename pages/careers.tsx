import Head from 'next/head'
import { motion } from 'framer-motion'
import { Users, MapPin, Heart, Award, ArrowRight } from 'lucide-react'
import Layout from '@/components/Layout'
import { useScrollReveal } from '@/shared/hooks/useAnimations'

const jobOpenings = [
  {
    title: 'Senior Frontend Developer',
    department: 'Engineering',
    location: 'Malaysia / Remote',
    type: 'Full-time',
    description: 'Build beautiful, responsive user interfaces for our desktop applications.',
  },
  {
    title: 'AI Research Engineer',
    department: 'Research',
    location: 'Malaysia',
    type: 'Full-time',
    description: 'Develop cutting-edge AI models and algorithms for our products.',
  },
  {
    title: 'Product Designer',
    department: 'Design',
    location: 'Remote',
    type: 'Full-time',
    description: 'Design intuitive and delightful user experiences across our product suite.',
  },
  {
    title: 'DevOps Engineer',
    department: 'Engineering',
    location: 'Malaysia / Remote',
    type: 'Full-time',
    description: 'Scale our infrastructure and improve deployment processes.',
  },
  {
    title: 'Technical Writer',
    department: 'Marketing',
    location: 'Remote',
    type: 'Contract',
    description: 'Create comprehensive documentation and technical content.',
  },
]

const benefits = [
  {
    icon: <Heart className="w-8 h-8" />,
    title: 'Health & Wellness',
    description: 'Comprehensive health insurance, dental, vision, and wellness programs.',
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: 'Work-Life Balance',
    description: 'Flexible hours, unlimited PTO, and remote work options.',
  },
  {
    icon: <Award className="w-8 h-8" />,
    title: 'Professional Growth',
    description: 'Learning budgets, conference attendance, and mentorship programs.',
  },
  {
    icon: <MapPin className="w-8 h-8" />,
    title: 'Great Office',
    description: 'Modern workspace in Malaysia with all the amenities you need.',
  },
]

export default function CareersPage() {
  const heroRef = useScrollReveal()

  return (
    <Layout
      title="Careers - Join the Equators Team"
      description="Join our mission to build the future of desktop applications. Explore career opportunities at Equators."
    >
      <Head>
        <meta property="og:title" content="Careers - Join the Equators Team" />
        <meta property="og:description" content="Join our mission to build the future of desktop applications. Explore career opportunities at Equators." />
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
              Build the <span className="text-gradient">Future</span> with Us
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-12 leading-relaxed">
              Join our passionate team of developers, designers, and innovators who are creating 
              the next generation of desktop applications. Make an impact at Equators.
            </p>
            <button className="btn-primary text-lg px-8 py-4">
              View Open Positions
            </button>
          </motion.div>
        </div>
      </section>

      {/* Why Work at Equators */}
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
              Why <span className="text-gradient">Equators</span>?
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              We&apos;re not just building software - we&apos;re shaping the future of how people interact with technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover text-center"
              >
                <div className="w-16 h-16 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary-400">{benefit.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{benefit.title}</h3>
                <p className="text-secondary-300">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
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
              Open <span className="text-gradient">Positions</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              Ready to make an impact? Explore our current openings and find your next career opportunity.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-6">
            {jobOpenings.map((job, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card-hover group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-semibold text-white group-hover:text-gradient transition-colors duration-300">
                        {job.title}
                      </h3>
                      <span className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-sm text-primary-300">
                        {job.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-secondary-400 mb-3">
                      <span>{job.department}</span>
                      <span>•</span>
                      <span>{job.location}</span>
                    </div>
                    <p className="text-secondary-300">{job.description}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-secondary-400 group-hover:text-primary-400 group-hover:translate-x-1 transition-all duration-200 ml-4" />
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <p className="text-secondary-300 mb-6">
              Don&apos;t see a position that fits? We&apos;re always looking for talented people.
            </p>
            <button className="btn-ghost">
              Send us your resume
            </button>
          </motion.div>
        </div>
      </section>

      {/* Application Process */}
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
              Our <span className="text-gradient">Process</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              We believe in a transparent, respectful hiring process that gives you the best opportunity to showcase your skills.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Application',
                description: 'Submit your application and tell us why you\'re interested in Equators.',
              },
              {
                step: '02',
                title: 'Initial Screen',
                description: 'Brief conversation with our recruiting team to learn more about you.',
              },
              {
                step: '03',
                title: 'Technical Interview',
                description: 'Showcase your skills through practical exercises and discussions.',
              },
              {
                step: '04',
                title: 'Team Interview',
                description: 'Meet your potential teammates and learn about our culture.',
              },
            ].map((process, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-lg">{process.step}</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{process.title}</h3>
                <p className="text-secondary-300">{process.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
