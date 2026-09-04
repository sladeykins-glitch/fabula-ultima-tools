import { useEffect } from 'react'

const focusableSelector = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'summary',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function AccessibilityTools() {
  useEffect(() => {
    let lastOpener: HTMLElement | null = null
    let activeModal: HTMLElement | null = null

    const annotate = () => {
      const nav = document.querySelector<HTMLElement>('nav')
      if (nav) {
        nav.setAttribute('role', 'tablist')
        nav.setAttribute('aria-label', 'Fabula Ultima tools')
        nav.querySelectorAll<HTMLButtonElement>('button').forEach(button => {
          button.setAttribute('role', 'tab')
          button.setAttribute('aria-selected', button.classList.contains('active') ? 'true' : 'false')
        })
      }

      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        if (!section.querySelector('.databaseSummary')) return
        const isMonster = !!section.querySelector('.monsterCard') || section.querySelector<HTMLInputElement>('input')?.placeholder.startsWith('Search monsters')
        const search = section.querySelector<HTMLInputElement>('.toolbar input')
        if (search) search.setAttribute('aria-label', isMonster ? 'Search monster database' : 'Search item database')

        const labels = isMonster
          ? ['Source book', 'Rank', 'Species', 'Combat style', 'Sort order']
          : ['Source book', 'Item type', 'Category', 'Martial status', 'Material status', 'Sort order']
        section.querySelectorAll<HTMLSelectElement>('.toolbar select').forEach((select, index) => {
          select.setAttribute('aria-label', labels[index] || `Filter ${index + 1}`)
        })
      })

      const modal = document.querySelector<HTMLElement>('.dbModal')
      if (modal && modal !== activeModal) {
        activeModal = modal
        const first = modal.querySelector<HTMLElement>('.dbClose') || modal.querySelector<HTMLElement>(focusableSelector)
        window.setTimeout(() => first?.focus(), 0)
      } else if (!modal && activeModal) {
        activeModal = null
        window.setTimeout(() => lastOpener?.focus(), 0)
      }
    }

    const onClickCapture = (event: MouseEvent) => {
      const opener = (event.target as HTMLElement).closest<HTMLElement>('[data-db-open]')
      if (opener) lastOpener = opener
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const modal = document.querySelector<HTMLElement>('.dbModal')
      if (!modal) return
      const focusable = Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector))
        .filter(element => element.offsetParent !== null)
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const current = document.activeElement
      if (event.shiftKey && current === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && current === last) {
        event.preventDefault()
        first.focus()
      }
    }

    annotate()
    const observer = new MutationObserver(() => requestAnimationFrame(annotate))
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
    document.addEventListener('click', onClickCapture, true)
    window.addEventListener('keydown', onKeyDown, true)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClickCapture, true)
      window.removeEventListener('keydown', onKeyDown, true)
    }
  }, [])

  return null
}
