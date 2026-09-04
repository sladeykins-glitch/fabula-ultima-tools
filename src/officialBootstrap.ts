const OFFICIAL_DATA_VERSION = '2026-09-04-natural-techno-v3'
const VERSION_KEY = 'fu-official-data-version'

function hasOfficialData(key: string) {
  try {
    const records = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(records) && records.some(record => record?.source === 'Official')
  } catch {
    return false
  }
}

export async function ensureOfficialData() {
  const currentVersion = localStorage.getItem(VERSION_KEY)
  const ready = hasOfficialData('fu-monsters') && hasOfficialData('fu-items')
  if (currentVersion === OFFICIAL_DATA_VERSION && ready) return false

  const { seedOfficialData } = await import('./officialSeedData')
  seedOfficialData()
  localStorage.setItem(VERSION_KEY, OFFICIAL_DATA_VERSION)
  return true
}
