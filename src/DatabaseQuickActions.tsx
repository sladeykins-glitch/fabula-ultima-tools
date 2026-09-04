import { useEffect } from 'react'
import './databaseQuickActions.css'

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function setSelectValue(select: HTMLSelectElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set
  setter?.call(select, value)
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

function resetToolbar(section: HTMLElement) {
  const toolbar = section.querySelector<HTMLElement>('.toolbar')
  if (!toolbar) return
  toolbar.querySelectorAll<HTMLInputElement>('input').forEach(input => {
    if (input.type === 'text' || input.type === 'search') setInputValue(input, '')
  })
  toolbar.querySelectorAll<HTMLSelectElement>('select').forEach(select => {
    const values = Array.from(select.options).map(option => option.value)
    if (values.includes('All')) setSelectValue(select, 'All')
    else if (values.includes('Newest')) setSelectValue(select, 'Newest')
  })
}

function eligibleCards(section: HTMLElement) {
  return Array.from(section.querySelectorAll<HTMLElement>('.monsterCard, .itemCard'))
    .filter(card => !card.classList.contains('dbHiddenByFavorite'))
}

export default function DatabaseQuickActions() {
  useEffect(() => {
    const apply = () => {
      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        if (!section.querySelector('.databaseSummary')) return
        let bar = section.querySelector<HTMLElement>('.dbQuickActions')
        if (!bar) {
          bar = document.createElement('div')
          bar.className = 'dbQuickActions'
          bar.innerHTML = `
            <button type="button" data-db-reset-filters title="Clear search and restore all database filters">Reset filters</button>
            <button type="button" data-db-random-entry title="Open a random entry from the current filtered results">Random entry</button>
            <span class="dbQuickHint">Press <kbd>/</kbd> to jump to search</span>`
          const quality = section.querySelector('.dbQualityBar')
          const browse = section.querySelector('.dbBrowseBar')
          const summary = section.querySelector('.databaseSummary')
          ;(quality || browse || summary)?.insertAdjacentElement('afterend', bar)
        }
      })
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const reset = target.closest<HTMLButtonElement>('[data-db-reset-filters]')
      if (reset) {
        const section = reset.closest<HTMLElement>('section')
        if (!section) return
        resetToolbar(section)
        return
      }

      const random = target.closest<HTMLButtonElement>('[data-db-random-entry]')
      if (random) {
        const section = random.closest<HTMLElement>('section')
        if (!section) return
        const cards = eligibleCards(section)
        if (!cards.length) return
        const card = cards[Math.floor(Math.random() * cards.length)]
        const open = card.querySelector<HTMLButtonElement>('.dbOpenButton')
        open?.click()
      }
    }

    apply()
    const observer = new MutationObserver(() => requestAnimationFrame(apply))
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('click', onClick)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}
