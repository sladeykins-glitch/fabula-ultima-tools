import { useEffect, useMemo, useState } from 'react'
import { damageTypes, generateMonster, Monster, Rank, Species, speciesRules, CombatStyle } from './rules'
import { applyMonsterTheme, monsterThemes, MonsterTheme, rerollMonsterPart, MonsterRerollPart } from './monsterThemeEngine'
import { applyItemTheme, itemThemes, ItemTheme, rerollItemPart, ItemRerollPart, itemCoherenceSummary } from './itemThemeEngine'
import { createMonsterVariant, GeneratorPowerIntent, MonsterVariant, monsterCoherenceSummary, officialInspiredItemBudget, officialInspiredMonsterSettings, powerAdjustedItemBudget, powerAdjustedMonsterSettings } from './generatorEvolution'
import { DamageType, GeneratedItem, generateItem, ItemType } from './items'
import { generateCustomWeapon } from './customWeapons'
import { GeneratedMaterial, generateMaterial, MaterialFunction, MaterialNature } from './materials'
import { aestraNations, aestraOrigins, applyAestraMonsterIdentity, AestraInfluence, AestraNation, AestraOrigin, valdoriaDepths, ValdoriaDepth } from './aestra'
import { aestraEnvironments, aestraExposures, aestraWildOrigins, applyAestraWildIdentity, AestraEnvironment, AestraExposure, AestraWildOrigin } from './aestraWilds'
import { applyAestraNationItemIdentity, applyAestraWildItemIdentity } from './aestraItems'
import { itemQualitySummary, monsterQualitySummary } from './generatorQuality'

type Tab = 'Monster Database' | 'Monster Generator' | 'Item Database' | 'Item Generator'
type DbKind = 'monster' | 'item'
type AppItem = GeneratedItem & { material?: GeneratedMaterial; origin?: string }
type ItemSort = 'Newest' | 'Name' | 'Cost Low' | 'Cost High'
type MonsterSort = 'Newest' | 'Name' | 'Level Low' | 'Level High'
type LibrarySource = 'All' | 'Core Rulebook' | 'High Fantasy' | 'Natural Fantasy' | 'Techno Fantasy' | 'Generated / Custom'
type ItemCatalogKind = 'All' | 'Equipment' | 'Artifact' | 'Inventory Item' | 'Weapon Module'

const species: Species[] = ['Beast','Construct','Demon','Elemental','Humanoid','Monster','Plant','Undead']
const ranks: Rank[] = ['Soldier','Elite','Champion']
const combatStyles: CombatStyle[] = ['Mixed','Brute','Defender','Controller','Spellcaster','Assassin','Support']
const librarySources: LibrarySource[] = ['All','Core Rulebook','High Fantasy','Natural Fantasy','Techno Fantasy','Generated / Custom']
const materialNatures: (MaterialNature|'Random')[] = ['Random','Animal','Fungal','Incorporeal','Liquid','Artificial','Mineral','Plant']
const materialFunctions: (MaterialFunction|'Random')[] = ['Random','Agility and Precision','Damage and Power','Protection','Recovery','Sabotage','Support']
const itemCatalogKinds: ItemCatalogKind[] = ['All','Equipment','Artifact','Inventory Item','Weapon Module']

const ACTIVE_TAB_KEY = 'fu-active-tab'
const MONSTER_FILTERS_KEY = 'fu-monster-filters'
const ITEM_FILTERS_KEY = 'fu-item-filters'
const MONSTER_SEARCH_KEY = 'fu-monster-search'
const MONSTER_GENERATOR_KEY = 'fu-monster-generator-settings'
const ITEM_GENERATOR_KEY = 'fu-item-generator-settings'
const FAVORITES_KEY = 'fu-db-favorites'
const FAVORITES_ONLY_KEY = 'fu-db-favorites-only'
const SELECTION_KEY = 'fu-db-selection'
const DATABASE_PAGE_SIZE = 24

function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? fallback : JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function readSelection(kind: DbKind) {
  const raw = readStored<any>(SELECTION_KEY, { monster:[], item:[] })
  if (Array.isArray(raw)) return new Set<string>()
  const values = raw?.[kind]
  return new Set<string>(Array.isArray(values) ? values.filter((value: unknown): value is string => typeof value === 'string') : [])
}

function writeSelection(kind: DbKind, selected: Set<string>) {
  const raw = readStored<any>(SELECTION_KEY, { monster:[], item:[] })
  const state = raw && !Array.isArray(raw) && typeof raw === 'object' ? raw : { monster:[], item:[] }
  localStorage.setItem(SELECTION_KEY, JSON.stringify({ ...state, [kind]: [...selected] }))
}

function toggledSelection(selected: Set<string>, id: string) {
  const next = new Set(selected)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

function monsterLibrarySource(monster: Monster): Exclude<LibrarySource, 'All'> {
  if (monster.source !== 'Official') return 'Generated / Custom'
  if (monster.id.startsWith('official-high-')) return 'High Fantasy'
  if (monster.id.startsWith('official-natural-')) return 'Natural Fantasy'
  if (monster.id.startsWith('official-techno-')) return 'Techno Fantasy'
  return 'Core Rulebook'
}

function itemLibrarySource(item: AppItem): Exclude<LibrarySource, 'All'> {
  if (item.source !== 'Official') return 'Generated / Custom'
  const metadata = `${item.id} ${(item.breakdown || []).join(' ')} ${item.origin || ''}`.toLowerCase()
  if (item.id.startsWith('official-hf-') || metadata.includes('high fantasy')) return 'High Fantasy'
  if (item.id.startsWith('official-nf-') || metadata.includes('natural fantasy')) return 'Natural Fantasy'
  if (item.id.startsWith('official-tf-') || metadata.includes('techno fantasy')) return 'Techno Fantasy'
  return 'Core Rulebook'
}

function itemCatalogKind(item: AppItem): Exclude<ItemCatalogKind, 'All'> {
  const meta = `${item.category || ''} ${item.baseItem || ''} ${item.origin || ''} ${(item.breakdown || []).join(' ')}`.toLowerCase()
  if (meta.includes('artifact')) return 'Artifact'
  if (meta.includes('weapon module') || /\bmodule\b/.test(meta)) return 'Weapon Module'
  if (meta.includes('inventory')) return 'Inventory Item'
  return 'Equipment'
}

function searchTokens(query: string) {
  return (query.match(/"[^"]+"|\S+/g) || []).map(token => token.replace(/^"|"$/g, '').trim()).filter(Boolean)
}

function matchRange(value: number, expression: string) {
  const range = expression.match(/^(\d+)-(\d+)$/)
  if (range) return value >= Number(range[1]) && value <= Number(range[2])
  const compare = expression.match(/^(<=|>=|<|>)(\d+)$/)
  if (compare) {
    const target = Number(compare[2])
    if (compare[1] === '<') return value < target
    if (compare[1] === '>') return value > target
    if (compare[1] === '<=') return value <= target
    return value >= target
  }
  const exact = Number(expression)
  return Number.isFinite(exact) ? value === exact : false
}

function monsterMatchesSearch(monster: Monster, query: string, book: string) {
  const skills = (monster.skills || []).map(skill => `${skill.name} ${skill.summary}`).join(' ')
  const spells = (monster.spells || []).map(spell => `${spell.name} ${spell.effect}`).join(' ')
  const attacks = (monster.attacks || []).map(attack => `${attack.name} ${attack.damageType} ${attack.effect || ''}`).join(' ')
  const notes = (monster.notes || []).join(' ')
  const haystack = `${monster.name} ${monster.species} ${monster.rank} ${monster.combatStyle || ''} ${(monster.traits || []).join(' ')} ${skills} ${spells} ${attacks} ${notes} ${book}`.toLowerCase()
  return searchTokens(query).every(raw => {
    const token = raw.toLowerCase()
    const split = token.indexOf(':')
    if (split < 0) return haystack.includes(token)
    const key = token.slice(0, split)
    const value = token.slice(split + 1)
    if (!value) return true
    if (key === 'level' || key === 'lv') return matchRange(monster.level, value)
    if (key === 'rank') return monster.rank.toLowerCase().includes(value)
    if (key === 'species') return monster.species.toLowerCase().includes(value)
    if (key === 'style') return (monster.combatStyle || 'Mixed').toLowerCase().includes(value)
    if (key === 'source') return book.toLowerCase().includes(value)
    if (key === 'has') {
      if (value.startsWith('spell')) return (monster.spells || []).length > 0
      if (value.startsWith('skill')) return (monster.skills || []).length > 0
      if (value === 'crisis') return (monster.skills || []).some(skill => `${skill.name} ${skill.summary}`.toLowerCase().includes('crisis')) || (monster.notes || []).some(note => note.toLowerCase().includes('crisis'))
    }
    if (key === 'damage') return (monster.attacks || []).some(attack => String(attack.damageType).toLowerCase() === value) || (monster.spells || []).some(spell => spell.effect.toLowerCase().includes(`${value} damage`))
    const affinity = monster.affinities?.[value as keyof Monster['affinities']]
    if (key === 'weak' || key === 'vulnerable') return affinity === 'Vulnerable'
    if (key === 'resist' || key === 'resistant') return affinity === 'Resistant'
    if (key === 'immune') return affinity === 'Immune'
    if (key === 'absorb') return affinity === 'Absorb'
    return haystack.includes(token)
  })
}

function itemMatchesSearch(item: AppItem, query: string, book: string, catalog: string) {
  const materialText = item.material ? `${item.material.name} ${item.material.nature} ${item.material.element || ''} ${item.material.function || ''}` : ''
  const haystack = `${item.name} ${item.type} ${item.category || ''} ${item.baseItem || ''} ${item.quality || ''} ${item.effect} ${materialText} ${item.origin || ''} ${book} ${catalog}`.toLowerCase()
  return searchTokens(query).every(raw => {
    const token = raw.toLowerCase()
    const split = token.indexOf(':')
    if (split < 0) return haystack.includes(token)
    const key = token.slice(0, split)
    const value = token.slice(split + 1)
    if (!value) return true
    if (key === 'type') return item.type.toLowerCase().includes(value)
    if (key === 'source') return book.toLowerCase().includes(value)
    if (key === 'category') return String(item.category || '').toLowerCase().includes(value)
    if (key === 'catalog' || key === 'kind') return catalog.toLowerCase().includes(value)
    if (key === 'martial') return (!!item.martial) === ['1','true','yes'].includes(value)
    if (key === 'material') return (!!item.material) === ['1','true','yes'].includes(value)
    if (key === 'cost') return matchRange(Number(item.cost) || 0, value)
    return haystack.includes(token)
  })
}

function favoriteMatches(favorites: Set<string>, kind: DbKind, id: string, name: string) {
  if (favorites.has(id) || favorites.has(name)) return true
  const prefix = `${kind}|${name}|`
  for (const key of favorites) if (key.startsWith(prefix)) return true
  return false
}

function toggledFavorites(favorites: Set<string>, kind: DbKind, id: string, name: string) {
  const next = new Set(favorites)
  const wasFavorite = favoriteMatches(favorites, kind, id, name)
  const prefix = `${kind}|${name}|`
  for (const key of [...next]) if (key === id || key === name || key.startsWith(prefix)) next.delete(key)
  if (!wasFavorite) next.add(id)
  return next
}

function saveFavoritesOnly(kind: DbKind, value: boolean) {
  const state = readStored<Record<DbKind, boolean>>(FAVORITES_ONLY_KEY, { monster:false, item:false })
  localStorage.setItem(FAVORITES_ONLY_KEY, JSON.stringify({ ...state, [kind]: value }))
}

function openDatabaseRecord(kind: DbKind, id: string) {
  window.dispatchEvent(new CustomEvent('fu-open-record', { detail: { kind, id } }))
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type:'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function createBlankMonster(): Monster {
  const id = `custom-monster-${Date.now()}-${Math.random().toString(36).slice(2,7)}`
  return {
    id, name:'New Monster', source:'Custom', level:10, rank:'Soldier', soldierEquivalent:1, species:'Monster', traits:['new'],
    attributes:{ dex:8, ins:8, mig:8, wlp:8 }, hp:60, crisis:30, mp:50, initiative:8, defense:8, magicDefense:8,
    accuracyBonus:1, magicBonus:1, levelDamageBonus:0, turnsPerRound:1, skillBudget:0,
    affinities:{ physical:'Normal', air:'Normal', bolt:'Normal', dark:'Normal', earth:'Normal', fire:'Normal', ice:'Normal', light:'Normal', poison:'Normal' },
    attacks:[{ name:'Basic Attack', formula:'DEX + MIG', damageType:'physical', effect:'HR + 5 damage.' }], skills:[], spells:[], notes:['Created from scratch.'], combatStyle:'Mixed',
  }
}

function createBlankItem(): AppItem {
  return { id:`custom-item-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, name:'New Item', type:'Accessory', source:'Custom', cost:100, martial:false, category:'Accessory', effect:'Describe this item effect.', breakdown:['Created from scratch.'] }
}

const combatTactics: Record<CombatStyle, string> = {
  Mixed: 'Adapt to the battlefield. Open with the safest attack or spell, then pivot toward whichever option pressures the party most effectively.',
  Brute: 'Close aggressively and keep dealing damage. Prioritize weakened or exposed targets, use high-impact attacks early, and become even more dangerous in Crisis.',
  Defender: 'Occupy the centre of the fight and protect allies. Punish enemies that ignore you, use reactions to disrupt attacks, and make yourself difficult to remove.',
  Controller: 'Disrupt the party before chasing damage. Spread status effects, deny key actions, and focus on keeping dangerous heroes slowed, weakened, or otherwise constrained.',
  Spellcaster: 'Protect your MP and fight from a safe position. Use spells to exploit Affinities or statuses, then save stronger effects for clustered enemies or Crisis turns.',
  Assassin: 'Target vulnerable enemies and exploit status effects. Strike quickly, focus one target at a time, and use reactions or mobility-style effects to avoid prolonged trades.',
  Support: 'Strengthen allies and interfere with enemy momentum. Use healing, buffs, reactions, and setup effects first; attack directly when there is no higher-value support action.',
}

export default function App() {
  const [tab, setTab] = useState<Tab>(() => {
    const saved = readStored<Tab>(ACTIVE_TAB_KEY, 'Monster Database')
    return (['Monster Database','Monster Generator','Item Database','Item Generator'] as Tab[]).includes(saved) ? saved : 'Monster Database'
  })
  const [monsters, setMonsters] = useState<Monster[]>(() => readStored<Monster[]>('fu-monsters', []))
  const [items, setItems] = useState<AppItem[]>(() => readStored<AppItem[]>('fu-items', []))
  const [search, setSearch] = useState(() => readStored<string>(MONSTER_SEARCH_KEY, ''))

  useEffect(() => localStorage.setItem('fu-monsters', JSON.stringify(monsters)), [monsters])
  useEffect(() => localStorage.setItem('fu-items', JSON.stringify(items)), [items])
  useEffect(() => localStorage.setItem(ACTIVE_TAB_KEY, JSON.stringify(tab)), [tab])
  useEffect(() => localStorage.setItem(MONSTER_SEARCH_KEY, JSON.stringify(search)), [search])

  return <div className="shell">
    <header><div><div className="eyebrow">FABULA ULTIMA</div><h1>Monster & Item Tools</h1></div><span className="badge">alpha</span></header>
    <nav>{(['Monster Database','Monster Generator','Item Database','Item Generator'] as Tab[]).map(t => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}</nav>
    <main>
      {tab === 'Monster Database' && <MonsterDatabase monsters={monsters} setMonsters={setMonsters} search={search} setSearch={setSearch} />}
      {tab === 'Monster Generator' && <MonsterGenerator onSave={m => { setMonsters(prev => [m, ...prev]); setTab('Monster Database') }} />}
      {tab === 'Item Database' && <ItemDatabase items={items} setItems={setItems} />}
      {tab === 'Item Generator' && <ItemGenerator onSave={item => { setItems(prev => [item, ...prev]); setTab('Item Database') }} />}
    </main>
  </div>
}

function MonsterCard({ monster, onDelete, database=false, favorite=false, onFavorite, selected=false, onSelect }: { monster:Monster; onDelete?:()=>void; database?:boolean; favorite?:boolean; onFavorite?:()=>void; selected?:boolean; onSelect?:()=>void }) {
  const skills = monster.skills || [], spells = monster.spells || [], notes = monster.notes || [], attacks = monster.attacks || []
  const affinities = monster.affinities || Object.fromEntries(damageTypes.map(t => [t, 'Normal'])) as Monster['affinities']
  const style = monster.combatStyle || 'Mixed', librarySource = monsterLibrarySource(monster)
  return <article className={`card monsterCard${favorite ? ' favoriteCard' : ''}${selected ? ' selectedCard' : ''}`} data-db-record-id={database ? monster.id : undefined} data-db-record-kind={database ? 'monster' : undefined}>
    <div className="cardTitle"><div><span className="source">{monster.source}{monster.source === 'Official' ? ` · ${librarySource}` : ''}</span><h2>{monster.name}</h2></div>
      {database && <div className="cardActions">{onSelect && <button type="button" className={`selectButton${selected ? ' active' : ''}`} aria-pressed={selected} onClick={onSelect}>{selected ? '✓ Selected' : 'Select'}</button>}{onFavorite && <button type="button" className={`favoriteButton${favorite ? ' active' : ''}`} aria-pressed={favorite} title={favorite ? 'Remove from favorites' : 'Add to favorites'} onClick={onFavorite}>{favorite ? '★' : '☆'}</button>}<button type="button" className="dbOpenButton" data-db-open="monster" data-db-record-id={monster.id}>Open / Edit</button>{onDelete && <button className="danger" onClick={onDelete}>Delete</button>}</div>}
    </div>
    <p className="muted">Lv {monster.level} · {monster.rank} · {monster.species}{monster.combatStyle ? ` · ${monster.combatStyle}` : ''}</p>
    <div className="stats"><b>HP {monster.hp}</b><b>Crisis {monster.crisis ?? Math.floor(monster.hp/2)}</b><b>MP {monster.mp}</b><b>Init {monster.initiative}</b><b>DEF {monster.defense}</b><b>M.DEF {monster.magicDefense}</b><b>Turns {monster.turnsPerRound || 1}</b></div>
    <div className="dice"><span>DEX d{monster.attributes.dex}</span><span>INS d{monster.attributes.ins}</span><span>MIG d{monster.attributes.mig}</span><span>WLP d{monster.attributes.wlp}</span><span>ACC +{monster.accuracyBonus ?? Math.floor(monster.level/10)}</span><span>MAG +{monster.magicBonus ?? Math.floor(monster.level/10)}</span></div>
    <p><strong>Traits:</strong> {(monster.traits || []).join(', ')}</p><div className="affinities">{damageTypes.filter(t=>affinities[t] !== 'Normal').map(t=><span key={t}>{t}: {affinities[t]}</span>)}</div>
    <div className="tacticsBox"><strong>Tactics — {style}</strong><span>{combatTactics[style]}</span></div><h3>Basic Attacks</h3>
    {attacks.map((a,i)=><div key={i} className="attack"><b>{a.name}</b> — {a.formula} {a.damageType}{a.effect && <div className="attackEffect">Effect: {a.effect}</div>}</div>)}
    {skills.length > 0 && <><h3>NPC Skills</h3><div className="skillList">{skills.map((sk,i)=><div className="skillBox" key={`${sk.name}-${i}`}><strong>{sk.name}</strong><span>{sk.summary}</span></div>)}</div></>}
    {spells.length > 0 && <><h3>Spells</h3><div className="spellList">{spells.map((sp,i)=><div className="spellBox" key={`${sp.name}-${i}`}><div className="spellTitle"><strong>{sp.name}</strong><span>{sp.mp} MP</span></div><div className="muted">{sp.target} · {sp.duration}</div><div>{sp.effect}</div></div>)}</div></>}
    {notes.length > 0 && <details><summary>Rules / generation notes</summary>{notes.map((n,i)=><p className="note" key={i}>{n}</p>)}</details>}
  </article>
}

function Pagination({ page,total,onPage }: { page:number; total:number; onPage:(page:number)=>void }) {
  if (total <= 1) return null
  return <div className="nativePagination" aria-label="Database pagination"><button type="button" disabled={page<=1} onClick={()=>onPage(page-1)}>Previous</button><span>Page <b>{page}</b> of <b>{total}</b></span><button type="button" disabled={page>=total} onClick={()=>onPage(page+1)}>Next</button></div>
}

function NativeDbActions({ kind, favoritesOnly, favoriteCount, count, selectedCount, onFavoritesOnly, onReset, onRandom, onCreate, onCopy, onExport, onSelectVisible, onCompare, onClearSelection, status }: { kind:DbKind; favoritesOnly:boolean; favoriteCount:number; count:number; selectedCount:number; onFavoritesOnly:()=>void; onReset:()=>void; onRandom:()=>void; onCreate:()=>void; onCopy:()=>void; onExport:()=>void; onSelectVisible:()=>void; onCompare:()=>void; onClearSelection:()=>void; status:string }) {
  return <div className="nativeDbActions">
    <button type="button" className={favoritesOnly ? 'active' : ''} onClick={onFavoritesOnly}>★ Favorites ({favoriteCount})</button>
    <button type="button" onClick={onReset}>Reset filters</button><button type="button" disabled={!count} onClick={onRandom}>Random entry</button>
    <button type="button" onClick={onCreate}>+ New {kind === 'monster' ? 'Monster' : 'Item'}</button><button type="button" disabled={!count} onClick={onCopy}>Copy names</button><button type="button" disabled={!count} onClick={onExport}>Export results</button>
    <button type="button" disabled={!count} onClick={onSelectVisible}>Select page</button>
    {selectedCount > 0 && <><button type="button" className="active" onClick={onCompare}>Compare selected ({selectedCount})</button><button type="button" onClick={onClearSelection}>Clear selection</button></>}
    {status && <span className="nativeDbStatus" role="status">{status}</span>}
  </div>
}

function CompareModal({ kind, records, onClose }: { kind:DbKind; records:any[]; onClose:()=>void }) {
  const shown = records.slice(0, 8)
  if (!shown.length) return null
  const rows = kind === 'monster'
    ? [
        ['Level', (r:any)=>r.level], ['Rank', (r:any)=>r.rank], ['Species', (r:any)=>r.species], ['Style', (r:any)=>r.combatStyle || 'Mixed'],
        ['HP', (r:any)=>r.hp], ['MP', (r:any)=>r.mp], ['Initiative', (r:any)=>r.initiative], ['DEF', (r:any)=>r.defense], ['M.DEF', (r:any)=>r.magicDefense],
        ['DEX', (r:any)=>`d${r.attributes?.dex || '?'}`], ['INS', (r:any)=>`d${r.attributes?.ins || '?'}`], ['MIG', (r:any)=>`d${r.attributes?.mig || '?'}`], ['WLP', (r:any)=>`d${r.attributes?.wlp || '?'}`],
        ['Attacks', (r:any)=>(r.attacks || []).length], ['Skills', (r:any)=>(r.skills || []).length], ['Spells', (r:any)=>(r.spells || []).length],
      ]
    : [
        ['Type', (r:any)=>r.type], ['Catalog', (r:any)=>itemCatalogKind(r)], ['Category', (r:any)=>r.category || '—'], ['Cost', (r:any)=>`${r.cost || 0}z`], ['Martial', (r:any)=>r.martial ? 'Yes' : 'No'],
        ['Handedness', (r:any)=>r.handedness || '—'], ['Range', (r:any)=>r.range || '—'], ['Accuracy', (r:any)=>r.accuracy || '—'], ['Damage', (r:any)=>r.damage == null ? '—' : `HR + ${r.damage}`], ['Damage type', (r:any)=>r.damageType || '—'], ['DEF', (r:any)=>r.defense || '—'], ['M.DEF', (r:any)=>r.magicDefense || '—'],
      ]
  return <div className="compareBackdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
    <section className="compareModal" role="dialog" aria-modal="true" aria-label={`Compare selected ${kind}s`}>
      <div className="compareHeader"><div><span className="source">{records.length} selected{records.length > 8 ? ' · showing first 8' : ''}</span><h2>Compare selected {kind === 'monster' ? 'monsters' : 'items'}</h2></div><button type="button" onClick={onClose}>Close</button></div>
      <div className="compareTableWrap"><table className="compareTable"><thead><tr><th>Attribute</th>{shown.map(record=><th key={record.id}>{record.name}</th>)}</tr></thead><tbody>{rows.map(([label, value])=><tr key={String(label)}><th>{String(label)}</th>{shown.map(record=><td key={record.id}>{String((value as (r:any)=>unknown)(record) ?? '—')}</td>)}</tr>)}</tbody></table></div>
    </section>
  </div>
}

function MonsterDatabase({ monsters,setMonsters,search,setSearch }: { monsters:Monster[]; setMonsters:React.Dispatch<React.SetStateAction<Monster[]>>; search:string; setSearch:(v:string)=>void }) {
  const initialFilters = useMemo(() => readStored(MONSTER_FILTERS_KEY, { rank:'All' as 'All'|Rank, speciesFilter:'All' as 'All'|Species, styleFilter:'All' as 'All'|CombatStyle, sourceFilter:'All' as LibrarySource, sort:'Newest' as MonsterSort }), [])
  const [rank,setRank] = useState<'All'|Rank>(initialFilters.rank), [speciesFilter,setSpeciesFilter] = useState<'All'|Species>(initialFilters.speciesFilter), [styleFilter,setStyleFilter] = useState<'All'|CombatStyle>(initialFilters.styleFilter), [sourceFilter,setSourceFilter] = useState<LibrarySource>(initialFilters.sourceFilter), [sort,setSort] = useState<MonsterSort>(initialFilters.sort)
  const [page,setPage] = useState(1), [favorites,setFavorites] = useState(() => new Set(readStored<string[]>(FAVORITES_KEY, []))), [favoritesOnly,setFavoritesOnly] = useState(() => readStored<Record<DbKind,boolean>>(FAVORITES_ONLY_KEY,{monster:false,item:false}).monster || false), [status,setStatus] = useState('')
  const [selected,setSelected] = useState(() => readSelection('monster')), [compareOpen,setCompareOpen] = useState(false)
  useEffect(()=>localStorage.setItem(MONSTER_FILTERS_KEY,JSON.stringify({rank,speciesFilter,styleFilter,sourceFilter,sort})),[rank,speciesFilter,styleFilter,sourceFilter,sort])
  useEffect(()=>localStorage.setItem(FAVORITES_KEY,JSON.stringify([...favorites])),[favorites])
  useEffect(()=>writeSelection('monster',selected),[selected])
  useEffect(()=>{ saveFavoritesOnly('monster',favoritesOnly); setPage(1) },[favoritesOnly])
  useEffect(()=>setPage(1),[search,rank,speciesFilter,styleFilter,sourceFilter,sort])

  const filtered = useMemo(() => {
    const matches = monsters.filter(m => {
      const book = monsterLibrarySource(m)
      return monsterMatchesSearch(m,search,book) && (rank==='All'||m.rank===rank) && (speciesFilter==='All'||m.species===speciesFilter) && (styleFilter==='All'||(m.combatStyle||'Mixed')===styleFilter) && (sourceFilter==='All'||book===sourceFilter) && (!favoritesOnly || favoriteMatches(favorites,'monster',m.id,m.name))
    })
    if (sort==='Name') return [...matches].sort((a,b)=>a.name.localeCompare(b.name)); if (sort==='Level Low') return [...matches].sort((a,b)=>a.level-b.level); if (sort==='Level High') return [...matches].sort((a,b)=>b.level-a.level); return matches
  },[monsters,search,rank,speciesFilter,styleFilter,sourceFilter,sort,favorites,favoritesOnly])
  const summary = useMemo(()=>({ soldiers:filtered.filter(m=>m.rank==='Soldier').length, elites:filtered.filter(m=>m.rank==='Elite').length, champions:filtered.filter(m=>m.rank==='Champion').length, spellcasters:filtered.filter(m=>(m.spells||[]).length>0).length, official:filtered.filter(m=>m.source==='Official').length, custom:filtered.filter(m=>m.source!=='Official').length, averageLevel:filtered.length?Math.round(filtered.reduce((n,m)=>n+m.level,0)/filtered.length):0 }),[filtered])
  const favoriteCount = useMemo(()=>monsters.filter(m=>favoriteMatches(favorites,'monster',m.id,m.name)).length,[monsters,favorites])
  const selectedRecords = useMemo(()=>monsters.filter(m=>selected.has(m.id)),[monsters,selected])
  const totalPages=Math.max(1,Math.ceil(filtered.length/DATABASE_PAGE_SIZE)), safePage=Math.min(page,totalPages), paged=useMemo(()=>filtered.slice((safePage-1)*DATABASE_PAGE_SIZE,safePage*DATABASE_PAGE_SIZE),[filtered,safePage])
  const reset=()=>{setSearch('');setRank('All');setSpeciesFilter('All');setStyleFilter('All');setSourceFilter('All');setSort('Newest');setFavoritesOnly(false)}
  const flash=(text:string)=>{setStatus(text);window.setTimeout(()=>setStatus(''),1300)}
  const createNew=()=>{const record=createBlankMonster();const next=[record,...monsters];localStorage.setItem('fu-monsters',JSON.stringify(next));setMonsters(next);window.setTimeout(()=>openDatabaseRecord('monster',record.id),0)}
  const exportResults=()=>downloadJson(`fabula-monsters-${new Date().toISOString().slice(0,10)}.json`,{format:'fabula-ultima-tools-filtered-results',version:1,kind:'monster',exportedAt:new Date().toISOString(),count:filtered.length,records:filtered})
  return <>
    <section>
      <div className="toolbar itemToolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search monsters, skills, spells, attacks..." />
        <select className="compactSelect" value={sourceFilter} onChange={e=>setSourceFilter(e.target.value as LibrarySource)}>{librarySources.map(x=><option key={x}>{x}</option>)}</select><select className="compactSelect" value={rank} onChange={e=>setRank(e.target.value as 'All'|Rank)}><option>All</option>{ranks.map(x=><option key={x}>{x}</option>)}</select><select className="compactSelect" value={speciesFilter} onChange={e=>setSpeciesFilter(e.target.value as 'All'|Species)}><option>All</option>{species.map(x=><option key={x}>{x}</option>)}</select><select className="compactSelect" value={styleFilter} onChange={e=>setStyleFilter(e.target.value as 'All'|CombatStyle)}><option>All</option>{combatStyles.map(x=><option key={x}>{x}</option>)}</select><select className="compactSelect" value={sort} onChange={e=>setSort(e.target.value as MonsterSort)}><option>Newest</option><option>Name</option><option>Level Low</option><option>Level High</option></select><span>{filtered.length} entries</span>
      </div>
      <div className="databaseSummary"><span>Official <b>{summary.official}</b></span><span>Custom <b>{summary.custom}</b></span><span>Soldiers <b>{summary.soldiers}</b></span><span>Elites <b>{summary.elites}</b></span><span>Champions <b>{summary.champions}</b></span><span>Spellcasters <b>{summary.spellcasters}</b></span><span>Avg Lv <b>{summary.averageLevel}</b></span></div>
      <NativeDbActions kind="monster" favoritesOnly={favoritesOnly} favoriteCount={favoriteCount} count={filtered.length} selectedCount={selected.size} onFavoritesOnly={()=>setFavoritesOnly(v=>!v)} onReset={reset} onRandom={()=>{if(filtered.length)openDatabaseRecord('monster',filtered[Math.floor(Math.random()*filtered.length)].id)}} onCreate={createNew} onCopy={()=>{void navigator.clipboard?.writeText(filtered.map(m=>m.name).join('\n'));flash(`Copied ${filtered.length} names`)}} onExport={()=>{exportResults();flash(`Exported ${filtered.length}`)}} onSelectVisible={()=>setSelected(current=>new Set([...current,...paged.map(record=>record.id)]))} onCompare={()=>setCompareOpen(true)} onClearSelection={()=>setSelected(new Set())} status={status}/>
      <details className="searchHelp"><summary>Advanced search</summary><p>Examples: <code>level:20-40</code> <code>rank:champion</code> <code>species:undead</code> <code>source:natural</code> <code>has:spell</code> <code>damage:fire</code> <code>weak:ice</code>. Plain words are combined as AND terms.</p></details>
      <Pagination page={safePage} total={totalPages} onPage={setPage}/>{filtered.length===0?<Empty text="No matching monsters saved yet."/>:<div className="grid">{paged.map(m=><MonsterCard key={m.id} monster={m} database favorite={favoriteMatches(favorites,'monster',m.id,m.name)} onFavorite={()=>setFavorites(current=>toggledFavorites(current,'monster',m.id,m.name))} selected={selected.has(m.id)} onSelect={()=>setSelected(current=>toggledSelection(current,m.id))} onDelete={m.source==='Official'?undefined:()=>{if(window.confirm(`Delete “${m.name}”? This cannot be undone unless you have a backup.`)){setSelected(current=>{const next=new Set(current);next.delete(m.id);return next});setMonsters(prev=>prev.filter(x=>x.id!==m.id))}}}/>)}</div>}<Pagination page={safePage} total={totalPages} onPage={setPage}/>
    </section>
    {compareOpen && <CompareModal kind="monster" records={selectedRecords} onClose={()=>setCompareOpen(false)}/>} 
  </>
}

function MonsterGenerator({ onSave }: { onSave:(m:Monster)=>void }) {
  const initial=useMemo(()=>readStored(MONSTER_GENERATOR_KEY,{level:10,rank:'Soldier' as Rank,soldierEquivalent:3,sp:'Monster' as Species,complexity:'Standard' as 'Simple'|'Standard'|'Crunchy',combatStyle:'Mixed' as CombatStyle,theme:'Auto' as MonsterTheme|'Auto',powerIntent:'Standard' as GeneratorPowerIntent,inspiration:'Original' as 'Original'|'Official Pattern',setting:'Generic' as 'Generic'|'Aestra',nation:'Garlond' as AestraNation|'Aestra',environment:'Green Reaches' as AestraEnvironment,exposure:'Borderlands' as AestraExposure,wildOrigin:'Natural' as AestraWildOrigin,origin:'Military' as AestraOrigin,influence:'Stable' as AestraInfluence,depth:'Market' as ValdoriaDepth}),[])
  const [level,setLevel]=useState(initial.level),[rank,setRank]=useState<Rank>(initial.rank),[soldierEquivalent,setSoldierEquivalent]=useState(initial.soldierEquivalent),[sp,setSp]=useState<Species>(initial.sp),[complexity,setComplexity]=useState<'Simple'|'Standard'|'Crunchy'>(initial.complexity),[combatStyle,setCombatStyle]=useState<CombatStyle>(initial.combatStyle),[theme,setTheme]=useState<MonsterTheme|'Auto'>(initial.theme || 'Auto'),[powerIntent,setPowerIntent]=useState<GeneratorPowerIntent>(initial.powerIntent||'Standard'),[inspiration,setInspiration]=useState<'Original'|'Official Pattern'>(initial.inspiration||'Original'),[setting,setSetting]=useState<'Generic'|'Aestra'>(initial.setting||'Generic'),[nation,setNation]=useState<AestraNation|'Aestra'>(initial.nation||'Garlond'),[environment,setEnvironment]=useState<AestraEnvironment>(initial.environment||'Green Reaches'),[exposure,setExposure]=useState<AestraExposure>(initial.exposure||'Borderlands'),[wildOrigin,setWildOrigin]=useState<AestraWildOrigin>(initial.wildOrigin||'Natural'),[origin,setOrigin]=useState<AestraOrigin>(initial.origin||'Military'),[influence,setInfluence]=useState<AestraInfluence>(initial.influence||'Stable'),[depth,setDepth]=useState<ValdoriaDepth>(initial.depth||'Market'),[result,setResult]=useState<Monster|null>(null)
  useEffect(()=>localStorage.setItem(MONSTER_GENERATOR_KEY,JSON.stringify({level,rank,soldierEquivalent,sp,complexity,combatStyle,theme,powerIntent,inspiration,setting,nation,environment,exposure,wildOrigin,origin,influence,depth})),[level,rank,soldierEquivalent,sp,complexity,combatStyle,theme,powerIntent,inspiration,setting,nation,environment,exposure,wildOrigin,origin,influence,depth])
  const make=()=>{const adjusted=powerAdjustedMonsterSettings(rank,complexity,soldierEquivalent,powerIntent);const pattern=inspiration==='Official Pattern'?officialInspiredMonsterSettings(readStored<Monster[]>('fu-monsters',[]),level,sp,adjusted.rank,combatStyle,adjusted.complexity):{style:combatStyle,complexity:adjusted.complexity,note:''};let monster=applyMonsterTheme(generateMonster({level,rank:adjusted.rank,soldierEquivalent:adjusted.soldierEquivalent,species:sp,complexity:pattern.complexity,combatStyle:pattern.style}),theme==='Auto'?undefined:theme);if(setting==='Aestra') monster=nation==='Aestra'?applyAestraWildIdentity(monster,environment,exposure,wildOrigin):applyAestraMonsterIdentity(monster,nation,origin,influence,depth);monster={...monster,notes:[...(monster.notes||[]),`Power intent: ${powerIntent}.${powerIntent==='Legendary'?' Legendary intent promotes the generated chassis to Champion.':''}`,...(pattern.note?[pattern.note]:[])]};setResult(monster)}
  const reroll=(part:MonsterRerollPart)=>setResult(current=>current?rerollMonsterPart(current,part):current)
  const variant=(kind:MonsterVariant)=>setResult(current=>current?createMonsterVariant(current,kind):current)
  return <section className="twoCol"><div className="panel"><h2>Random Monster Generator</h2><label>Level <strong>{level}</strong><input type="range" min="5" max="60" step="5" value={level} onChange={e=>setLevel(Number(e.target.value))}/></label><label>Rank<select value={rank} onChange={e=>setRank(e.target.value as Rank)}>{ranks.map(r=><option key={r}>{r}</option>)}</select></label>{rank==='Champion'&&<><label>Soldiers replaced<input type="number" min="2" max="10" value={soldierEquivalent} onChange={e=>setSoldierEquivalent(Number(e.target.value))}/></label><p className="note">Champions now gain a themed Crisis phase that escalates their existing gimmick instead of introducing an unrelated mechanic.</p></>}<label>Species<select value={sp} onChange={e=>setSp(e.target.value as Species)}>{species.map(s=><option key={s}>{s}</option>)}</select></label><p className="note">{speciesRules[sp].note}</p><label>Complexity<select value={complexity} onChange={e=>setComplexity(e.target.value as typeof complexity)}><option>Simple</option><option>Standard</option><option>Crunchy</option></select></label><p className="muted smallText">Complexity is a generator convenience, not an official NPC rule.</p><label>Combat style<select value={combatStyle} onChange={e=>setCombatStyle(e.target.value as CombatStyle)}>{combatStyles.map(x=><option key={x}>{x}</option>)}</select></label><label>Theme<select value={theme} onChange={e=>setTheme(e.target.value as MonsterTheme|'Auto')}><option>Auto</option>{monsterThemes.map(x=><option key={x}>{x}</option>)}</select></label><label>Setting<select value={setting} onChange={e=>setSetting(e.target.value as 'Generic'|'Aestra')}><option>Generic</option><option>Aestra</option></select></label>{setting==='Aestra'&&<><label>Aestra region<select value={nation} onChange={e=>{const n=e.target.value as AestraNation|'Aestra';setNation(n);if(n!=='Aestra')setOrigin(aestraOrigins(n)[0])}}>{[...(Object.keys(aestraNations) as AestraNation[]),'Aestra'].map(n=><option key={n}>{n}</option>)}</select></label>{nation==='Aestra'?<><p className="note">Lands outside direct national control: wilderness, ruins, frontier settlements and the spaces between the four powers.</p><label>Environment<select value={environment} onChange={e=>setEnvironment(e.target.value as AestraEnvironment)}>{aestraEnvironments.map(x=><option key={x}>{x}</option>)}</select></label><label>Exposure<select value={exposure} onChange={e=>setExposure(e.target.value as AestraExposure)}>{aestraExposures.map(x=><option key={x}>{x}</option>)}</select></label><label>Origin<select value={wildOrigin} onChange={e=>setWildOrigin(e.target.value as AestraWildOrigin)}>{aestraWildOrigins.map(x=><option key={x}>{x}</option>)}</select></label><p className="muted smallText">Exposure controls how poorly understood and unusual the threat is, independently of its level.</p></>:<><p className="note">{aestraNations[nation].identity}</p><label>Origin<select value={origin} onChange={e=>setOrigin(e.target.value as AestraOrigin)}>{aestraOrigins(nation).map(o=><option key={o}>{o}</option>)}</select></label><label>Crystal influence<select value={influence} onChange={e=>setInfluence(e.target.value as AestraInfluence)}><option>Stable</option><option>Fading</option><option>Crystal-Starved</option><option>Overcharged</option><option>Corrupted</option></select></label></>}{nation==='Valdoria'&&<><label>Valdoria depth<select value={depth} onChange={e=>setDepth(e.target.value as ValdoriaDepth)}>{valdoriaDepths.map(d=><option key={d}>{d}</option>)}</select></label><p className="muted smallText">Depth changes the actual combat design: Market threats are opportunistic, Lower City threats use cramped-terrain pressure, Deep Below interferes with crystal power, and Buried / Ancient threats use stranger Lost Era-style functions.</p></>}<p className="muted smallText">Aestra mode applies national design language, origin and crystal context to the generated monster while preserving the Fabula Ultima chassis.</p></>}<label>Power intent<select value={powerIntent} onChange={e=>setPowerIntent(e.target.value as GeneratorPowerIntent)}><option>Conservative</option><option>Standard</option><option>Dangerous</option><option>Legendary</option></select></label><label>Design reference<select value={inspiration} onChange={e=>setInspiration(e.target.value as 'Original'|'Official Pattern')}><option>Original</option><option>Official Pattern</option></select></label><p className="muted smallText">Auto keeps the concept coherent. Power intent changes how aggressively the generator spends complexity; Legendary produces a Champion chassis. Official Pattern samples role and complexity from nearby official profiles without copying their names or rules text.</p><button className="primary" onClick={make}>Generate Monster</button></div><div className="panel preview">{!result?<Empty text="Choose your options and generate a monster."/>:<><MonsterCard monster={result}/><div className="subpanel"><span className="source">Coherence summary</span><p className="note">{monsterCoherenceSummary(result)}</p></div><div className="subpanel"><span className="source">Quality check</span><p className="note">{monsterQualitySummary(result)}</p></div><div className="subpanel"><span className="source">Create a related variant</span><div className="buttonRow"><button onClick={()=>variant('Minion')}>Lesser / Minion</button><button onClick={()=>variant('Elite')}>Elite</button><button onClick={()=>variant('Champion')}>Champion / Boss</button><button onClick={()=>variant('Corrupted')}>Corrupted</button><button onClick={()=>variant('Elemental')}>Elemental</button><button onClick={()=>variant('Role Shift')}>Different Role</button></div><p className="muted smallText">Variants regenerate a rules-aware chassis while preserving species and family identity, instead of merely multiplying HP or damage.</p></div><div className="subpanel"><span className="source">Keep this monster, reroll only</span><div className="buttonRow"><button onClick={()=>reroll('name')}>Name</button><button onClick={()=>reroll('attacks')}>Attacks</button><button onClick={()=>reroll('skills')}>Skills</button><button onClick={()=>reroll('spells')} disabled={!result.spells?.length}>Spells</button><button onClick={()=>reroll('affinities')}>Affinities</button><button onClick={()=>reroll('theme')}>Theme</button></div><p className="muted smallText">Targeted rerolls preserve level, rank, attributes, HP, MP and the rest of the current monster.</p></div><div className="buttonRow"><button onClick={make}>Reroll Everything</button><button className="primary" onClick={()=>onSave(result)}>Save to Database</button></div></>}</div></section>
}

function ItemDatabase({ items,setItems }: { items:AppItem[]; setItems:React.Dispatch<React.SetStateAction<AppItem[]>> }) {
  const initialFilters=useMemo(()=>readStored(ITEM_FILTERS_KEY,{search:'',type:'All' as 'All'|ItemType,category:'All',sourceFilter:'All' as LibrarySource,martialFilter:'All' as 'All'|'Martial'|'Non-martial',materialFilter:'All' as 'All'|'With Material'|'No Material',sort:'Newest' as ItemSort,catalogFilter:'All' as ItemCatalogKind}),[])
  const [search,setSearch]=useState(initialFilters.search||''),[type,setType]=useState<'All'|ItemType>(initialFilters.type||'All'),[category,setCategory]=useState(initialFilters.category||'All'),[sourceFilter,setSourceFilter]=useState<LibrarySource>(initialFilters.sourceFilter||'All'),[martialFilter,setMartialFilter]=useState<'All'|'Martial'|'Non-martial'>(initialFilters.martialFilter||'All'),[materialFilter,setMaterialFilter]=useState<'All'|'With Material'|'No Material'>(initialFilters.materialFilter||'All'),[sort,setSort]=useState<ItemSort>(initialFilters.sort||'Newest'),[catalogFilter,setCatalogFilter]=useState<ItemCatalogKind>(initialFilters.catalogFilter||'All')
  const [page,setPage]=useState(1),[favorites,setFavorites]=useState(()=>new Set(readStored<string[]>(FAVORITES_KEY,[]))),[favoritesOnly,setFavoritesOnly]=useState(()=>readStored<Record<DbKind,boolean>>(FAVORITES_ONLY_KEY,{monster:false,item:false}).item||false),[status,setStatus]=useState('')
  const [selected,setSelected] = useState(() => readSelection('item')), [compareOpen,setCompareOpen] = useState(false)
  useEffect(()=>localStorage.setItem(ITEM_FILTERS_KEY,JSON.stringify({search,type,category,sourceFilter,martialFilter,materialFilter,sort,catalogFilter})),[search,type,category,sourceFilter,martialFilter,materialFilter,sort,catalogFilter]);useEffect(()=>localStorage.setItem(FAVORITES_KEY,JSON.stringify([...favorites])),[favorites]);useEffect(()=>writeSelection('item',selected),[selected]);useEffect(()=>{saveFavoritesOnly('item',favoritesOnly);setPage(1)},[favoritesOnly]);useEffect(()=>setPage(1),[search,type,category,sourceFilter,martialFilter,materialFilter,sort,catalogFilter])
  const categories=useMemo(()=>Array.from(new Set(items.map(i=>i.category).filter((v):v is string=>!!v))).sort(),[items])
  const filtered=useMemo(()=>{const matches=items.filter(item=>{const book=itemLibrarySource(item),catalog=itemCatalogKind(item),matchesMartial=martialFilter==='All'||(martialFilter==='Martial'?!!item.martial:!item.martial),matchesMaterial=materialFilter==='All'||(materialFilter==='With Material'?!!item.material:!item.material);return itemMatchesSearch(item,search,book,catalog)&&(type==='All'||item.type===type)&&(category==='All'||item.category===category)&&(sourceFilter==='All'||book===sourceFilter)&&(catalogFilter==='All'||catalog===catalogFilter)&&matchesMartial&&matchesMaterial&&(!favoritesOnly||favoriteMatches(favorites,'item',item.id,item.name))});if(sort==='Name')return[...matches].sort((a,b)=>a.name.localeCompare(b.name));if(sort==='Cost Low')return[...matches].sort((a,b)=>a.cost-b.cost);if(sort==='Cost High')return[...matches].sort((a,b)=>b.cost-a.cost);return matches},[items,search,type,category,sourceFilter,martialFilter,materialFilter,sort,catalogFilter,favorites,favoritesOnly])
  const summary=useMemo(()=>({weapons:filtered.filter(i=>i.type==='Weapon').length,armor:filtered.filter(i=>i.type==='Armor').length,shields:filtered.filter(i=>i.type==='Shield').length,accessories:filtered.filter(i=>i.type==='Accessory').length,official:filtered.filter(i=>i.source==='Official').length,custom:filtered.filter(i=>i.source!=='Official').length,martial:filtered.filter(i=>!!i.martial).length,materials:filtered.filter(i=>!!i.material).length,averageCost:filtered.length?Math.round(filtered.reduce((n,i)=>n+i.cost,0)/filtered.length):0}),[filtered]),favoriteCount=useMemo(()=>items.filter(i=>favoriteMatches(favorites,'item',i.id,i.name)).length,[items,favorites]),selectedRecords=useMemo(()=>items.filter(i=>selected.has(i.id)),[items,selected]),totalPages=Math.max(1,Math.ceil(filtered.length/DATABASE_PAGE_SIZE)),safePage=Math.min(page,totalPages),paged=useMemo(()=>filtered.slice((safePage-1)*DATABASE_PAGE_SIZE,safePage*DATABASE_PAGE_SIZE),[filtered,safePage])
  const reset=()=>{setSearch('');setType('All');setCategory('All');setSourceFilter('All');setMartialFilter('All');setMaterialFilter('All');setCatalogFilter('All');setSort('Newest');setFavoritesOnly(false)},flash=(text:string)=>{setStatus(text);window.setTimeout(()=>setStatus(''),1300)},createNew=()=>{const record=createBlankItem();const next=[record,...items];localStorage.setItem('fu-items',JSON.stringify(next));setItems(next);window.setTimeout(()=>openDatabaseRecord('item',record.id),0)},exportResults=()=>downloadJson(`fabula-items-${new Date().toISOString().slice(0,10)}.json`,{format:'fabula-ultima-tools-filtered-results',version:1,kind:'item',exportedAt:new Date().toISOString(),count:filtered.length,records:filtered})
  return <>
    <section><div className="toolbar itemToolbar"><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search items, qualities, materials, effects..."/><select className="compactSelect" value={sourceFilter} onChange={e=>setSourceFilter(e.target.value as LibrarySource)}>{librarySources.map(x=><option key={x}>{x}</option>)}</select><select className="compactSelect" value={type} onChange={e=>setType(e.target.value as 'All'|ItemType)}><option>All</option><option>Weapon</option><option>Armor</option><option>Shield</option><option>Accessory</option></select><select className="compactSelect" value={catalogFilter} onChange={e=>setCatalogFilter(e.target.value as ItemCatalogKind)}>{itemCatalogKinds.map(x=><option key={x}>{x}</option>)}</select><select className="compactSelect" value={category} onChange={e=>setCategory(e.target.value)}><option>All</option>{categories.map(c=><option key={c}>{c}</option>)}</select><select className="compactSelect" value={martialFilter} onChange={e=>setMartialFilter(e.target.value as 'All'|'Martial'|'Non-martial')}><option>All</option><option>Martial</option><option>Non-martial</option></select><select className="compactSelect" value={materialFilter} onChange={e=>setMaterialFilter(e.target.value as 'All'|'With Material'|'No Material')}><option>All</option><option>With Material</option><option>No Material</option></select><select className="compactSelect" value={sort} onChange={e=>setSort(e.target.value as ItemSort)}><option>Newest</option><option>Name</option><option>Cost Low</option><option>Cost High</option></select><span>{filtered.length} entries</span></div>
      <div className="databaseSummary"><span>Official <b>{summary.official}</b></span><span>Custom <b>{summary.custom}</b></span><span>Weapons <b>{summary.weapons}</b></span><span>Armor <b>{summary.armor}</b></span><span>Shields <b>{summary.shields}</b></span><span>Accessories <b>{summary.accessories}</b></span><span>Martial <b>{summary.martial}</b></span><span>Materials <b>{summary.materials}</b></span><span>Avg Cost <b>{summary.averageCost}z</b></span></div>
      <NativeDbActions kind="item" favoritesOnly={favoritesOnly} favoriteCount={favoriteCount} count={filtered.length} selectedCount={selected.size} onFavoritesOnly={()=>setFavoritesOnly(v=>!v)} onReset={reset} onRandom={()=>{if(filtered.length)openDatabaseRecord('item',filtered[Math.floor(Math.random()*filtered.length)].id)}} onCreate={createNew} onCopy={()=>{void navigator.clipboard?.writeText(filtered.map(i=>i.name).join('\n'));flash(`Copied ${filtered.length} names`)}} onExport={()=>{exportResults();flash(`Exported ${filtered.length}`)}} onSelectVisible={()=>setSelected(current=>new Set([...current,...paged.map(record=>record.id)]))} onCompare={()=>setCompareOpen(true)} onClearSelection={()=>setSelected(new Set())} status={status}/><details className="searchHelp"><summary>Advanced search</summary><p>Examples: <code>cost:500-1500</code> <code>type:weapon</code> <code>source:techno</code> <code>catalog:artifact</code> <code>martial:true</code> <code>material:true</code>.</p></details>
      <Pagination page={safePage} total={totalPages} onPage={setPage}/>{filtered.length===0?<Empty text="No matching items saved yet."/>:<div className="grid">{paged.map(item=><ItemCard key={item.id} item={item} database favorite={favoriteMatches(favorites,'item',item.id,item.name)} onFavorite={()=>setFavorites(current=>toggledFavorites(current,'item',item.id,item.name))} selected={selected.has(item.id)} onSelect={()=>setSelected(current=>toggledSelection(current,item.id))} onDelete={item.source==='Official'?undefined:()=>{if(window.confirm(`Delete “${item.name}”? This cannot be undone unless you have a backup.`)){setSelected(current=>{const next=new Set(current);next.delete(item.id);return next});setItems(prev=>prev.filter(x=>x.id!==item.id))}}}/>)}</div>}<Pagination page={safePage} total={totalPages} onPage={setPage}/>
    </section>
    {compareOpen && <CompareModal kind="item" records={selectedRecords} onClose={()=>setCompareOpen(false)}/>} 
  </>
}

function ItemCard({ item,onDelete,database=false,favorite=false,onFavorite,selected=false,onSelect }: { item:AppItem; onDelete?:()=>void; database?:boolean; favorite?:boolean; onFavorite?:()=>void; selected?:boolean; onSelect?:()=>void }) {
  const librarySource=itemLibrarySource(item),catalog=itemCatalogKind(item)
  return <article className={`card itemCard${favorite?' favoriteCard':''}${selected?' selectedCard':''}`} data-db-record-id={database?item.id:undefined} data-db-record-kind={database?'item':undefined}><div className="cardTitle"><div><span className="source">{item.source}{item.source==='Official'?` · ${librarySource}`:''}</span><h2>{item.name}</h2></div>{database&&<div className="cardActions">{onSelect&&<button type="button" className={`selectButton${selected?' active':''}`} aria-pressed={selected} onClick={onSelect}>{selected?'✓ Selected':'Select'}</button>}{onFavorite&&<button type="button" className={`favoriteButton${favorite?' active':''}`} aria-pressed={favorite} onClick={onFavorite}>{favorite?'★':'☆'}</button>}<button type="button" className="dbOpenButton" data-db-open="item" data-db-record-id={item.id}>Open / Edit</button>{onDelete&&<button className="danger" onClick={onDelete}>Delete</button>}</div>}</div><div className="itemMeta"><span>{item.type}</span>{catalog!=='Equipment'&&<span>{catalog}</span>}{item.category&&<span>{item.category}</span>}<span>{item.cost}z</span>{item.martial&&<span>Martial</span>}{item.material&&<span>Material</span>}</div>{item.baseItem&&<p><strong>Base:</strong> {item.baseItem}</p>}{item.material&&<div className="materialBox"><span className="source">Natural Fantasy Material</span><p><strong>{item.material.name}</strong> · {item.material.nature}</p><p className="muted">{item.material.descriptorKind}{item.material.element?` · ${item.material.element}`:''}{item.material.function?` · ${item.material.function}`:''}</p></div>}{item.origin&&<p className="note"><strong>Origin:</strong> {item.origin}</p>}{item.type==='Weapon'&&<div className="stats"><b>{item.handedness}</b><b>{item.range}</b><b>{item.accuracy}{item.accuracyBonus?` +${item.accuracyBonus}`:''}</b><b>HR + {item.damage}</b><b>{item.damageType}</b></div>}{(item.type==='Armor'||item.type==='Shield')&&<div className="stats"><b>DEF {item.defense}</b><b>M.DEF {item.magicDefense}</b><b>Init {item.initiative&&item.initiative>0?'+':''}{item.initiative||0}</b></div>}{item.quality&&<p><strong>Quality / Customizations:</strong> {item.quality}</p>}<p className="attack">{item.effect}</p>{(item.breakdown?.length??0)>0&&<details><summary>Price / rule breakdown</summary>{(item.breakdown||[]).map((b,i)=><p className="note" key={i}>{b}</p>)}</details>}</article>
}

function ItemGenerator({ onSave }: { onSave:(item:AppItem)=>void }) {
  const initial=useMemo(()=>readStored(ITEM_GENERATOR_KEY,{type:'Weapon' as ItemType,weaponMethod:'Core Rare' as 'Core Rare'|'Atlas Custom',maxCost:1500,allowMartial:true,allowTransforming:true,damageType:'random' as DamageType|'random',addMaterial:false,materialNature:'Random' as MaterialNature|'Random',descriptorMode:'Random' as 'Elemental'|'Functional'|'Random',materialFunction:'Random' as MaterialFunction|'Random',itemTheme:'Auto' as ItemTheme|'Auto',powerIntent:'Standard' as GeneratorPowerIntent,inspiration:'Original' as 'Original'|'Official Pattern',setting:'Generic' as 'Generic'|'Aestra',nation:'Garlond' as AestraNation|'Aestra',environment:'Green Reaches' as AestraEnvironment,exposure:'Borderlands' as AestraExposure,wildOrigin:'Natural' as AestraWildOrigin,origin:'Military' as AestraOrigin,influence:'Stable' as AestraInfluence,depth:'Market' as ValdoriaDepth}),[])
  const [type,setType]=useState<ItemType>(initial.type),[weaponMethod,setWeaponMethod]=useState<'Core Rare'|'Atlas Custom'>(initial.weaponMethod),[maxCost,setMaxCost]=useState(initial.maxCost),[allowMartial,setAllowMartial]=useState(initial.allowMartial),[allowTransforming,setAllowTransforming]=useState(initial.allowTransforming),[damageType,setDamageType]=useState<DamageType|'random'>(initial.damageType),[addMaterial,setAddMaterial]=useState(initial.addMaterial),[materialNature,setMaterialNature]=useState<MaterialNature|'Random'>(initial.materialNature),[descriptorMode,setDescriptorMode]=useState<'Elemental'|'Functional'|'Random'>(initial.descriptorMode),[materialFunction,setMaterialFunction]=useState<MaterialFunction|'Random'>(initial.materialFunction),[itemTheme,setItemTheme]=useState<ItemTheme|'Auto'>(initial.itemTheme||'Auto'),[powerIntent,setPowerIntent]=useState<GeneratorPowerIntent>(initial.powerIntent||'Standard'),[inspiration,setInspiration]=useState<'Original'|'Official Pattern'>(initial.inspiration||'Original'),[setting,setSetting]=useState<'Generic'|'Aestra'>(initial.setting||'Generic'),[nation,setNation]=useState<AestraNation|'Aestra'>(initial.nation||'Garlond'),[environment,setEnvironment]=useState<AestraEnvironment>(initial.environment||'Green Reaches'),[exposure,setExposure]=useState<AestraExposure>(initial.exposure||'Borderlands'),[wildOrigin,setWildOrigin]=useState<AestraWildOrigin>(initial.wildOrigin||'Natural'),[origin,setOrigin]=useState<AestraOrigin>(initial.origin||'Military'),[influence,setInfluence]=useState<AestraInfluence>(initial.influence||'Stable'),[depth,setDepth]=useState<ValdoriaDepth>(initial.depth||'Market'),[result,setResult]=useState<AppItem|null>(null)
  useEffect(()=>localStorage.setItem(ITEM_GENERATOR_KEY,JSON.stringify({type,weaponMethod,maxCost,allowMartial,allowTransforming,damageType,addMaterial,materialNature,descriptorMode,materialFunction,itemTheme,powerIntent,inspiration,setting,nation,environment,exposure,wildOrigin,origin,influence,depth})),[type,weaponMethod,maxCost,allowMartial,allowTransforming,damageType,addMaterial,materialNature,descriptorMode,materialFunction,itemTheme,powerIntent,inspiration,setting,nation,environment,exposure,wildOrigin,origin,influence,depth])
  const applyItemSetting=(item:AppItem):AppItem=>setting!=='Aestra'?item:(nation==='Aestra'?applyAestraWildItemIdentity(item,environment,exposure,wildOrigin):applyAestraNationItemIdentity(item,nation,origin,influence,depth));const generate=()=>{let budget=powerAdjustedItemBudget(maxCost,powerIntent);const pattern=inspiration==='Official Pattern'?officialInspiredItemBudget(readStored<AppItem[]>('fu-items',[]),type,budget):{maxCost:budget,note:''};budget=pattern.maxCost;let item:AppItem=type==='Weapon'&&weaponMethod==='Atlas Custom'?generateCustomWeapon({allowMartial,allowTransforming:powerIntent==='Legendary'?true:allowTransforming,preferredDamageType:damageType}):generateItem({type,maxCost:budget,allowMartial,preferredDamageType:damageType});item=applyItemTheme(item,itemTheme==='Auto'?undefined:itemTheme);item={...item,breakdown:[...(item.breakdown||[]),`Power intent: ${powerIntent}.`,...(pattern.note?[pattern.note]:[])]};if(addMaterial){const material=generateMaterial({nature:materialNature,descriptorMode,element:descriptorMode==='Elemental'&&damageType!=='random'&&damageType!=='physical'?damageType:'Random',function:materialFunction});item={...item,material,origin:`Crafted using ${material.name.toLowerCase()}, a ${material.nature.toLowerCase()} material selected from the Natural Fantasy material tables.`,breakdown:[...(item.breakdown||[]).filter(line=>!line.startsWith('Concept material: ')),`Material: ${material.name} (authoritative material identity; does not alter equipment cost by itself).`]}}item=applyItemSetting(item);setResult(item)}
  const rerollItem=(part:ItemRerollPart)=>setResult(current=>current?applyItemSetting(rerollItemPart(current,part) as AppItem):current)
  const rerollMaterial=()=>setResult(current=>{if(!current||!addMaterial)return current;const material=generateMaterial({nature:materialNature,descriptorMode,element:descriptorMode==='Elemental'&&damageType!=='random'&&damageType!=='physical'?damageType:'Random',function:materialFunction});return applyItemSetting({...current,material,origin:`Crafted using ${material.name.toLowerCase()}, a ${material.nature.toLowerCase()} material selected from the Natural Fantasy material tables.`,breakdown:[...(current.breakdown||[]).filter(line=>!line.startsWith('Material: ')&&!line.startsWith('Concept material: ')&&!line.startsWith('Material identity: ')),`Material: ${material.name} (authoritative material identity; does not alter equipment cost by itself).`]})})
  return <section className="twoCol"><div className="panel"><h2>Item Generator</h2><p className="muted">Core rare equipment, High Fantasy custom weapons, and optional Natural Fantasy materials all save into the same item database.</p><label>Item type<select value={type} onChange={e=>{setType(e.target.value as ItemType);setResult(null)}}><option>Weapon</option><option>Armor</option><option>Shield</option><option>Accessory</option></select></label>{type==='Weapon'&&<label>Weapon system<select value={weaponMethod} onChange={e=>{setWeaponMethod(e.target.value as 'Core Rare'|'Atlas Custom');setResult(null)}}><option>Core Rare</option><option>Atlas Custom</option></select></label>}{(type!=='Weapon'||weaponMethod==='Core Rare')&&<label>Maximum cost <strong>{maxCost}z</strong><input type="range" min="500" max="3000" step="100" value={maxCost} onChange={e=>setMaxCost(Number(e.target.value))}/></label>}<label className="checkRow"><input type="checkbox" checked={allowMartial} onChange={e=>setAllowMartial(e.target.checked)}/><span>Allow martial equipment</span></label>{type==='Weapon'&&weaponMethod==='Atlas Custom'&&<label className="checkRow"><input type="checkbox" checked={allowTransforming} onChange={e=>setAllowTransforming(e.target.checked)}/><span>Allow Transforming custom weapons</span></label>}{type==='Weapon'&&<label>Damage type<select value={damageType} onChange={e=>setDamageType(e.target.value as DamageType|'random')}><option value="random">Random</option><option value="physical">Physical</option><option value="air">Air</option><option value="bolt">Bolt</option><option value="dark">Dark</option><option value="earth">Earth</option><option value="fire">Fire</option><option value="ice">Ice</option><option value="light">Light</option><option value="poison">Poison</option></select></label>}<label>Theme<select value={itemTheme} onChange={e=>setItemTheme(e.target.value as ItemTheme|'Auto')}><option>Auto</option>{itemThemes.map(t=><option key={t}>{t}</option>)}</select></label><label>Power intent<select value={powerIntent} onChange={e=>setPowerIntent(e.target.value as GeneratorPowerIntent)}><option>Conservative</option><option>Standard</option><option>Dangerous</option><option>Legendary</option></select></label><label>Design reference<select value={inspiration} onChange={e=>setInspiration(e.target.value as 'Original'|'Official Pattern')}><option>Original</option><option>Official Pattern</option></select></label><p className="muted smallText">Power intent changes the budget the generator is willing to spend. Official Pattern centers that budget on matching official equipment already in the database without copying item text.</p><label>Setting<select value={setting} onChange={e=>setSetting(e.target.value as 'Generic'|'Aestra')}><option>Generic</option><option>Aestra</option></select></label>{setting==='Aestra'&&<div className="subpanel"><label>Region<select value={nation} onChange={e=>{const n=e.target.value as AestraNation|'Aestra';setNation(n);if(n!=='Aestra')setOrigin(aestraOrigins(n)[0])}}>{[...(Object.keys(aestraNations) as AestraNation[]),'Aestra'].map(n=><option key={n}>{n}</option>)}</select></label>{nation==='Aestra'?<><p className="note">Lands outside direct national control.</p><label>Environment<select value={environment} onChange={e=>setEnvironment(e.target.value as AestraEnvironment)}>{aestraEnvironments.map(x=><option key={x}>{x}</option>)}</select></label><label>Exposure<select value={exposure} onChange={e=>setExposure(e.target.value as AestraExposure)}>{aestraExposures.map(x=><option key={x}>{x}</option>)}</select></label><label>Origin<select value={wildOrigin} onChange={e=>setWildOrigin(e.target.value as AestraWildOrigin)}>{aestraWildOrigins.map(x=><option key={x}>{x}</option>)}</select></label><p className="muted smallText">Environment controls the item’s local design/ecology. Exposure controls how familiar or poorly understood it is, not its raw price or power.</p></>:<><p className="note">{aestraNations[nation].identity}</p><label>Origin<select value={origin} onChange={e=>setOrigin(e.target.value as AestraOrigin)}>{aestraOrigins(nation).map(o=><option key={o}>{o}</option>)}</select></label><label>Crystal influence<select value={influence} onChange={e=>setInfluence(e.target.value as AestraInfluence)}><option>Stable</option><option>Fading</option><option>Crystal-Starved</option><option>Overcharged</option><option>Corrupted</option></select></label>{nation==='Valdoria'&&<label>Valdoria depth<select value={depth} onChange={e=>setDepth(e.target.value as ValdoriaDepth)}>{valdoriaDepths.map(d=><option key={d}>{d}</option>)}</select></label>}</>}<p className="muted smallText">Aestra item identity changes naming, provenance and a bounded situational mechanic without silently increasing the listed zenny budget.</p></div>}<div className="subpanel"><label className="checkRow"><input type="checkbox" checked={addMaterial} onChange={e=>setAddMaterial(e.target.checked)}/><span>Add Natural Fantasy material / origin</span></label>{addMaterial&&<><label>Material nature<select value={materialNature} onChange={e=>setMaterialNature(e.target.value as MaterialNature|'Random')}>{materialNatures.map(n=><option key={n}>{n}</option>)}</select></label><label>Descriptor style<select value={descriptorMode} onChange={e=>setDescriptorMode(e.target.value as 'Elemental'|'Functional'|'Random')}><option>Random</option><option>Elemental</option><option>Functional</option></select></label>{descriptorMode==='Functional'&&<label>Function<select value={materialFunction} onChange={e=>setMaterialFunction(e.target.value as MaterialFunction|'Random')}>{materialFunctions.map(f=><option key={f}>{f}</option>)}</select></label>}</>}</div><button className="primary" onClick={generate}>Generate Item</button></div><div className="panel preview">{!result?<Empty text="Choose your options and generate a rules-aware item."/>:<><ItemCard item={result}/><div className="subpanel"><span className="source">Coherence summary</span><p className="note">{itemCoherenceSummary(result)}</p></div><div className="subpanel"><span className="source">Quality check</span><p className="note">{itemQualitySummary(result)}</p></div><div className="subpanel"><span className="source">Keep this item, reroll only</span><div className="buttonRow"><button onClick={()=>rerollItem('name')}>Name</button><button onClick={()=>rerollItem('quality')}>Quality / Effect</button><button onClick={()=>rerollItem('element')} disabled={result.type!=='Weapon'}>Element</button><button onClick={()=>rerollItem('theme')}>Theme</button><button onClick={rerollMaterial} disabled={!addMaterial}>Material</button></div><p className="muted smallText">Targeted rerolls preserve the base item, price and other details unless the selected part logically requires a thematic rewrite.</p></div><div className="buttonRow"><button onClick={generate}>Reroll Everything</button><button className="primary" onClick={()=>onSave(result)}>Save to Database</button></div></>}</div></section>
}

function Empty({ text }: { text:string }) { return <div className="empty">{text}</div> }
