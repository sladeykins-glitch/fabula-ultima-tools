import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AppErrorBoundary from './AppErrorBoundary'
import DatabaseOverlay from './DatabaseOverlay'
import SiteBackupTools from './SiteBackupTools'
import PwaTools from './PwaTools'
import './styles.css'
import './performance.css'
import './nativePagination.css'

/*
 * Stability-first runtime.
 *
 * Database behavior is now implemented in React or direct editor events rather
 * than document-wide MutationObservers. Keep the mounted surface deliberately
 * small so the expanded bestiary remains responsive.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
    <DatabaseOverlay />
    <SiteBackupTools />
    <PwaTools />
  </React.StrictMode>,
)
