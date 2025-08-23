import Image from 'next/image'

interface OSIconProps {
  os: 'windows' | 'macos' | 'linux'
  size?: number
  className?: string
}

const osConfig = {
  windows: {
    src: '/images/os/windows.svg',
    alt: 'Windows',
    name: 'Windows'
  },
  macos: {
    src: '/images/os/macos.svg',
    alt: 'macOS',
    name: 'macOS'
  },
  linux: {
    src: '/images/os/linux.svg',
    alt: 'Linux',
    name: 'Linux'
  }
}

export default function OSIcon({ os, size = 24, className = '' }: OSIconProps) {
  const config = osConfig[os]
  
  return (
    <Image
      src={config.src}
      alt={config.alt}
      width={size}
      height={size}
      className={className}
    />
  )
}

export { osConfig }
