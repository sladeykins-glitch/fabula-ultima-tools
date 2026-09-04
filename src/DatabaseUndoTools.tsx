import { useEffect } from 'react'

type Kind = 'monster' | 'item'
type DeletedSnapshot = { kind: Kind; record: any; deletedAt: string }

const KEY = 'fu-last-deleted-record'

function readSnapshot(): DeletedSnapshot | null {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null')
    if (!value || (value.kind !== 'monster' && value.kind !== 'item') || !value.record?.id) return null
    return value
  } catch {
    return null
  }
}

function activeKind(section: HTMLElement): Kind | null {
  if (section.querySelector('.monsterCard')) return 'monster'
  if (section.querySelector('.itemCard')) return 'item'
  return null
}

function storageKey(kind: Kind) {
  return kind === 'monster' ? 'fu-monsters' : 'fu-items'
}

function loadRecord(kind: Kind, id: string) {
  try {
    const records = JSON.parse(localStorage.getItem(storageKey(kind)) || '[]')
    return Array.isArray(records) ? records.find(record => record?.id === id) || null : null
  } catch {
    return null
  }
}

function cardStillExists(id: string) {
  return Array.from(document.querySelectorAll<HTMLElement>('[data-db-record-id]')).some(card => card.dataset.dbRecordId === id)
}

export default function DatabaseUndoTools() {
  useEffect(() => {
    const apply = () => {
      const snapshot = readSnapshot()
      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        const quick = section.querySelector<HTMLElement>('.dbQuickActions')
        if (!quick) return
        const kind = activeKind(section)
        let button = quick.querySelector<HTMLButtonElement>('[data-db-undo-delete]')
        if (!snapshot || !kind || snapshot.kind !== kind) {
          button?.remove()
          return
        }
        if (!button) {
          button = document.createElement('button')
          button.type = 'button'
          button.dataset.dbUndoDelete = 'true'
          const hint = quick.querySelector('.dbQuickHint')
          quick.insertBefore(button, hint)
        }
        button.textContent = `Undo delete: ${snapshot.record.name}`
        button.title = 'Restore the most recently deleted custom entry'
      })
    }

    const captureDelete = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const button = target.closest<HTMLButtonElement>('.monsterCard .danger, .itemCard .danger')
      if (!button || button.textContent?.trim() !== 'Delete') return
      const card = button.closest<HTMLElement>('.monsterCard, .itemCard')
      const id = card?.dataset.dbRecordId
      const kind = card?.dataset.dbRecordKind as Kind | undefined
      if (!id || (kind !== 'monster' && kind !== 'item')) return
      const record = loadRecord(kind, id)
      if (!record || record.source === 'Official') return

      window.setTimeout(() => {
        if (cardStillExists(id)) return
        localStorage.setItem(KEY, JSON.stringify({ kind, record, deletedAt: new Date().toISOString() } satisfies DeletedSnapshot))
        apply()
      }, 120)
    }

    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-db-undo-delete]')
      if (!button) return
      const snapshot = readSnapshot()
      if (!snapshot) return
      try {
        const key = storageKey(snapshot.kind)
        const records = JSON.parse(localStorage.getItem(key) || '[]')
        const list = Array.isArray(records) ? records : []
        if (!list.some(record => record?.id === snapshot.record.id)) {
          localStorage.setItem(key, JSON.stringify([snapshot.record, ...list]))
        }
        localStorage.removeItem(KEY)
        window.location.reload()
      } catch {
        localStorage.removeItem(KEY)
        apply()
      }
    }

    apply()
    const observer = new MutationObserver(() => requestAnimationFrame(apply))
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('click', captureDelete, true)
    document.addEventListener('click', onClick)
    window.addEventListener('storage', apply)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', captureDelete, true)
      document.removeEventListener('click', onClick)
      window.removeEventListener('storage', apply)
    }
  }, [])

  return null
}
