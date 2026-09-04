import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import AppErrorBoundary from './AppErrorBoundary'
import DatabaseOverlay from './DatabaseOverlay'
import SiteBackupTools from './SiteBackupTools'
import SessionUtilityTools from './SessionUtilityTools'
import SavedViewsTools from './SavedViewsTools'
import UndoDeleteTools from './UndoDeleteTools'
import PwaTools from './PwaTools'
import { ensureOfficialData } from './officialBootstrap'
import './styles.css'
import './performance.css'
import './nativePagination.css'

function renderApp() {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <AppErrorBoundary>
        <App />
      </AppErrorBoundary>
      <DatabaseOverlay />
      <SiteBackupTools />
      <SessionUtilityTools />
      <SavedViewsTools />
      <UndoDeleteTools />
      <PwaTools />
    </React.StrictMode>,
  )
}

async function start() {
  try {
    await ensureOfficialData()
  } catch (error) {
    console.error('Could not seed the built-in Fabula Ultima library.', error)
  }
  renderApp()
}

void start()
