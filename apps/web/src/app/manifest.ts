import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dispensary Manager',
    short_name: 'Dispensary',
    description: 'Simple dispensary control system for sales, stock, debts, expenses, and reports.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#0ea5e9',
    orientation: 'portrait',
    icons: [
      {
        src: '/window.svg',
        sizes: '192x192',
        type: 'image/svg+xml',
      },
      {
        src: '/globe.svg',
        sizes: '512x512',
        type: 'image/svg+xml',
      },
    ],
  };
}