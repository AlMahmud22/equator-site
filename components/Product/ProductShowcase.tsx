'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, Variants } from 'framer-motion'
import { ArrowRight, Download, ExternalLink, Github, Star, Calendar, Code } from 'lucide-react'
import { mainProjects } from '@/config/site'
import { useScrollReveal } from '@/shared/hooks/useAnimations'
import { getOSSpecificDownload } from '@/shared/utils'
import BlizzardOverlay from '@/components/BlizzardOverlay'

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
}

export default function ProductShowcase() {
  const [hoveredProject, setHoveredProject] = useState<string | null>(null)
  const sectionRef = useScrollReveal()

  return (
    <section className="section-padding bg-pitch-black relative">
      <BlizzardOverlay />
      <div className="container-custom relative z-10">
        <motion.div
          ref={sectionRef}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 heading-3d">
              <span className="text-gradient">Personal Projects</span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto">
              A collection of privacy-focused tools and applications I&apos;ve built to promote digital freedom 
              and user sovereignty.
            </p>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {mainProjects.map((project) => {
              const download = getOSSpecificDownload(project.id)
              
              return (
                <motion.div
                  key={project.id}
                  variants={itemVariants}
                  className="group"
                  onMouseEnter={() => setHoveredProject(project.id)}
                  onMouseLeave={() => setHoveredProject(null)}
                >
                  <div className="card-hover h-full relative overflow-hidden flex flex-col">
                    {/* Project Image */}
                    <div className="relative h-48 mb-6 rounded-lg overflow-hidden flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20 z-10" />
                      <Image
                        src={project.image}
                        alt={project.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                      
                      {/* Floating Icon */}
                      <motion.div
                        className="absolute top-4 left-4 w-12 h-12 bg-white/10 backdrop-blur-md rounded-lg flex items-center justify-center text-2xl z-20"
                        animate={{
                          y: hoveredProject === project.id ? -5 : 0,
                          scale: hoveredProject === project.id ? 1.1 : 1,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {project.icon}
                      </motion.div>
                      
                      {/* Version Badge */}
                      <div className="absolute top-4 right-4 px-2 py-1 bg-primary-500/20 backdrop-blur-md border border-primary-500/30 rounded-full text-xs text-primary-300 z-20">
                        v{project.version}
                      </div>

                      {/* Category Badge */}
                      <div className="absolute bottom-4 left-4 px-3 py-1 bg-accent-500/20 backdrop-blur-md border border-accent-500/30 rounded-full text-xs text-accent-300 z-20">
                        {project.category}
                      </div>
                    </div>

                    {/* Project Info */}
                    <div className="space-y-4 flex-grow flex flex-col">
                      <div className="flex-grow">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-gradient transition-colors duration-300">
                          {project.name}
                        </h3>
                        <p className="text-sm text-primary-400 font-medium mb-3">
                          {project.tagline}
                        </p>
                        <p className="text-secondary-300 leading-relaxed text-sm">
                          {project.description}
                        </p>
                      </div>

                      {/* Bottom section - Tech Stack, Stats, and Buttons */}
                      <div className="mt-auto space-y-4">
                        {/* Tech Stack */}
                        <div className="space-y-2">
                          <div className="flex items-center text-xs text-secondary-400 mb-2">
                            <Code className="w-3 h-3 mr-2" />
                            Tech Stack
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {project.techStack.slice(0, 3).map((tech, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-secondary-800/50 border border-secondary-700 rounded text-xs text-secondary-300"
                              >
                                {tech}
                              </span>
                            ))}
                            {project.techStack.length > 3 && (
                              <span className="px-2 py-1 bg-secondary-800/50 border border-secondary-700 rounded text-xs text-secondary-400">
                                +{project.techStack.length - 3}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Project Stats */}
                        <div className="flex items-center justify-between text-xs text-secondary-400 pt-2 border-t border-secondary-800">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Download className="w-3 h-3 mr-1" />
                              {project.stats.downloads}
                            </span>
                            <span className="flex items-center">
                              <Star className="w-3 h-3 mr-1" />
                              {project.stats.stars}
                            </span>
                          </div>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {new Date(project.lastUpdate).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3 pt-4">
                          {/* Top Row - Source and View Details */}
                          {project.links.github ? (
                            <div className="grid grid-cols-2 gap-3">
                              <Link
                                href={project.links.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-ghost group/btn text-center flex items-center justify-center text-xs py-2 px-3 min-h-[36px]"
                              >
                                <Github className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                <span className="truncate">Source</span>
                              </Link>
                              <Link
                                href={`/products/${project.id}`}
                                className="btn-ghost group/btn text-center flex items-center justify-center text-xs py-2 px-3 min-h-[36px]"
                              >
                                <span className="truncate">View Details</span>
                                <ExternalLink className="w-3 h-3 ml-1.5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-200 flex-shrink-0" />
                              </Link>
                            </div>
                          ) : (
                            <Link
                              href={`/products/${project.id}`}
                              className="btn-ghost group/btn text-center flex items-center justify-center text-xs py-2 px-3 min-h-[36px] w-full"
                            >
                              <span className="truncate">View Details</span>
                              <ExternalLink className="w-3 h-3 ml-1.5 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform duration-200 flex-shrink-0" />
                            </Link>
                          )}
                          
                          {/* Bottom Row - Download Button (Full Width) */}
                          <Link
                            href={project.links.download}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary group/btn text-center flex items-center justify-center text-xs py-2.5 px-4 min-h-[38px] w-full"
                          >
                            <Download className="w-3 h-3 mr-1.5 group-hover/btn:animate-bounce flex-shrink-0" />
                            <span className="truncate">Download</span>
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Hover Effect Overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      initial={false}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* CTA Section */}
          <motion.div
            variants={itemVariants}
            className="text-center mt-16"
          >
            <div className="inline-flex items-center justify-center p-8 rounded-2xl bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-white mb-4">
                  Explore More Projects
                </h3>
                <p className="text-secondary-300 mb-6 max-w-md">
                  Check out my full portfolio of open-source privacy tools and applications.
                </p>
                <Link href="/products" className="btn-accent group">
                  View All Projects
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
