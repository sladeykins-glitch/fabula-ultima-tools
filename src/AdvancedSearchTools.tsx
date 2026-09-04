import { useEffect } from 'react'
import './advancedSearchTools.css'

type Kind = 'monster' | 'item'
type Criteria = {
  levelMin?: number
  levelMax?: number
  costMin?: number
  costMax?: number
  has?: 'spell' | 'skill' | 'attack' | 'material'
  damage?: string
  affinityType?: string
  affinityValue?: string
  official?: boolean
  martial?: boolean
  category?: string
}

const KEY = 'fu-db-advanced-search'

function readState(): Record<Kind, Criteria> {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}')
    return { monster: value?.monster || {}, item: value?.item || {} }
  } catch {
    return { monster: {}, item: {} }
  }
}

function writeState(value: Record<Kind, Criteria>) {
  localStorage.setItem(KEY, JSON.stringify(value))
}

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

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function setSelectValue(section: HTMLElement, wanted: string) {
  const selects = Array.from(section.querySelectorAll<HTMLSelectElement>('.toolbar select'))
  const match = selects.find(select => Array.from(select.options).some(option => option.value.toLowerCase() === wanted.toLowerCase()))
  if (!match) return false
  const option = Array.from(match.options).find(item => item.value.toLowerCase() === wanted.toLowerCase())
  if (!option) return false
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set
  setter?.call(match, option.value)
  match.dispatchEvent(new Event('change', { bubbles: true }))
  return true
}

function range(value: string) {
  const match = value.match(/^(\d+)(?:-(\d+))?$/)
  if (!match) return null
  const first = Number(match[1])
  const second = match[2] ? Number(match[2]) : first
  return { min: Math.min(first, second), max: Math.max(first, second) }
}

function parse(section: HTMLElement, kind: Kind, raw: string): { criteria: Criteria; plain: string } {
  const criteria: Criteria = {}
  const plain: string[] = []
  const parts = raw.match(/"[^"]+"|\S+/g) || []

  for (const token of parts) {
    const split = token.match(/^([a-z]+):(.*)$/i)
    if (!split) { plain.push(token); continue }
    const key = split[1].toLowerCase()
    const value = split[2].replace(/^"|"$/g, '').trim()
    const lower = value.toLowerCase()

    if (key === 'level' && kind === 'monster') {
      const parsed = range(lower); if (parsed) { criteria.levelMin = parsed.min; criteria.levelMax = parsed.max; continue }
    }
    if (key === 'cost' && kind === 'item') {
      const parsed = range(lower); if (parsed) { criteria.costMin = parsed.min; criteria.costMax = parsed.max; continue }
    }
    if (key === 'has' && ['spell','skill','attack','material'].includes(lower)) { criteria.has = lower as Criteria['has']; continue }
    if (key === 'damage') { criteria.damage = lower; continue }
    if (key === 'official') { criteria.official = ['true','yes','1'].includes(lower); continue }
    if (key === 'custom') { criteria.official = !['true','yes','1'].includes(lower); continue }
    if (key === 'martial' && kind === 'item') { criteria.martial = ['true','yes','1'].includes(lower); continue }
    if (key === 'category' && kind === 'item') { criteria.category = lower; continue }
    if (key === 'affinity' && kind === 'monster') {
      const affinity = lower.match(/^([a-z]+)[=/-](vulnerable|resistant|immune|absorb|normal)$/)
      if (affinity) { criteria.affinityType = affinity[1]; criteria.affinityValue = affinity[2]; continue }
    }
    if (key === 'source') {
      const sourceMap: Record<string,string> = { core:'Core Rulebook', high:'High Fantasy', natural:'Natural Fantasy', techno:'Techno Fantasy', custom:'Generated / Custom', generated:'Generated / Custom' }
      if (sourceMap[lower] && setSelectValue(section, sourceMap[lower])) continue
    }
    if (key === 'rank' && kind === 'monster') { if (setSelectValue(section, value)) continue }
    if (key === 'species' && kind === 'monster') { if (setSelectValue(section, value)) continue }
    if (key === 'style' && kind === 'monster') { if (setSelectValue(section, value)) continue }
    if (key === 'type' && kind === 'item') { if (setSelectValue(section, value)) continue }
    plain.push(token)
  }

  return { criteria, plain: plain.join(' ') }
}

function matches(kind: Kind, record: any, criteria: Criteria) {
  if (criteria.official != null && (record?.source === 'Official') !== criteria.official) return false
  if (kind === 'monster') {
    const level = Number(record?.level) || 0
    if (criteria.levelMin != null && level < criteria.levelMin) return false
    if (criteria.levelMax != null && level > criteria.levelMax) return false
    if (criteria.has === 'spell' && !(record?.spells?.length > 0)) return false
    if (criteria.has === 'skill' && !(record?.skills?.length > 0)) return false
    if (criteria.has === 'attack' && !(record?.attacks?.length > 0)) return false
    if (criteria.damage && !(record?.attacks || []).some((attack:any) => String(attack?.damageType || '').toLowerCase() === criteria.damage) && !(record?.spells || []).some((spell:any) => String(spell?.effect || '').toLowerCase().includes(criteria.damage!))) return false
    if (criteria.affinityType && criteria.affinityValue) {
      if (String(record?.affinities?.[criteria.affinityType] || 'Normal').toLowerCase() !== criteria.affinityValue) return false
    }
  } else {
    const cost = Number(record?.cost) || 0
    if (criteria.costMin != null && cost < criteria.costMin) return false
    if (criteria.costMax != null && cost > criteria.costMax) return false
    if (criteria.martial != null && !!record?.martial !== criteria.martial) return false
    if (criteria.category && !String(record?.category || '').toLowerCase().includes(criteria.category)) return false
    if (criteria.has === 'material' && !record?.material) return false
    if (criteria.damage && String(record?.damageType || '').toLowerCase() !== criteria.damage) return false
  }
  return true
}

function label(criteria: Criteria) {
  const parts: string[] = []
  if (criteria.levelMin != null) parts.push(`level ${criteria.levelMin}-${criteria.levelMax}`)
  if (criteria.costMin != null) parts.push(`cost ${criteria.costMin}-${criteria.costMax}`)
  if (criteria.has) parts.push(`has ${criteria.has}`)
  if (criteria.damage) parts.push(`damage ${criteria.damage}`)
  if (criteria.affinityType) parts.push(`${criteria.affinityType} ${criteria.affinityValue}`)
  if (criteria.official != null) parts.push(criteria.official ? 'official' : 'custom')
  if (criteria.martial != null) parts.push(criteria.martial ? 'martial' : 'non-martial')
  if (criteria.category) parts.push(`category ${criteria.category}`)
  return parts.join(' · ')
}

export default function AdvancedSearchTools() {
  useEffect(() => {
    const apply = () => {
      const state = readState()
      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        if (!section.querySelector('.databaseSummary')) return
        const kind = kindForSection(section)
        if (!kind) return
        const byId = new Map(records(kind).map(record => [record?.id, record]))
        const criteria = state[kind]
        section.querySelectorAll<HTMLElement>('.monsterCard, .itemCard').forEach(card => {
          const record = byId.get(card.dataset.dbRecordId)
          card.classList.toggle('dbHiddenByAdvanced', !!record && !matches(kind, record, criteria))
        })

        let bar = section.querySelector<HTMLElement>('.dbAdvancedSearchBar')
        if (!bar) {
          bar = document.createElement('div')
          bar.className = 'dbAdvancedSearchBar'
          bar.dataset.dbAdvancedKind = kind
          const toolbar = section.querySelector('.toolbar')
          toolbar?.insertAdjacentElement('afterend', bar)
        }
        if (!bar) return
        const current = label(criteria)
        const html = `<span><strong>Advanced search</strong>${current ? ` · ${current}` : ' · no extra filters'}</span><button type="button" data-db-advanced-apply>Apply syntax</button><button type="button" data-db-advanced-clear ${current ? '' : 'disabled'}>Clear advanced</button><button type="button" data-db-advanced-help>?</button>`
        if (bar.dataset.signature !== html) { bar.innerHTML = html; bar.dataset.signature = html }
      })
    }

    const applySyntax = (section: HTMLElement, kind: Kind) => {
      const input = section.querySelector<HTMLInputElement>('.toolbar input')
      if (!input) return
      const parsed = parse(section, kind, input.value)
      const state = readState()
      state[kind] = parsed.criteria
      writeState(state)
      setInputValue(input, parsed.plain)
      window.setTimeout(apply, 0)
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return
      const input = event.target instanceof HTMLInputElement ? event.target : null
      const section = input?.closest<HTMLElement>('main > section')
      if (!input || !section || !section.querySelector('.databaseSummary') || !input.value.includes(':')) return
      const kind = kindForSection(section)
      if (!kind) return
      event.preventDefault()
      applySyntax(section, kind)
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const bar = target.closest<HTMLElement>('.dbAdvancedSearchBar')
      if (!bar) return
      const section = bar.closest<HTMLElement>('main > section')
      const kind = bar.dataset.dbAdvancedKind as Kind | undefined
      if (!section || !kind) return
      if (target.closest('[data-db-advanced-apply]')) { applySyntax(section, kind); return }
      if (target.closest('[data-db-advanced-clear]')) {
        const state = readState(); state[kind] = {}; writeState(state); apply(); return
      }
      if (target.closest('[data-db-advanced-help]')) {
        window.alert(kind === 'monster'
          ? 'Search syntax examples:\nlevel:20-40  has:spell  damage:fire  affinity:ice=vulnerable  official:true  source:natural  rank:Champion  species:Undead  style:Controller\n\nMix these with ordinary words, then press Enter or Apply syntax.'
          : 'Search syntax examples:\ncost:100-2000  martial:true  has:material  damage:fire  category:sword  official:false  source:techno  type:Weapon\n\nMix these with ordinary words, then press Enter or Apply syntax.')
      }
    }

    apply()
    const observer = new MutationObserver(() => requestAnimationFrame(apply))
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('keydown', onKey)
    document.addEventListener('click', onClick)
    return () => {
      observer.disconnect()
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('click', onClick)
    }
  }, [])
  return null
}
