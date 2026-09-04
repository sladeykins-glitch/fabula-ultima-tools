import { useEffect } from 'react'

type Kind = 'monster' | 'item'
type OpenRecord = { kind: Kind; id: string } | null

function fieldSnapshot(modal: HTMLElement) {
  return Array.from(modal.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea'))
    .map(control => {
      if (control instanceof HTMLInputElement && control.type === 'checkbox') return `${control.name}|${control.checked}`
      return `${control.name}|${control.value}`
    })
    .join('\u001f')
}

function loadRecord(open: OpenRecord) {
  if (!open) return null
  const key = open.kind === 'monster' ? 'fu-monsters' : 'fu-items'
  try {
    const records = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(records) ? records.find(record => record?.id === open.id) || null : null
  } catch {
    return null
  }
}

export default function DatabaseEditorEnhancements() {
  useEffect(() => {
    const initialSnapshots = new WeakMap<HTMLElement, string>()
    let lastOpen: OpenRecord = null

    const isDirty = (modal: HTMLElement) => {
      const initial = initialSnapshots.get(modal)
      return initial != null && initial !== fieldSnapshot(modal)
    }

    const updateDirtyIndicator = (modal: HTMLElement) => {
      const header = modal.querySelector<HTMLElement>('.dbModalHeader > div')
      if (!header) return
      let indicator = header.querySelector<HTMLElement>('.dbDirtyIndicator')
      const dirty = isDirty(modal)
      if (dirty) {
        if (!indicator) {
          indicator = document.createElement('span')
          indicator.className = 'dbDirtyIndicator'
          indicator.textContent = 'Unsaved changes'
          header.appendChild(indicator)
        }
      } else {
        indicator?.remove()
      }
    }

    const ensureModal = () => {
      document.querySelectorAll<HTMLElement>('.dbModal').forEach(modal => {
        if (!initialSnapshots.has(modal)) initialSnapshots.set(modal, fieldSnapshot(modal))
        const actions = modal.querySelector<HTMLElement>('.dbModalActions')
        if (actions && !actions.querySelector('[data-db-copy-json]')) {
          const copy = document.createElement('button')
          copy.type = 'button'
          copy.dataset.dbCopyJson = 'true'
          copy.textContent = 'Copy stored JSON'
          actions.insertBefore(copy, actions.firstChild)
        }
        updateDirtyIndicator(modal)
      })
    }

    const confirmDiscard = (modal: HTMLElement) => !isDirty(modal) || window.confirm('Discard unsaved changes?')

    const onClickCapture = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const opener = target.closest<HTMLElement>('[data-db-open][data-db-record-id]')
      if (opener) {
        const kind = opener.dataset.dbOpen as Kind | undefined
        const id = opener.dataset.dbRecordId
        if ((kind === 'monster' || kind === 'item') && id) lastOpen = { kind, id }
      }

      const modal = target.closest<HTMLElement>('.dbModal')
      const copy = target.closest<HTMLButtonElement>('[data-db-copy-json]')
      if (copy && modal) {
        event.preventDefault()
        event.stopPropagation()
        const record = loadRecord(lastOpen)
        const text = JSON.stringify(record || {}, null, 2)
        navigator.clipboard?.writeText(text).then(() => {
          const original = copy.textContent
          copy.textContent = 'Copied'
          window.setTimeout(() => { copy.textContent = original }, 1200)
        }).catch(() => undefined)
        return
      }

      const closeControl = target.closest<HTMLButtonElement>('.dbClose, .dbModalActions button')
      const isCancel = closeControl?.textContent?.trim() === 'Cancel' || closeControl?.classList.contains('dbClose')
      if (modal && isCancel && !confirmDiscard(modal)) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
      }
    }

    const onInput = (event: Event) => {
      const modal = (event.target as HTMLElement).closest<HTMLElement>('.dbModal')
      if (modal) updateDirtyIndicator(modal)
    }

    const onMouseDownCapture = (event: MouseEvent) => {
      const backdrop = event.target instanceof HTMLElement && event.target.classList.contains('dbModalBackdrop') ? event.target : null
      const modal = backdrop?.querySelector<HTMLElement>('.dbModal')
      if (modal && !confirmDiscard(modal)) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
      }
    }

    const onKeyCapture = (event: KeyboardEvent) => {
      const modal = document.querySelector<HTMLElement>('.dbModal')
      if (!modal) return

      if (event.key === 'Escape' && !confirmDiscard(modal)) {
        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        return
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        const save = Array.from(modal.querySelectorAll<HTMLButtonElement>('.dbModalActions button')).find(button => button.classList.contains('primary'))
        if (save) {
          event.preventDefault()
          save.click()
        }
      }
    }

    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      const modal = document.querySelector<HTMLElement>('.dbModal')
      if (!modal || !isDirty(modal)) return
      event.preventDefault()
      event.returnValue = ''
    }

    ensureModal()
    const observer = new MutationObserver(ensureModal)
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('click', onClickCapture, true)
    document.addEventListener('input', onInput, true)
    document.addEventListener('change', onInput, true)
    document.addEventListener('mousedown', onMouseDownCapture, true)
    window.addEventListener('keydown', onKeyCapture, true)
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClickCapture, true)
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('change', onInput, true)
      document.removeEventListener('mousedown', onMouseDownCapture, true)
      window.removeEventListener('keydown', onKeyCapture, true)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [])

  return null
}
