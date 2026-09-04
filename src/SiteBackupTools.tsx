import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './siteBackupTools.css'

type SiteBackup = {
  format: 'fabula-ultima-tools-site-backup'
  version: 1
  exportedAt: string
  records: {
    monsters: any[]
    items: any[]
  }
  settings: Record<string, unknown>
}

const SETTINGS_KEYS = [
  'fu-db-favorites',
  'fu-db-view-modes',
  'fu-db-favorites-only',
  'fu-db-pagination',
  'fu-db-saved-views',
  'fu-db-selection',
  'fu-active-tab',
  'fu-monster-filters',
  'fu-item-filters',
  'fu-monster-search',
  'fu-monster-generator-settings',
  'fu-item-generator-settings',
]

function readArray(key: string): any[] {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function customRecords(key: string) {
  return readArray(key).filter(record => record?.source !== 'Official')
}

function readSettings() {
  const settings: Record<string, unknown> = {}
  for (const key of SETTINGS_KEYS) {
    const raw = localStorage.getItem(key)
    if (raw == null) continue
    try {
      settings[key] = JSON.parse(raw)
    } catch {
      settings[key] = raw
    }
  }
  return settings
}

function mergeRecords(key: string, incoming: any[]) {
  const current = readArray(key)
  const official = current.filter(record => record?.source === 'Official')
  const custom = current.filter(record => record?.source !== 'Official')
  const sanitized = incoming
    .filter(record => record && typeof record === 'object' && typeof record.id === 'string' && typeof record.name === 'string')
    .map(record => ({ ...record, source: record.source === 'Official' ? 'Custom' : (record.source || 'Custom') }))
  const incomingIds = new Set(sanitized.map(record => record.id))
  localStorage.setItem(key, JSON.stringify([...official, ...sanitized, ...custom.filter(record => !incomingIds.has(record.id))]))
  return sanitized.length
}

function download(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export default function SiteBackupTools() {
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [message, setMessage] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const update = () => setTarget(document.querySelector<HTMLElement>('.shell > header'))
    update()
    if (document.querySelector('.shell > header')) return
    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  if (!target) return null

  const exportAll = () => {
    const payload: SiteBackup = {
      format: 'fabula-ultima-tools-site-backup',
      version: 1,
      exportedAt: new Date().toISOString(),
      records: {
        monsters: customRecords('fu-monsters'),
        items: customRecords('fu-items'),
      },
      settings: readSettings(),
    }
    const stamp = new Date().toISOString().slice(0, 10)
    download(`fabula-ultima-tools-full-backup-${stamp}.json`, payload)
    setMessage(`Backed up ${payload.records.monsters.length} custom monsters and ${payload.records.items.length} custom items.`)
  }

  const importAll = async (file: File) => {
    try {
      const payload = JSON.parse(await file.text()) as SiteBackup
      if (payload?.format !== 'fabula-ultima-tools-site-backup' || payload.version !== 1 || !payload.records || !Array.isArray(payload.records.monsters) || !Array.isArray(payload.records.items)) {
        throw new Error('That file is not a Fabula Ultima Tools full-site backup.')
      }

      const monsters = mergeRecords('fu-monsters', payload.records.monsters)
      const items = mergeRecords('fu-items', payload.records.items)
      if (payload.settings && typeof payload.settings === 'object') {
        for (const key of SETTINGS_KEYS) {
          if (!(key in payload.settings)) continue
          localStorage.setItem(key, JSON.stringify(payload.settings[key]))
        }
      }
      setMessage(`Restored ${monsters} custom monsters and ${items} custom items. Reloading…`)
      window.setTimeout(() => window.location.reload(), 450)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not restore that backup.')
    } finally {
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  return createPortal(
    <div className="siteBackupTools" aria-label="Whole site backup tools">
      <button type="button" onClick={exportAll}>Backup All</button>
      <button type="button" onClick={() => fileInput.current?.click()}>Restore All</button>
      <input ref={fileInput} type="file" accept="application/json,.json" onChange={event => { const file = event.target.files?.[0]; if (file) void importAll(file) }} />
      {message && <span className="siteBackupMessage" role="status">{message}</span>}
    </div>,
    target,
  )
}
