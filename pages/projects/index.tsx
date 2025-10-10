import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Filter, Search, Eye, Download, MessageSquare, User, Calendar } from 'lucide-react';
import Layout from '@/components/Layout';

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  features: string[];
  version: string;
  status: string;
  createdBy: {
    _id: string;
    name: string;
    image?: string;
    email: string;
  };
  stats: {
    downloads: number;
    views: number;
    likes: number;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    search: ''
  });

  const categories = ['all', 'Desktop Apps', 'Web Apps', 'Mobile Apps', 'Security Tools', 'Other'];

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category !== 'all') params.set('category', filters.category);
      if (filters.search) params.set('search', filters.search);
      
      const response = await fetch(`/api/projects?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  return (
    <Layout
      title="Community Projects - Share Your Creations"
      description="Discover and share amazing projects with the community. Upload your own creations and explore what others have built."
    >
      <Head>
        <meta name="keywords" content="community projects, user creations, project sharing, developer community" />
      </Head>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center bg-gradient-to-br from-secondary-950 via-pitch-black to-primary-950 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/grid-pattern.svg')] opacity-10" />
        <div className="container-custom relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Community <span className="text-gradient">Projects</span>
            </h1>
            <p className="text-lg sm:text-xl text-secondary-300 mb-8 leading-relaxed max-w-3xl mx-auto">
              Discover amazing projects created by our community. Share your own creations and collaborate with fellow developers.
            </p>
            
            {session && (
              <Link href="/create-project" className="btn-primary inline-flex items-center px-8 py-4">
                <Plus className="w-5 h-5 mr-2" />
                Share Your Project
              </Link>
            )}
          </motion.div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-secondary-900 border-b border-secondary-800">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 bg-secondary-800 border border-secondary-700 rounded-lg text-white placeholder-secondary-400 focus:border-primary-500 focus:outline-none"
                value={filters.search}
                onChange={handleSearchChange}
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.category === category
                      ? 'bg-primary-500 text-white'
                      : 'bg-secondary-800 text-secondary-300 hover:bg-secondary-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="section-padding bg-secondary-900">
        <div className="container-custom">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-secondary-800 rounded-lg p-6 h-80"></div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-xl font-semibold text-white mb-2">No projects found</h3>
              <p className="text-secondary-400 mb-6">
                {session ? "Be the first to share your project!" : "Sign in to share your projects with the community."}
              </p>
              {session && (
                <Link href="/create-project" className="btn-primary inline-flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-secondary-800 rounded-lg p-6 hover:bg-secondary-750 transition-colors duration-300 border border-secondary-700 hover:border-primary-500/30"
                >
                  {/* Project Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                        {project.title}
                      </h3>
                      <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs font-medium">
                        {project.category}
                      </span>
                    </div>
                    <span className="text-xs text-secondary-400 ml-4">v{project.version}</span>
                  </div>

                  {/* Description */}
                  <p className="text-secondary-300 text-sm mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Tech Stack */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {project.techStack.slice(0, 3).map((tech, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-secondary-700 text-secondary-300 rounded text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                      {project.techStack.length > 3 && (
                        <span className="px-2 py-1 bg-secondary-700 text-secondary-400 rounded text-xs">
                          +{project.techStack.length - 3}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="flex items-center mb-4 pb-4 border-b border-secondary-700">
                    {project.createdBy.image ? (
                      <img
                        src={project.createdBy.image}
                        alt={project.createdBy.name}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center mr-3">
                        <User className="w-4 h-4 text-secondary-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {project.createdBy.name}
                      </p>
                      <p className="text-xs text-secondary-400 flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-secondary-400 mb-4">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {project.stats.views}
                    </div>
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      {project.stats.downloads}
                    </div>
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      0
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/projects/${project._id}`}
                      className="flex-1 btn-secondary text-center"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/api/projects/${project._id}/download`}
                      className="btn-primary px-4"
                      target="_blank"
                    >
                      <Download className="w-4 h-4" />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}