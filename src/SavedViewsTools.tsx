import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import './savedViewsTools.css'

type Kind = 'monster' | 'item'
type SavedView = {
  id: string
  kind: Kind
  name: string
  createdAt: number
  settings: Record<string, unknown>
}

const SAVED_KEY = 'fu-db-saved-views-native'

function readJson(key: string, fallback: unknown = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

function readViews(): SavedView[] {
  const value = readJson(SAVED_KEY, [])
  return Array.isArray(value) ? value.filter(view => view && (view.kind === 'monster' || view.kind === 'item') && typeof view.name === 'string') : []
}

function activeKind(): Kind {
  const tab = readJson('fu-active-tab', 'Monster Database')
  return tab === 'Item Database' ? 'item' : 'monster'
}

function currentSettings(kind: Kind) {
  if (kind === 'monster') {
    return {
      'fu-monster-search': readJson('fu-monster-search', ''),
      'fu-monster-filters': readJson('fu-monster-filters', {}),
      'fu-db-favorites-only': readJson('fu-db-favorites-only', { monster:false, item:false }),
    }
  }
  return {
    'fu-item-filters': readJson('fu-item-filters', {}),
    'fu-db-favorites-only': readJson('fu-db-favorites-only', { monster:false, item:false }),
  }
}

function restore(view: SavedView) {
  for (const [key, value] of Object.entries(view.settings)) localStorage.setItem(key, JSON.stringify(value))
  localStorage.setItem('fu-active-tab', JSON.stringify(view.kind === 'monster' ? 'Monster Database' : 'Item Database'))
  window.location.reload()
}

export default function SavedViewsTools() {
  const [views, setViews] = useState<SavedView[]>(readViews)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const target = document.querySelector<HTMLElement>('.shell > header')
  const kind = activeKind()
  const matching = useMemo(() => views.filter(view => view.kind === kind), [views, kind])

  if (!target) return null

  const save = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const view: SavedView = {
      id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      kind,
      name: trimmed,
      createdAt: Date.now(),
      settings: currentSettings(kind),
    }
    const next = [view, ...views]
    setViews(next)
    localStorage.setItem(SAVED_KEY, JSON.stringify(next))
    setName('')
  }

  const remove = (id: string) => {
    const next = views.filter(view => view.id !== id)
    setViews(next)
    localStorage.setItem(SAVED_KEY, JSON.stringify(next))
  }

  return createPortal(<div className="savedViewsTools">
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open}>Views{matching.length ? ` (${matching.length})` : ''}</button>
    {open && <div className="savedViewsMenu">
      <div className="savedViewsTitle"><strong>{kind === 'monster' ? 'Monster' : 'Item'} views</strong><small>Save search + filters</small></div>
      <div className="savedViewsCreate"><input value={name} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === 'Enter') save() }} placeholder="View name" /><button type="button" onClick={save} disabled={!name.trim()}>Save</button></div>
      {matching.length === 0 ? <p>No saved views for this database yet.</p> : matching.map(view => <div className="savedViewRow" key={view.id}><button type="button" className="savedViewOpen" onClick={() => restore(view)}>{view.name}</button><button type="button" className="savedViewDelete" title="Delete saved view" onClick={() => remove(view.id)}>×</button></div>)}
    </div>}
  </div>, target)
}
