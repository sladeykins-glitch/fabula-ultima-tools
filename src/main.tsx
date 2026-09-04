import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AppErrorBoundary from './AppErrorBoundary'
import DatabaseOverlay from './DatabaseOverlay'
import DatabaseOpenEventBridge from './DatabaseOpenEventBridge'
import SiteBackupTools from './SiteBackupTools'
import PwaTools from './PwaTools'
import './styles.css'
import './performance.css'
import './nativePagination.css'

/*
 * Stability-first runtime.
 *
 * The previous enhancement stack mounted many document-wide MutationObservers
 * that all reacted to the same database card changes. With the expanded
 * bestiary those observers could trigger each other repeatedly and lock the
 * browser after ordinary clicks. Keep only the core React application, the
 * stable-id editor, whole-site backup, and the one-time PWA cache recovery.
 * Secondary database features should return as native React controls rather
 * than global DOM decorators.
 */
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
    <DatabaseOverlay />
    <DatabaseOpenEventBridge />
    <SiteBackupTools />
    <PwaTools />
  </React.StrictMode>,
)
