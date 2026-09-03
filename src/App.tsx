import { useEffect, useMemo, useState } from 'react'
import { damageTypes, generateMonster, Monster, Rank, Species, speciesRules } from './rules'
import { DamageType, GeneratedItem, generateItem, ItemType } from './items'
import { generateCustomWeapon } from './customWeapons'

type Tab = 'Monster Database' | 'Monster Generator' | 'Item Database' | 'Item Generator'

const species: Species[] = ['Beast','Construct','Demon','Elemental','Humanoid','Monster','Plant','Undead']
const ranks: Rank[] = ['Soldier','Elite','Champion']

export default function App() {
  const [tab, setTab] = useState<Tab>('Monster Database')
  const [monsters, setMonsters] = useState<Monster[]>(() => JSON.parse(localStorage.getItem('fu-monsters') || '[]'))
  const [items, setItems] = useState<GeneratedItem[]>(() => JSON.parse(localStorage.getItem('fu-items') || '[]'))
  const [search, setSearch] = useState('')

  useEffect(() => localStorage.setItem('fu-monsters', JSON.stringify(monsters)), [monsters])
  useEffect(() => localStorage.setItem('fu-items', JSON.stringify(items)), [items])

  return (
    <div className="shell">
      <header>
        <div>
          <div className="eyebrow">FABULA ULTIMA</div>
          <h1>Monster & Item Tools</h1>
        </div>
        <span className="badge">alpha</span>
      </header>

      <nav>
        {(['Monster Database','Monster Generator','Item Database','Item Generator'] as Tab[]).map(t => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </nav>

      <main>
        {tab === 'Monster Database' && <MonsterDatabase monsters={monsters} setMonsters={setMonsters} search={search} setSearch={setSearch} />}
        {tab === 'Monster Generator' && <MonsterGenerator onSave={m => { setMonsters(prev => [m, ...prev]); setTab('Monster Database') }} />}
        {tab === 'Item Database' && <ItemDatabase items={items} setItems={setItems} />}
        {tab === 'Item Generator' && <ItemGenerator onSave={item => { setItems(prev => [item, ...prev]); setTab('Item Database') }} />}
      </main>
    </div>
  )
}

function MonsterDatabase({ monsters, setMonsters, search, setSearch }: { monsters: Monster[]; setMonsters: React.Dispatch<React.SetStateAction<Monster[]>>; search: string; setSearch: (v:string)=>void }) {
  const filtered = useMemo(() => monsters.filter(m => `${m.name} ${m.species} ${m.rank} ${m.traits.join(' ')}`.toLowerCase().includes(search.toLowerCase())), [monsters, search])
  return <section>
    <div className="toolbar">
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search monsters..." />
      <span>{filtered.length} entries</span>
    </div>
    {filtered.length === 0 ? <Empty text="No monsters saved yet. Generate one to start your database." /> : <div className="grid">
      {filtered.map(m => <article className="card" key={m.id}>
        <div className="cardTitle"><div><span className="source">{m.source}</span><h2>{m.name}</h2></div><button className="danger" onClick={()=>setMonsters(prev=>prev.filter(x=>x.id!==m.id))}>Delete</button></div>
        <p className="muted">Lv {m.level} · {m.rank} · {m.species}</p>
        <div className="stats"><b>HP {m.hp}</b><b>MP {m.mp}</b><b>Init {m.initiative}</b><b>DEF {m.defense}</b><b>M.DEF {m.magicDefense}</b></div>
        <div className="dice"><span>DEX d{m.attributes.dex}</span><span>INS d{m.attributes.ins}</span><span>MIG d{m.attributes.mig}</span><span>WLP d{m.attributes.wlp}</span></div>
        <p><strong>Traits:</strong> {m.traits.join(', ')}</p>
        <div className="affinities">{damageTypes.filter(t=>m.affinities[t] !== 'Normal').map(t=><span key={t}>{t}: {m.affinities[t]}</span>)}</div>
        <h3>Basic attacks</h3>
        {m.attacks.map((a,i)=><p key={i} className="attack"><b>{a.name}</b> — {a.formula} {a.damageType}</p>)}
        <h3>Rules</h3>
        {m.notes.map((n,i)=><p className="note" key={i}>{n}</p>)}
      </article>)}
    </div>}
  </section>
}

function MonsterGenerator({ onSave }: { onSave: (m:Monster)=>void }) {
  const [level, setLevel] = useState(10)
  const [rank, setRank] = useState<Rank>('Soldier')
  const [soldierEquivalent, setSoldierEquivalent] = useState(3)
  const [sp, setSp] = useState<Species>('Monster')
  const [complexity, setComplexity] = useState<'Simple'|'Standard'|'Crunchy'>('Standard')
  const [result, setResult] = useState<Monster|null>(null)

  const make = () => setResult(generateMonster({ level, rank, soldierEquivalent, species: sp, complexity }))

  return <section className="twoCol">
    <div className="panel">
      <h2>Random Monster Generator</h2>
      <label>Level <strong>{level}</strong><input type="range" min="5" max="60" step="5" value={level} onChange={e=>setLevel(Number(e.target.value))}/></label>
      <label>Rank<select value={rank} onChange={e=>setRank(e.target.value as Rank)}>{ranks.map(r=><option key={r}>{r}</option>)}</select></label>
      {rank==='Champion' && <label>Soldiers replaced<input type="number" min="2" max="10" value={soldierEquivalent} onChange={e=>setSoldierEquivalent(Number(e.target.value))}/></label>}
      <label>Species<select value={sp} onChange={e=>setSp(e.target.value as Species)}>{species.map(s=><option key={s}>{s}</option>)}</select></label>
      <p className="note">{speciesRules[sp].note}</p>
      <label>Complexity<select value={complexity} onChange={e=>setComplexity(e.target.value as typeof complexity)}><option>Simple</option><option>Standard</option><option>Crunchy</option></select></label>
      <button className="primary" onClick={make}>Generate Monster</button>
    </div>
    <div className="panel preview">
      {!result ? <Empty text="Choose your options and generate a monster." /> : <>
        <span className="source">Generated</span><h2>{result.name}</h2>
        <p className="muted">Lv {result.level} · {result.rank} · {result.species}</p>
        <div className="stats"><b>HP {result.hp}</b><b>MP {result.mp}</b><b>Init {result.initiative}</b><b>Skills {result.skillBudget}</b><b>Turns {result.turnsPerRound}</b></div>
        <p><strong>Traits:</strong> {result.traits.join(', ')}</p>
        {result.attacks.map((a,i)=><p className="attack" key={i}><b>{a.name}</b> — {a.formula} {a.damageType}</p>)}
        <div className="buttonRow"><button onClick={make}>Reroll</button><button className="primary" onClick={()=>onSave(result)}>Save to Database</button></div>
      </>}
    </div>
  </section>
}

function ItemDatabase({ items, setItems }: { items: GeneratedItem[]; setItems: React.Dispatch<React.SetStateAction<GeneratedItem[]>> }) {
  const [search, setSearch] = useState('')
  const [type, setType] = useState<'All'|ItemType>('All')
  const filtered = useMemo(() => items.filter(item => {
    const haystack = `${item.name} ${item.type} ${item.category || ''} ${item.baseItem || ''} ${item.quality || ''} ${item.effect}`.toLowerCase()
    return haystack.includes(search.toLowerCase()) && (type === 'All' || item.type === type)
  }), [items, search, type])

  return <section>
    <div className="toolbar">
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search items, qualities, effects..." />
      <select className="compactSelect" value={type} onChange={e=>setType(e.target.value as 'All'|ItemType)}>
        <option>All</option><option>Weapon</option><option>Armor</option><option>Shield</option><option>Accessory</option>
      </select>
      <span>{filtered.length} entries</span>
    </div>
    {filtered.length===0 ? <Empty text="No matching items saved yet. Generate one to start your database."/> : <div className="grid">{filtered.map(item=><ItemCard key={item.id} item={item} onDelete={()=>setItems(prev=>prev.filter(x=>x.id!==item.id))} />)}</div>}
  </section>
}

function ItemCard({ item, onDelete }: { item: GeneratedItem; onDelete?:()=>void }) {
  return <article className="card" key={item.id}>
    <div className="cardTitle">
      <div><span className="source">{item.source}</span><h2>{item.name}</h2></div>
      {onDelete && <button className="danger" onClick={onDelete}>Delete</button>}
    </div>
    <p className="muted">{item.type}{item.category ? ` · ${item.category}` : ''} · {item.cost}z {item.martial ? '· Martial' : ''}</p>
    {item.baseItem && <p><strong>Base:</strong> {item.baseItem}</p>}
    {item.type === 'Weapon' && <div className="stats">
      <b>{item.handedness}</b><b>{item.range}</b><b>{item.accuracy}{item.accuracyBonus ? ` +${item.accuracyBonus}` : ''}</b><b>HR + {item.damage}</b><b>{item.damageType}</b>
    </div>}
    {(item.type === 'Armor' || item.type === 'Shield') && <div className="stats"><b>DEF {item.defense}</b><b>M.DEF {item.magicDefense}</b><b>Init {item.initiative && item.initiative > 0 ? '+' : ''}{item.initiative || 0}</b></div>}
    {item.quality && <p><strong>Quality / Customizations:</strong> {item.quality}</p>}
    <p className="attack">{item.effect}</p>
    {item.breakdown.length > 0 && <details><summary>Price / rule breakdown</summary>{item.breakdown.map((b,i)=><p className="note" key={i}>{b}</p>)}</details>}
  </article>
}

function ItemGenerator({ onSave }: { onSave: (item:GeneratedItem)=>void }) {
  const [type, setType] = useState<ItemType>('Weapon')
  const [weaponMethod, setWeaponMethod] = useState<'Core Rare'|'Atlas Custom'>('Core Rare')
  const [maxCost, setMaxCost] = useState(1500)
  const [allowMartial, setAllowMartial] = useState(true)
  const [allowTransforming, setAllowTransforming] = useState(true)
  const [damageType, setDamageType] = useState<DamageType|'random'>('random')
  const [result, setResult] = useState<GeneratedItem|null>(null)

  const generate = () => {
    if (type === 'Weapon' && weaponMethod === 'Atlas Custom') {
      setResult(generateCustomWeapon({ allowMartial, allowTransforming, preferredDamageType:damageType }))
    } else {
      setResult(generateItem({ type, maxCost, allowMartial, preferredDamageType:damageType }))
    }
  }

  return <section className="twoCol">
    <div className="panel">
      <h2>Item Generator</h2>
      <p className="muted">Core rare equipment and the High Fantasy Atlas custom-weapon framework now share the same item database.</p>
      <label>Item type<select value={type} onChange={e=>{ setType(e.target.value as ItemType); setResult(null) }}><option>Weapon</option><option>Armor</option><option>Shield</option><option>Accessory</option></select></label>
      {type === 'Weapon' && <label>Weapon system<select value={weaponMethod} onChange={e=>{ setWeaponMethod(e.target.value as 'Core Rare'|'Atlas Custom'); setResult(null) }}><option>Core Rare</option><option>Atlas Custom</option></select></label>}
      {(type !== 'Weapon' || weaponMethod === 'Core Rare') && <label>Maximum cost <strong>{maxCost}z</strong><input type="range" min="500" max="3000" step="100" value={maxCost} onChange={e=>setMaxCost(Number(e.target.value))}/></label>}
      <label className="checkRow"><input type="checkbox" checked={allowMartial} onChange={e=>setAllowMartial(e.target.checked)}/><span>Allow martial equipment</span></label>
      {type === 'Weapon' && weaponMethod === 'Atlas Custom' && <label className="checkRow"><input type="checkbox" checked={allowTransforming} onChange={e=>setAllowTransforming(e.target.checked)}/><span>Allow Transforming custom weapons</span></label>}
      {type === 'Weapon' && <label>Damage type<select value={damageType} onChange={e=>setDamageType(e.target.value as DamageType|'random')}><option value="random">Random</option><option value="physical">Physical</option><option value="air">Air</option><option value="bolt">Bolt</option><option value="dark">Dark</option><option value="earth">Earth</option><option value="fire">Fire</option><option value="ice">Ice</option><option value="light">Light</option><option value="poison">Poison</option></select></label>}
      {type === 'Weapon' && weaponMethod === 'Atlas Custom' && <p className="note">Atlas custom weapons start at 300z, are always two-handed, use DEX+INS or DEX+MIG, deal HR+5 physical before customizations, and receive three customization slots.</p>}
      <button className="primary" onClick={generate}>Generate Item</button>
    </div>
    <div className="panel preview">
      {!result ? <Empty text="Choose your options and generate a rules-aware item."/> : <>
        <ItemCard item={result} />
        <div className="buttonRow"><button onClick={generate}>Reroll</button><button className="primary" onClick={()=>onSave(result)}>Save to Database</button></div>
      </>}
    </div>
  </section>
}

function Empty({ text }: { text:string }) { return <div className="empty">{text}</div> }
