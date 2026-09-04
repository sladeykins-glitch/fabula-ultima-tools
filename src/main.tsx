import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import DatabaseOverlay from './DatabaseOverlay'
import DatabaseBackupTools from './DatabaseBackupTools'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
    <DatabaseOverlay />
    <DatabaseBackupTools />
  </React.StrictMode>,
)
