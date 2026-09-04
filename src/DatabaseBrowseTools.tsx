import { useEffect } from 'react'
import './databaseBrowseTools.css'

type Kind = 'monster' | 'item'
type ViewMode = 'full' | 'compact'

const FAVORITES_KEY = 'fu-db-favorites'
const VIEW_KEY = 'fu-db-view-modes'
const ONLY_KEY = 'fu-db-favorites-only'

function readJson<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function readFavorites(): Record<Kind, string[]> {
  return readJson(FAVORITES_KEY, { monster: [], item: [] })
}

function writeFavorites(value: Record<Kind, string[]>) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(value))
}

function readViews(): Record<Kind, ViewMode> {
  return readJson(VIEW_KEY, { monster: 'full', item: 'full' })
}

function writeViews(value: Record<Kind, ViewMode>) {
  localStorage.setItem(VIEW_KEY, JSON.stringify(value))
}

function readOnly(): Record<Kind, boolean> {
  return readJson(ONLY_KEY, { monster: false, item: false })
}

function writeOnly(value: Record<Kind, boolean>) {
  localStorage.setItem(ONLY_KEY, JSON.stringify(value))
}

function cardName(card: HTMLElement) {
  return card.querySelector('h2')?.textContent?.trim() || ''
}

function cardKey(kind: Kind, card: HTMLElement) {
  const explicit = card.dataset.dbRecordId
  if (explicit) return explicit
  const name = cardName(card)
  const source = card.querySelector('.source')?.textContent?.trim() || ''
  const detail = kind === 'monster'
    ? card.querySelector('.muted')?.textContent?.trim() || ''
    : card.querySelector('.itemMeta')?.textContent?.trim() || ''
  return `${kind}|${name}|${source}|${detail}`
}

function databaseKind(section: HTMLElement): Kind | null {
  if (section.querySelector('.monsterCard')) return 'monster'
  if (section.querySelector('.itemCard')) return 'item'
  return null
}

function updateBrowseBar(bar: HTMLElement, kind: Kind, view: ViewMode, favoriteCount: number, favoritesOnly: boolean) {
  const signature = `${kind}|${view}|${favoriteCount}|${favoritesOnly}`
  if (bar.dataset.dbBrowseSignature === signature) return
  bar.dataset.dbBrowseSignature = signature
  bar.innerHTML = `
    <div class="dbBrowseLeft">
      <button type="button" data-db-view="full" class="${view === 'full' ? 'active' : ''}">Full cards</button>
      <button type="button" data-db-view="compact" class="${view === 'compact' ? 'active' : ''}">Compact</button>
    </div>
    <div class="dbBrowseRight">
      <span>${favoriteCount} favorite${favoriteCount === 1 ? '' : 's'}</span>
      <button type="button" data-db-favorites-only class="${favoritesOnly ? 'active' : ''}">${favoritesOnly ? 'Showing favorites' : 'Favorites only'}</button>
    </div>`
}

export default function DatabaseBrowseTools() {
  useEffect(() => {
    const apply = () => {
      const favorites = readFavorites()
      const views = readViews()
      const favoritesOnly = readOnly()
      let migrated = false

      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        if (!section.querySelector('.databaseSummary')) return
        const kind = databaseKind(section)
        if (!kind) return

        section.dataset.dbViewMode = views[kind]
        section.dataset.dbBrowseKind = kind
        section.classList.toggle('dbFavoritesOnly', favoritesOnly[kind])

        let bar = section.querySelector<HTMLElement>('.dbBrowseBar')
        if (!bar) {
          bar = document.createElement('div')
          bar.className = 'dbBrowseBar'
          bar.dataset.dbBrowseKind = kind
          const summary = section.querySelector('.databaseSummary')
          summary?.insertAdjacentElement('afterend', bar)
        }

        section.querySelectorAll<HTMLElement>('.monsterCard, .itemCard').forEach(card => {
          const name = cardName(card)
          if (!name) return
          const key = cardKey(kind, card)
          const legacyFavorite = favorites[kind].includes(name)
          if (legacyFavorite && !favorites[kind].includes(key)) {
            favorites[kind] = [...favorites[kind].filter(entry => entry !== name), key]
            migrated = true
          }
          const isFavorite = favorites[kind].includes(key)
          card.classList.toggle('dbFavoriteCard', isFavorite)
          card.classList.toggle('dbHiddenByFavorite', favoritesOnly[kind] && !isFavorite)

          const title = card.querySelector<HTMLElement>('.cardTitle')
          if (!title) return
          let star = title.querySelector<HTMLButtonElement>('.dbFavoriteButton')
          if (!star) {
            star = document.createElement('button')
            star.type = 'button'
            star.className = 'dbFavoriteButton'
            star.dataset.dbFavorite = kind
            title.appendChild(star)
          }
          star.dataset.dbFavoriteKey = key
          star.dataset.dbFavoriteName = name
          star.classList.toggle('active', isFavorite)
          star.textContent = isFavorite ? '★' : '☆'
          star.title = isFavorite ? 'Remove from favorites' : 'Add to favorites'
          star.setAttribute('aria-label', star.title)
        })

        updateBrowseBar(bar, kind, views[kind], favorites[kind].length, favoritesOnly[kind])
      })

      if (migrated) writeFavorites(favorites)
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      const favoriteButton = target.closest<HTMLButtonElement>('[data-db-favorite]')
      if (favoriteButton) {
        event.preventDefault()
        event.stopPropagation()
        const kind = favoriteButton.dataset.dbFavorite as Kind
        const key = favoriteButton.dataset.dbFavoriteKey || ''
        const legacyName = favoriteButton.dataset.dbFavoriteName || ''
        if (!key) return
        const favorites = readFavorites()
        const active = favorites[kind].includes(key) || (legacyName && favorites[kind].includes(legacyName))
        favorites[kind] = favorites[kind].filter(entry => entry !== key && entry !== legacyName)
        if (!active) favorites[kind] = [...favorites[kind], key]
        writeFavorites(favorites)
        apply()
        return
      }

      const viewButton = target.closest<HTMLButtonElement>('[data-db-view]')
      if (viewButton) {
        event.preventDefault()
        event.stopPropagation()
        const bar = viewButton.closest<HTMLElement>('[data-db-browse-kind]')
        const section = viewButton.closest<HTMLElement>('section')
        const kind = bar?.dataset.dbBrowseKind as Kind | undefined
        if (!kind || !section) return
        const view: ViewMode = viewButton.dataset.dbView === 'compact' ? 'compact' : 'full'
        const views = readViews()
        views[kind] = view
        writeViews(views)
        section.dataset.dbViewMode = view
        bar!.dataset.dbBrowseSignature = ''
        apply()
        return
      }

      const favoritesOnlyButton = target.closest<HTMLButtonElement>('[data-db-favorites-only]')
      if (favoritesOnlyButton) {
        event.preventDefault()
        event.stopPropagation()
        const bar = favoritesOnlyButton.closest<HTMLElement>('[data-db-browse-kind]')
        const kind = bar?.dataset.dbBrowseKind as Kind | undefined
        if (!kind) return
        const only = readOnly()
        only[kind] = !only[kind]
        writeOnly(only)
        if (bar) bar.dataset.dbBrowseSignature = ''
        apply()
      }
    }

    apply()
    let scheduled = false
    const observer = new MutationObserver(() => {
      if (scheduled) return
      scheduled = true
      requestAnimationFrame(() => {
        scheduled = false
        apply()
      })
    })
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('click', onClick)

    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}
