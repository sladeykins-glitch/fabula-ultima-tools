import { useEffect, useMemo, useState } from 'react'
import './databaseOverlay.css'

type Kind = 'monster' | 'item'
type Selected = { kind: Kind; record: any } | null

function loadRecords(kind: Kind): any[] {
  try {
    return JSON.parse(localStorage.getItem(kind === 'monster' ? 'fu-monsters' : 'fu-items') || '[]')
  } catch {
    return []
  }
}

function saveRecords(kind: Kind, records: any[]) {
  localStorage.setItem(kind === 'monster' ? 'fu-monsters' : 'fu-items', JSON.stringify(records))
}

export default function DatabaseOverlay() {
  const [selected, setSelected] = useState<Selected>(null)
  const [draft, setDraft] = useState<any>(null)

  useEffect(() => {
    const decorate = () => {
      document.querySelectorAll<HTMLElement>('.monsterCard, .itemCard').forEach(card => {
        const title = card.querySelector<HTMLElement>('.cardTitle')
        if (!title || title.querySelector('.dbOpenButton')) return
        const button = document.createElement('button')
        button.type = 'button'
        button.className = 'dbOpenButton'
        button.textContent = 'Open / Edit'
        button.dataset.dbOpen = card.classList.contains('monsterCard') ? 'monster' : 'item'
        title.appendChild(button)
      })
    }

    decorate()
    const observer = new MutationObserver(decorate)
    observer.observe(document.body, { childList: true, subtree: true })

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const button = target.closest<HTMLElement>('[data-db-open]')
      if (!button) return
      event.preventDefault()
      event.stopPropagation()
      const kind = button.dataset.dbOpen as Kind
      const card = button.closest<HTMLElement>(kind === 'monster' ? '.monsterCard' : '.itemCard')
      const name = card?.querySelector('h2')?.textContent?.trim()
      if (!name) return
      const record = loadRecords(kind).find(entry => entry.name === name)
      if (!record) return
      setSelected({ kind, record })
      setDraft({ ...record, traitsText: Array.isArray(record.traits) ? record.traits.join(', ') : '' })
    }

    document.addEventListener('click', onClick)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClick)
    }
  }, [])

  useEffect(() => {
    if (!selected) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setSelected(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected])

  const isOfficial = selected?.record?.source === 'Official'
  const title = useMemo(() => selected ? `${selected.record.name} — ${selected.kind === 'monster' ? 'Monster' : 'Item'}` : '', [selected])

  if (!selected || !draft) return null

  const set = (key: string, value: any) => setDraft((current: any) => ({ ...current, [key]: value }))
  const number = (key: string, value: string) => set(key, Number(value) || 0)

  const save = () => {
    const records = loadRecords(selected.kind)
    let next = { ...draft }
    delete next.traitsText
    if (selected.kind === 'monster') {
      next.traits = String(draft.traitsText || '').split(',').map((value: string) => value.trim()).filter(Boolean)
      next.crisis = Math.floor((Number(next.hp) || 0) / 2)
    }

    if (isOfficial) {
      next = {
        ...next,
        id: `custom-copy-${Date.now()}`,
        source: 'Custom',
        name: next.name === selected.record.name ? `${next.name} — Custom` : next.name,
      }
      saveRecords(selected.kind, [next, ...records])
    } else {
      saveRecords(selected.kind, records.map(entry => entry.id === selected.record.id ? next : entry))
    }
    window.location.reload()
  }

  return <div className="dbModalBackdrop" onMouseDown={event => { if (event.target === event.currentTarget) setSelected(null) }}>
    <section className="dbModal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="dbModalHeader">
        <div><span className="source">{isOfficial ? 'Official reference' : 'Editable entry'}</span><h2>{title}</h2></div>
        <button className="dbClose" onClick={() => setSelected(null)}>Close</button>
      </div>

      {isOfficial && <p className="dbOfficialNotice">Official book entries are protected. Saving changes creates a Custom copy, leaving the imported reference untouched.</p>}

      {selected.kind === 'monster' ? <div className="dbEditGrid">
        <label>Name<input value={draft.name || ''} onChange={event => set('name', event.target.value)} /></label>
        <label>Level<input type="number" min="1" max="99" value={draft.level ?? 1} onChange={event => number('level', event.target.value)} /></label>
        <label>Rank<select value={draft.rank || 'Soldier'} onChange={event => set('rank', event.target.value)}><option>Soldier</option><option>Elite</option><option>Champion</option></select></label>
        <label>Species<select value={draft.species || 'Monster'} onChange={event => set('species', event.target.value)}><option>Beast</option><option>Construct</option><option>Demon</option><option>Elemental</option><option>Humanoid</option><option>Monster</option><option>Plant</option><option>Undead</option></select></label>
        <label>HP<input type="number" min="0" value={draft.hp ?? 0} onChange={event => number('hp', event.target.value)} /></label>
        <label>MP<input type="number" min="0" value={draft.mp ?? 0} onChange={event => number('mp', event.target.value)} /></label>
        <label>Initiative<input type="number" value={draft.initiative ?? 0} onChange={event => number('initiative', event.target.value)} /></label>
        <label>Defense<input type="number" value={draft.defense ?? 0} onChange={event => number('defense', event.target.value)} /></label>
        <label>Magic Defense<input type="number" value={draft.magicDefense ?? 0} onChange={event => number('magicDefense', event.target.value)} /></label>
        <label className="dbWide">Traits<textarea value={draft.traitsText || ''} onChange={event => set('traitsText', event.target.value)} placeholder="trait one, trait two, trait three" /></label>
      </div> : <div className="dbEditGrid">
        <label>Name<input value={draft.name || ''} onChange={event => set('name', event.target.value)} /></label>
        <label>Cost (zenit)<input type="number" min="0" value={draft.cost ?? 0} onChange={event => number('cost', event.target.value)} /></label>
        <label>Type<input value={draft.type || ''} disabled /></label>
        <label>Category<input value={draft.category || ''} onChange={event => set('category', event.target.value)} /></label>
        <label className="dbWide">Quality / Customizations<textarea value={draft.quality || ''} onChange={event => set('quality', event.target.value)} /></label>
        <label className="dbWide">Effect<textarea value={draft.effect || ''} onChange={event => set('effect', event.target.value)} /></label>
        <label className="dbWide">Origin<textarea value={draft.origin || ''} onChange={event => set('origin', event.target.value)} /></label>
      </div>}

      <details className="dbReferenceDetails">
        <summary>Full stored record</summary>
        <pre>{JSON.stringify(selected.record, null, 2)}</pre>
      </details>

      <div className="dbModalActions">
        <button onClick={() => setSelected(null)}>Cancel</button>
        <button className="primary" onClick={save}>{isOfficial ? 'Save as Custom Copy' : 'Save Changes'}</button>
      </div>
    </section>
  </div>
}
