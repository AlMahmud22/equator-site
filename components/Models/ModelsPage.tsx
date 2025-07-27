import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Download, Star, Users, Eye, Grid, List } from 'lucide-react'
import { ModelCard } from './index'
import { cn } from '@/utils'

interface AIModel {
  id: string
  name: string
  description: string
  author: string
  downloads: number
  likes: number
  tags: string[]
  modelType: 'text-generation' | 'image-generation' | 'embedding' | 'classification'
  size: string
  lastUpdated: string
  isLocal: boolean
  downloadProgress?: number
}

// Mock data - replace with your actual data source
const mockModels: AIModel[] = [
  {
    id: 'llama-2-7b',
    name: 'Llama 2 7B Chat',
    description: 'A 7 billion parameter language model fine-tuned for conversational use cases. Excellent for chat applications and general text generation.',
    author: 'Meta',
    downloads: 125000,
    likes: 8420,
    tags: ['chat', 'text-generation', 'instruction-following'],
    modelType: 'text-generation',
    size: '3.8 GB',
    lastUpdated: '2024-01-15',
    isLocal: false,
  },
  {
    id: 'stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    description: 'High-resolution image generation model capable of creating detailed artwork and photorealistic images from text prompts.',
    author: 'Stability AI',
    downloads: 89000,
    likes: 12500,
    tags: ['image-generation', 'art', 'diffusion'],
    modelType: 'image-generation',
    size: '6.9 GB',
    lastUpdated: '2024-01-20',
    isLocal: true,
    downloadProgress: 100,
  },
  {
    id: 'bert-base-uncased',
    name: 'BERT Base Uncased',
    description: 'Bidirectional transformer model pre-trained on a large corpus of English data. Great for text classification and embeddings.',
    author: 'Google',
    downloads: 256000,
    likes: 15600,
    tags: ['embeddings', 'classification', 'nlp'],
    modelType: 'embedding',
    size: '438 MB',
    lastUpdated: '2024-01-10',
    isLocal: false,
  },
]

interface ModelsPageProps {
  className?: string
}

export default function ModelsPage({ className }: ModelsPageProps) {
  const [models, setModels] = useState<AIModel[]>(mockModels)
  const [filteredModels, setFilteredModels] = useState<AIModel[]>(mockModels)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(false)

  // Filter models based on search and filter criteria
  useEffect(() => {
    let filtered = models

    // Apply text search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        model =>
          model.name.toLowerCase().includes(query) ||
          model.description.toLowerCase().includes(query) ||
          model.author.toLowerCase().includes(query) ||
          model.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Apply category filter
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'local') {
        filtered = filtered.filter(model => model.isLocal)
      } else {
        filtered = filtered.filter(model => model.modelType === selectedFilter)
      }
    }

    setFilteredModels(filtered)
  }, [models, searchQuery, selectedFilter])

  const handleDownload = async (modelId: string) => {
    // Simulate download process
    setIsLoading(true)
    
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, downloadProgress: 0 }
        : model
    ))

    // Simulate download progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      setModels(prev => prev.map(model => 
        model.id === modelId 
          ? { ...model, downloadProgress: progress }
          : model
      ))
    }

    // Mark as local when download complete
    setModels(prev => prev.map(model => 
      model.id === modelId 
        ? { ...model, isLocal: true, downloadProgress: 100 }
        : model
    ))

    setIsLoading(false)
  }

  const filterOptions = [
    { value: 'all', label: 'All Models', count: models.length },
    { value: 'text-generation', label: 'Text Generation', count: models.filter(m => m.modelType === 'text-generation').length },
    { value: 'image-generation', label: 'Image Generation', count: models.filter(m => m.modelType === 'image-generation').length },
    { value: 'embedding', label: 'Embeddings', count: models.filter(m => m.modelType === 'embedding').length },
    { value: 'classification', label: 'Classification', count: models.filter(m => m.modelType === 'classification').length },
    { value: 'local', label: 'Downloaded', count: models.filter(m => m.isLocal).length },
  ]

  return (
    <div className={cn('min-h-screen bg-black text-white', className)}>
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900/50 to-black border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-bold mb-2">
              AI Model <span className="text-blue-400">Hub</span>
            </h1>
            <p className="text-slate-300 text-lg">
              Discover and download cutting-edge AI models for your projects
            </p>
          </motion.div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search models..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors"
              />
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-700 rounded-lg p-1">
              <button
                onClick={() => setLayoutMode('grid')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  layoutMode === 'grid'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                )}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setLayoutMode('list')}
                className={cn(
                  'p-2 rounded-md transition-colors',
                  layoutMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                )}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-slate-900/30 border border-slate-800 rounded-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-400" />
                Filters
              </h3>
              
              <div className="space-y-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFilter(option.value)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md transition-colors flex items-center justify-between',
                      selectedFilter === option.value
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    )}
                  >
                    <span>{option.label}</span>
                    <span className="text-xs bg-slate-700 px-2 py-1 rounded-full">
                      {option.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Models Grid/List */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-slate-400">
                {filteredModels.length} model{filteredModels.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={layoutMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={cn(
                  'gap-6',
                  layoutMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    : 'flex flex-col space-y-4'
                )}
              >
                {filteredModels.map((model, index) => (
                  <motion.div
                    key={model.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ModelCard
                      model={model}
                      layout={layoutMode}
                      onDownload={() => handleDownload(model.id)}
                      isDownloading={model.downloadProgress !== undefined && model.downloadProgress < 100}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {filteredModels.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">No models found</h3>
                <p className="text-slate-400">
                  Try adjusting your search or filters
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
