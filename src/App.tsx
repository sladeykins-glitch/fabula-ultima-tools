import { useEffect, useMemo, useState } from 'react'
import { damageTypes, generateMonster, Monster, Rank, Species, speciesRules } from './rules'

type Tab = 'Monster Database' | 'Monster Generator' | 'Item Database' | 'Item Generator'

type Item = {
  id: string
  name: string
  type: 'Weapon' | 'Armor' | 'Shield' | 'Accessory'
  source: 'Generated' | 'Custom' | 'Official'
  cost: number
  effect: string
}

const species: Species[] = ['Beast','Construct','Demon','Elemental','Humanoid','Monster','Plant','Undead']
const ranks: Rank[] = ['Soldier','Elite','Champion']

export default function App() {
  const [tab, setTab] = useState<Tab>('Monster Database')
  const [monsters, setMonsters] = useState<Monster[]>(() => JSON.parse(localStorage.getItem('fu-monsters') || '[]'))
  const [items, setItems] = useState<Item[]>(() => JSON.parse(localStorage.getItem('fu-items') || '[]'))
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

function ItemDatabase({ items, setItems }: { items: Item[]; setItems: React.Dispatch<React.SetStateAction<Item[]>> }) {
  return <section>{items.length===0 ? <Empty text="No items saved yet. Generate one to start your database."/> : <div className="grid">{items.map(item=><article className="card" key={item.id}><div className="cardTitle"><div><span className="source">{item.source}</span><h2>{item.name}</h2></div><button className="danger" onClick={()=>setItems(prev=>prev.filter(x=>x.id!==item.id))}>Delete</button></div><p>{item.type} · {item.cost}z</p><p>{item.effect}</p></article>)}</div>}</section>
}

function ItemGenerator({ onSave }: { onSave: (item:Item)=>void }) {
  const [type, setType] = useState<Item['type']>('Weapon')
  const [result, setResult] = useState<Item|null>(null)
  const generate = () => {
    const names: Record<Item['type'], string[]> = {
      Weapon: ['Ashen Edge','Moonlit Pike','Storm Needle','Graveglass Blade'], Armor: ['Foxfire Coat','Runic Plate','Moonweave Robe'], Shield: ['Aegis of Cinders','Mirror Guard','Thornwall'], Accessory: ['Ring of Echoes','Crystal Brooch','Warden Charm']
    }
    const effects = ['You gain Resistance to fire damage.','You gain a +4 bonus to Initiative.','Damage dealt by this item ignores Resistances.','You are immune to slow.','Once per scene, recover 10 MP after you enter Crisis.']
    setResult({ id: crypto.randomUUID(), name: names[type][Math.floor(Math.random()*names[type].length)], type, source:'Generated', cost: [500,700,800,1000,1200,1500][Math.floor(Math.random()*6)], effect: effects[Math.floor(Math.random()*effects.length)] })
  }
  return <section className="twoCol"><div className="panel"><h2>Item Generator</h2><p className="muted">Initial generator shell. The full Core + Atlas pricing/quality logic will be added next.</p><label>Item type<select value={type} onChange={e=>setType(e.target.value as Item['type'])}><option>Weapon</option><option>Armor</option><option>Shield</option><option>Accessory</option></select></label><button className="primary" onClick={generate}>Generate Item</button></div><div className="panel preview">{!result?<Empty text="Generate an item to preview it."/>:<><span className="source">Generated</span><h2>{result.name}</h2><p>{result.type} · {result.cost}z</p><p>{result.effect}</p><div className="buttonRow"><button onClick={generate}>Reroll</button><button className="primary" onClick={()=>onSave(result)}>Save to Database</button></div></>}</div></section>
}

function Empty({ text }: { text:string }) { return <div className="empty">{text}</div> }
