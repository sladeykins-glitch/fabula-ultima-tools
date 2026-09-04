import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import './databaseUtilityPanel.css'

type Kind = 'monster' | 'item'
type ViewMode = 'full' | 'compact'

type SelectionState = { monster: string[]; item: string[] }

const VIEW_KEY = 'fu-db-view-modes-native'
const SELECTION_KEY = 'fu-db-selection'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function activeKind(): Kind {
  return readJson('fu-active-tab', 'Monster Database') === 'Item Database' ? 'item' : 'monster'
}

function readSelection(kind: Kind) {
  const raw = readJson<any>(SELECTION_KEY, { monster:[], item:[] })
  if (!raw || Array.isArray(raw) || typeof raw !== 'object') return [] as string[]
  const values = raw[kind]
  return Array.isArray(values) ? values.filter((value: unknown): value is string => typeof value === 'string') : []
}

function records(kind: Kind) {
  const key = kind === 'monster' ? 'fu-monsters' : 'fu-items'
  const value = readJson<any[]>(key, [])
  return Array.isArray(value) ? value : []
}

function selectedRecords(kind: Kind) {
  const ids = new Set(readSelection(kind))
  return records(kind).filter(record => ids.has(record?.id))
}

function recordIssues(kind: Kind, record: any): string[] {
  if (record?.source === 'Official') return []
  const issues: string[] = []
  if (typeof record?.id !== 'string' || !record.id.trim()) issues.push('missing ID')
  if (typeof record?.name !== 'string' || !record.name.trim()) issues.push('missing name')
  if (kind === 'monster') {
    if (!Number.isFinite(record?.level) || record.level < 1 || record.level > 99) issues.push('invalid level')
    if (!Number.isFinite(record?.hp) || record.hp < 1) issues.push('invalid HP')
    if (!Number.isFinite(record?.mp) || record.mp < 0) issues.push('invalid MP')
    for (const key of ['dex','ins','mig','wlp']) if (![6,8,10,12].includes(record?.attributes?.[key])) issues.push(`invalid ${key.toUpperCase()}`)
    if (!Array.isArray(record?.attacks)) issues.push('attacks are not a list')
    if (!Array.isArray(record?.skills)) issues.push('skills are not a list')
    if (!Array.isArray(record?.spells)) issues.push('spells are not a list')
  } else {
    if (!['Weapon','Armor','Shield','Accessory'].includes(record?.type)) issues.push('invalid type')
    if (!Number.isFinite(record?.cost) || record.cost < 0) issues.push('invalid cost')
    if (record?.type === 'Weapon') {
      if (!record?.accuracy) issues.push('missing accuracy')
      if (!Number.isFinite(record?.damage)) issues.push('missing damage')
      if (!record?.damageType) issues.push('missing damage type')
    }
    if ((record?.type === 'Armor' || record?.type === 'Shield') && !Number.isFinite(record?.defense)) issues.push('missing defense')
  }
  return issues
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[char] || char))
}

function markdownFor(kind: Kind, rows: any[]) {
  if (kind === 'monster') return rows.map(record => `## ${record.name}\nLv ${record.level} · ${record.rank} · ${record.species}\nHP ${record.hp} · MP ${record.mp} · DEF ${record.defense} · M.DEF ${record.magicDefense}\n${(record.attacks || []).map((attack:any) => `- **${attack.name}** — ${attack.formula}; ${attack.damageType}; ${attack.effect || ''}`).join('\n')}`).join('\n\n')
  return rows.map(record => `## ${record.name}\n${record.type}${record.category ? ` · ${record.category}` : ''} · ${record.cost}z\n${record.effect || ''}`).join('\n\n')
}

function download(kind: Kind, rows: any[]) {
  const payload = { format:'fabula-ultima-tools-selection', version:1, kind, exportedAt:new Date().toISOString(), count:rows.length, records:rows }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `fabula-${kind}-selection-${new Date().toISOString().slice(0,10)}.json`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

function printRows(kind: Kind, rows: any[]) {
  const popup = window.open('', '_blank', 'width=980,height=760')
  if (!popup) return false
  const body = rows.map(record => kind === 'monster'
    ? `<article><h2>${escapeHtml(record.name)}</h2><p>Lv ${escapeHtml(record.level)} · ${escapeHtml(record.rank)} · ${escapeHtml(record.species)}</p><p><b>HP</b> ${escapeHtml(record.hp)} · <b>MP</b> ${escapeHtml(record.mp)} · <b>DEF</b> ${escapeHtml(record.defense)} · <b>M.DEF</b> ${escapeHtml(record.magicDefense)}</p><p><b>Traits:</b> ${escapeHtml((record.traits || []).join(', '))}</p>${(record.attacks || []).map((attack:any)=>`<p><b>${escapeHtml(attack.name)}</b> — ${escapeHtml(attack.formula)}; ${escapeHtml(attack.damageType)}; ${escapeHtml(attack.effect || '')}</p>`).join('')}</article>`
    : `<article><h2>${escapeHtml(record.name)}</h2><p>${escapeHtml(record.type)}${record.category ? ` · ${escapeHtml(record.category)}` : ''} · ${escapeHtml(record.cost)}z</p><p>${escapeHtml(record.effect || '')}</p></article>`).join('')
  popup.document.write(`<!doctype html><html><head><title>Fabula Ultima selected ${kind}s</title><style>body{font-family:system-ui,sans-serif;margin:24px;color:#111}main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}article{break-inside:avoid;border:1px solid #bbb;border-radius:10px;padding:14px}h2{margin:0 0 8px}p{margin:6px 0;line-height:1.35}@media print{body{margin:8mm}article{box-shadow:none}}</style></head><body><h1>Fabula Ultima — Selected ${kind === 'monster' ? 'Monsters' : 'Items'}</h1><main>${body}</main><script>window.onload=()=>window.print()<\/script></body></html>`)
  popup.document.close()
  return true
}

function pageFromRecord(record: any) {
  const text = [...(Array.isArray(record?.notes) ? record.notes : []), ...(Array.isArray(record?.breakdown) ? record.breakdown : [])].join(' ')
  const match = text.match(/printed page\s+(\d+)/i)
  return match?.[1] || ''
}

function decorateSourcePages() {
  const kind = activeKind()
  const byId = new Map(records(kind).map(record => [record?.id, record]))
  document.querySelectorAll<HTMLElement>('.monsterCard[data-db-record-id], .itemCard[data-db-record-id]').forEach(card => {
    const id = card.dataset.dbRecordId
    const record = id ? byId.get(id) : undefined
    const page = pageFromRecord(record)
    const old = card.querySelector('.sourcePageBadge')
    if (!page) { old?.remove(); return }
    if (old) { old.textContent = `p. ${page}`; return }
    const source = card.querySelector('.source')
    if (!source) return
    const badge = document.createElement('span')
    badge.className = 'sourcePageBadge'
    badge.textContent = `p. ${page}`
    badge.title = `Verified source profile: printed page ${page}`
    source.insertAdjacentElement('afterend', badge)
  })
}

export default function DatabaseUtilityPanel() {
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [kind, setKind] = useState<Kind>(activeKind)
  const [selected, setSelected] = useState<any[]>(() => selectedRecords(activeKind()))
  const [healthOpen, setHealthOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [view, setView] = useState<ViewMode>(() => {
    const state = readJson<Record<Kind,ViewMode>>(VIEW_KEY, { monster:'full', item:'full' })
    return state[activeKind()] === 'compact' ? 'compact' : 'full'
  })

  const refresh = () => {
    const nextKind = activeKind()
    setKind(nextKind)
    setSelected(selectedRecords(nextKind))
    const state = readJson<Record<Kind,ViewMode>>(VIEW_KEY, { monster:'full', item:'full' })
    const nextView = state[nextKind] === 'compact' ? 'compact' : 'full'
    setView(nextView)
    document.documentElement.dataset.fuDbView = nextView
    window.setTimeout(decorateSourcePages, 0)
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { setTarget(document.querySelector<HTMLElement>('.shell > header')); refresh() }, 0)
    const onClick = () => window.setTimeout(refresh, 0)
    const onOpen = () => window.setTimeout(refresh, 0)
    document.addEventListener('click', onClick)
    window.addEventListener('fu-open-record', onOpen)
    return () => { window.clearTimeout(timer); document.removeEventListener('click', onClick); window.removeEventListener('fu-open-record', onOpen) }
  }, [])

  const unhealthy = useMemo(() => records(kind).filter(record => record?.source !== 'Official').map(record => ({ record, issues:recordIssues(kind, record) })).filter(entry => entry.issues.length), [kind, selected, healthOpen])

  if (!target) return null

  const changeView = (next: ViewMode) => {
    const state = readJson<Record<Kind,ViewMode>>(VIEW_KEY, { monster:'full', item:'full' })
    localStorage.setItem(VIEW_KEY, JSON.stringify({ ...state, [kind]:next }))
    setView(next)
    document.documentElement.dataset.fuDbView = next
  }

  const flash = (text: string) => { setMessage(text); window.setTimeout(()=>setMessage(''), 1600) }

  return createPortal(<div className="databaseUtilityPanel" aria-label="Database display and selected record tools">
    <div className="dbViewSwitch" role="group" aria-label="Database card view">
      <button type="button" className={view === 'full' ? 'active' : ''} onClick={()=>changeView('full')}>Full</button>
      <button type="button" className={view === 'compact' ? 'active' : ''} onClick={()=>changeView('compact')}>Compact</button>
    </div>
    {selected.length > 0 && <div className="dbSelectedTools">
      <span>{selected.length} selected</span>
      <button type="button" onClick={()=>{void navigator.clipboard?.writeText(markdownFor(kind, selected));flash('Copied selected as Markdown')}}>Copy</button>
      <button type="button" onClick={()=>{download(kind, selected);flash('Exported selected')}}>Export</button>
      <button type="button" onClick={()=>{if(!printRows(kind, selected))flash('Allow pop-ups to print selected records')}}>Print</button>
    </div>}
    <div className="dbHealthWrap">
      <button type="button" className={unhealthy.length ? 'warning' : ''} onClick={()=>setHealthOpen(value=>!value)} aria-expanded={healthOpen}>Data health {unhealthy.length ? `(${unhealthy.length})` : '✓'}</button>
      {healthOpen && <div className="dbHealthMenu"><strong>{kind === 'monster' ? 'Monster' : 'Item'} data health</strong>{unhealthy.length === 0 ? <p>All custom records pass the basic structural checks.</p> : <>{unhealthy.slice(0,12).map(({record,issues})=><div key={record.id} className="dbHealthRow"><b>{record.name || 'Unnamed record'}</b><span>{issues.join(' · ')}</span></div>)}{unhealthy.length > 12 && <p>…and {unhealthy.length - 12} more.</p>}</>}</div>}
    </div>
    {message && <span className="dbUtilityMessage" role="status">{message}</span>}
  </div>, target)
}
