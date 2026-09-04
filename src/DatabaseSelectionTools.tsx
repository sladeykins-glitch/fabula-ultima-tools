import { useEffect } from 'react'
import './databaseSelectionTools.css'

type Kind = 'monster' | 'item'

const KEY = 'fu-db-selection'
const FAVORITES_KEY = 'fu-db-favorites'

function readSelection(): Record<Kind, string[]> {
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

function writeSelection(value: Record<Kind, string[]>) {
  localStorage.setItem(KEY, JSON.stringify(value))
}

function readRecords(kind: Kind): any[] {
  try {
    const value = JSON.parse(localStorage.getItem(kind === 'monster' ? 'fu-monsters' : 'fu-items') || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function kindForSection(section: HTMLElement): Kind | null {
  if (section.querySelector('[data-db-record-kind="monster"]') || section.querySelector('input[placeholder^="Search monsters"]')) return 'monster'
  if (section.querySelector('[data-db-record-kind="item"]') || section.querySelector('input[placeholder^="Search items"]')) return 'item'
  return null
}

function selectedRecords(kind: Kind, ids: string[]) {
  const byId = new Map(readRecords(kind).map(record => [record?.id, record]))
  return ids.map(id => byId.get(id)).filter(Boolean)
}

function visibleRecordIds(section: HTMLElement, kind: Kind) {
  return Array.from(section.querySelectorAll<HTMLElement>(`[data-db-record-kind="${kind}"][data-db-record-id]`))
    .filter(card => {
      const style = getComputedStyle(card)
      return style.display !== 'none' && style.visibility !== 'hidden' && !card.classList.contains('dbHiddenByFavorite')
    })
    .map(card => card.dataset.dbRecordId)
    .filter((id): id is string => !!id)
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

function readFavorites(): Record<Kind, string[]> {
  try {
    const value = JSON.parse(localStorage.getItem(FAVORITES_KEY) || '{}')
    return {
      monster: Array.isArray(value?.monster) ? value.monster : [],
      item: Array.isArray(value?.item) ? value.item : [],
    }
  } catch {
    return { monster: [], item: [] }
  }
}

export default function DatabaseSelectionTools() {
  useEffect(() => {
    const apply = () => {
      const selection = readSelection()
      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        if (!section.querySelector('.databaseSummary')) return
        const kind = kindForSection(section)
        if (!kind) return
        const records = readRecords(kind)
        const validIds = new Set(records.map(record => record?.id).filter(Boolean))
        const cleaned = selection[kind].filter(id => validIds.has(id))
        if (cleaned.length !== selection[kind].length) {
          selection[kind] = cleaned
          writeSelection(selection)
        }

        section.querySelectorAll<HTMLElement>('[data-db-record-id][data-db-record-kind]').forEach(card => {
          if (card.dataset.dbRecordKind !== kind) return
          const id = card.dataset.dbRecordId
          if (!id) return
          const active = cleaned.includes(id)
          card.classList.toggle('dbSelectedCard', active)
          const actions = card.querySelector<HTMLElement>('.cardActions')
          if (!actions) return
          let button = actions.querySelector<HTMLButtonElement>('[data-db-select-record]')
          if (!button) {
            button = document.createElement('button')
            button.type = 'button'
            button.dataset.dbSelectRecord = kind
            button.className = 'dbSelectButton'
            actions.insertBefore(button, actions.firstChild)
          }
          button.dataset.dbRecordId = id
          button.classList.toggle('active', active)
          button.textContent = active ? 'Selected' : 'Select'
          button.setAttribute('aria-pressed', String(active))
        })

        let bar = section.querySelector<HTMLElement>('.dbSelectionBar')
        if (!bar) {
          bar = document.createElement('div')
          bar.className = 'dbSelectionBar'
          bar.dataset.dbSelectionKind = kind
          const preset = section.querySelector('.dbPresetTools')
          const quick = section.querySelector('.dbQuickActions')
          ;(preset || quick || section.querySelector('.databaseSummary'))?.insertAdjacentElement('afterend', bar)
        }
        const selected = selectedRecords(kind, cleaned)
        const customCount = selected.filter(record => record?.source !== 'Official').length
        const visibleCount = visibleRecordIds(section, kind).length
        const signature = `${selected.length}|${customCount}|${visibleCount}|${selected.map(record => record.id).join(',')}`
        if (bar.dataset.signature !== signature) {
          bar.dataset.signature = signature
          bar.innerHTML = `
            <span><strong>${selected.length}</strong> selected${customCount ? ` · ${customCount} custom` : ''}</span>
            <button type="button" data-db-selection-visible ${visibleCount ? '' : 'disabled'}>Select visible (${visibleCount})</button>
            <button type="button" data-db-selection-copy ${selected.length ? '' : 'disabled'}>Copy names</button>
            <button type="button" data-db-selection-export ${selected.length ? '' : 'disabled'}>Export selected</button>
            <button type="button" data-db-selection-print ${selected.length ? '' : 'disabled'}>Print selected</button>
            <button type="button" data-db-selection-favorite ${selected.length ? '' : 'disabled'}>Favorite selected</button>
            <button type="button" data-db-selection-delete ${customCount ? '' : 'disabled'}>Delete selected custom</button>
            <button type="button" data-db-selection-clear ${selected.length ? '' : 'disabled'}>Clear</button>`
        }
      })
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const selectButton = target.closest<HTMLButtonElement>('[data-db-select-record]')
      if (selectButton) {
        event.preventDefault()
        event.stopPropagation()
        const kind = selectButton.dataset.dbSelectRecord as Kind
        const id = selectButton.dataset.dbRecordId
        if (!id) return
        const selection = readSelection()
        selection[kind] = selection[kind].includes(id)
          ? selection[kind].filter(value => value !== id)
          : [...selection[kind], id]
        writeSelection(selection)
        apply()
        return
      }

      const bar = target.closest<HTMLElement>('.dbSelectionBar')
      if (!bar) return
      const kind = bar.dataset.dbSelectionKind as Kind | undefined
      const section = bar.closest<HTMLElement>('section')
      if (!kind || !section) return
      const selection = readSelection()
      const records = selectedRecords(kind, selection[kind])

      if (target.closest('[data-db-selection-visible]')) {
        selection[kind] = Array.from(new Set([...selection[kind], ...visibleRecordIds(section, kind)]))
        writeSelection(selection)
        apply()
        return
      }

      if (target.closest('[data-db-selection-copy]')) {
        void navigator.clipboard?.writeText(records.map(record => record.name).join('\n'))
        return
      }

      if (target.closest('[data-db-selection-export]')) {
        const stamp = new Date().toISOString().slice(0, 10)
        downloadJson(`fabula-ultima-${kind}-selection-${stamp}.json`, {
          format: 'fabula-ultima-tools-selection',
          version: 1,
          kind,
          exportedAt: new Date().toISOString(),
          records,
        })
        return
      }

      if (target.closest('[data-db-selection-print]')) {
        document.body.classList.add('dbPrintSelection')
        const cleanup = () => {
          document.body.classList.remove('dbPrintSelection')
          window.removeEventListener('afterprint', cleanup)
        }
        window.addEventListener('afterprint', cleanup)
        window.print()
        return
      }

      if (target.closest('[data-db-selection-favorite]')) {
        const favorites = readFavorites()
        favorites[kind] = Array.from(new Set([...favorites[kind], ...records.map(record => record.id)]))
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
        apply()
        return
      }

      if (target.closest('[data-db-selection-delete]')) {
        const custom = records.filter(record => record?.source !== 'Official')
        if (!custom.length) return
        if (!window.confirm(`Delete ${custom.length} selected custom ${kind}${custom.length === 1 ? '' : 's'}? Official entries will be kept.`)) return
        const ids = new Set(custom.map(record => record.id))
        const key = kind === 'monster' ? 'fu-monsters' : 'fu-items'
        localStorage.setItem(key, JSON.stringify(readRecords(kind).filter(record => !ids.has(record.id))))
        selection[kind] = selection[kind].filter(id => !ids.has(id))
        writeSelection(selection)
        window.location.reload()
        return
      }

      if (target.closest('[data-db-selection-clear]')) {
        selection[kind] = []
        writeSelection(selection)
        apply()
      }
    }

    apply()
    const observer = new MutationObserver(() => requestAnimationFrame(apply))
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] })
    document.addEventListener('click', onClick)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}
