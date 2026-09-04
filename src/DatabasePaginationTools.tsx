import { useEffect } from 'react'
import './databasePaginationTools.css'

type Kind = 'monster' | 'item'
type PageSize = 12 | 24 | 48 | 'all'

const PAGE_KEY = 'fu-db-pagination'

type PaginationState = Record<Kind, { page: number; pageSize: PageSize }>

function readState(): PaginationState {
  try {
    const saved = JSON.parse(localStorage.getItem(PAGE_KEY) || '{}')
    return {
      monster: { page: Number(saved.monster?.page) || 1, pageSize: saved.monster?.pageSize || 24 },
      item: { page: Number(saved.item?.page) || 1, pageSize: saved.item?.pageSize || 24 },
    }
  } catch {
    return { monster: { page: 1, pageSize: 24 }, item: { page: 1, pageSize: 24 } }
  }
}

function writeState(state: PaginationState) {
  localStorage.setItem(PAGE_KEY, JSON.stringify(state))
}

function databaseKind(section: HTMLElement): Kind | null {
  if (section.querySelector('.monsterCard')) return 'monster'
  if (section.querySelector('.itemCard')) return 'item'
  return null
}

function eligibleCards(section: HTMLElement) {
  return Array.from(section.querySelectorAll<HTMLElement>('.monsterCard, .itemCard'))
    .filter(card => !card.classList.contains('dbHiddenByFavorite'))
}

function cardSignature(kind: Kind, card: HTMLElement) {
  if (card.dataset.dbRecordId) return card.dataset.dbRecordId
  const name = card.querySelector('h2')?.textContent?.trim() || ''
  const source = card.querySelector('.source')?.textContent?.trim() || ''
  const detail = kind === 'monster'
    ? card.querySelector('.muted')?.textContent?.trim() || ''
    : card.querySelector('.itemMeta')?.textContent?.trim() || ''
  return `${kind}|${name}|${source}|${detail}`
}

export default function DatabasePaginationTools() {
  useEffect(() => {
    let applying = false
    let scheduled = false
    let lastSignatures: Record<Kind, string> = { monster: '', item: '' }

    const apply = (resetChanged = false) => {
      if (applying) return
      applying = true
      const state = readState()

      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        if (!section.querySelector('.databaseSummary')) return
        const kind = databaseKind(section)
        if (!kind) return

        const cards = eligibleCards(section)
        const signature = cards.map(card => cardSignature(kind, card)).join('|')
        if (resetChanged && lastSignatures[kind] && signature !== lastSignatures[kind]) state[kind].page = 1
        lastSignatures[kind] = signature

        const pageSize = state[kind].pageSize
        const totalPages = pageSize === 'all' ? 1 : Math.max(1, Math.ceil(cards.length / pageSize))
        state[kind].page = Math.min(Math.max(1, state[kind].page), totalPages)
        const page = state[kind].page
        const start = pageSize === 'all' ? 0 : (page - 1) * pageSize
        const end = pageSize === 'all' ? cards.length : start + pageSize

        section.querySelectorAll<HTMLElement>('.monsterCard, .itemCard').forEach(card => card.classList.remove('dbHiddenByPage'))
        cards.forEach((card, index) => card.classList.toggle('dbHiddenByPage', index < start || index >= end))

        let bar = section.querySelector<HTMLElement>('.dbPaginationBar')
        if (!bar) {
          bar = document.createElement('div')
          bar.className = 'dbPaginationBar'
          bar.dataset.dbPaginationKind = kind
          const grid = section.querySelector('.grid')
          grid?.insertAdjacentElement('afterend', bar)
        }
        if (!bar) return

        const showingStart = cards.length === 0 ? 0 : start + 1
        const showingEnd = Math.min(end, cards.length)
        const html = `
          <div class="dbPaginationInfo">Showing <b>${showingStart}-${showingEnd}</b> of <b>${cards.length}</b></div>
          <div class="dbPaginationControls">
            <label>Per page
              <select data-db-page-size>
                <option value="12" ${pageSize === 12 ? 'selected' : ''}>12</option>
                <option value="24" ${pageSize === 24 ? 'selected' : ''}>24</option>
                <option value="48" ${pageSize === 48 ? 'selected' : ''}>48</option>
                <option value="all" ${pageSize === 'all' ? 'selected' : ''}>All</option>
              </select>
            </label>
            <button type="button" data-db-page="prev" ${page <= 1 ? 'disabled' : ''}>Previous</button>
            <span>Page <b>${page}</b> of <b>${totalPages}</b></span>
            <button type="button" data-db-page="next" ${page >= totalPages ? 'disabled' : ''}>Next</button>
          </div>`
        if (bar.dataset.dbPaginationHtml !== html) {
          bar.innerHTML = html
          bar.dataset.dbPaginationHtml = html
        }
      })

      writeState(state)
      applying = false
    }

    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-db-page]')
      if (!button) return
      const bar = button.closest<HTMLElement>('[data-db-pagination-kind]')
      const kind = bar?.dataset.dbPaginationKind as Kind | undefined
      if (!kind) return
      const state = readState()
      state[kind].page += button.dataset.dbPage === 'next' ? 1 : -1
      writeState(state)
      apply(false)
      bar?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }

    const onChange = (event: Event) => {
      const select = (event.target as HTMLElement).closest<HTMLSelectElement>('[data-db-page-size]')
      if (!select) return
      const bar = select.closest<HTMLElement>('[data-db-pagination-kind]')
      const kind = bar?.dataset.dbPaginationKind as Kind | undefined
      if (!kind) return
      const state = readState()
      state[kind].pageSize = select.value === 'all' ? 'all' : Number(select.value) as 12 | 24 | 48
      state[kind].page = 1
      writeState(state)
      apply(false)
    }

    apply(false)
    const observer = new MutationObserver(() => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        apply(true)
      })
    })
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] })
    document.addEventListener('click', onClick)
    document.addEventListener('change', onChange)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClick)
      document.removeEventListener('change', onChange)
    }
  }, [])

  return null
}
