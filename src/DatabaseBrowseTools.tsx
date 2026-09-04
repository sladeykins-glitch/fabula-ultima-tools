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

function databaseKind(section: HTMLElement): Kind | null {
  if (section.querySelector('.monsterCard')) return 'monster'
  if (section.querySelector('.itemCard')) return 'item'
  return null
}

export default function DatabaseBrowseTools() {
  useEffect(() => {
    const apply = () => {
      const favorites = readFavorites()
      const views = readViews()
      const favoritesOnly = readOnly()

      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        if (!section.querySelector('.databaseSummary')) return
        const kind = databaseKind(section)
        if (!kind) return

        section.classList.toggle('dbCompactMode', views[kind] === 'compact')
        section.classList.toggle('dbFavoritesOnly', favoritesOnly[kind])

        let bar = section.querySelector<HTMLElement>('.dbBrowseBar')
        if (!bar) {
          bar = document.createElement('div')
          bar.className = 'dbBrowseBar'
          bar.dataset.dbBrowseKind = kind
          const summary = section.querySelector('.databaseSummary')
          summary?.insertAdjacentElement('afterend', bar)
        }

        const favoriteCount = favorites[kind].length
        bar.innerHTML = `
          <div class="dbBrowseLeft">
            <button type="button" data-db-view="full" class="${views[kind] === 'full' ? 'active' : ''}">Full cards</button>
            <button type="button" data-db-view="compact" class="${views[kind] === 'compact' ? 'active' : ''}">Compact</button>
          </div>
          <div class="dbBrowseRight">
            <span>${favoriteCount} favorite${favoriteCount === 1 ? '' : 's'}</span>
            <button type="button" data-db-favorites-only class="${favoritesOnly[kind] ? 'active' : ''}">${favoritesOnly[kind] ? 'Showing favorites' : 'Favorites only'}</button>
          </div>`

        section.querySelectorAll<HTMLElement>('.monsterCard, .itemCard').forEach(card => {
          const name = cardName(card)
          if (!name) return
          const isFavorite = favorites[kind].includes(name)
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
          star.dataset.dbFavoriteName = name
          star.classList.toggle('active', isFavorite)
          star.textContent = isFavorite ? '★' : '☆'
          star.title = isFavorite ? 'Remove from favorites' : 'Add to favorites'
          star.setAttribute('aria-label', star.title)
        })
      })
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      const favoriteButton = target.closest<HTMLButtonElement>('[data-db-favorite]')
      if (favoriteButton) {
        event.preventDefault()
        event.stopPropagation()
        const kind = favoriteButton.dataset.dbFavorite as Kind
        const name = favoriteButton.dataset.dbFavoriteName || ''
        if (!name) return
        const favorites = readFavorites()
        favorites[kind] = favorites[kind].includes(name)
          ? favorites[kind].filter(entry => entry !== name)
          : [...favorites[kind], name]
        writeFavorites(favorites)
        apply()
        return
      }

      const viewButton = target.closest<HTMLButtonElement>('[data-db-view]')
      if (viewButton) {
        const bar = viewButton.closest<HTMLElement>('[data-db-browse-kind]')
        const kind = bar?.dataset.dbBrowseKind as Kind | undefined
        if (!kind) return
        const views = readViews()
        views[kind] = viewButton.dataset.dbView === 'compact' ? 'compact' : 'full'
        writeViews(views)
        apply()
        return
      }

      const favoritesOnlyButton = target.closest<HTMLButtonElement>('[data-db-favorites-only]')
      if (favoritesOnlyButton) {
        const bar = favoritesOnlyButton.closest<HTMLElement>('[data-db-browse-kind]')
        const kind = bar?.dataset.dbBrowseKind as Kind | undefined
        if (!kind) return
        const only = readOnly()
        only[kind] = !only[kind]
        writeOnly(only)
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
