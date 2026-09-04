import { officialWeapons } from './officialData'
import { officialCoreRareWeapons } from './officialCoreRareWeapons'
import { officialOtherItems } from './officialOtherItems'
import { officialMonsters } from './officialMonsters'

function mergeOfficial<T extends { id: string }>(key: string, official: T[]) {
  try {
    const existing = JSON.parse(localStorage.getItem(key) || '[]') as T[]
    const officialIds = new Set(official.map(entry => entry.id))
    const userEntries = existing.filter(entry => !officialIds.has(entry.id))
    localStorage.setItem(key, JSON.stringify([...official, ...userEntries]))
  } catch {
    localStorage.setItem(key, JSON.stringify(official))
  }
}

mergeOfficial('fu-items', [...officialWeapons, ...officialCoreRareWeapons, ...officialOtherItems])
mergeOfficial('fu-monsters', officialMonsters)
