import { useEffect, useMemo, useState } from 'react'
import './databaseOverlay.css'

type Kind = 'monster' | 'item'
type Selected = { kind: Kind; record: any } | null

const damageTypes = ['physical','air','bolt','dark','earth','fire','ice','light','poison']
const affinityValues = ['Normal','Vulnerable','Resistant','Immune','Absorb']
const dieValues = [6,8,10,12]
const combatStyles = ['Mixed','Brute','Defender','Controller','Spellcaster','Assassin','Support']
const itemTypes = ['Weapon','Armor','Shield','Accessory']

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
      const copy = JSON.parse(JSON.stringify(record))
      if (kind === 'monster') {
        copy.traitsText = Array.isArray(record.traits) ? record.traits.join(', ') : ''
        copy.attributes ||= { dex: 8, ins: 8, mig: 8, wlp: 8 }
        copy.affinities ||= Object.fromEntries(damageTypes.map(type => [type, 'Normal']))
        copy.attacks ||= []
        copy.skills ||= []
        copy.spells ||= []
      }
      setSelected({ kind, record })
      setDraft(copy)
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
  const setNested = (parent: string, key: string, value: any) => setDraft((current: any) => ({ ...current, [parent]: { ...(current[parent] || {}), [key]: value } }))
  const setArrayField = (key: string, index: number, field: string, value: any) => setDraft((current: any) => ({
    ...current,
    [key]: (current[key] || []).map((entry: any, i: number) => i === index ? { ...entry, [field]: value } : entry),
  }))
  const removeArrayRow = (key: string, index: number) => setDraft((current: any) => ({ ...current, [key]: (current[key] || []).filter((_: any, i: number) => i !== index) }))
  const addAttack = () => set('attacks', [...(draft.attacks || []), { name: 'New Attack', formula: 'DEX + MIG', damageType: 'physical', effect: '' }])
  const addSkill = () => set('skills', [...(draft.skills || []), { name: 'New Skill', summary: '' }])
  const addSpell = () => set('spells', [...(draft.spells || []), { name: 'New Spell', mp: '10', target: 'One creature', duration: 'Instantaneous', effect: '' }])

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

      {selected.kind === 'monster' ? <>
        <div className="dbEditGrid">
          <label>Name<input value={draft.name || ''} onChange={event => set('name', event.target.value)} /></label>
          <label>Level<input type="number" min="1" max="99" value={draft.level ?? 1} onChange={event => number('level', event.target.value)} /></label>
          <label>Rank<select value={draft.rank || 'Soldier'} onChange={event => set('rank', event.target.value)}><option>Soldier</option><option>Elite</option><option>Champion</option></select></label>
          <label>Species<select value={draft.species || 'Monster'} onChange={event => set('species', event.target.value)}><option>Beast</option><option>Construct</option><option>Demon</option><option>Elemental</option><option>Humanoid</option><option>Monster</option><option>Plant</option><option>Undead</option></select></label>
          <label>Combat Style<select value={draft.combatStyle || 'Mixed'} onChange={event => set('combatStyle', event.target.value)}>{combatStyles.map(style => <option key={style}>{style}</option>)}</select></label>
          <label>Turns / Round<input type="number" min="1" max="10" value={draft.turnsPerRound ?? 1} onChange={event => number('turnsPerRound', event.target.value)} /></label>
          <label>HP<input type="number" min="0" value={draft.hp ?? 0} onChange={event => number('hp', event.target.value)} /></label>
          <label>MP<input type="number" min="0" value={draft.mp ?? 0} onChange={event => number('mp', event.target.value)} /></label>
          <label>Initiative<input type="number" value={draft.initiative ?? 0} onChange={event => number('initiative', event.target.value)} /></label>
          <label>Defense<input type="number" value={draft.defense ?? 0} onChange={event => number('defense', event.target.value)} /></label>
          <label>Magic Defense<input type="number" value={draft.magicDefense ?? 0} onChange={event => number('magicDefense', event.target.value)} /></label>
          <label>Accuracy Bonus<input type="number" value={draft.accuracyBonus ?? 0} onChange={event => number('accuracyBonus', event.target.value)} /></label>
          <label>Magic Bonus<input type="number" value={draft.magicBonus ?? 0} onChange={event => number('magicBonus', event.target.value)} /></label>
          <label className="dbWide">Traits<textarea value={draft.traitsText || ''} onChange={event => set('traitsText', event.target.value)} placeholder="trait one, trait two, trait three" /></label>
        </div>

        <h3 className="dbSectionTitle">Attributes</h3>
        <div className="dbCompactGrid">
          {(['dex','ins','mig','wlp'] as const).map(attr => <label key={attr}>{attr.toUpperCase()}<select value={draft.attributes?.[attr] || 8} onChange={event => setNested('attributes', attr, Number(event.target.value))}>{dieValues.map(die => <option key={die} value={die}>d{die}</option>)}</select></label>)}
        </div>

        <h3 className="dbSectionTitle">Affinities</h3>
        <div className="dbAffinityGrid">
          {damageTypes.map(type => <label key={type}>{type}<select value={draft.affinities?.[type] || 'Normal'} onChange={event => setNested('affinities', type, event.target.value)}>{affinityValues.map(value => <option key={value}>{value}</option>)}</select></label>)}
        </div>

        <div className="dbSectionHeader"><h3>Basic Attacks</h3><button onClick={addAttack}>+ Add Attack</button></div>
        <div className="dbArrayList">{(draft.attacks || []).map((attack: any, index: number) => <div className="dbArrayRow" key={index}>
          <input value={attack.name || ''} onChange={event => setArrayField('attacks', index, 'name', event.target.value)} placeholder="Attack name" />
          <input value={attack.formula || ''} onChange={event => setArrayField('attacks', index, 'formula', event.target.value)} placeholder="DEX + MIG" />
          <select value={attack.damageType || 'physical'} onChange={event => setArrayField('attacks', index, 'damageType', event.target.value)}>{damageTypes.map(type => <option key={type}>{type}</option>)}</select>
          <textarea value={attack.effect || ''} onChange={event => setArrayField('attacks', index, 'effect', event.target.value)} placeholder="Damage and special effect" />
          <button className="danger" onClick={() => removeArrayRow('attacks', index)}>Remove</button>
        </div>)}</div>

        <div className="dbSectionHeader"><h3>NPC Skills / Special Rules</h3><button onClick={addSkill}>+ Add Skill</button></div>
        <div className="dbArrayList">{(draft.skills || []).map((skill: any, index: number) => <div className="dbArrayRow dbTwoField" key={index}>
          <input value={skill.name || ''} onChange={event => setArrayField('skills', index, 'name', event.target.value)} placeholder="Skill name" />
          <textarea value={skill.summary || ''} onChange={event => setArrayField('skills', index, 'summary', event.target.value)} placeholder="Rule text" />
          <button className="danger" onClick={() => removeArrayRow('skills', index)}>Remove</button>
        </div>)}</div>

        <div className="dbSectionHeader"><h3>Spells</h3><button onClick={addSpell}>+ Add Spell</button></div>
        <div className="dbArrayList">{(draft.spells || []).map((spell: any, index: number) => <div className="dbArrayRow dbSpellRow" key={index}>
          <input value={spell.name || ''} onChange={event => setArrayField('spells', index, 'name', event.target.value)} placeholder="Spell name" />
          <input value={spell.mp || ''} onChange={event => setArrayField('spells', index, 'mp', event.target.value)} placeholder="10" />
          <input value={spell.target || ''} onChange={event => setArrayField('spells', index, 'target', event.target.value)} placeholder="Target" />
          <input value={spell.duration || ''} onChange={event => setArrayField('spells', index, 'duration', event.target.value)} placeholder="Duration" />
          <textarea value={spell.effect || ''} onChange={event => setArrayField('spells', index, 'effect', event.target.value)} placeholder="Spell effect" />
          <button className="danger" onClick={() => removeArrayRow('spells', index)}>Remove</button>
        </div>)}</div>
      </> : <>
        <div className="dbEditGrid">
          <label>Name<input value={draft.name || ''} onChange={event => set('name', event.target.value)} /></label>
          <label>Cost (zenit)<input type="number" min="0" value={draft.cost ?? 0} onChange={event => number('cost', event.target.value)} /></label>
          <label>Type<select value={draft.type || 'Accessory'} onChange={event => set('type', event.target.value)}>{itemTypes.map(type => <option key={type}>{type}</option>)}</select></label>
          <label>Category<input value={draft.category || ''} onChange={event => set('category', event.target.value)} /></label>
          <label className="dbCheckLabel"><input type="checkbox" checked={!!draft.martial} onChange={event => set('martial', event.target.checked)} /> Martial equipment</label>
          <label>Base Item<input value={draft.baseItem || ''} onChange={event => set('baseItem', event.target.value)} /></label>
        </div>

        {draft.type === 'Weapon' && <>
          <h3 className="dbSectionTitle">Weapon Profile</h3>
          <div className="dbEditGrid">
            <label>Handedness<select value={draft.handedness || 'One-handed'} onChange={event => set('handedness', event.target.value)}><option>One-handed</option><option>Two-handed</option></select></label>
            <label>Range<select value={draft.range || 'Melee'} onChange={event => set('range', event.target.value)}><option>Melee</option><option>Ranged</option></select></label>
            <label>Accuracy Formula<input value={draft.accuracy || ''} onChange={event => set('accuracy', event.target.value)} placeholder="DEX + MIG" /></label>
            <label>Accuracy Bonus<input type="number" value={draft.accuracyBonus ?? 0} onChange={event => number('accuracyBonus', event.target.value)} /></label>
            <label>HR Damage Bonus<input type="number" value={draft.damage ?? 0} onChange={event => number('damage', event.target.value)} /></label>
            <label>Damage Type<select value={draft.damageType || 'physical'} onChange={event => set('damageType', event.target.value)}>{damageTypes.map(type => <option key={type}>{type}</option>)}</select></label>
          </div>
        </>}

        {(draft.type === 'Armor' || draft.type === 'Shield') && <>
          <h3 className="dbSectionTitle">Defensive Profile</h3>
          <div className="dbEditGrid">
            <label>Defense<input value={draft.defense || ''} onChange={event => set('defense', event.target.value)} placeholder="DEX +1 or 11" /></label>
            <label>Magic Defense<input value={draft.magicDefense || ''} onChange={event => set('magicDefense', event.target.value)} placeholder="INS +1 or +2" /></label>
            <label>Initiative Modifier<input type="number" value={draft.initiative ?? 0} onChange={event => number('initiative', event.target.value)} /></label>
          </div>
        </>}

        <h3 className="dbSectionTitle">Quality & Effect</h3>
        <div className="dbEditGrid">
          <label className="dbWide">Quality / Customizations<textarea value={draft.quality || ''} onChange={event => set('quality', event.target.value)} /></label>
          <label className="dbWide">Effect<textarea value={draft.effect || ''} onChange={event => set('effect', event.target.value)} /></label>
          <label className="dbWide">Origin<textarea value={draft.origin || ''} onChange={event => set('origin', event.target.value)} /></label>
        </div>

        {draft.material && <>
          <h3 className="dbSectionTitle">Material</h3>
          <div className="dbEditGrid">
            <label>Name<input value={draft.material.name || ''} onChange={event => setNested('material', 'name', event.target.value)} /></label>
            <label>Nature<input value={draft.material.nature || ''} onChange={event => setNested('material', 'nature', event.target.value)} /></label>
            <label>Descriptor<input value={draft.material.descriptorKind || ''} onChange={event => setNested('material', 'descriptorKind', event.target.value)} /></label>
            <label>Element<input value={draft.material.element || ''} onChange={event => setNested('material', 'element', event.target.value)} /></label>
            <label className="dbWide">Function<input value={draft.material.function || ''} onChange={event => setNested('material', 'function', event.target.value)} /></label>
          </div>
        </>}
      </>}

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