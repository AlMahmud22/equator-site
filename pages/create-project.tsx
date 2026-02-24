import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { Upload, Plus, X, ArrowLeft } from 'lucide-react';
import Layout from '@/components/Layout';
import Link from 'next/link';

export default function CreateProjectPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    version: '1.0.0',
    techStack: [''],
    features: [''],
    requirements: {
      os: '',
      ram: '',
      storage: '',
      browser: '',
      network: '',
      runtime: ''
    }
  });
  const [projectFile, setProjectFile] = useState<File | null>(null);

  const categories = ['Desktop Apps', 'Web Apps', 'Mobile Apps', 'Security Tools', 'Other'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('requirements.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        requirements: { ...prev.requirements, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleArrayChange = (index: number, value: string, field: 'techStack' | 'features') => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field: 'techStack' | 'features') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (index: number, field: 'techStack' | 'features') => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a ZIP, RAR, or 7Z file only.');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        alert('File size must be less than 100MB.');
        return;
      }
      setProjectFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!projectFile) {
      alert('Please upload a project file.');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('version', formData.version);
      formDataToSend.append('techStack', JSON.stringify(formData.techStack.filter(tech => tech.trim())));
      formDataToSend.append('features', JSON.stringify(formData.features.filter(feature => feature.trim())));
      formDataToSend.append('requirements', JSON.stringify(formData.requirements));
      formDataToSend.append('projectFile', projectFile);

      const response = await fetch('/api/projects', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        router.push('/projects');
      } else {
        alert(data.message || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <Layout title="Sign In Required">
        <div className="min-h-screen flex items-center justify-center bg-secondary-900">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Sign In Required</h1>
            <p className="text-secondary-300 mb-6">You need to be signed in to create a project.</p>
            <Link href="/auth/login" className="btn-primary">
              Sign In
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Create New Project">
      <Head>
        <meta name="description" content="Share your project with the community" />
      </Head>

      <section className="py-20 bg-secondary-900 min-h-screen">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="flex items-center mb-8">
              <Link href="/projects" className="btn-ghost mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Link>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-white">
                  Create New <span className="text-gradient">Project</span>
                </h1>
                <p className="text-secondary-300 mt-2">Share your creation with the community</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                      className="w-full px-4 py-2 bg-secondary-900 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:border-primary-500 focus:outline-none"
                      placeholder="Enter project title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-secondary-300 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 bg-secondary-900 border border-secondary-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                    >
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    maxLength={1000}
                    rows={4}
                    className="w-full px-4 py-2 bg-secondary-900 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:border-primary-500 focus:outline-none resize-vertical"
                    placeholder="Describe your project..."
                  />
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-secondary-300 mb-2">
                    Version
                  </label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    className="w-full max-w-xs px-4 py-2 bg-secondary-900 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:border-primary-500 focus:outline-none"
                    placeholder="1.0.0"
                  />
                </div>
              </div>

              {/* Tech Stack */}
              <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                <h2 className="text-xl font-semibold text-white mb-6">Tech Stack</h2>
                <div className="space-y-3">
                  {formData.techStack.map((tech, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={tech}
                        onChange={(e) => handleArrayChange(index, e.target.value, 'techStack')}
                        className="flex-1 px-4 py-2 bg-secondary-900 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:border-primary-500 focus:outline-none"
                        placeholder="e.g., React, Node.js, TypeScript"
                      />
                      {formData.techStack.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem(index, 'techStack')}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('techStack')}
                    className="flex items-center text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Technology
                  </button>
                </div>
              </div>

              {/* Features */}
              <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                <h2 className="text-xl font-semibold text-white mb-6">Key Features</h2>
                <div className="space-y-3">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex gap-3">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => handleArrayChange(index, e.target.value, 'features')}
                        className="flex-1 px-4 py-2 bg-secondary-900 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:border-primary-500 focus:outline-none"
                        placeholder="e.g., Real-time updates, Offline support"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeArrayItem(index, 'features')}
                          className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('features')}
                    className="flex items-center text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Feature
                  </button>
                </div>
              </div>

              {/* System Requirements */}
              <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                <h2 className="text-xl font-semibold text-white mb-6">System Requirements (Optional)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(formData.requirements).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-secondary-300 mb-2 capitalize">
                        {key === 'os' ? 'Operating System' : key}
                      </label>
                      <input
                        type="text"
                        name={`requirements.${key}`}
                        value={value}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-secondary-900 border border-secondary-600 rounded-lg text-white placeholder-secondary-400 focus:border-primary-500 focus:outline-none"
                        placeholder={key === 'ram' ? 'e.g., 4 GB RAM' : key === 'storage' ? 'e.g., 200 MB' : `Enter ${key}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Project File Upload */}
              <div className="bg-secondary-800 rounded-lg p-6 border border-secondary-700">
                <h2 className="text-xl font-semibold text-white mb-6">Project File *</h2>
                <div className="border-2 border-dashed border-secondary-600 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-secondary-400 mb-4" />
                  <div className="space-y-2">
                    <p className="text-white font-medium">Upload your project file</p>
                    <p className="text-secondary-400 text-sm">
                      Accepted formats: ZIP, RAR, 7Z (Max size: 100MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".zip,.rar,.7z"
                    className="mt-4"
                    required
                  />
                  {projectFile && (
                    <div className="mt-4 p-3 bg-secondary-900 rounded-lg">
                      <p className="text-white text-sm">
                        Selected: {projectFile.name} ({(projectFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Project'}
                </button>
                <Link href="/projects" className="btn-ghost px-8 py-3">
                  Cancel
                </Link>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}