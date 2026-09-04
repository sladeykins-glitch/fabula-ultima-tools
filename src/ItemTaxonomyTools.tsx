import { useEffect } from 'react'
import './itemTaxonomyTools.css'

type CatalogType = 'All' | 'Weapon' | 'Armor' | 'Shield' | 'Accessory' | 'Artifact' | 'Inventory Item' | 'Weapon Module' | 'Other'
const KEY = 'fu-item-catalog-type'

function records(): any[] {
  try {
    const value = JSON.parse(localStorage.getItem('fu-items') || '[]')
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

function catalogType(item: any): Exclude<CatalogType,'All'> {
  const text = `${item?.category || ''} ${item?.origin || ''} ${(item?.breakdown || []).join(' ')} ${item?.name || ''}`.toLowerCase()
  if (/artifact|relic artifact|legendary artifact/.test(text)) return 'Artifact'
  if (/weapon module|module /.test(text) || String(item?.category || '').toLowerCase().includes('module')) return 'Weapon Module'
  if (/inventory item|consumable|remedy|potion|tonic|bomb|shard|symbol|utility item/.test(text)) return 'Inventory Item'
  if (['Weapon','Armor','Shield','Accessory'].includes(item?.type)) return item.type
  return 'Other'
}

function readType(): CatalogType {
  const value = localStorage.getItem(KEY)
  const parsed = value ? JSON.parse(value) : 'All'
  return ['All','Weapon','Armor','Shield','Accessory','Artifact','Inventory Item','Weapon Module','Other'].includes(parsed) ? parsed : 'All'
}

function writeType(value: CatalogType) { localStorage.setItem(KEY, JSON.stringify(value)) }

export default function ItemTaxonomyTools() {
  useEffect(() => {
    const apply = () => {
      const section = Array.from(document.querySelectorAll<HTMLElement>('main > section')).find(candidate => candidate.querySelector('input[placeholder^="Search items"]'))
      if (!section || !section.querySelector('.databaseSummary')) return
      const selected = readType()
      const byId = new Map(records().map(item => [item?.id, item]))
      section.querySelectorAll<HTMLElement>('.itemCard').forEach(card => {
        const item = byId.get(card.dataset.dbRecordId)
        if (!item) return
        const type = catalogType(item)
        card.dataset.dbCatalogType = type
        card.classList.toggle('dbHiddenByTaxonomy', selected !== 'All' && type !== selected)
        const meta = card.querySelector<HTMLElement>('.itemMeta')
        if (meta && !meta.querySelector('.dbCatalogBadge')) {
          const badge = document.createElement('span')
          badge.className = 'dbCatalogBadge'
          badge.textContent = type
          meta.appendChild(badge)
        } else if (meta) {
          const badge = meta.querySelector<HTMLElement>('.dbCatalogBadge')
          if (badge) badge.textContent = type
        }
      })

      let bar = section.querySelector<HTMLElement>('.dbTaxonomyBar')
      if (!bar) {
        bar = document.createElement('div')
        bar.className = 'dbTaxonomyBar'
        const advanced = section.querySelector('.dbAdvancedSearchBar')
        const toolbar = section.querySelector('.toolbar')
        ;(advanced || toolbar)?.insertAdjacentElement('afterend', bar)
      }
      if (!bar) return
      const types: CatalogType[] = ['All','Weapon','Armor','Shield','Accessory','Artifact','Inventory Item','Weapon Module','Other']
      const html = `<label>Catalog type <select data-db-catalog-type>${types.map(type => `<option ${type === selected ? 'selected' : ''}>${type}</option>`).join('')}</select></label><span>Artifacts, modules and inventory items are treated as distinct catalog categories without breaking the generator's core equipment types.</span>`
      if (bar.dataset.signature !== html) { bar.innerHTML = html; bar.dataset.signature = html }
    }

    const onChange = (event: Event) => {
      const select = (event.target as HTMLElement).closest<HTMLSelectElement>('[data-db-catalog-type]')
      if (!select) return
      writeType(select.value as CatalogType)
      apply()
    }

    apply()
    const observer = new MutationObserver(() => requestAnimationFrame(apply))
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('change', onChange)
    return () => { observer.disconnect(); document.removeEventListener('change', onChange) }
  }, [])
  return null
}
