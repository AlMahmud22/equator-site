'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, Grid, List, Download, Star, Users, Calendar, HardDrive, Check, Loader } from 'lucide-react'
import { cn } from '@/shared/utils'
import { formatDate } from '@/shared/utils/dateUtils'

// Types
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

interface ModelsPageProps {
  className?: string
}

interface ModelCardProps {
  model: AIModel
  layout: 'grid' | 'list'
  onDownload: () => void
  isDownloading?: boolean
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
  {
    id: 'clip-vit-large',
    name: 'CLIP ViT Large',
    description: 'Vision transformer model that understands images and text together, perfect for image classification and search.',
    author: 'OpenAI',
    downloads: 95000,
    likes: 11800,
    tags: ['vision', 'text-image', 'classification'],
    modelType: 'embedding',
    size: '1.7 GB',
    lastUpdated: '2024-01-12',
    isLocal: false,
  },
]

// Helper functions
const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

const modelTypeColors = {
  'text-generation': 'bg-green-500/20 text-green-300 border-green-500/30',
  'image-generation': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'embedding': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'classification': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

// ModelCard Component
function ModelCard({ model, layout, onDownload, isDownloading }: ModelCardProps) {
  const isListLayout = layout === 'list'
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-gradient-to-br from-slate-900/80 to-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300',
        isListLayout 
          ? 'flex flex-row min-h-[120px]' 
          : 'flex flex-col h-[320px] w-full max-w-[300px]'
      )}
    >
      <div className={cn(
        'flex-1 p-6',
        isListLayout ? 'flex items-center' : 'flex flex-col justify-between h-full'
      )}>
        {/* Header */}
        <div className={cn(isListLayout ? 'flex-1' : 'flex-shrink-0')}>
          <div className={cn(
            'flex items-start justify-between mb-3',
            isListLayout ? 'mb-2' : ''
          )}>
            <div className="flex-1 min-w-0 mr-4">
              <h3 className={cn(
                'font-bold text-white mb-1 line-clamp-1',
                isListLayout ? 'text-lg' : 'text-xl'
              )}>
                {model.name}
              </h3>
              <p className="text-sm text-slate-400 mb-1">{model.author}</p>
            </div>
            <div className={cn(
              'px-2 py-1 rounded-md text-xs font-medium border whitespace-nowrap',
              modelTypeColors[model.modelType]
            )}>
              {model.modelType.replace('-', ' ')}
            </div>
          </div>

          <p className={cn(
            'text-slate-300 mb-4 leading-relaxed',
            isListLayout ? 'text-sm line-clamp-2' : 'text-sm line-clamp-3'
          )}>
            {model.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {model.tags.slice(0, isListLayout ? 3 : 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-md text-xs"
              >
                {tag}
              </span>
            ))}
            {model.tags.length > 3 && (
              <span className="px-2 py-1 bg-slate-700/30 text-slate-400 rounded-md text-xs">
                +{model.tags.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Stats and Actions */}
        <div className={cn(
          isListLayout 
            ? 'flex items-center gap-6 ml-4' 
            : 'flex-shrink-0'
        )}>
          {/* Stats */}
          <div className={cn(
            'flex items-center justify-between text-xs text-slate-400 mb-4',
            isListLayout ? 'mb-0 flex-col items-start gap-1' : ''
          )}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{formatNumber(model.downloads)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>{formatNumber(model.likes)}</span>
              </div>
            </div>
            {!isListLayout && (
              <div className="flex items-center gap-1">
                <HardDrive className="w-3 h-3" />
                <span>{model.size}</span>
              </div>
            )}
          </div>

          {/* Download Progress or Button */}
          {model.downloadProgress !== undefined && model.downloadProgress < 100 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Downloading...</span>
                <span className="text-blue-400">{model.downloadProgress}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${model.downloadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all duration-200',
                model.isLocal
                  ? 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
                  : 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              {isDownloading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : model.isLocal ? (
                <>
                  <Check className="w-4 h-4" />
                  Downloaded
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Download
                </>
              )}
            </button>
          )}

          {isListLayout && (
            <div className="flex items-center gap-1 text-xs text-slate-400 whitespace-nowrap">
              <HardDrive className="w-3 h-3" />
              <span>{model.size}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Main ModelsPage Component
export default function ModelsPage({ className }: ModelsPageProps) {
  const [models, setModels] = useState<AIModel[]>(mockModels)
  const [filteredModels, setFilteredModels] = useState<AIModel[]>(mockModels)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [layoutMode, setLayoutMode] = useState<'grid' | 'list'>('grid')

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
  }, [searchQuery, selectedFilter, models])

  const handleDownload = (modelId: string) => {
    // Implement download logic here
    console.log('Downloading model:', modelId)
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
            <div className="bg-slate-900/30 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Filters
              </h3>
              <div className="space-y-2">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setSelectedFilter(option.value)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left',
                      selectedFilter === option.value
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'hover:bg-slate-800/50 text-slate-300'
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
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4'
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
