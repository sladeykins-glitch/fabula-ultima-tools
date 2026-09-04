import { useEffect } from 'react'

function fieldSnapshot(modal: HTMLElement) {
  return Array.from(modal.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea'))
    .map(control => {
      if (control instanceof HTMLInputElement && control.type === 'checkbox') return `${control.name}|${control.checked}`
      return `${control.name}|${control.value}`
    })
    .join('\u001f')
}

function storedRecordForModal(modal: HTMLElement) {
  const title = modal.querySelector('h2')?.textContent || ''
  const isMonster = title.endsWith('— Monster') || !!modal.querySelector('.dbAffinityGrid')
  const key = isMonster ? 'fu-monsters' : 'fu-items'
  const visibleName = title.replace(/\s+—\s+(Monster|Item)\s*$/, '').trim()
  try {
    const records = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(records) ? records.find(record => record?.name === visibleName) : null
  } catch {
    return null
  }
}

export default function DatabaseEditorEnhancements() {
  useEffect(() => {
    const initialSnapshots = new WeakMap<HTMLElement, string>()

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
      })
    }

    const isDirty = (modal: HTMLElement) => {
      const initial = initialSnapshots.get(modal)
      return initial != null && initial !== fieldSnapshot(modal)
    }

    const confirmDiscard = (modal: HTMLElement) => !isDirty(modal) || window.confirm('Discard unsaved changes?')

    const onClickCapture = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const modal = target.closest<HTMLElement>('.dbModal')

      const copy = target.closest<HTMLButtonElement>('[data-db-copy-json]')
      if (copy && modal) {
        event.preventDefault()
        event.stopPropagation()
        const record = storedRecordForModal(modal)
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
    document.addEventListener('mousedown', onMouseDownCapture, true)
    window.addEventListener('keydown', onKeyCapture, true)
    window.addEventListener('beforeunload', onBeforeUnload)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClickCapture, true)
      document.removeEventListener('mousedown', onMouseDownCapture, true)
      window.removeEventListener('keydown', onKeyCapture, true)
      window.removeEventListener('beforeunload', onBeforeUnload)
    }
  }, [])

  return null
}
