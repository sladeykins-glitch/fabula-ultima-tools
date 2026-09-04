import { officialWeapons } from './officialData'
import { officialCoreRareWeapons } from './officialCoreRareWeapons'
import { officialAtlasRareWeapons } from './officialAtlasRareWeapons'
import { officialOtherItems } from './officialOtherItems'
import { officialMonsters } from './officialMonsters'
import { officialCoreBestiaryRemaining } from './officialCoreBestiaryRemaining'
import { officialHighFantasyMonsters } from './officialHighFantasyMonsters'
import { officialNaturalFantasyMonsters } from './officialNaturalFantasyMonsters'
import { officialTechnoFantasyMonsters } from './officialTechnoFantasyMonsters'
import { officialTechnoFantasySupplement } from './officialTechnoFantasySupplement'

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

mergeOfficial('fu-items', [...officialWeapons, ...officialCoreRareWeapons, ...officialAtlasRareWeapons, ...officialOtherItems])
mergeOfficial('fu-monsters', [...officialMonsters, ...officialCoreBestiaryRemaining, ...officialHighFantasyMonsters, ...officialNaturalFantasyMonsters, ...officialTechnoFantasyMonsters, ...officialTechnoFantasySupplement])
