'use client';

import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';

interface SimpleDownloadButtonProps {
  href: string;
  filename?: string;
  label: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

/**
 * Simple static download button - no tracking, no auth, no API
 * Just direct file downloads from public/downloads folder
 */
export default function SimpleDownloadButton({
  href,
  filename,
  label,
  className = 'btn-primary',
  icon,
  disabled = false,
}: SimpleDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = () => {
    if (disabled) return;
    
    setIsDownloading(true);
    
    // Simple direct download
    const link = document.createElement('a');
    link.href = href;
    if (filename) {
      link.download = filename;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Reset button state after a short delay
    setTimeout(() => {
      setIsDownloading(false);
    }, 2000);
  };

  return (
    <button
      onClick={handleDownload}
      disabled={disabled || isDownloading}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
        isDownloading ? 'opacity-75' : ''
      } relative`}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-5 h-5 mr-3 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          {icon || <Download className="w-5 h-5 mr-3" />}
          {label}
        </>
      )}
    </button>
  );
}

interface DownloadLinkProps {
  href: string;
  filename?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

/**
 * Simple download link - no tracking, no auth
 */
export function SimpleDownloadLink({
  href,
  filename,
  children,
  className = '',
  disabled = false,
}: DownloadLinkProps) {
  if (disabled) {
    return (
      <span className={`${className} opacity-50 cursor-not-allowed`}>
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      download={filename}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {children}
    </a>
  );
}
