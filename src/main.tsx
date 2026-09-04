import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import DatabaseOverlay from './DatabaseOverlay'
import DatabaseBackupTools from './DatabaseBackupTools'
import DatabaseBrowseTools from './DatabaseBrowseTools'
import DatabasePaginationTools from './DatabasePaginationTools'
import DatabaseSafetyTools from './DatabaseSafetyTools'
import DatabaseQualityTools from './DatabaseQualityTools'
import DatabaseQuickActions from './DatabaseQuickActions'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <DatabaseOverlay />
    <DatabaseBackupTools />
    <DatabaseBrowseTools />
    <DatabasePaginationTools />
    <DatabaseSafetyTools />
    <DatabaseQualityTools />
    <DatabaseQuickActions />
  </React.StrictMode>,
)
