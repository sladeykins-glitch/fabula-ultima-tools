import { useEffect, useMemo, useState } from 'react'
import './databaseCompareTools.css'

type Kind = 'monster' | 'item'
type OpenState = { kind: Kind; records: any[] } | null

const SELECTION_KEY = 'fu-db-selection'

function readSelection(kind: Kind): string[] {
  try {
    const value = JSON.parse(localStorage.getItem(SELECTION_KEY) || '{}')
    return Array.isArray(value?.[kind]) ? value[kind] : []
  } catch {
    return []
  }
}

function readRecords(kind: Kind): any[] {
  try {
    const value = JSON.parse(localStorage.getItem(kind === 'monster' ? 'fu-monsters' : 'fu-items') || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function selectedRecords(kind: Kind) {
  const ids = readSelection(kind)
  const byId = new Map(readRecords(kind).map(record => [record?.id, record]))
  return ids.map(id => byId.get(id)).filter(Boolean).slice(0, 8)
}

function text(value: unknown) {
  return value == null || value === '' ? '—' : String(value)
}

export default function DatabaseCompareTools() {
  const [open, setOpen] = useState<OpenState>(null)

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLElement>('[data-db-selection-compare]')
      if (!button) return
      const bar = button.closest<HTMLElement>('.dbSelectionBar')
      const kind = bar?.dataset.dbSelectionKind as Kind | undefined
      if (!kind) return
      const records = selectedRecords(kind)
      if (records.length < 2) return
      setOpen({ kind, records })
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const rows = useMemo(() => {
    if (!open) return [] as { label: string; value: (record: any) => string }[]
    if (open.kind === 'monster') return [
      { label: 'Level', value: record => text(record.level) },
      { label: 'Rank', value: record => text(record.rank) },
      { label: 'Species', value: record => text(record.species) },
      { label: 'Style', value: record => text(record.combatStyle || 'Mixed') },
      { label: 'HP', value: record => text(record.hp) },
      { label: 'MP', value: record => text(record.mp) },
      { label: 'Initiative', value: record => text(record.initiative) },
      { label: 'Defense', value: record => text(record.defense) },
      { label: 'Magic Defense', value: record => text(record.magicDefense) },
      { label: 'Turns', value: record => text(record.turnsPerRound || 1) },
      { label: 'DEX', value: record => record.attributes?.dex ? `d${record.attributes.dex}` : '—' },
      { label: 'INS', value: record => record.attributes?.ins ? `d${record.attributes.ins}` : '—' },
      { label: 'MIG', value: record => record.attributes?.mig ? `d${record.attributes.mig}` : '—' },
      { label: 'WLP', value: record => record.attributes?.wlp ? `d${record.attributes.wlp}` : '—' },
      { label: 'Attacks', value: record => text(record.attacks?.length || 0) },
      { label: 'Skills', value: record => text(record.skills?.length || 0) },
      { label: 'Spells', value: record => text(record.spells?.length || 0) },
    ]
    return [
      { label: 'Type', value: record => text(record.type) },
      { label: 'Category', value: record => text(record.category) },
      { label: 'Cost', value: record => `${Number(record.cost) || 0}z` },
      { label: 'Martial', value: record => record.martial ? 'Yes' : 'No' },
      { label: 'Handedness', value: record => text(record.handedness) },
      { label: 'Range', value: record => text(record.range) },
      { label: 'Accuracy', value: record => text(record.accuracy) },
      { label: 'Accuracy Bonus', value: record => text(record.accuracyBonus) },
      { label: 'HR Damage', value: record => record.damage == null ? '—' : `+${record.damage}` },
      { label: 'Damage Type', value: record => text(record.damageType) },
      { label: 'Defense', value: record => text(record.defense) },
      { label: 'Magic Defense', value: record => text(record.magicDefense) },
      { label: 'Initiative', value: record => text(record.initiative) },
      { label: 'Quality', value: record => text(record.quality) },
    ]
  }, [open])

  if (!open) return null

  return <div className="dbCompareBackdrop" onMouseDown={event => { if (event.target === event.currentTarget) setOpen(null) }}>
    <section className="dbCompareModal" role="dialog" aria-modal="true" aria-label={`Compare selected ${open.kind}s`}>
      <div className="dbCompareHeader">
        <div><span className="source">Selection comparison</span><h2>Compare {open.kind === 'monster' ? 'Monsters' : 'Items'}</h2></div>
        <button type="button" onClick={() => setOpen(null)}>Close</button>
      </div>
      {readSelection(open.kind).length > 8 && <p className="muted">Showing the first 8 selected entries.</p>}
      <div className="dbCompareScroll">
        <table className="dbCompareTable">
          <thead><tr><th>Field</th>{open.records.map(record => <th key={record.id}>{record.name}</th>)}</tr></thead>
          <tbody>{rows.map(row => <tr key={row.label}><th>{row.label}</th>{open.records.map(record => <td key={record.id}>{row.value(record)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      {open.kind === 'item' && <div className="dbCompareEffects">
        {open.records.map(record => <article key={record.id}><strong>{record.name}</strong><p>{record.effect || 'No special effect.'}</p></article>)}
      </div>}
    </section>
  </div>
}
