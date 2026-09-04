import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import './dataMaintenanceTools.css'

type Kind = 'monster' | 'item'
type Audit = {
  duplicateIds: { kind: Kind; id: string; count: number }[]
  missingIds: { kind: Kind; index: number; name: string }[]
  missingNames: { kind: Kind; id: string }[]
  staleFavorites: number
  staleSelection: number
  staleRecent: number
}

const recordKey = (kind: Kind) => kind === 'monster' ? 'fu-monsters' : 'fu-items'

function readArray(key: string): any[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function readObject(key: string): any {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '{}')
    return value && typeof value === 'object' ? value : {}
  } catch {
    return {}
  }
}

function freshId(kind: Kind) {
  try {
    if (crypto?.randomUUID) return `custom-${kind}-${crypto.randomUUID()}`
  } catch {
    // Fallback below.
  }
  return `custom-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

function auditData(): Audit {
  const duplicateIds: Audit['duplicateIds'] = []
  const missingIds: Audit['missingIds'] = []
  const missingNames: Audit['missingNames'] = []
  const valid: Record<Kind, Set<string>> = { monster: new Set(), item: new Set() }

  ;(['monster', 'item'] as Kind[]).forEach(kind => {
    const records = readArray(recordKey(kind))
    const counts = new Map<string, number>()
    records.forEach((record, index) => {
      if (typeof record?.id === 'string' && record.id.trim()) {
        valid[kind].add(record.id)
        counts.set(record.id, (counts.get(record.id) || 0) + 1)
      } else if (record?.source !== 'Official') {
        missingIds.push({ kind, index, name: String(record?.name || `Entry ${index + 1}`) })
      }
      if (record?.source !== 'Official' && (typeof record?.name !== 'string' || !record.name.trim())) {
        missingNames.push({ kind, id: String(record?.id || `index-${index}`) })
      }
    })
    counts.forEach((count, id) => { if (count > 1) duplicateIds.push({ kind, id, count }) })
  })

  const favorites = readObject('fu-db-favorites')
  const selection = readObject('fu-db-selection')
  const recent = readObject('fu-db-recent')
  let staleFavorites = 0
  let staleSelection = 0
  let staleRecent = 0
  ;(['monster', 'item'] as Kind[]).forEach(kind => {
    const fav = Array.isArray(favorites[kind]) ? favorites[kind] : []
    staleFavorites += fav.filter((id: string) => !valid[kind].has(id) && !id.includes('|')).length
    const sel = Array.isArray(selection[kind]) ? selection[kind] : []
    staleSelection += sel.filter((id: string) => !valid[kind].has(id)).length
    const rec = Array.isArray(recent[kind]) ? recent[kind] : []
    staleRecent += rec.filter((entry: any) => !valid[kind].has(entry?.id)).length
  })

  return { duplicateIds, missingIds, missingNames, staleFavorites, staleSelection, staleRecent }
}

function repairData() {
  const remap: Record<Kind, Map<string, string>> = { monster: new Map(), item: new Map() }

  ;(['monster', 'item'] as Kind[]).forEach(kind => {
    const records = readArray(recordKey(kind))
    const seen = new Set<string>()
    const repaired = records.map((record, index) => {
      if (!record || typeof record !== 'object' || record.source === 'Official') {
        if (record?.id) seen.add(record.id)
        return record
      }
      const currentId = typeof record.id === 'string' ? record.id.trim() : ''
      let id = currentId
      if (!id || seen.has(id)) {
        id = freshId(kind)
        if (currentId && !remap[kind].has(currentId)) remap[kind].set(currentId, id)
      }
      seen.add(id)
      const name = typeof record.name === 'string' && record.name.trim() ? record.name : `Untitled ${kind === 'monster' ? 'Monster' : 'Item'} ${index + 1}`
      return { ...record, id, name }
    })
    localStorage.setItem(recordKey(kind), JSON.stringify(repaired))
  })

  const valid: Record<Kind, Set<string>> = {
    monster: new Set(readArray('fu-monsters').map(record => record?.id).filter(Boolean)),
    item: new Set(readArray('fu-items').map(record => record?.id).filter(Boolean)),
  }

  const favorites = readObject('fu-db-favorites')
  const selection = readObject('fu-db-selection')
  const recent = readObject('fu-db-recent')
  ;(['monster', 'item'] as Kind[]).forEach(kind => {
    const fav = Array.isArray(favorites[kind]) ? favorites[kind] : []
    favorites[kind] = Array.from(new Set(fav
      .map((id: string) => remap[kind].get(id) || id)
      .filter((id: string) => valid[kind].has(id) || id.includes('|'))))

    const sel = Array.isArray(selection[kind]) ? selection[kind] : []
    selection[kind] = Array.from(new Set(sel
      .map((id: string) => remap[kind].get(id) || id)
      .filter((id: string) => valid[kind].has(id))))

    const rec = Array.isArray(recent[kind]) ? recent[kind] : []
    recent[kind] = rec
      .map((entry: any) => ({ ...entry, id: remap[kind].get(entry?.id) || entry?.id }))
      .filter((entry: any) => valid[kind].has(entry?.id))
  })
  localStorage.setItem('fu-db-favorites', JSON.stringify(favorites))
  localStorage.setItem('fu-db-selection', JSON.stringify(selection))
  localStorage.setItem('fu-db-recent', JSON.stringify(recent))
}

export default function DataMaintenanceTools() {
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(false)
  const [revision, setRevision] = useState(0)
  const audit = useMemo(() => auditData(), [revision, open])
  const issueCount = audit.duplicateIds.length + audit.missingIds.length + audit.missingNames.length + audit.staleFavorites + audit.staleSelection + audit.staleRecent

  useEffect(() => {
    const update = () => setTarget(document.querySelector<HTMLElement>('.shell > header'))
    update()
    if (document.querySelector('.shell > header')) return
    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (!target) return null

  const repair = () => {
    if (!issueCount) return
    if (!window.confirm(`Repair ${issueCount} detected data issue${issueCount === 1 ? '' : 's'}? Official records will not be modified.`)) return
    repairData()
    setRevision(value => value + 1)
    window.setTimeout(() => window.location.reload(), 250)
  }

  return <>
    {createPortal(<button type="button" className={`dataMaintenanceTrigger ${issueCount ? 'hasIssues' : ''}`} onClick={() => setOpen(true)} title="Audit custom database data">
      Data Check{issueCount ? ` · ${issueCount}` : ''}
    </button>, target)}
    {open && <div className="dataMaintenanceBackdrop" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false) }}>
      <section className="dataMaintenanceModal" role="dialog" aria-modal="true" aria-label="Database data check">
        <div className="dataMaintenanceHeader"><div><span className="source">Database maintenance</span><h2>Data Check</h2></div><button type="button" onClick={() => setOpen(false)}>Close</button></div>
        {issueCount === 0 ? <p className="dataMaintenanceHealthy">No duplicate custom IDs or stale database references were detected.</p> : <>
          <p className="muted">This checks local custom/generated data only. Official imported records are never rewritten by the repair action.</p>
          <div className="dataMaintenanceGrid">
            <span>Duplicate IDs <b>{audit.duplicateIds.length}</b></span>
            <span>Missing IDs <b>{audit.missingIds.length}</b></span>
            <span>Missing names <b>{audit.missingNames.length}</b></span>
            <span>Stale favorites <b>{audit.staleFavorites}</b></span>
            <span>Stale selections <b>{audit.staleSelection}</b></span>
            <span>Stale recent entries <b>{audit.staleRecent}</b></span>
          </div>
          {audit.duplicateIds.length > 0 && <details><summary>Duplicate IDs</summary>{audit.duplicateIds.map(entry => <p className="note" key={`${entry.kind}-${entry.id}`}>{entry.kind}: {entry.id} appears {entry.count} times</p>)}</details>}
          <div className="dataMaintenanceActions"><button type="button" onClick={() => setRevision(value => value + 1)}>Re-scan</button><button type="button" className="primary" onClick={repair}>Repair custom data</button></div>
        </>}
      </section>
    </div>}
  </>
}
