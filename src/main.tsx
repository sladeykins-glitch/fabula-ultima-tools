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
import DatabaseUndoTools from './DatabaseUndoTools'
import AccessibilityTools from './AccessibilityTools'
import DatabaseSelectionTools from './DatabaseSelectionTools'
import DatabaseCompareTools from './DatabaseCompareTools'
import DatabaseRecentTools from './DatabaseRecentTools'
import DataMaintenanceTools from './DataMaintenanceTools'
import CommandPalette from './CommandPalette'
import DatabaseCardCopyTools from './DatabaseCardCopyTools'
import DatabaseCreateTools from './DatabaseCreateTools'
import DatabaseToolPanel from './DatabaseToolPanel'
import PwaTools from './PwaTools'
import './styles.css'

/*
 * Keep the always-mounted enhancement layer deliberately small.
 * Several optional tools previously installed independent document-wide
 * MutationObservers. With a large bestiary those observers repeatedly scanned
 * the same cards and made filtering/scrolling feel sluggish. The core workflow
 * stays mounted here; lower-value analytics/taxonomy/audit/result decorators
 * can return later as native React features without global DOM observers.
 */
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
    <DatabaseUndoTools />
    <AccessibilityTools />
    <DatabaseSelectionTools />
    <DatabaseCompareTools />
    <DatabaseRecentTools />
    <DataMaintenanceTools />
    <CommandPalette />
    <DatabaseCardCopyTools />
    <DatabaseCreateTools />
    <DatabaseToolPanel />
    <PwaTools />
  </React.StrictMode>,
)
