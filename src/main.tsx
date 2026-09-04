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
import SiteBackupTools from './SiteBackupTools'
import DatabaseResultTools from './DatabaseResultTools'
import DatabaseUndoTools from './DatabaseUndoTools'
import AccessibilityTools from './AccessibilityTools'
import DatabasePresetTools from './DatabasePresetTools'
import DatabaseSelectionTools from './DatabaseSelectionTools'
import DatabaseCompareTools from './DatabaseCompareTools'
import DatabaseRecentTools from './DatabaseRecentTools'
import DatabaseSelectionInsights from './DatabaseSelectionInsights'
import DataMaintenanceTools from './DataMaintenanceTools'
import CommandPalette from './CommandPalette'
import DatabaseCardCopyTools from './DatabaseCardCopyTools'
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
    <SiteBackupTools />
    <DatabaseResultTools />
    <DatabaseUndoTools />
    <AccessibilityTools />
    <DatabasePresetTools />
    <DatabaseSelectionTools />
    <DatabaseCompareTools />
    <DatabaseRecentTools />
    <DatabaseSelectionInsights />
    <DataMaintenanceTools />
    <CommandPalette />
    <DatabaseCardCopyTools />
  </React.StrictMode>,
)
