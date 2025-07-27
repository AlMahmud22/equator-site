// Types and interfaces for the AI Models UI

export interface AIModel {
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
  version?: string
  license?: string
  requirements?: {
    ram: string
    storage: string
    gpu?: string
  }
}

export interface FilterOption {
  value: string
  label: string
  count: number
}

export interface ModelStats {
  downloads: number
  likes: number
  rating?: number
  lastUpdated: string
}

export interface DownloadState {
  isDownloading: boolean
  progress: number
  error?: string
}

export interface SearchFilters {
  query: string
  category: string
  author?: string
  tags?: string[]
  isLocal?: boolean
  minDownloads?: number
}

export interface LayoutProps {
  mode: 'grid' | 'list'
  className?: string
}

export interface ModelCardProps {
  model: AIModel
  layout: 'grid' | 'list'
  onDownload: (modelId: string) => void
  onLike?: (modelId: string) => void
  onView?: (modelId: string) => void
  isDownloading?: boolean
  className?: string
}

export interface ModelsPageProps {
  models?: AIModel[]
  initialLayout?: 'grid' | 'list'
  onModelSelect?: (model: AIModel) => void
  onDownload?: (modelId: string) => Promise<void>
  className?: string
  showFilters?: boolean
  showSearch?: boolean
  showLayoutToggle?: boolean
}

// API response types
export interface ModelsAPIResponse {
  models: AIModel[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface DownloadAPIResponse {
  success: boolean
  downloadUrl?: string
  error?: string
  estimatedTime?: number
}

// Event types
export interface ModelEvent {
  type: 'download' | 'like' | 'view' | 'delete'
  modelId: string
  timestamp: number
  userId?: string
}

// Utility types
export type ModelType = AIModel['modelType']
export type SortOption = 'name' | 'downloads' | 'likes' | 'updated' | 'size'
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  option: SortOption
  direction: SortDirection
}

// Component state types
export interface ModelsPageState {
  models: AIModel[]
  filteredModels: AIModel[]
  searchQuery: string
  selectedFilter: string
  layoutMode: 'grid' | 'list'
  isLoading: boolean
  error: string | null
  sortConfig: SortConfig
}

// Hook return types
export interface UseModelsReturn {
  models: AIModel[]
  filteredModels: AIModel[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  setSearchQuery: (query: string) => void
  selectedFilter: string
  setSelectedFilter: (filter: string) => void
  downloadModel: (modelId: string) => Promise<void>
  refreshModels: () => Promise<void>
}

export interface UseDownloadReturn {
  downloadModel: (modelId: string) => Promise<void>
  downloadProgress: Record<string, number>
  downloadErrors: Record<string, string>
  isDownloading: (modelId: string) => boolean
  cancelDownload: (modelId: string) => void
}

// Configuration types
export interface ModelsUIConfig {
  cardDimensions: {
    grid: {
      width: number
      height: number
    }
    list: {
      minHeight: number
    }
  }
  colors: {
    primary: string
    secondary: string
    accent: string
    success: string
    error: string
    warning: string
  }
  animations: {
    duration: number
    easing: string
  }
  layout: {
    gridColumns: {
      desktop: number
      tablet: number
      mobile: number
    }
    breakpoints: {
      mobile: number
      tablet: number
      desktop: number
    }
  }
}

// Default configuration
export const defaultModelsUIConfig: ModelsUIConfig = {
  cardDimensions: {
    grid: {
      width: 300,
      height: 320
    },
    list: {
      minHeight: 120
    }
  },
  colors: {
    primary: '#1e90ff',
    secondary: '#64748b',
    accent: '#8b5cf6',
    success: '#22c55e',
    error: '#ef4444',
    warning: '#f59e0b'
  },
  animations: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  layout: {
    gridColumns: {
      desktop: 3,
      tablet: 2,
      mobile: 1
    },
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200
    }
  }
}

// Utility type guards
export const isValidModelType = (type: string): type is ModelType => {
  return ['text-generation', 'image-generation', 'embedding', 'classification'].includes(type)
}

export const isValidSortOption = (option: string): option is SortOption => {
  return ['name', 'downloads', 'likes', 'updated', 'size'].includes(option)
}

// Mock data generators (for testing)
export const createMockModel = (overrides: Partial<AIModel> = {}): AIModel => ({
  id: `model-${Math.random().toString(36).substr(2, 9)}`,
  name: 'Sample AI Model',
  description: 'This is a sample AI model for testing purposes.',
  author: 'Test Author',
  downloads: Math.floor(Math.random() * 100000),
  likes: Math.floor(Math.random() * 10000),
  tags: ['ai', 'machine-learning', 'neural-network'],
  modelType: 'text-generation',
  size: `${Math.floor(Math.random() * 10 + 1)} GB`,
  lastUpdated: new Date().toISOString(),
  isLocal: Math.random() > 0.5,
  ...overrides
})

export const createMockModels = (count: number): AIModel[] => {
  return Array.from({ length: count }, () => createMockModel())
}
