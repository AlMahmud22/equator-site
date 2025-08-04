import Head from 'next/head'
import { motion } from 'framer-motion'
import { AlertTriangle, FileText, Mail, Clock } from 'lucide-react'
import Layout from '@/components/Layout'
import { useScrollReveal } from '@/shared/hooks/useAnimations'

export default function DMCAPage() {
  const heroRef = useScrollReveal()

  return (
    <Layout
      title="DMCA Policy - Equators"
      description="Equators' Digital Millennium Copyright Act (DMCA) policy and procedure for reporting copyright infringement claims."
    >
      <Head>
        <meta property="og:title" content="DMCA Policy - Equators" />
        <meta property="og:description" content="Equators' Digital Millennium Copyright Act (DMCA) policy and procedure for reporting copyright infringement claims." />
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
              DMCA <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-8 leading-relaxed">
              Our policy for handling Digital Millennium Copyright Act (DMCA) takedown notices and copyright infringement claims.
            </p>
            <div className="text-sm text-secondary-400">
              Last updated: December 20, 2024
            </div>
          </motion.div>
        </div>
      </section>

      {/* Key Information */}
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
              DMCA <span className="text-gradient">Overview</span>
            </h2>
            <p className="text-lg text-secondary-300 max-w-3xl mx-auto">
              We respect intellectual property rights and respond to valid DMCA takedown notices promptly.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: <AlertTriangle className="w-8 h-8" />,
                title: 'Copyright Respect',
                description: 'We take copyright infringement seriously and act on valid claims.',
              },
              {
                icon: <FileText className="w-8 h-8" />,
                title: 'Proper Process',
                description: 'Follow the correct DMCA process for takedown requests.',
              },
              {
                icon: <Mail className="w-8 h-8" />,
                title: 'Designated Agent',
                description: 'Send notices to our designated DMCA agent for processing.',
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: 'Timely Response',
                description: 'We respond to valid DMCA notices within the required timeframe.',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="w-16 h-16 bg-primary-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary-400">{item.icon}</div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-secondary-300 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DMCA Policy Content */}
      <section className="section-padding bg-secondary-950">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-12"
            >
              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-4">1. Our Commitment</h2>
                <div className="text-secondary-300 space-y-4">
                  <p>
                    Equators respects the intellectual property rights of others and expects users of our services to do the same. 
                    We will respond to clear notices of alleged copyright infringement that comply with the Digital Millennium Copyright Act (DMCA).
                  </p>
                  <p>
                    It is our policy to terminate, in appropriate circumstances, the accounts of users who are repeat infringers 
                    of intellectual property rights.
                  </p>
                </div>
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-4">2. Filing a DMCA Takedown Notice</h2>
                <div className="text-secondary-300 space-y-4">
                  <p>If you believe that content on our platform infringes your copyright, you may submit a DMCA takedown notice. 
                     Your notice must include the following information:</p>
                  
                  <div className="bg-secondary-800 p-6 rounded-lg">
                    <h3 className="font-semibold text-white mb-3">Required Information:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>A physical or electronic signature of the copyright owner or authorized agent</li>
                      <li>Identification of the copyrighted work claimed to have been infringed</li>
                      <li>Identification of the material that is claimed to be infringing and its location on our service</li>
                      <li>Your contact information (address, telephone number, and email address)</li>
                      <li>A statement that you have a good faith belief that the use is not authorized</li>
                      <li>A statement that the information is accurate and you are authorized to act on behalf of the copyright owner</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-4">3. Designated Agent</h2>
                <div className="text-secondary-300 space-y-4">
                  <p>Please send DMCA takedown notices to our designated agent:</p>
                  
                  <div className="bg-secondary-800 p-6 rounded-lg">
                    <h3 className="font-semibold text-white mb-3">DMCA Agent Contact Information:</h3>
                    <div className="space-y-2">
                      <p><strong>Name:</strong> DMCA Agent</p>
                      <p><strong>Email:</strong> dmca@equators.tech</p>
                      <p><strong>Address:</strong> Equators Inc., DMCA Department, Malaysia</p>
                      <p><strong>Phone:</strong> +1 (555) 123-DMCA</p>
                    </div>
                  </div>
                  
                  <p className="text-sm italic">
                    Note: Only DMCA notices should be sent to this contact. For other inquiries, please use our general contact information.
                  </p>
                </div>
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-4">4. Our Response Process</h2>
                <div className="text-secondary-300 space-y-4">
                  <p>Upon receiving a valid DMCA takedown notice, we will:</p>
                  
                  <ol className="list-decimal pl-6 space-y-2">
                    <li>Promptly investigate the claim</li>
                    <li>Remove or disable access to the allegedly infringing material if the claim is valid</li>
                    <li>Notify the user who posted the material about the takedown</li>
                    <li>Provide the user with information about filing a counter-notification if appropriate</li>
                  </ol>
                  
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
                    <p className="text-amber-300">
                      <strong>Processing Time:</strong> We typically process valid DMCA notices within 24-48 hours of receipt.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-4">5. Counter-Notifications</h2>
                <div className="text-secondary-300 space-y-4">
                  <p>
                    If you believe your content was removed by mistake or misidentification, you may file a counter-notification. 
                    Your counter-notification must include:
                  </p>
                  
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Your physical or electronic signature</li>
                    <li>Identification of the material that was removed and its previous location</li>
                    <li>A statement under penalty of perjury that you have a good faith belief the material was removed by mistake</li>
                    <li>Your name, address, and phone number</li>
                    <li>Consent to jurisdiction of the federal court in your district</li>
                  </ul>
                  
                  <p>
                    After receiving a valid counter-notification, we may restore the content after 10-14 business days, 
                    unless the copyright owner files a court action.
                  </p>
                </div>
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-4">6. Repeat Infringer Policy</h2>
                <div className="text-secondary-300 space-y-4">
                  <p>
                    We maintain a policy of terminating accounts of users who are determined to be repeat infringers. 
                    We may also at our sole discretion limit access to our service and/or terminate the accounts of any users 
                    who infringe any intellectual property rights of others, whether or not there is any repeat infringement.
                  </p>
                </div>
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-4">7. False Claims</h2>
                <div className="text-secondary-300 space-y-4">
                  <p>
                    Please note that under Section 512(f) of the DMCA, any person who knowingly materially misrepresents 
                    that material is infringing or was removed by mistake may be subject to liability. We reserve the right 
                    to seek damages from any party that submits a false or bad faith takedown notice or counter-notification.
                  </p>
                  
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-lg">
                    <p className="text-red-300">
                      <strong>Warning:</strong> Filing false DMCA claims can result in legal consequences, including liability for damages, 
                      attorney fees, and court costs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-4">8. Other Intellectual Property</h2>
                <div className="text-secondary-300 space-y-4">
                  <p>
                    This DMCA policy applies specifically to copyright infringement claims. For other intellectual property concerns 
                    such as trademark infringement, trade secret misappropriation, or patent infringement, please contact us at:
                  </p>
                  
                  <div className="bg-secondary-800 p-4 rounded-lg">
                    <p>Email: legal@equators.tech</p>
                    <p>Subject: Intellectual Property Concern</p>
                  </div>
                </div>
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-4">9. Updates to This Policy</h2>
                <div className="text-secondary-300 space-y-4">
                  <p>
                    We may update this DMCA policy from time to time. We will notify users of any material changes by posting 
                    the updated policy on our website and updating the &quot;last updated&quot; date at the top of this page.
                  </p>
                </div>
              </div>

              <div className="card">
                <h2 className="text-2xl font-bold text-white mb-4">10. Questions</h2>
                <div className="text-secondary-300 space-y-4">
                  <p>If you have questions about this DMCA policy or need assistance with the takedown process, please contact us:</p>
                  
                  <div className="bg-secondary-800 p-6 rounded-lg">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-white mb-2">General Inquiries</h3>
                        <p>Email: legal@equators.tech</p>
                        <p>Phone: +1 (555) 123-4567</p>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">DMCA Notices Only</h3>
                        <p>Email: dmca@equators.tech</p>
                        <p>Phone: +1 (555) 123-DMCA</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
