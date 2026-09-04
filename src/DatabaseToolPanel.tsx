import { useEffect } from 'react'
import './databaseToolPanel.css'

const OPEN_KEY = 'fu-db-tools-open'

function kindForSection(section: HTMLElement) {
  if (section.querySelector('input[placeholder^="Search monsters"]')) return 'monster'
  if (section.querySelector('input[placeholder^="Search items"]')) return 'item'
  return null
}

function readOpen(kind: string) {
  try {
    const state = JSON.parse(localStorage.getItem(OPEN_KEY) || '{}')
    return state?.[kind] !== false
  } catch { return true }
}

function writeOpen(kind: string, open: boolean) {
  try {
    const state = JSON.parse(localStorage.getItem(OPEN_KEY) || '{}')
    state[kind] = open
    localStorage.setItem(OPEN_KEY, JSON.stringify(state))
  } catch {
    localStorage.setItem(OPEN_KEY, JSON.stringify({ [kind]: open }))
  }
}

export default function DatabaseToolPanel() {
  useEffect(() => {
    let scheduled = false
    const apply = () => {
      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        if (!section.querySelector('.databaseSummary')) return
        const kind = kindForSection(section)
        if (!kind) return
        let panel = section.querySelector<HTMLDetailsElement>('.dbToolPanel')
        if (!panel) {
          panel = document.createElement('details')
          panel.className = 'dbToolPanel'
          panel.dataset.dbToolKind = kind
          panel.open = readOpen(kind)
          panel.innerHTML = '<summary><span>Database tools</span><small>filters, selection, recent, export & data controls</small></summary><div class="dbToolPanelBody"></div>'
          const summary = section.querySelector('.databaseSummary')
          summary?.insertAdjacentElement('afterend', panel)
        }
        const body = panel.querySelector<HTMLElement>('.dbToolPanelBody')
        if (!body) return
        const selectors = ['.dbAdvancedSearchBar','.dbMonsterProfileFilters','.dbTaxonomyBar','.dbHubResultTools','.dbBrowseBar','.dbPresetTools','.dbSelectionBar','.dbRecentBar','.dbQualityBar','.dbBackupTools']
        for (const selector of selectors) {
          const element = section.querySelector<HTMLElement>(selector)
          if (element && element.parentElement !== body) body.appendChild(element)
        }
      })
    }

    const onToggle = (event: Event) => {
      const panel = event.target instanceof HTMLDetailsElement && event.target.classList.contains('dbToolPanel') ? event.target : null
      if (!panel) return
      const kind = panel.dataset.dbToolKind
      if (kind) writeOpen(kind, panel.open)
    }

    apply()
    const observer = new MutationObserver(() => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => { scheduled = false; apply() })
    })
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('toggle', onToggle, true)
    return () => { observer.disconnect(); document.removeEventListener('toggle', onToggle, true) }
  }, [])
  return null
}
