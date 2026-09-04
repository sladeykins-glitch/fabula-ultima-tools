const FAVORITES_KEY = 'fu-db-favorites'
const FAVORITES_ONLY_KEY = 'fu-db-favorites-only'
const SELECTION_KEY = 'fu-db-selection'

function parse(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw == null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string') : []
}

/**
 * Normalizes preference formats written by older database-tool versions.
 * This intentionally never touches fu-monsters or fu-items.
 */
export function migrateInterfaceStorage() {
  const favorites = parse(FAVORITES_KEY)
  if (!Array.isArray(favorites)) {
    const legacy = favorites && typeof favorites === 'object' ? favorites as Record<string, unknown> : {}
    const merged = [...new Set([...strings(legacy.monster), ...strings(legacy.item), ...strings(legacy.favorites)])]
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(merged))
  }

  const favoritesOnly = parse(FAVORITES_ONLY_KEY)
  if (!favoritesOnly || Array.isArray(favoritesOnly) || typeof favoritesOnly !== 'object') {
    localStorage.setItem(FAVORITES_ONLY_KEY, JSON.stringify({ monster:false, item:false }))
  } else {
    const value = favoritesOnly as Record<string, unknown>
    localStorage.setItem(FAVORITES_ONLY_KEY, JSON.stringify({ monster:value.monster === true, item:value.item === true }))
  }

  const selection = parse(SELECTION_KEY)
  if (!selection || Array.isArray(selection) || typeof selection !== 'object') {
    localStorage.setItem(SELECTION_KEY, JSON.stringify({ monster:[], item:[] }))
  } else {
    const value = selection as Record<string, unknown>
    localStorage.setItem(SELECTION_KEY, JSON.stringify({ monster:strings(value.monster), item:strings(value.item) }))
  }
}
