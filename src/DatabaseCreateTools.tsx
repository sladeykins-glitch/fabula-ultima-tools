import { useEffect } from 'react'
import './databaseCreateTools.css'

type Kind = 'monster' | 'item'
const PENDING_KEY = 'fu-db-open-after-reload'

function kindForSection(section: HTMLElement): Kind | null {
  if (section.querySelector('input[placeholder^="Search monsters"]')) return 'monster'
  if (section.querySelector('input[placeholder^="Search items"]')) return 'item'
  return null
}

function records(kind: Kind): any[] {
  try {
    const value = JSON.parse(localStorage.getItem(kind === 'monster' ? 'fu-monsters' : 'fu-items') || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function createRecord(kind: Kind) {
  const id = `custom-${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  if (kind === 'monster') return {
    id,
    name: 'New Monster',
    source: 'Custom',
    level: 10,
    rank: 'Soldier',
    soldierEquivalent: 1,
    species: 'Monster',
    traits: ['new'],
    attributes: { dex: 8, ins: 8, mig: 8, wlp: 8 },
    hp: 60,
    crisis: 30,
    mp: 50,
    initiative: 8,
    defense: 8,
    magicDefense: 8,
    accuracyBonus: 1,
    magicBonus: 1,
    levelDamageBonus: 0,
    turnsPerRound: 1,
    skillBudget: 0,
    affinities: { physical:'Normal', air:'Normal', bolt:'Normal', dark:'Normal', earth:'Normal', fire:'Normal', ice:'Normal', light:'Normal', poison:'Normal' },
    attacks: [{ name: 'Basic Attack', formula: 'DEX + MIG', damageType: 'physical', effect: 'HR + 5 damage.' }],
    skills: [],
    spells: [],
    notes: ['Created from scratch.'],
    combatStyle: 'Mixed',
  }
  return {
    id,
    name: 'New Item',
    type: 'Accessory',
    source: 'Custom',
    cost: 100,
    martial: false,
    category: 'Accessory',
    effect: 'Describe this item effect.',
    breakdown: ['Created from scratch.'],
  }
}

function openRecord(kind: Kind, id: string) {
  const button = document.createElement('button')
  button.type = 'button'
  button.hidden = true
  button.dataset.dbOpen = kind
  button.dataset.dbRecordId = id
  document.body.appendChild(button)
  button.click()
  button.remove()
}

export default function DatabaseCreateTools() {
  useEffect(() => {
    const apply = () => {
      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        if (!section.querySelector('.databaseSummary')) return
        const kind = kindForSection(section)
        if (!kind) return
        let button = section.querySelector<HTMLButtonElement>('[data-db-create-new]')
        if (!button) {
          button = document.createElement('button')
          button.type = 'button'
          button.dataset.dbCreateNew = kind
          button.className = 'dbCreateButton'
          button.textContent = kind === 'monster' ? '+ New Monster' : '+ New Item'
          const quick = section.querySelector('.dbQuickActions')
          const toolbar = section.querySelector('.toolbar')
          ;(quick || toolbar)?.appendChild(button)
        }
      })
    }

    const pendingRaw = localStorage.getItem(PENDING_KEY)
    if (pendingRaw) {
      localStorage.removeItem(PENDING_KEY)
      try {
        const pending = JSON.parse(pendingRaw) as { kind: Kind; id: string }
        window.setTimeout(() => openRecord(pending.kind, pending.id), 120)
      } catch {
        // Ignore malformed pending state.
      }
    }

    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-db-create-new]')
      if (!button) return
      const kind = button.dataset.dbCreateNew as Kind
      const record = createRecord(kind)
      const key = kind === 'monster' ? 'fu-monsters' : 'fu-items'
      localStorage.setItem(key, JSON.stringify([record, ...records(kind)]))
      localStorage.setItem('fu-active-tab', JSON.stringify(kind === 'monster' ? 'Monster Database' : 'Item Database'))
      localStorage.setItem(PENDING_KEY, JSON.stringify({ kind, id: record.id }))
      window.location.reload()
    }

    apply()
    const observer = new MutationObserver(() => requestAnimationFrame(apply))
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('click', onClick)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClick)
    }
  }, [])
  return null
}
