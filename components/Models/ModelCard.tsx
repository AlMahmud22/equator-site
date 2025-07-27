import React from 'react'
import { motion } from 'framer-motion'
import { Download, Star, Users, Calendar, HardDrive, Check, Loader } from 'lucide-react'
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

interface ModelCardProps {
  model: AIModel
  layout: 'grid' | 'list'
  onDownload: () => void
  isDownloading?: boolean
}

const modelTypeColors = {
  'text-generation': 'bg-green-500/20 text-green-300 border-green-500/30',
  'image-generation': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'embedding': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'classification': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function ModelCard({ model, layout, onDownload, isDownloading }: ModelCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (layout === 'list') {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="group bg-gradient-to-r from-slate-900/40 to-slate-800/40 border border-slate-700 rounded-lg p-6 hover:border-blue-400/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
      >
        <div className="flex items-start gap-6">
          {/* Model Icon/Avatar */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center text-2xl flex-shrink-0 border border-slate-600">
            🤖
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-semibold text-white mb-1 truncate group-hover:text-blue-300 transition-colors">
                  {model.name}
                </h3>
                <p className="text-slate-400 text-sm mb-2">by {model.author}</p>
                <p className="text-slate-300 text-sm line-clamp-2 leading-relaxed">
                  {model.description}
                </p>
              </div>

              {/* Download Button */}
              <div className="flex-shrink-0">
                {model.isLocal ? (
                  <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Downloaded</span>
                  </div>
                ) : (
                  <button
                    onClick={onDownload}
                    disabled={isDownloading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-lg text-white transition-colors"
                  >
                    {isDownloading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">
                          {model.downloadProgress}%
                        </span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">Download</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={cn('px-2 py-1 rounded-md text-xs border', modelTypeColors[model.modelType])}>
                {model.modelType.replace('-', ' ')}
              </span>
              {model.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-md text-xs border border-slate-600"
                >
                  {tag}
                </span>
              ))}
              {model.tags.length > 3 && (
                <span className="px-2 py-1 bg-slate-700/30 text-slate-400 rounded-md text-xs">
                  +{model.tags.length - 3} more
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{formatNumber(model.downloads)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                <span>{formatNumber(model.likes)}</span>
              </div>
              <div className="flex items-center gap-1">
                <HardDrive className="w-4 h-4" />
                <span>{model.size}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(model.lastUpdated)}</span>
              </div>
            </div>

            {/* Download Progress */}
            {isDownloading && model.downloadProgress !== undefined && (
              <div className="mt-4">
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${model.downloadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Grid layout
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      className="group bg-gradient-to-br from-slate-900/40 to-slate-800/40 border border-slate-700 rounded-lg overflow-hidden hover:border-blue-400/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 h-[320px] flex flex-col"
    >
      {/* Header */}
      <div className="p-6 flex-1 flex flex-col">
        {/* Model Icon and Type */}
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center text-xl border border-slate-600">
            🤖
          </div>
          <span className={cn('px-2 py-1 rounded-md text-xs border', modelTypeColors[model.modelType])}>
            {model.modelType.replace('-', ' ')}
          </span>
        </div>

        {/* Title and Author */}
        <div className="mb-3 flex-shrink-0">
          <h3 className="text-lg font-semibold text-white mb-1 truncate group-hover:text-blue-300 transition-colors">
            {model.name}
          </h3>
          <p className="text-slate-400 text-sm">by {model.author}</p>
        </div>

        {/* Description */}
        <p className="text-slate-300 text-sm line-clamp-3 leading-relaxed mb-4 flex-1">
          {model.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {model.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-md text-xs border border-slate-600"
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

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-slate-400 mb-4">
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
          <div className="flex items-center gap-1">
            <HardDrive className="w-3 h-3" />
            <span>{model.size}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-900/20">
        {/* Download Progress */}
        {isDownloading && model.downloadProgress !== undefined && (
          <div className="mb-3">
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${model.downloadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button */}
        {model.isLocal ? (
          <div className="flex items-center justify-center gap-2 py-2 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Downloaded</span>
          </div>
        ) : (
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="w-full flex items-center justify-center gap-2 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 rounded-lg text-white transition-colors font-medium"
          >
            {isDownloading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">Downloading {model.downloadProgress}%</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span className="text-sm">Download</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.div>
  )
}
