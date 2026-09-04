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
import DatabaseEnhancementHub from './DatabaseEnhancementHub'
import AdvancedSearchSyntaxTools from './AdvancedSearchSyntaxTools'
import './styles.css'

/*
 * Secondary filtering/taxonomy/export behavior is consolidated into one hub
 * instead of mounting several document-wide MutationObservers independently.
 * Advanced search syntax uses event delegation only, so the richer database
 * workflow does not restore the observer-heavy behavior removed previously.
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
    <DatabaseEnhancementHub />
    <AdvancedSearchSyntaxTools />
    <DatabaseToolPanel />
    <PwaTools />
  </React.StrictMode>,
)
