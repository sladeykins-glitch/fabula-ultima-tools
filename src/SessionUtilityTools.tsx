import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import './sessionUtilityTools.css'

type Kind = 'monster' | 'item'
type RecentEntry = { kind: Kind; id: string; name: string; openedAt: number }

const RECENT_KEY = 'fu-db-recent-native'
const MAX_RECENT = 8

function readRecent(): RecentEntry[] {
  try {
    const value = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    return Array.isArray(value) ? value.filter(entry => entry && (entry.kind === 'monster' || entry.kind === 'item') && typeof entry.id === 'string') : []
  } catch {
    return []
  }
}

function recordFor(kind: Kind, id: string) {
  try {
    const key = kind === 'monster' ? 'fu-monsters' : 'fu-items'
    const records = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(records) ? records.find(record => record?.id === id) : null
  } catch {
    return null
  }
}

export default function SessionUtilityTools() {
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [recent, setRecent] = useState<RecentEntry[]>(readRecent)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setTarget(document.querySelector<HTMLElement>('.shell > header'))

    const addRecent = (kind: Kind, id: string) => {
      const record = recordFor(kind, id)
      if (!record) return
      setRecent(current => {
        const next = [{ kind, id, name: String(record.name || 'Untitled'), openedAt: Date.now() }, ...current.filter(entry => !(entry.kind === kind && entry.id === id))].slice(0, MAX_RECENT)
        localStorage.setItem(RECENT_KEY, JSON.stringify(next))
        return next
      })
    }

    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>('[data-db-open]')
      if (!button) return
      const kind = button.dataset.dbOpen as Kind
      const id = button.dataset.dbRecordId
      if ((kind === 'monster' || kind === 'item') && id) addRecent(kind, id)
    }

    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: Kind; id?: string }>).detail
      if (detail && (detail.kind === 'monster' || detail.kind === 'item') && detail.id) addRecent(detail.kind, detail.id)
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return
      const active = document.activeElement
      if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement || active instanceof HTMLSelectElement || (active instanceof HTMLElement && active.isContentEditable)) return
      const search = document.querySelector<HTMLInputElement>('main input[placeholder^="Search monsters"], main input[placeholder^="Search items"]')
      if (!search) return
      event.preventDefault()
      search.focus()
      search.select()
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener('fu-open-record', onOpen)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('fu-open-record', onOpen)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const existing = useMemo(() => recent.filter(entry => !!recordFor(entry.kind, entry.id)), [recent])
  if (!target) return null

  return createPortal(<div className="sessionUtilityTools">
    <button type="button" onClick={() => setOpen(value => !value)} aria-expanded={open}>Recent{existing.length ? ` (${existing.length})` : ''}</button>
    {open && <div className="recentMenu" role="menu">
      <div className="recentMenuTitle"><strong>Recently opened</strong><span>Press / to search</span></div>
      {existing.length === 0 ? <p>No recently opened entries yet.</p> : existing.map(entry => <button
        type="button"
        role="menuitem"
        key={`${entry.kind}-${entry.id}`}
        onClick={() => {
          setOpen(false)
          window.dispatchEvent(new CustomEvent('fu-open-record', { detail: { kind: entry.kind, id: entry.id } }))
        }}
      ><span>{entry.name}</span><small>{entry.kind === 'monster' ? 'Monster' : 'Item'}</small></button>)}
      {existing.length > 0 && <button type="button" className="recentClear" onClick={() => { setRecent([]); localStorage.removeItem(RECENT_KEY) }}>Clear recent</button>}
    </div>}
  </div>, target)
}
