import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import './undoDeleteTools.css'

type Kind = 'monster' | 'item'
type Deleted = { kind: Kind; record: any; deletedAt: number }

const UNDO_KEY = 'fu-db-last-delete-native'

function readRecords(kind: Kind): any[] {
  try {
    const value = JSON.parse(localStorage.getItem(kind === 'monster' ? 'fu-monsters' : 'fu-items') || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function readUndo(): Deleted | null {
  try {
    const value = JSON.parse(localStorage.getItem(UNDO_KEY) || 'null')
    if (!value || (value.kind !== 'monster' && value.kind !== 'item') || !value.record?.id) return null
    return value
  } catch {
    return null
  }
}

export default function UndoDeleteTools() {
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [deleted, setDeleted] = useState<Deleted | null>(readUndo)

  useEffect(() => {
    setTarget(document.querySelector<HTMLElement>('.shell > header'))

    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.monsterCard .danger, .itemCard .danger')
      if (!button || button.textContent?.trim() !== 'Delete') return
      const card = button.closest<HTMLElement>('.monsterCard, .itemCard')
      const id = card?.dataset.dbRecordId
      const kind = card?.dataset.dbRecordKind as Kind | undefined
      if (!id || (kind !== 'monster' && kind !== 'item')) return
      const record = readRecords(kind).find(entry => entry?.id === id)
      if (!record || record.source === 'Official') return

      window.setTimeout(() => {
        const stillExists = readRecords(kind).some(entry => entry?.id === id)
        if (stillExists) return
        const snapshot: Deleted = { kind, record, deletedAt: Date.now() }
        localStorage.setItem(UNDO_KEY, JSON.stringify(snapshot))
        setDeleted(snapshot)
      }, 160)
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  if (!target || !deleted) return null

  const restore = () => {
    const current = readRecords(deleted.kind)
    if (!current.some(record => record?.id === deleted.record.id)) {
      localStorage.setItem(deleted.kind === 'monster' ? 'fu-monsters' : 'fu-items', JSON.stringify([deleted.record, ...current]))
    }
    localStorage.setItem('fu-active-tab', JSON.stringify(deleted.kind === 'monster' ? 'Monster Database' : 'Item Database'))
    localStorage.removeItem(UNDO_KEY)
    setDeleted(null)
    window.location.reload()
  }

  const dismiss = () => {
    localStorage.removeItem(UNDO_KEY)
    setDeleted(null)
  }

  return createPortal(<div className="undoDeleteTools" role="status">
    <span>Deleted <strong>{deleted.record.name || 'entry'}</strong></span>
    <button type="button" onClick={restore}>Undo</button>
    <button type="button" className="undoDismiss" aria-label="Dismiss undo" onClick={dismiss}>×</button>
  </div>, target)
}
