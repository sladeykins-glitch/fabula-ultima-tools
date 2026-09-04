import { useEffect } from 'react'
import './databaseRecentTools.css'

type Kind = 'monster' | 'item'
type RecentEntry = { id: string; name: string; openedAt: string }

const KEY = 'fu-db-recent'
const LIMIT = 8

function readRecent(): Record<Kind, RecentEntry[]> {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}')
    return {
      monster: Array.isArray(value?.monster) ? value.monster : [],
      item: Array.isArray(value?.item) ? value.item : [],
    }
  } catch {
    return { monster: [], item: [] }
  }
}

function writeRecent(value: Record<Kind, RecentEntry[]>) {
  localStorage.setItem(KEY, JSON.stringify(value))
}

function kindForSection(section: HTMLElement): Kind | null {
  if (section.querySelector('input[placeholder^="Search monsters"]')) return 'monster'
  if (section.querySelector('input[placeholder^="Search items"]')) return 'item'
  return null
}

function openById(kind: Kind, id: string) {
  const button = document.createElement('button')
  button.type = 'button'
  button.dataset.dbOpen = kind
  button.dataset.dbRecordId = id
  button.hidden = true
  document.body.appendChild(button)
  button.click()
  button.remove()
}

export default function DatabaseRecentTools() {
  useEffect(() => {
    const apply = () => {
      const recent = readRecent()
      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        if (!section.querySelector('.databaseSummary')) return
        const kind = kindForSection(section)
        if (!kind) return
        let bar = section.querySelector<HTMLElement>('.dbRecentBar')
        if (!bar) {
          bar = document.createElement('div')
          bar.className = 'dbRecentBar'
          bar.dataset.dbRecentKind = kind
          const selection = section.querySelector('.dbSelectionBar')
          const preset = section.querySelector('.dbPresetTools')
          ;(selection || preset || section.querySelector('.databaseSummary'))?.insertAdjacentElement('afterend', bar)
        }
        const entries = recent[kind].slice(0, 5)
        const signature = entries.map(entry => `${entry.id}:${entry.name}`).join('|')
        if (bar.dataset.signature === signature) return
        bar.dataset.signature = signature
        bar.innerHTML = entries.length
          ? `<span>Recent</span>${entries.map(entry => `<button type="button" data-db-recent-open="${entry.id.replace(/"/g, '&quot;')}" title="Open recently viewed entry">${entry.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</button>`).join('')}<button type="button" data-db-recent-clear class="dbRecentClear">Clear</button>`
          : '<span>Recent</span><em>No recently opened entries.</em>'
      })
    }

    const onClickCapture = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const openButton = target.closest<HTMLElement>('[data-db-open]')
      const kind = openButton?.dataset.dbOpen as Kind | undefined
      const id = openButton?.dataset.dbRecordId
      if (kind && id) {
        try {
          const records = JSON.parse(localStorage.getItem(kind === 'monster' ? 'fu-monsters' : 'fu-items') || '[]')
          const record = Array.isArray(records) ? records.find(entry => entry?.id === id) : null
          if (record?.name) {
            const recent = readRecent()
            recent[kind] = [{ id, name: record.name, openedAt: new Date().toISOString() }, ...recent[kind].filter(entry => entry.id !== id)].slice(0, LIMIT)
            writeRecent(recent)
            window.setTimeout(apply, 0)
          }
        } catch {
          // Ignore malformed local data here; the data-health layer reports it elsewhere.
        }
      }
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const recentButton = target.closest<HTMLButtonElement>('[data-db-recent-open]')
      if (recentButton) {
        const bar = recentButton.closest<HTMLElement>('.dbRecentBar')
        const kind = bar?.dataset.dbRecentKind as Kind | undefined
        const id = recentButton.dataset.dbRecentOpen
        if (kind && id) openById(kind, id)
        return
      }

      const clear = target.closest<HTMLButtonElement>('[data-db-recent-clear]')
      if (clear) {
        const bar = clear.closest<HTMLElement>('.dbRecentBar')
        const kind = bar?.dataset.dbRecentKind as Kind | undefined
        if (!kind) return
        const recent = readRecent()
        recent[kind] = []
        writeRecent(recent)
        bar.dataset.signature = '__refresh__'
        apply()
      }
    }

    apply()
    const observer = new MutationObserver(() => requestAnimationFrame(apply))
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('click', onClickCapture, true)
    document.addEventListener('click', onClick)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClickCapture, true)
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}
