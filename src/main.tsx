import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import DatabaseOverlay from './DatabaseOverlay'
import DatabaseBackupTools from './DatabaseBackupTools'
import DatabaseBrowseTools from './DatabaseBrowseTools'
import DatabasePaginationTools from './DatabasePaginationTools'
import DatabaseQualityTools from './DatabaseQualityTools'
import DatabaseQuickActions from './DatabaseQuickActions'
import DatabaseEditorEnhancements from './DatabaseEditorEnhancements'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <DatabaseOverlay />
    <DatabaseBackupTools />
    <DatabaseBrowseTools />
    <DatabasePaginationTools />
    <DatabaseQualityTools />
    <DatabaseQuickActions />
    <DatabaseEditorEnhancements />
  </React.StrictMode>,
)
