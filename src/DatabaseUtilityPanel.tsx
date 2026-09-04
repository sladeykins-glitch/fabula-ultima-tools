import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import './databaseUtilityPanel.css'

type Kind = 'monster' | 'item'
type ViewMode = 'full' | 'compact'
type PageSize = 12 | 24 | 48

const VIEW_KEY = 'fu-db-view-modes-native'
const SELECTION_KEY = 'fu-db-selection'
const PAGE_SIZE_KEY = 'fu-db-page-size'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw) as T
  } catch { return fallback }
}

function activeKind(): Kind {
  const tab = readJson<string>('fu-active-tab', 'Monster Database')
  return tab === 'Item Database' ? 'item' : 'monster'
}

function allRecords(kind: Kind): any[] {
  const value = readJson<any[]>(kind === 'monster' ? 'fu-monsters' : 'fu-items', [])
  return Array.isArray(value) ? value : []
}

function selectionIds(kind: Kind): string[] {
  const raw = readJson<any>(SELECTION_KEY, { monster:[], item:[] })
  if (!raw || Array.isArray(raw) || typeof raw !== 'object') return []
  return Array.isArray(raw[kind]) ? raw[kind].filter((v:unknown):v is string => typeof v === 'string') : []
}

function chosen(kind: Kind) {
  const ids = new Set(selectionIds(kind))
  return allRecords(kind).filter(record => ids.has(record?.id))
}

function issues(kind: Kind, record: any): string[] {
  if (record?.source === 'Official') return []
  const out: string[] = []
  if (typeof record?.id !== 'string' || !record.id.trim()) out.push('missing ID')
  if (typeof record?.name !== 'string' || !record.name.trim()) out.push('missing name')
  if (kind === 'monster') {
    if (!Number.isFinite(record?.level) || record.level < 1 || record.level > 99) out.push('invalid level')
    if (!Number.isFinite(record?.hp) || record.hp < 1) out.push('invalid HP')
    if (!Number.isFinite(record?.mp) || record.mp < 0) out.push('invalid MP')
    for (const key of ['dex','ins','mig','wlp']) if (![6,8,10,12].includes(record?.attributes?.[key])) out.push(`invalid ${key.toUpperCase()}`)
    for (const key of ['attacks','skills','spells']) if (!Array.isArray(record?.[key])) out.push(`${key} are not a list`)
  } else {
    if (!['Weapon','Armor','Shield','Accessory'].includes(record?.type)) out.push('invalid type')
    if (!Number.isFinite(record?.cost) || record.cost < 0) out.push('invalid cost')
    if (record?.type === 'Weapon') {
      if (!record?.accuracy) out.push('missing accuracy')
      if (!Number.isFinite(record?.damage)) out.push('missing damage')
      if (!record?.damageType) out.push('missing damage type')
    }
    if ((record?.type === 'Armor' || record?.type === 'Shield') && !Number.isFinite(record?.defense)) out.push('missing defense')
  }
  return out
}

function escapeHtml(value: unknown) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c] || c))
}

function asMarkdown(kind: Kind, rows: any[]) {
  return rows.map(record => kind === 'monster'
    ? `## ${record.name}\nLv ${record.level} · ${record.rank} · ${record.species}\nHP ${record.hp} · MP ${record.mp} · DEF ${record.defense} · M.DEF ${record.magicDefense}\n${(record.attacks || []).map((a:any)=>`- **${a.name}** — ${a.formula}; ${a.damageType}; ${a.effect || ''}`).join('\n')}`
    : `## ${record.name}\n${record.type}${record.category ? ` · ${record.category}` : ''} · ${record.cost}z\n${record.effect || ''}`).join('\n\n')
}

function exportRows(kind: Kind, rows: any[]) {
  const blob = new Blob([JSON.stringify({format:'fabula-ultima-tools-selection',version:1,kind,exportedAt:new Date().toISOString(),count:rows.length,records:rows}, null, 2)], {type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `fabula-${kind}-selection-${new Date().toISOString().slice(0,10)}.json`; a.click()
  URL.revokeObjectURL(url)
}

function printRows(kind: Kind, rows: any[]) {
  const popup = window.open('', '_blank', 'width=980,height=760')
  if (!popup) return false
  const cards = rows.map(record => kind === 'monster'
    ? `<article><h2>${escapeHtml(record.name)}</h2><p>Lv ${escapeHtml(record.level)} · ${escapeHtml(record.rank)} · ${escapeHtml(record.species)}</p><p><b>HP</b> ${escapeHtml(record.hp)} · <b>MP</b> ${escapeHtml(record.mp)} · <b>DEF</b> ${escapeHtml(record.defense)} · <b>M.DEF</b> ${escapeHtml(record.magicDefense)}</p><p><b>Traits:</b> ${escapeHtml((record.traits || []).join(', '))}</p>${(record.attacks || []).map((a:any)=>`<p><b>${escapeHtml(a.name)}</b> — ${escapeHtml(a.formula)}; ${escapeHtml(a.damageType)}; ${escapeHtml(a.effect || '')}</p>`).join('')}</article>`
    : `<article><h2>${escapeHtml(record.name)}</h2><p>${escapeHtml(record.type)} · ${escapeHtml(record.cost)}z</p><p>${escapeHtml(record.effect || '')}</p></article>`).join('')
  popup.document.write(`<!doctype html><html><head><title>Fabula Ultima selection</title><style>body{font-family:system-ui;margin:24px;color:#111}main{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}article{break-inside:avoid;border:1px solid #bbb;border-radius:10px;padding:14px}h2{margin:0 0 8px}@media print{body{margin:8mm}}</style></head><body><h1>Fabula Ultima — Selected ${kind === 'monster' ? 'Monsters' : 'Items'}</h1><main>${cards}</main><script>window.onload=()=>window.print()<\/script></body></html>`)
  popup.document.close()
  return true
}

function sourcePage(record: any) {
  const text = [...(Array.isArray(record?.notes) ? record.notes : []), ...(Array.isArray(record?.breakdown) ? record.breakdown : [])].join(' ')
  return text.match(/printed page\s+(\d+)/i)?.[1] || ''
}

function addPageBadges() {
  const kind = activeKind(), byId = new Map(allRecords(kind).map(r => [r?.id,r]))
  document.querySelectorAll<HTMLElement>('.monsterCard[data-db-record-id],.itemCard[data-db-record-id]').forEach(card => {
    const page = sourcePage(byId.get(card.dataset.dbRecordId || '')), old = card.querySelector('.sourcePageBadge')
    if (!page) { old?.remove(); return }
    if (old) { old.textContent = `p. ${page}`; return }
    const source = card.querySelector('.source'); if (!source) return
    const badge = document.createElement('span'); badge.className='sourcePageBadge'; badge.textContent=`p. ${page}`; badge.title=`Verified source profile: printed page ${page}`
    source.insertAdjacentElement('afterend', badge)
  })
}

function readPageSize(): PageSize {
  const n = Number(localStorage.getItem(PAGE_SIZE_KEY) || '24')
  return n === 12 || n === 48 ? n : 24
}

export default function DatabaseUtilityPanel() {
  const [target,setTarget] = useState<HTMLElement|null>(null)
  const [kind,setKind] = useState<Kind>(activeKind)
  const [selected,setSelected] = useState<any[]>(()=>chosen(activeKind()))
  const [healthOpen,setHealthOpen] = useState(false)
  const [message,setMessage] = useState('')
  const [pageSize,setPageSize] = useState<PageSize>(readPageSize)
  const [view,setView] = useState<ViewMode>(()=>readJson<Record<Kind,ViewMode>>(VIEW_KEY,{monster:'full',item:'full'})[activeKind()] === 'compact' ? 'compact' : 'full')

  const refresh = () => {
    const k = activeKind(); setKind(k); setSelected(chosen(k)); setPageSize(readPageSize())
    const v = readJson<Record<Kind,ViewMode>>(VIEW_KEY,{monster:'full',item:'full'})[k] === 'compact' ? 'compact' : 'full'
    setView(v); document.documentElement.dataset.fuDbView=v; window.setTimeout(addPageBadges,0)
  }

  useEffect(()=>{
    const timer=window.setTimeout(()=>{setTarget(document.querySelector<HTMLElement>('.shell > header'));refresh()},0)
    const onClick=()=>window.setTimeout(refresh,0)
    document.addEventListener('click',onClick); window.addEventListener('fu-open-record',onClick)
    return()=>{window.clearTimeout(timer);document.removeEventListener('click',onClick);window.removeEventListener('fu-open-record',onClick)}
  },[])

  const unhealthy = useMemo(()=>allRecords(kind).filter(r=>r?.source!=='Official').map(record=>({record,issues:issues(kind,record)})).filter(x=>x.issues.length),[kind,selected,healthOpen])
  if(!target) return null

  const flash=(text:string)=>{setMessage(text);window.setTimeout(()=>setMessage(''),1600)}
  const changeView=(v:ViewMode)=>{const state=readJson<Record<Kind,ViewMode>>(VIEW_KEY,{monster:'full',item:'full'});localStorage.setItem(VIEW_KEY,JSON.stringify({...state,[kind]:v}));setView(v);document.documentElement.dataset.fuDbView=v}
  const changePageSize=(n:PageSize)=>{if(n===pageSize)return;localStorage.setItem(PAGE_SIZE_KEY,String(n));window.location.reload()}

  return createPortal(<div className="databaseUtilityPanel" aria-label="Database display and selected record tools">
    <label className="dbPageSize">Cards <select value={pageSize} onChange={e=>changePageSize(Number(e.target.value) as PageSize)}><option value={12}>12</option><option value={24}>24</option><option value={48}>48</option></select></label>
    <div className="dbViewSwitch"><button type="button" className={view==='full'?'active':''} onClick={()=>changeView('full')}>Full</button><button type="button" className={view==='compact'?'active':''} onClick={()=>changeView('compact')}>Compact</button></div>
    {selected.length>0&&<div className="dbSelectedTools"><span>{selected.length} selected</span><button type="button" onClick={()=>{void navigator.clipboard?.writeText(asMarkdown(kind,selected));flash('Copied selected')}}>Copy</button><button type="button" onClick={()=>{exportRows(kind,selected);flash('Exported selected')}}>Export</button><button type="button" onClick={()=>{if(!printRows(kind,selected))flash('Allow pop-ups to print')}}>Print</button></div>}
    <div className="dbHealthWrap"><button type="button" className={unhealthy.length?'warning':''} onClick={()=>setHealthOpen(v=>!v)}>Data health {unhealthy.length?`(${unhealthy.length})`:'✓'}</button>{healthOpen&&<div className="dbHealthMenu"><strong>{kind==='monster'?'Monster':'Item'} data health</strong>{unhealthy.length===0?<p>All custom records pass the basic structural checks.</p>:unhealthy.slice(0,12).map(({record,issues})=><div className="dbHealthRow" key={record.id}><b>{record.name||'Unnamed record'}</b><span>{issues.join(' · ')}</span></div>)}</div>}</div>
    {message&&<span className="dbUtilityMessage" role="status">{message}</span>}
  </div>,target)
}
