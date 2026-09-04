import { useEffect } from 'react'
import './pwaTools.css'

export default function PwaTools() {
  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/'
    if (!document.querySelector('link[rel="manifest"]')) {
      const link = document.createElement('link')
      link.rel = 'manifest'
      link.href = `${base}manifest.webmanifest`
      document.head.appendChild(link)
    }
    let theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (!theme) {
      theme = document.createElement('meta')
      theme.name = 'theme-color'
      document.head.appendChild(theme)
    }
    theme.content = '#312e81'

    let badge: HTMLElement | null = null
    const showStatus = (text: string) => {
      const header = document.querySelector<HTMLElement>('.shell > header')
      if (!header) return
      if (!badge) {
        badge = document.createElement('span')
        badge.className = 'pwaStatus'
        header.appendChild(badge)
      }
      badge.textContent = text
      badge.title = 'This app caches visited assets so it can keep working without a connection.'
    }

    const updateOnline = () => showStatus(navigator.onLine ? 'Offline ready' : 'Offline')
    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(`${base}sw.js`, { scope: base })
        .then(() => updateOnline())
        .catch(() => undefined)
    }

    return () => {
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOnline)
      badge?.remove()
    }
  }, [])
  return null
}
