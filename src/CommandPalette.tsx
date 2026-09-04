import { useEffect, useMemo, useRef, useState } from 'react'
import './commandPalette.css'

type Command = {
  id: string
  label: string
  hint?: string
  run: () => void
  available?: () => boolean
}

function activeDatabaseSection() {
  return Array.from(document.querySelectorAll<HTMLElement>('main > section')).find(section => section.querySelector('.databaseSummary')) || null
}

function click(selector: string, root: ParentNode = document) {
  root.querySelector<HTMLButtonElement>(selector)?.click()
}

function clickNav(label: string) {
  const button = Array.from(document.querySelectorAll<HTMLButtonElement>('nav button')).find(node => node.textContent?.trim() === label)
  button?.click()
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const commands = useMemo<Command[]>(() => [
    { id: 'monster-db', label: 'Go to Monster Database', hint: 'Navigation', run: () => clickNav('Monster Database') },
    { id: 'monster-gen', label: 'Go to Monster Generator', hint: 'Navigation', run: () => clickNav('Monster Generator') },
    { id: 'item-db', label: 'Go to Item Database', hint: 'Navigation', run: () => clickNav('Item Database') },
    { id: 'item-gen', label: 'Go to Item Generator', hint: 'Navigation', run: () => clickNav('Item Generator') },
    { id: 'search', label: 'Focus database search', hint: '/', available: () => !!activeDatabaseSection(), run: () => activeDatabaseSection()?.querySelector<HTMLInputElement>('.toolbar input')?.focus() },
    { id: 'reset', label: 'Reset current database filters', hint: 'Database', available: () => !!activeDatabaseSection(), run: () => { const section = activeDatabaseSection(); if (section) click('[data-db-reset-filters]', section) } },
    { id: 'random', label: 'Open a random matching entry', hint: 'Database', available: () => !!activeDatabaseSection(), run: () => { const section = activeDatabaseSection(); if (section) click('[data-db-random-entry]', section) } },
    { id: 'compact', label: 'Use compact database cards', hint: 'View', available: () => !!activeDatabaseSection(), run: () => { const section = activeDatabaseSection(); if (section) click('[data-db-view="compact"]', section) } },
    { id: 'full', label: 'Use full database cards', hint: 'View', available: () => !!activeDatabaseSection(), run: () => { const section = activeDatabaseSection(); if (section) click('[data-db-view="full"]', section) } },
    { id: 'favorites', label: 'Toggle favorites-only view', hint: 'View', available: () => !!activeDatabaseSection(), run: () => { const section = activeDatabaseSection(); if (section) click('[data-db-favorites-only]', section) } },
    { id: 'clear-selection', label: 'Clear current selection', hint: 'Selection', available: () => !!activeDatabaseSection()?.querySelector('[data-db-selection-clear]:not(:disabled)'), run: () => { const section = activeDatabaseSection(); if (section) click('[data-db-selection-clear]', section) } },
    { id: 'backup', label: 'Backup all custom data and settings', hint: 'Safety', available: () => !!document.querySelector('.siteBackupTools button'), run: () => click('.siteBackupTools button') },
    { id: 'data-check', label: 'Open Data Check', hint: 'Safety', available: () => !!document.querySelector('.dataMaintenanceTrigger'), run: () => click('.dataMaintenanceTrigger') },
  ], [])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return commands.filter(command => command.available?.() !== false)
      .filter(command => !needle || `${command.label} ${command.hint || ''}`.toLowerCase().includes(needle))
  }, [commands, query, open])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setOpen(value => !value)
        return
      }
      if (!open) return
      if (event.key === 'Escape') {
        event.preventDefault()
        setOpen(false)
      } else if (event.key === 'ArrowDown') {
        event.preventDefault()
        setIndex(value => visible.length ? (value + 1) % visible.length : 0)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setIndex(value => visible.length ? (value - 1 + visible.length) % visible.length : 0)
      } else if (event.key === 'Enter' && visible[index]) {
        event.preventDefault()
        visible[index].run()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, visible, index])

  useEffect(() => {
    if (!open) return
    setQuery('')
    setIndex(0)
    window.setTimeout(() => inputRef.current?.focus(), 0)
  }, [open])

  useEffect(() => { if (index >= visible.length) setIndex(0) }, [visible.length, index])

  if (!open) return null

  const run = (command: Command) => {
    command.run()
    setOpen(false)
  }

  return <div className="commandPaletteBackdrop" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(false) }}>
    <section className="commandPalette" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="commandPaletteSearch">
        <input ref={inputRef} value={query} onChange={event => { setQuery(event.target.value); setIndex(0) }} placeholder="Search commands…" aria-label="Search commands" />
        <kbd>Esc</kbd>
      </div>
      <div className="commandPaletteList" role="listbox">
        {visible.length ? visible.map((command, commandIndex) => <button
          type="button"
          key={command.id}
          className={commandIndex === index ? 'active' : ''}
          onMouseEnter={() => setIndex(commandIndex)}
          onClick={() => run(command)}
          role="option"
          aria-selected={commandIndex === index}
        ><span>{command.label}</span>{command.hint && <small>{command.hint}</small>}</button>) : <div className="commandPaletteEmpty">No matching commands.</div>}
      </div>
      <div className="commandPaletteFooter"><span>↑ ↓ navigate</span><span>Enter run</span><span>Ctrl/Cmd+K toggle</span></div>
    </section>
  </div>
}
