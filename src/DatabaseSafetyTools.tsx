import { useEffect } from 'react'

export default function DatabaseSafetyTools() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const button = target.closest<HTMLButtonElement>('.monsterCard .danger, .itemCard .danger')
      if (!button || button.textContent?.trim() !== 'Delete') return
      const section = button.closest<HTMLElement>('main > section')
      if (!section?.querySelector('.databaseSummary')) return
      const card = button.closest<HTMLElement>('.monsterCard, .itemCard')
      const name = card?.querySelector('h2')?.textContent?.trim() || 'this entry'
      if (window.confirm(`Delete “${name}”? This cannot be undone unless you have a backup.`)) return
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
    }

    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
