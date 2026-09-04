import { useEffect } from 'react'

const RETIRED_KEY = 'fu-pwa-cache-retired-v2'

export default function PwaTools() {
  useEffect(() => {
    if (sessionStorage.getItem(RETIRED_KEY) === 'done') return

    const retire = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          await Promise.all(registrations
            .filter(registration => registration.scope.includes('/fabula-ultima-tools/'))
            .map(registration => registration.unregister()))
        }

        if ('caches' in window) {
          const keys = await caches.keys()
          await Promise.all(keys
            .filter(key => key.startsWith('fabula-ultima-tools-'))
            .map(key => caches.delete(key)))
        }
      } finally {
        sessionStorage.setItem(RETIRED_KEY, 'done')
      }
    }

    void retire()
  }, [])

  return null
}
