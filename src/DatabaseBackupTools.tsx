import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './databaseBackupTools.css'

type Kind = 'monster' | 'item'
type ViewMode = 'full' | 'compact'
type PageSize = 12 | 24 | 48 | 'all'

type DatabasePreferences = {
  favorites: string[]
  viewMode: ViewMode
  favoritesOnly: boolean
  pagination: { page: number; pageSize: PageSize }
}

type BackupPayload = {
  format: 'fabula-ultima-tools-backup'
  version: 1 | 2
  kind: Kind
  exportedAt: string
  records: any[]
  preferences?: DatabasePreferences
}

const FAVORITES_KEY = 'fu-db-favorites'
const VIEW_KEY = 'fu-db-view-modes'
const ONLY_KEY = 'fu-db-favorites-only'
const PAGE_KEY = 'fu-db-pagination'

function storageKey(kind: Kind) {
  return kind === 'monster' ? 'fu-monsters' : 'fu-items'
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function readRecords(kind: Kind): any[] {
  const parsed = readJson<any[]>(storageKey(kind), [])
  return Array.isArray(parsed) ? parsed : []
}

function readPreferences(kind: Kind): DatabasePreferences {
  const favorites = readJson<Record<Kind, string[]>>(FAVORITES_KEY, { monster: [], item: [] })
  const views = readJson<Record<Kind, ViewMode>>(VIEW_KEY, { monster: 'full', item: 'full' })
  const only = readJson<Record<Kind, boolean>>(ONLY_KEY, { monster: false, item: false })
  const pagination = readJson<Record<Kind, { page: number; pageSize: PageSize }>>(PAGE_KEY, {
    monster: { page: 1, pageSize: 24 },
    item: { page: 1, pageSize: 24 },
  })
  return {
    favorites: Array.isArray(favorites[kind]) ? favorites[kind] : [],
    viewMode: views[kind] === 'compact' ? 'compact' : 'full',
    favoritesOnly: !!only[kind],
    pagination: {
      page: Math.max(1, Number(pagination[kind]?.page) || 1),
      pageSize: pagination[kind]?.pageSize || 24,
    },
  }
}

function restorePreferences(kind: Kind, preferences: DatabasePreferences) {
  const favorites = readJson<Record<Kind, string[]>>(FAVORITES_KEY, { monster: [], item: [] })
  favorites[kind] = Array.isArray(preferences.favorites) ? preferences.favorites.filter(value => typeof value === 'string') : []
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))

  const views = readJson<Record<Kind, ViewMode>>(VIEW_KEY, { monster: 'full', item: 'full' })
  views[kind] = preferences.viewMode === 'compact' ? 'compact' : 'full'
  localStorage.setItem(VIEW_KEY, JSON.stringify(views))

  const only = readJson<Record<Kind, boolean>>(ONLY_KEY, { monster: false, item: false })
  only[kind] = !!preferences.favoritesOnly
  localStorage.setItem(ONLY_KEY, JSON.stringify(only))

  const pagination = readJson<Record<Kind, { page: number; pageSize: PageSize }>>(PAGE_KEY, {
    monster: { page: 1, pageSize: 24 },
    item: { page: 1, pageSize: 24 },
  })
  const pageSize = preferences.pagination?.pageSize
  pagination[kind] = {
    page: Math.max(1, Number(preferences.pagination?.page) || 1),
    pageSize: pageSize === 'all' || pageSize === 12 || pageSize === 24 || pageSize === 48 ? pageSize : 24,
  }
  localStorage.setItem(PAGE_KEY, JSON.stringify(pagination))
}

function detectDatabase(): { kind: Kind; target: HTMLElement } | null {
  const active = Array.from(document.querySelectorAll<HTMLButtonElement>('nav button')).find(button => button.classList.contains('active'))?.textContent?.trim()
  if (active !== 'Monster Database' && active !== 'Item Database') return null
  const inputPlaceholder = active === 'Monster Database' ? 'Search monsters' : 'Search items'
  const input = Array.from(document.querySelectorAll<HTMLInputElement>('main input')).find(node => node.placeholder.startsWith(inputPlaceholder))
  const section = input?.closest<HTMLElement>('section')
  if (!section) return null
  const toolbar = section.querySelector<HTMLElement>('.toolbar')
  if (!toolbar) return null
  return { kind: active === 'Monster Database' ? 'monster' : 'item', target: toolbar }
}

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export default function DatabaseBackupTools() {
  const [mount, setMount] = useState<{ kind: Kind; target: HTMLElement } | null>(null)
  const [message, setMessage] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const update = () => {
      const next = detectDatabase()
      setMount(current => {
        if (!next) return null
        if (current?.kind === next.kind && current.target === next.target) return current
        return next
      })
    }
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
    document.addEventListener('click', update)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', update)
    }
  }, [])

  useEffect(() => setMessage(''), [mount?.kind])

  const customCount = useMemo(() => mount ? readRecords(mount.kind).filter(record => record?.source !== 'Official').length : 0, [mount, message])

  if (!mount) return null

  const label = mount.kind === 'monster' ? 'monsters' : 'items'

  const exportBackup = () => {
    const records = readRecords(mount.kind).filter(record => record?.source !== 'Official')
    const payload: BackupPayload = {
      format: 'fabula-ultima-tools-backup',
      version: 2,
      kind: mount.kind,
      exportedAt: new Date().toISOString(),
      records,
      preferences: readPreferences(mount.kind),
    }
    const stamp = new Date().toISOString().slice(0, 10)
    downloadJson(`fabula-ultima-${label}-backup-${stamp}.json`, payload)
    setMessage(`Exported ${records.length} custom ${label} with database preferences.`)
  }

  const importBackup = async (file: File) => {
    try {
      const payload = JSON.parse(await file.text()) as BackupPayload
      if (payload?.format !== 'fabula-ultima-tools-backup' || ![1, 2].includes(payload.version) || payload.kind !== mount.kind || !Array.isArray(payload.records)) {
        throw new Error('This backup does not match the current database.')
      }
      const invalid = payload.records.some(record => !record || typeof record !== 'object' || typeof record.id !== 'string' || typeof record.name !== 'string')
      if (invalid) throw new Error('The backup contains invalid records.')

      const current = readRecords(mount.kind)
      const official = current.filter(record => record?.source === 'Official')
      const user = current.filter(record => record?.source !== 'Official')
      const incoming = payload.records.map(record => ({ ...record, source: record.source === 'Official' ? 'Custom' : (record.source || 'Custom') }))
      const incomingIds = new Set(incoming.map(record => record.id))
      const merged = [...official, ...incoming, ...user.filter(record => !incomingIds.has(record.id))]
      localStorage.setItem(storageKey(mount.kind), JSON.stringify(merged))
      if (payload.version === 2 && payload.preferences) restorePreferences(mount.kind, payload.preferences)
      setMessage(`Imported ${incoming.length} custom ${label}${payload.version === 2 ? ' and preferences' : ''}. Reloading…`)
      window.setTimeout(() => window.location.reload(), 350)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not import that backup.')
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const reset = () => {
    const records = readRecords(mount.kind)
    const custom = records.filter(record => record?.source !== 'Official')
    if (!custom.length) {
      setMessage(`There are no custom ${label} to remove.`)
      return
    }
    if (!window.confirm(`Remove all ${custom.length} generated/custom ${label}? Official book entries will be kept.`)) return
    localStorage.setItem(storageKey(mount.kind), JSON.stringify(records.filter(record => record?.source === 'Official')))
    setMessage(`Removed ${custom.length} custom ${label}. Reloading…`)
    window.setTimeout(() => window.location.reload(), 350)
  }

  return createPortal(
    <div className="dbBackupTools" aria-label={`${label} database backup tools`}>
      <span className="dbBackupCount">Custom: <b>{customCount}</b></span>
      <button type="button" onClick={exportBackup}>Export Backup</button>
      <button type="button" onClick={() => fileInput.current?.click()}>Import Backup</button>
      <button type="button" className="dbResetButton" onClick={reset}>Reset to Official</button>
      <input ref={fileInput} className="dbBackupFile" type="file" accept="application/json,.json" onChange={event => { const file = event.target.files?.[0]; if (file) void importBackup(file) }} />
      {message && <span className="dbBackupMessage" role="status">{message}</span>}
    </div>,
    mount.target,
  )
}
