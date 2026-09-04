import { useEffect } from 'react'
import './databaseQualityTools.css'

type Kind = 'monster' | 'item'

const VALID_DICE = new Set([6, 8, 10, 12])
const VALID_RANKS = new Set(['Soldier', 'Elite', 'Champion'])
const VALID_SPECIES = new Set(['Beast', 'Construct', 'Demon', 'Elemental', 'Humanoid', 'Monster', 'Plant', 'Undead'])
const VALID_ITEM_TYPES = new Set(['Weapon', 'Armor', 'Shield', 'Accessory'])

function storageKey(kind: Kind) {
  return kind === 'monster' ? 'fu-monsters' : 'fu-items'
}

function loadRecords(kind: Kind): any[] {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(kind)) || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function recordIssues(kind: Kind, record: any): string[] {
  const issues: string[] = []
  if (!record || typeof record !== 'object') return ['Record is not an object']
  if (typeof record.id !== 'string' || !record.id.trim()) issues.push('Missing record ID')
  if (typeof record.name !== 'string' || !record.name.trim()) issues.push('Name is required')

  if (kind === 'monster') {
    if (!Number.isFinite(Number(record.level)) || Number(record.level) < 1 || Number(record.level) > 99) issues.push('Level must be 1–99')
    if (!VALID_RANKS.has(record.rank)) issues.push('Rank is invalid')
    if (!VALID_SPECIES.has(record.species)) issues.push('Species is invalid')
    if (!Number.isFinite(Number(record.hp)) || Number(record.hp) < 1) issues.push('HP must be at least 1')
    if (!Number.isFinite(Number(record.mp)) || Number(record.mp) < 0) issues.push('MP cannot be negative')
    if (!Number.isFinite(Number(record.turnsPerRound ?? 1)) || Number(record.turnsPerRound ?? 1) < 1) issues.push('Turns per round must be at least 1')
    const attrs = record.attributes || {}
    for (const key of ['dex', 'ins', 'mig', 'wlp']) {
      if (!VALID_DICE.has(Number(attrs[key]))) issues.push(`${key.toUpperCase()} must be d6, d8, d10 or d12`)
    }
    if (!Array.isArray(record.attacks)) issues.push('Attacks must be a list')
    if (!Array.isArray(record.skills)) issues.push('Skills must be a list')
    if (!Array.isArray(record.spells)) issues.push('Spells must be a list')
  } else {
    if (!VALID_ITEM_TYPES.has(record.type)) issues.push('Item type is invalid')
    if (!Number.isFinite(Number(record.cost)) || Number(record.cost) < 0) issues.push('Cost cannot be negative')
    if (record.type === 'Weapon') {
      if (typeof record.accuracy !== 'string' || !record.accuracy.trim()) issues.push('Weapon accuracy formula is required')
      if (!Number.isFinite(Number(record.damage))) issues.push('Weapon HR damage bonus is required')
      if (typeof record.damageType !== 'string' || !record.damageType.trim()) issues.push('Weapon damage type is required')
    }
    if ((record.type === 'Armor' || record.type === 'Shield') && record.defense == null) issues.push('Defense is required')
  }
  return issues
}

function kindForSection(section: HTMLElement): Kind | null {
  if (section.querySelector('.monsterCard')) return 'monster'
  if (section.querySelector('.itemCard')) return 'item'
  return null
}

function sourceClass(source: unknown) {
  if (source === 'Official') return 'dbSourceOfficial'
  if (source === 'Custom') return 'dbSourceCustom'
  return 'dbSourceGenerated'
}

function subtypeForItem(record: any) {
  const text = `${record?.category || ''} ${record?.baseItem || ''} ${record?.origin || ''}`.toLowerCase()
  if (text.includes('artifact')) return 'Artifact'
  if (text.includes('weapon module') || text.includes('module')) return 'Weapon Module'
  if (text.includes('inventory')) return 'Inventory Item'
  return ''
}

function clearValidation(modal: HTMLElement) {
  modal.querySelector('.dbValidationBanner')?.remove()
  modal.querySelectorAll('.dbInvalidField').forEach(node => node.classList.remove('dbInvalidField'))
}

function labelControl(modal: HTMLElement, startsWith: string) {
  const labels = Array.from(modal.querySelectorAll<HTMLLabelElement>('label'))
  const label = labels.find(node => (node.textContent || '').trim().toLowerCase().startsWith(startsWith.toLowerCase()))
  return label?.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('input, select, textarea') || null
}

function numericValue(control: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null) {
  return control ? Number(control.value) : NaN
}

function validateModal(modal: HTMLElement): { messages: string[]; first?: HTMLElement } {
  const messages: string[] = []
  let first: HTMLElement | undefined
  const mark = (control: HTMLElement | null, message: string) => {
    messages.push(message)
    if (control) {
      control.classList.add('dbInvalidField')
      first ||= control
    }
  }

  const name = labelControl(modal, 'Name')
  if (!name?.value.trim()) mark(name, 'Name is required.')

  const isMonster = !!modal.querySelector('.dbAffinityGrid')
  if (isMonster) {
    const level = labelControl(modal, 'Level')
    const hp = labelControl(modal, 'HP')
    const mp = labelControl(modal, 'MP')
    const turns = labelControl(modal, 'Turns / Round')
    if (!Number.isFinite(numericValue(level)) || numericValue(level) < 1 || numericValue(level) > 99) mark(level, 'Level must be between 1 and 99.')
    if (!Number.isFinite(numericValue(hp)) || numericValue(hp) < 1) mark(hp, 'HP must be at least 1.')
    if (!Number.isFinite(numericValue(mp)) || numericValue(mp) < 0) mark(mp, 'MP cannot be negative.')
    if (!Number.isFinite(numericValue(turns)) || numericValue(turns) < 1) mark(turns, 'Turns per round must be at least 1.')

    modal.querySelectorAll<HTMLElement>('.dbArrayRow').forEach(row => {
      const nameInput = row.querySelector<HTMLInputElement>('input[placeholder="Attack name"]')
      const formulaInput = row.querySelector<HTMLInputElement>('input[placeholder="DEX + MIG"]')
      if (nameInput && !nameInput.value.trim()) mark(nameInput, 'Every attack needs a name.')
      if (formulaInput && !formulaInput.value.trim()) mark(formulaInput, 'Every attack needs an accuracy formula.')
    })
  } else {
    const cost = labelControl(modal, 'Cost (zenit)')
    const type = labelControl(modal, 'Type')
    if (!Number.isFinite(numericValue(cost)) || numericValue(cost) < 0) mark(cost, 'Cost cannot be negative.')
    if (type?.value === 'Weapon') {
      const accuracy = labelControl(modal, 'Accuracy Formula')
      const damage = labelControl(modal, 'HR Damage Bonus')
      if (!accuracy?.value.trim()) mark(accuracy, 'Weapons need an accuracy formula.')
      if (!Number.isFinite(numericValue(damage))) mark(damage, 'Weapons need an HR damage bonus.')
    }
    if (type?.value === 'Armor' || type?.value === 'Shield') {
      const defense = labelControl(modal, 'Defense')
      if (!defense?.value.trim()) mark(defense, 'Armor and shields need a Defense value.')
    }
  }

  return { messages, first }
}

function showValidation(modal: HTMLElement, messages: string[]) {
  let banner = modal.querySelector<HTMLElement>('.dbValidationBanner')
  if (!banner) {
    banner = document.createElement('div')
    banner.className = 'dbValidationBanner'
    const header = modal.querySelector('.dbModalHeader')
    header?.insertAdjacentElement('afterend', banner)
  }
  banner.innerHTML = `<strong>Fix these fields before saving:</strong><ul>${messages.map(message => `<li>${message}</li>`).join('')}</ul>`
}

export default function DatabaseQualityTools() {
  useEffect(() => {
    let scheduled = false

    const apply = () => {
      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        if (!section.querySelector('.databaseSummary')) return
        const kind = kindForSection(section)
        if (!kind) return
        const records = loadRecords(kind)
        const byId = new Map(records.map(record => [record.id, record]))
        const customIssues = records
          .filter(record => record?.source !== 'Official')
          .map(record => ({ record, issues: recordIssues(kind, record) }))
          .filter(entry => entry.issues.length)

        let bar = section.querySelector<HTMLElement>('.dbQualityBar')
        if (!bar) {
          bar = document.createElement('div')
          bar.className = 'dbQualityBar'
          const summary = section.querySelector('.databaseSummary')
          summary?.insertAdjacentElement('afterend', bar)
        }
        if (bar) {
          const signature = `${customIssues.length}|${records.filter(record => record?.source !== 'Official').length}`
          if (bar.dataset.signature !== signature) {
            bar.dataset.signature = signature
            bar.classList.toggle('hasIssues', customIssues.length > 0)
            bar.innerHTML = customIssues.length
              ? `<strong>Data health:</strong> ${customIssues.length} custom ${kind === 'monster' ? 'monster' : 'item'}${customIssues.length === 1 ? '' : 's'} need review.`
              : `<strong>Data health:</strong> all custom ${kind === 'monster' ? 'monsters' : 'items'} pass basic validation.`
          }
        }

        section.querySelectorAll<HTMLElement>('.monsterCard, .itemCard').forEach(card => {
          const id = card.dataset.dbRecordId
          if (!id) return
          const record = byId.get(id)
          if (!record) return
          card.classList.remove('dbSourceOfficial', 'dbSourceCustom', 'dbSourceGenerated', 'dbRecordNeedsReview')
          card.classList.add(sourceClass(record.source))

          const issues = record.source === 'Official' ? [] : recordIssues(kind, record)
          card.classList.toggle('dbRecordNeedsReview', issues.length > 0)
          const title = card.querySelector<HTMLElement>('.cardTitle')
          let warning = title?.querySelector<HTMLElement>('.dbRecordWarning')
          if (issues.length && title) {
            if (!warning) {
              warning = document.createElement('span')
              warning.className = 'dbRecordWarning'
              title.appendChild(warning)
            }
            warning.textContent = 'Needs review'
            warning.title = issues.join('\n')
          } else {
            warning?.remove()
          }

          if (kind === 'item') {
            const subtype = subtypeForItem(record)
            const meta = card.querySelector<HTMLElement>('.itemMeta')
            let badge = meta?.querySelector<HTMLElement>('.dbSubtypeBadge')
            if (subtype && meta) {
              if (!badge) {
                badge = document.createElement('span')
                badge.className = 'dbSubtypeBadge'
                meta.appendChild(badge)
              }
              badge.textContent = subtype
            } else {
              badge?.remove()
            }
          }
        })
      })
    }

    const schedule = () => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        apply()
      })
    }

    const onClickCapture = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('.dbModalActions button')
      if (!button) return
      const text = button.textContent?.trim() || ''
      if (text !== 'Duplicate' && !button.classList.contains('primary')) return
      const modal = button.closest<HTMLElement>('.dbModal')
      if (!modal) return
      clearValidation(modal)
      const result = validateModal(modal)
      if (!result.messages.length) return
      event.preventDefault()
      event.stopPropagation()
      event.stopImmediatePropagation()
      showValidation(modal, result.messages)
      result.first?.focus()
      result.first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }

    const onInput = (event: Event) => {
      const modal = (event.target as HTMLElement).closest<HTMLElement>('.dbModal')
      if (modal) clearValidation(modal)
    }

    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return
      const target = event.target as HTMLElement
      if (target.matches('input, textarea, select, [contenteditable="true"]')) return
      const activeTab = Array.from(document.querySelectorAll<HTMLButtonElement>('nav button')).find(button => button.classList.contains('active'))?.textContent?.trim()
      if (activeTab !== 'Monster Database' && activeTab !== 'Item Database') return
      const placeholder = activeTab === 'Monster Database' ? 'Search monsters' : 'Search items'
      const search = Array.from(document.querySelectorAll<HTMLInputElement>('main input')).find(input => input.placeholder.startsWith(placeholder))
      if (!search) return
      event.preventDefault()
      search.focus()
      search.select()
    }

    apply()
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-db-record-id'] })
    document.addEventListener('click', onClickCapture, true)
    document.addEventListener('input', onInput, true)
    document.addEventListener('change', onInput, true)
    window.addEventListener('keydown', onKey)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClickCapture, true)
      document.removeEventListener('input', onInput, true)
      document.removeEventListener('change', onInput, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return null
}
