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

function sourcePage(record: any) {
  const text = [...(Array.isArray(record?.notes) ? record.notes : []), ...(Array.isArray(record?.breakdown) ? record.breakdown : [])].join(' ')
  return text.match(/printed page\s+(\d+)/i)?.[1] || ''
}

function sourceBook(record: any) {
  if (record?.source !== 'Official') return record?.source || 'Custom'
  const id = String(record?.id || '')
  if (id.startsWith('official-high-') || id.startsWith('official-hf-')) return 'Atlas: High Fantasy'
  if (id.startsWith('official-natural-') || id.startsWith('official-nf-')) return 'Atlas: Natural Fantasy'
  if (id.startsWith('official-techno-') || id.startsWith('official-tf-')) return 'Atlas: Techno Fantasy'
  return 'Core Rulebook'
}

function affinityText(record: any) {
  if (!record?.affinities || typeof record.affinities !== 'object') return ''
  return Object.entries(record.affinities).filter(([,value])=>value !== 'Normal').map(([key,value])=>`${key}: ${value}`).join(' · ')
}

function asMarkdown(kind: Kind, rows: any[]) {
  return rows.map(record => {
    const page = sourcePage(record), source = sourceBook(record)
    if (kind === 'monster') {
      const attacks = (record.attacks || []).map((a:any)=>`- **${a.name}** — ${a.formula}; ${a.damageType}; ${a.effect || ''}`).join('\n')
      const skills = (record.skills || []).map((s:any)=>`- **${s.name}** — ${s.summary}`).join('\n')
      const spells = (record.spells || []).map((s:any)=>`- **${s.name}** (${s.mp} MP; ${s.target}; ${s.duration}) — ${s.effect}`).join('\n')
      return `## ${record.name}\n${source}${page ? ` · p. ${page}` : ''}\nLv ${record.level} · ${record.rank} · ${record.species}${record.combatStyle ? ` · ${record.combatStyle}` : ''}\nHP ${record.hp} · Crisis ${record.crisis ?? Math.floor((record.hp || 0)/2)} · MP ${record.mp} · Init ${record.initiative} · DEF ${record.defense} · M.DEF ${record.magicDefense}\nDEX d${record.attributes?.dex} · INS d${record.attributes?.ins} · MIG d${record.attributes?.mig} · WLP d${record.attributes?.wlp}\nTraits: ${(record.traits || []).join(', ')}${affinityText(record) ? `\nAffinities: ${affinityText(record)}` : ''}${attacks ? `\n\n### Attacks\n${attacks}` : ''}${skills ? `\n\n### Skills\n${skills}` : ''}${spells ? `\n\n### Spells\n${spells}` : ''}`
    }
    return `## ${record.name}\n${source}${page ? ` · p. ${page}` : ''}\n${record.type}${record.category ? ` · ${record.category}` : ''} · ${record.cost}z${record.martial ? ' · Martial' : ''}${record.baseItem ? `\nBase: ${record.baseItem}` : ''}${record.quality ? `\nQuality: ${record.quality}` : ''}\n${record.effect || ''}`
  }).join('\n\n---\n\n')
}

function exportRows(kind: Kind, rows: any[]) {
  const blob = new Blob([JSON.stringify({format:'fabula-ultima-tools-selection',version:2,kind,exportedAt:new Date().toISOString(),count:rows.length,records:rows}, null, 2)], {type:'application/json'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = `fabula-${kind}-selection-${new Date().toISOString().slice(0,10)}.json`; a.click()
  URL.revokeObjectURL(url)
}

function monsterPrintCard(record: any) {
  const page = sourcePage(record), source = sourceBook(record), affinities = affinityText(record)
  const attacks = (record.attacks || []).map((a:any)=>`<div class="entry"><b>${escapeHtml(a.name)}</b><span>${escapeHtml(a.formula)} · ${escapeHtml(a.damageType)}</span>${a.effect ? `<p>${escapeHtml(a.effect)}</p>` : ''}</div>`).join('')
  const skills = (record.skills || []).map((s:any)=>`<div class="entry"><b>${escapeHtml(s.name)}</b><p>${escapeHtml(s.summary)}</p></div>`).join('')
  const spells = (record.spells || []).map((s:any)=>`<div class="entry"><div class="entryTitle"><b>${escapeHtml(s.name)}</b><em>${escapeHtml(s.mp)} MP</em></div><span>${escapeHtml(s.target)} · ${escapeHtml(s.duration)}</span><p>${escapeHtml(s.effect)}</p></div>`).join('')
  return `<article class="printCard monsterPrint"><header><div><small>${escapeHtml(source)}${page ? ` · PRINTED P. ${escapeHtml(page)}` : ''}</small><h2>${escapeHtml(record.name)}</h2><p>Lv ${escapeHtml(record.level)} · ${escapeHtml(record.rank)} · ${escapeHtml(record.species)}${record.combatStyle ? ` · ${escapeHtml(record.combatStyle)}` : ''}</p></div></header><div class="statGrid"><b>HP ${escapeHtml(record.hp)}</b><b>Crisis ${escapeHtml(record.crisis ?? Math.floor((record.hp || 0)/2))}</b><b>MP ${escapeHtml(record.mp)}</b><b>Init ${escapeHtml(record.initiative)}</b><b>DEF ${escapeHtml(record.defense)}</b><b>M.DEF ${escapeHtml(record.magicDefense)}</b></div><div class="attrGrid"><span>DEX d${escapeHtml(record.attributes?.dex)}</span><span>INS d${escapeHtml(record.attributes?.ins)}</span><span>MIG d${escapeHtml(record.attributes?.mig)}</span><span>WLP d${escapeHtml(record.attributes?.wlp)}</span></div><p class="traits"><b>Traits</b> ${escapeHtml((record.traits || []).join(', '))}</p>${affinities ? `<p class="aff"><b>Affinities</b> ${escapeHtml(affinities)}</p>` : ''}${attacks ? `<section><h3>Basic Attacks</h3>${attacks}</section>` : ''}${skills ? `<section><h3>NPC Skills</h3>${skills}</section>` : ''}${spells ? `<section><h3>Spells</h3>${spells}</section>` : ''}</article>`
}

function itemPrintCard(record: any) {
  const page = sourcePage(record), source = sourceBook(record)
  const profile = record.type === 'Weapon'
    ? `<div class="statGrid"><b>${escapeHtml(record.handedness || '—')}</b><b>${escapeHtml(record.range || '—')}</b><b>${escapeHtml(record.accuracy || '—')}${record.accuracyBonus ? ` +${escapeHtml(record.accuracyBonus)}` : ''}</b><b>HR + ${escapeHtml(record.damage ?? '—')}</b><b>${escapeHtml(record.damageType || '—')}</b></div>`
    : (record.type === 'Armor' || record.type === 'Shield') ? `<div class="statGrid"><b>DEF ${escapeHtml(record.defense ?? '—')}</b><b>M.DEF ${escapeHtml(record.magicDefense ?? '—')}</b><b>Init ${escapeHtml(record.initiative ?? 0)}</b></div>` : ''
  return `<article class="printCard itemPrint"><header><div><small>${escapeHtml(source)}${page ? ` · PRINTED P. ${escapeHtml(page)}` : ''}</small><h2>${escapeHtml(record.name)}</h2><p>${escapeHtml(record.type)}${record.category ? ` · ${escapeHtml(record.category)}` : ''} · ${escapeHtml(record.cost)}z${record.martial ? ' · Martial' : ''}</p></div></header>${profile}${record.baseItem ? `<p><b>Base</b> ${escapeHtml(record.baseItem)}</p>` : ''}${record.quality ? `<p><b>Quality / Customizations</b> ${escapeHtml(record.quality)}</p>` : ''}<div class="effect">${escapeHtml(record.effect || '')}</div>${record.origin ? `<p class="origin"><b>Origin</b> ${escapeHtml(record.origin)}</p>` : ''}</article>`
}

function printRows(kind: Kind, rows: any[]) {
  const popup = window.open('', '_blank', 'width=1100,height=820')
  if (!popup) return false
  const cards = rows.map(record => kind === 'monster' ? monsterPrintCard(record) : itemPrintCard(record)).join('')
  popup.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Fabula Ultima - Selected ${kind === 'monster' ? 'Monsters' : 'Items'}</title><style>@page{size:A4;margin:8mm}*{box-sizing:border-box}body{font-family:Arial,Helvetica,sans-serif;margin:0;color:#141821;background:#fff}.printHeader{display:flex;justify-content:space-between;align-items:flex-end;border-bottom:2px solid #312e81;margin-bottom:7mm;padding-bottom:3mm}.printHeader h1{font-size:18pt;margin:0}.printHeader span{font-size:8.5pt;color:#555}.sheet{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5mm}.printCard{break-inside:avoid;border:1px solid #9aa3b2;border-radius:3mm;padding:4mm;background:#fff;box-shadow:0 1mm 2mm rgba(0,0,0,.05)}.printCard header{border-bottom:1px solid #c8cdd6;padding-bottom:2mm;margin-bottom:2.5mm}.printCard small{font-size:6.8pt;letter-spacing:.08em;font-weight:700;color:#4f46e5;text-transform:uppercase}.printCard h2{font-size:14pt;margin:1mm 0 .5mm}.printCard header p{font-size:8.5pt;margin:0;color:#4b5563}.statGrid,.attrGrid{display:flex;flex-wrap:wrap;gap:1.5mm;margin:2mm 0}.statGrid b,.attrGrid span{font-size:7.7pt;border:1px solid #cbd0d9;background:#f5f6f8;border-radius:1.7mm;padding:1.2mm 1.7mm}.traits,.aff,.origin{font-size:8pt;line-height:1.35;margin:2mm 0}.printCard section{margin-top:2.5mm}.printCard h3{font-size:8pt;text-transform:uppercase;letter-spacing:.08em;color:#3730a3;border-bottom:1px solid #d7dae0;margin:0 0 1.5mm;padding-bottom:.7mm}.entry{font-size:7.8pt;line-height:1.28;border-left:1.2mm solid #6366f1;padding:1.2mm 1.7mm;margin:1.3mm 0;background:#fafafa}.entry b{font-size:8pt}.entry span{color:#4b5563;margin-left:1mm}.entry p{margin:.7mm 0 0}.entryTitle{display:flex;justify-content:space-between;gap:2mm}.entryTitle em{font-size:7pt;color:#4f46e5;font-style:normal;font-weight:700}.effect{font-size:8.5pt;line-height:1.4;border-left:1.2mm solid #6366f1;background:#f7f7fb;padding:2mm;margin-top:2mm}.itemPrint{min-height:45mm}@media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact}.printCard{box-shadow:none}}@media(max-width:760px){.sheet{grid-template-columns:1fr}}</style></head><body><div class="printHeader"><h1>Fabula Ultima - Selected ${kind === 'monster' ? 'Monsters' : 'Items'}</h1><span>${rows.length} record${rows.length === 1 ? '' : 's'} · ${escapeHtml(new Date().toLocaleDateString())}</span></div><main class="sheet">${cards}</main><script>window.onload=()=>window.print()<\/script></body></html>`)
  popup.document.close()
  return true
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

  const records = useMemo(()=>allRecords(kind),[kind,selected,healthOpen])
  const unhealthy = useMemo(()=>records.filter(r=>r?.source!=='Official').map(record=>({record,issues:issues(kind,record)})).filter(x=>x.issues.length),[records,kind])
  const official = useMemo(()=>records.filter(r=>r?.source==='Official'),[records])
  const verified = useMemo(()=>official.filter(r=>!!sourcePage(r)).length,[official])
  if(!target) return null

  const flash=(text:string)=>{setMessage(text);window.setTimeout(()=>setMessage(''),1600)}
  const changeView=(v:ViewMode)=>{const state=readJson<Record<Kind,ViewMode>>(VIEW_KEY,{monster:'full',item:'full'});localStorage.setItem(VIEW_KEY,JSON.stringify({...state,[kind]:v}));setView(v);document.documentElement.dataset.fuDbView=v}
  const changePageSize=(n:PageSize)=>{if(n===pageSize)return;localStorage.setItem(PAGE_SIZE_KEY,String(n));window.location.reload()}

  return createPortal(<div className="databaseUtilityPanel" aria-label="Database display and selected record tools">
    <label className="dbPageSize">Cards <select value={pageSize} onChange={e=>changePageSize(Number(e.target.value) as PageSize)}><option value={12}>12</option><option value={24}>24</option><option value={48}>48</option></select></label>
    <div className="dbViewSwitch"><button type="button" className={view==='full'?'active':''} onClick={()=>changeView('full')}>Full</button><button type="button" className={view==='compact'?'active':''} onClick={()=>changeView('compact')}>Compact</button></div>
    {kind === 'monster' && official.length > 0 && <span className="dbAuditStatus" title="Official monster profiles with a verified printed source page">Audit <b>{verified}</b>/{official.length}</span>}
    {selected.length>0&&<div className="dbSelectedTools"><span>{selected.length} selected</span><button type="button" onClick={()=>{void navigator.clipboard?.writeText(asMarkdown(kind,selected));flash('Copied full stat blocks')}}>Copy</button><button type="button" onClick={()=>{exportRows(kind,selected);flash('Exported selected')}}>Export</button><button type="button" onClick={()=>{if(!printRows(kind,selected))flash('Allow pop-ups to print')}}>Print cards</button></div>}
    <div className="dbHealthWrap"><button type="button" className={unhealthy.length?'warning':''} onClick={()=>setHealthOpen(v=>!v)} aria-expanded={healthOpen}>Data health {unhealthy.length?`(${unhealthy.length})`:'✓'}</button>{healthOpen&&<div className="dbHealthMenu"><strong>{kind==='monster'?'Monster':'Item'} data health</strong>{kind === 'monster' && <p>Official source pages verified: <b>{verified}/{official.length}</b>.</p>}{unhealthy.length===0?<p>All custom records pass the basic structural checks.</p>:unhealthy.slice(0,12).map(({record,issues})=><div className="dbHealthRow" key={record.id}><b>{record.name||'Unnamed record'}</b><span>{issues.join(' · ')}</span></div>)}</div>}</div>
    {message&&<span className="dbUtilityMessage" role="status">{message}</span>}
  </div>,target)
}
