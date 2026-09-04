import { useEffect } from 'react'
import './databasePresetTools.css'

type Kind = 'monster' | 'item'
type Preset = {
  id: string
  name: string
  search: string
  selects: string[]
  viewMode: 'full' | 'compact'
  favoritesOnly: boolean
}

const KEY = 'fu-db-saved-views'

function readPresets(): Record<Kind, Preset[]> {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || '{}')
    return {
      monster: Array.isArray(value?.monster) ? value.monster : [],
      item: Array.isArray(value?.item) ? value.item : [],
    }
  } catch {
    return { monster: [], item: [] }
  }
}

function writePresets(value: Record<Kind, Preset[]>) {
  localStorage.setItem(KEY, JSON.stringify(value))
}

function kindForSection(section: HTMLElement): Kind | null {
  if (section.querySelector('[data-db-record-kind="monster"]') || section.querySelector('input[placeholder^="Search monsters"]')) return 'monster'
  if (section.querySelector('[data-db-record-kind="item"]') || section.querySelector('input[placeholder^="Search items"]')) return 'item'
  return null
}

function setInputValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  setter?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function setSelectValue(select: HTMLSelectElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set
  setter?.call(select, value)
  select.dispatchEvent(new Event('change', { bubbles: true }))
}

function snapshot(section: HTMLElement, name: string): Preset {
  const toolbar = section.querySelector<HTMLElement>('.toolbar')
  const search = toolbar?.querySelector<HTMLInputElement>('input')?.value || ''
  const selects = Array.from(toolbar?.querySelectorAll<HTMLSelectElement>('select') || []).map(select => select.value)
  return {
    id: `view-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    search,
    selects,
    viewMode: section.dataset.dbViewMode === 'compact' ? 'compact' : 'full',
    favoritesOnly: section.classList.contains('dbFavoritesOnly'),
  }
}

function applyPreset(section: HTMLElement, kind: Kind, preset: Preset) {
  const toolbar = section.querySelector<HTMLElement>('.toolbar')
  const input = toolbar?.querySelector<HTMLInputElement>('input')
  if (input) setInputValue(input, preset.search || '')
  Array.from(toolbar?.querySelectorAll<HTMLSelectElement>('select') || []).forEach((select, index) => {
    const value = preset.selects[index]
    if (value != null && Array.from(select.options).some(option => option.value === value)) setSelectValue(select, value)
  })

  const viewButton = section.querySelector<HTMLButtonElement>(`[data-db-view="${preset.viewMode}"]`)
  if (viewButton && section.dataset.dbViewMode !== preset.viewMode) viewButton.click()
  const currentlyFavoritesOnly = section.classList.contains('dbFavoritesOnly')
  if (currentlyFavoritesOnly !== !!preset.favoritesOnly) section.querySelector<HTMLButtonElement>('[data-db-favorites-only]')?.click()

  const pagination = section.querySelector<HTMLElement>('.dbPaginationTools')
  pagination?.querySelector<HTMLButtonElement>('[data-db-page-first]')?.click()

  localStorage.setItem(`fu-db-last-view-${kind}`, JSON.stringify(preset.id))
}

function renderBar(bar: HTMLElement, kind: Kind, presets: Preset[]) {
  const selected = bar.querySelector<HTMLSelectElement>('[data-db-preset-select]')?.value || ''
  const signature = `${kind}|${presets.map(preset => `${preset.id}:${preset.name}`).join('|')}`
  if (bar.dataset.signature === signature) return
  bar.dataset.signature = signature
  bar.innerHTML = `
    <span class="dbPresetLabel">Saved views</span>
    <select data-db-preset-select aria-label="Saved database views">
      <option value="">Choose a view…</option>
      ${presets.map(preset => `<option value="${preset.id.replace(/"/g, '&quot;')}">${preset.name.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</option>`).join('')}
    </select>
    <button type="button" data-db-preset-apply>Apply</button>
    <button type="button" data-db-preset-save>Save current</button>
    <button type="button" data-db-preset-delete>Delete</button>`
  const next = bar.querySelector<HTMLSelectElement>('[data-db-preset-select]')
  if (next && presets.some(preset => preset.id === selected)) next.value = selected
}

export default function DatabasePresetTools() {
  useEffect(() => {
    const apply = () => {
      const all = readPresets()
      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        if (!section.querySelector('.databaseSummary')) return
        const kind = kindForSection(section)
        if (!kind) return
        let bar = section.querySelector<HTMLElement>('.dbPresetTools')
        if (!bar) {
          bar = document.createElement('div')
          bar.className = 'dbPresetTools'
          bar.dataset.dbPresetKind = kind
          const quick = section.querySelector('.dbQuickActions')
          const browse = section.querySelector('.dbBrowseBar')
          ;(quick || browse || section.querySelector('.databaseSummary'))?.insertAdjacentElement('afterend', bar)
        }
        renderBar(bar, kind, all[kind])
      })
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const bar = target.closest<HTMLElement>('.dbPresetTools')
      if (!bar) return
      const section = bar.closest<HTMLElement>('section')
      const kind = bar.dataset.dbPresetKind as Kind | undefined
      if (!section || !kind) return
      const all = readPresets()
      const select = bar.querySelector<HTMLSelectElement>('[data-db-preset-select]')

      if (target.closest('[data-db-preset-save]')) {
        const proposed = window.prompt('Name this saved database view:')?.trim()
        if (!proposed) return
        all[kind] = [...all[kind], snapshot(section, proposed)]
        writePresets(all)
        bar.dataset.signature = ''
        apply()
        return
      }

      if (target.closest('[data-db-preset-apply]')) {
        const preset = all[kind].find(entry => entry.id === select?.value)
        if (preset) applyPreset(section, kind, preset)
        return
      }

      if (target.closest('[data-db-preset-delete]')) {
        const preset = all[kind].find(entry => entry.id === select?.value)
        if (!preset) return
        if (!window.confirm(`Delete saved view “${preset.name}”?`)) return
        all[kind] = all[kind].filter(entry => entry.id !== preset.id)
        writePresets(all)
        bar.dataset.signature = ''
        apply()
      }
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
