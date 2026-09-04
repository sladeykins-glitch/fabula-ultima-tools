import { useEffect } from 'react'
import './databaseSelectionInsights.css'

type Kind = 'monster' | 'item'
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
  return ids.map(id => byId.get(id)).filter(Boolean)
}

function kindForSection(section: HTMLElement): Kind | null {
  if (section.querySelector('input[placeholder^="Search monsters"]')) return 'monster'
  if (section.querySelector('input[placeholder^="Search items"]')) return 'item'
  return null
}

function monsterWeight(record: any) {
  if (record?.rank === 'Champion') return Number(record.soldierEquivalent) || 3
  if (record?.rank === 'Elite') return 2
  return 1
}

function monsterSummary(records: any[]) {
  if (!records.length) return ''
  const weight = records.reduce((total, record) => total + monsterWeight(record), 0)
  const averageLevel = Math.round(records.reduce((total, record) => total + (Number(record.level) || 0), 0) / records.length)
  const turns = records.reduce((total, record) => total + (Number(record.turnsPerRound) || 1), 0)
  const spellcasters = records.filter(record => Array.isArray(record.spells) && record.spells.length).length
  const ranks = ['Soldier', 'Elite', 'Champion'].map(rank => `${rank}s ${records.filter(record => record.rank === rank).length}`).join(' · ')
  return `${records.length} selected · Weight ${weight} Soldier-equivalents · Avg Lv ${averageLevel} · ${ranks} · Turns ${turns} · Spellcasters ${spellcasters}`
}

function itemSummary(records: any[]) {
  if (!records.length) return ''
  const totalCost = records.reduce((total, record) => total + (Number(record.cost) || 0), 0)
  const martial = records.filter(record => !!record.martial).length
  const materials = records.filter(record => !!record.material).length
  const types = ['Weapon', 'Armor', 'Shield', 'Accessory']
    .map(type => `${type}s ${records.filter(record => record.type === type).length}`)
    .join(' · ')
  return `${records.length} selected · Total ${totalCost}z · ${types} · Martial ${martial} · Materials ${materials}`
}

function formattedMonster(record: any) {
  const attacks = (record.attacks || []).map((attack: any) => `  • ${attack.name}: ${attack.formula} ${attack.damageType}${attack.effect ? ` — ${attack.effect}` : ''}`).join('\n')
  const spells = (record.spells || []).map((spell: any) => `  • ${spell.name} (${spell.mp} MP): ${spell.effect}`).join('\n')
  return [
    `**${record.name}** — Lv ${record.level} ${record.rank} ${record.species}`,
    `HP ${record.hp} | MP ${record.mp} | DEF ${record.defense} | M.DEF ${record.magicDefense} | Init ${record.initiative}`,
    `DEX d${record.attributes?.dex} | INS d${record.attributes?.ins} | MIG d${record.attributes?.mig} | WLP d${record.attributes?.wlp}`,
    attacks ? `Attacks:\n${attacks}` : '',
    spells ? `Spells:\n${spells}` : '',
  ].filter(Boolean).join('\n')
}

function formattedItem(record: any) {
  const profile = record.type === 'Weapon'
    ? `${record.handedness || ''} ${record.range || ''} | ${record.accuracy || ''}${record.accuracyBonus ? ` +${record.accuracyBonus}` : ''} | HR +${record.damage ?? 0} ${record.damageType || ''}`.trim()
    : (record.type === 'Armor' || record.type === 'Shield')
      ? `DEF ${record.defense ?? '—'} | M.DEF ${record.magicDefense ?? '—'} | Init ${record.initiative ?? 0}`
      : ''
  return [
    `**${record.name}** — ${record.type}${record.category ? ` · ${record.category}` : ''} · ${Number(record.cost) || 0}z`,
    profile,
    record.quality ? `Quality: ${record.quality}` : '',
    record.effect || '',
  ].filter(Boolean).join('\n')
}

export default function DatabaseSelectionInsights() {
  useEffect(() => {
    const apply = () => {
      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        if (!section.querySelector('.databaseSummary')) return
        const kind = kindForSection(section)
        if (!kind) return
        const records = selectedRecords(kind)
        let bar = section.querySelector<HTMLElement>('.dbSelectionInsights')
        if (!bar) {
          bar = document.createElement('div')
          bar.className = 'dbSelectionInsights'
          bar.dataset.dbSelectionInsightKind = kind
          const selection = section.querySelector('.dbSelectionBar')
          ;(selection || section.querySelector('.databaseSummary'))?.insertAdjacentElement('afterend', bar)
        }
        const summary = kind === 'monster' ? monsterSummary(records) : itemSummary(records)
        const signature = `${records.map(record => record.id).join(',')}|${summary}`
        if (bar.dataset.signature === signature) return
        bar.dataset.signature = signature
        bar.innerHTML = records.length
          ? `<span>${summary}</span><button type="button" data-db-copy-formatted>Copy formatted</button>`
          : '<span>Select entries to see encounter/equipment totals.</span>'
      })
    }

    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-db-copy-formatted]')
      if (!button) return
      const bar = button.closest<HTMLElement>('.dbSelectionInsights')
      const kind = bar?.dataset.dbSelectionInsightKind as Kind | undefined
      if (!kind) return
      const records = selectedRecords(kind)
      const text = records.map(record => kind === 'monster' ? formattedMonster(record) : formattedItem(record)).join('\n\n')
      void navigator.clipboard?.writeText(text).then(() => {
        const original = button.textContent
        button.textContent = 'Copied'
        window.setTimeout(() => { button.textContent = original }, 1200)
      }).catch(() => undefined)
    }

    apply()
    const observer = new MutationObserver(() => requestAnimationFrame(apply))
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('click', onClick)
    window.addEventListener('storage', apply)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClick)
      window.removeEventListener('storage', apply)
    }
  }, [])

  return null
}
