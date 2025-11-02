import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Eye, MessageSquare, Calendar, User, Edit, Trash2, Send } from 'lucide-react';
import Layout from '@/components/Layout';

interface Project {
  _id: string;
  title: string;
  description: string;
  category: string;
  techStack: string[];
  features: string[];
  requirements: {
    os?: string;
    ram?: string;
    storage?: string;
    browser?: string;
    network?: string;
    runtime?: string;
  };
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
  comments: Array<{
    _id: string;
    userId?: {
      _id: string;
      name: string;
      image?: string;
    };
    anonymousEmail?: string;
    content: string;
    createdAt: string;
    isAnonymous: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

export default function ProjectDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [anonymousEmail, setAnonymousEmail] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
    }
  }, [id]);

  const fetchProject = async () => {
    try {
      const response = await fetch(`/api/projects/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setProject(data.project);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!session && !anonymousEmail.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/projects/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentText,
          anonymousEmail: !session ? anonymousEmail : undefined,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setCommentText('');
        setAnonymousEmail('');
        await fetchProject(); // Refresh to get updated comments
      } else {
        alert(data.message || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDownload = () => {
    if (project) {
      window.open(`/api/projects/${project._id}/download`, '_blank');
    }
  };

  const canEdit = session && project && (
    session.user?.email === project.createdBy.email ||
    session.user?.email === 'mahmud23k@gmail.com'
  );

  if (loading) {
    return (
      <Layout title="Loading Project">
        <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout title="Project Not Found">
        <div className="min-h-screen bg-secondary-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Project Not Found</h1>
            <Link href="/projects" className="btn-primary">
              Back to Projects
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={project.title} description={project.description}>
      <Head>
        <meta property="og:title" content={project.title} />
        <meta property="og:description" content={project.description} />
        <meta property="og:type" content="article" />
      </Head>

      <section className="py-20 bg-secondary-900 min-h-screen">
        <div className="container-custom max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <Link href="/projects" className="btn-ghost">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Link>
              
              {canEdit && (
                <div className="flex gap-2">
                  <button className="btn-ghost">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button className="btn-ghost text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-8">
                {/* Project Header */}
                <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
                      <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium">
                        {project.category}
                      </span>
                    </div>
                    <span className="text-secondary-400">v{project.version}</span>
                  </div>

                  {/* Creator Info */}
                  <div className="flex items-center mb-6 pb-6 border-b border-secondary-700">
                    {project.createdBy.image ? (
                      <img
                        src={project.createdBy.image}
                        alt={project.createdBy.name}
                        className="w-12 h-12 rounded-full mr-4"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-secondary-600 rounded-full flex items-center justify-center mr-4">
                        <User className="w-6 h-6 text-secondary-400" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-white">{project.createdBy.name}</h3>
                      <p className="text-secondary-400 text-sm flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-6 mb-6">
                    <div className="flex items-center text-secondary-400">
                      <Eye className="w-4 h-4 mr-2" />
                      <span>{project.stats.views} views</span>
                    </div>
                    <div className="flex items-center text-secondary-400">
                      <Download className="w-4 h-4 mr-2" />
                      <span>{project.stats.downloads} downloads</span>
                    </div>
                    <div className="flex items-center text-secondary-400">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span>{project.comments.length} comments</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
                    <p className="text-secondary-300 leading-relaxed">{project.description}</p>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                  <h2 className="text-xl font-semibold text-white mb-4">Tech Stack</h2>
                  <div className="flex flex-wrap gap-2">
                    {project.techStack.map((tech, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-secondary-700 text-secondary-300 rounded-full text-sm"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features */}
                <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                  <h2 className="text-xl font-semibold text-white mb-4">Key Features</h2>
                  <ul className="space-y-2">
                    {project.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-secondary-300">
                        <div className="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* System Requirements */}
                {Object.values(project.requirements).some(req => req) && (
                  <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                    <h2 className="text-xl font-semibold text-white mb-4">System Requirements</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(project.requirements).map(([key, value]) => (
                        value && (
                          <div key={key} className="flex justify-between">
                            <span className="text-secondary-400 capitalize">
                              {key === 'os' ? 'Operating System' : key}:
                            </span>
                            <span className="text-white">{value}</span>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                  <h2 className="text-xl font-semibold text-white mb-6">
                    Comments ({project.comments.length})
                  </h2>

                  {/* Add Comment Form */}
                  <form onSubmit={handleComment} className="mb-6 p-4 bg-secondary-700 rounded-lg">
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      className="w-full px-4 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:border-primary-500 focus:outline-none resize-vertical mb-3"
                      required
                    />
                    
                    {!session && (
                      <input
                        type="email"
                        value={anonymousEmail}
                        onChange={(e) => setAnonymousEmail(e.target.value)}
                        placeholder="Your email address"
                        className="w-full px-4 py-2 bg-secondary-800 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:border-primary-500 focus:outline-none mb-3"
                        required
                      />
                    )}
                    
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="btn-primary disabled:opacity-50"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {submittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {project.comments.map((comment) => (
                      <div key={comment._id} className="border-b border-secondary-700 pb-4">
                        <div className="flex items-start space-x-3">
                          {comment.isAnonymous ? (
                            <div className="w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center">
                              <User className="w-4 h-4 text-secondary-400" />
                            </div>
                          ) : (
                            comment.userId?.image ? (
                              <img
                                src={comment.userId.image}
                                alt={comment.userId.name}
                                className="w-8 h-8 rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 bg-secondary-600 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-secondary-400" />
                              </div>
                            )
                          )}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium text-white">
                                {comment.isAnonymous ? 'Anonymous' : comment.userId?.name}
                              </span>
                              <span className="text-secondary-400 text-sm">
                                {new Date(comment.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-secondary-300">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {project.comments.length === 0 && (
                      <p className="text-secondary-400 text-center py-8">
                        No comments yet. Be the first to comment!
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Download Card */}
                <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Download Project</h3>
                  <button
                    onClick={handleDownload}
                    className="w-full btn-primary flex items-center justify-center mb-4"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                  <p className="text-secondary-400 text-sm text-center">
                    Free download • No registration required
                  </p>
                </div>

                {/* Project Info */}
                <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Project Info</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-secondary-400">Version:</span>
                      <span className="text-white">{project.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-400">Status:</span>
                      <span className="text-white capitalize">{project.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-400">Created:</span>
                      <span className="text-white">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary-400">Updated:</span>
                      <span className="text-white">
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}