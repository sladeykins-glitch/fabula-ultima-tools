const OFFICIAL_DATA_VERSION = '2026-09-04-natural-techno-v4'
const VERSION_KEY = 'fu-official-data-version'

const REQUIRED_MONSTER_IDS = [
  'official-core-cutterpillar',
  'official-high-eileen',
  'official-natural-tonitranea-thorax',
  'official-techno-commissioner-vyne',
  'official-techno-syntech-cop',
]

const REQUIRED_ITEM_PREFIXES = [
  'official-core-',
  'official-hf-',
  'official-nf-',
  'official-tf-',
]

function storedRecords(key: string) {
  try {
    const records = JSON.parse(localStorage.getItem(key) || '[]')
    return Array.isArray(records) ? records : []
  } catch {
    return []
  }
}

function officialLibraryReady() {
  const monsters = storedRecords('fu-monsters')
  const items = storedRecords('fu-items')
  if (monsters.length < 100 || items.length < 40) return false

  const monsterIds = new Set(monsters.filter(record => record?.source === 'Official').map(record => record.id))
  if (!REQUIRED_MONSTER_IDS.every(id => monsterIds.has(id))) return false

  const officialItemIds = items.filter(record => record?.source === 'Official').map(record => String(record.id || ''))
  return REQUIRED_ITEM_PREFIXES.every(prefix => officialItemIds.some(id => id.startsWith(prefix)))
}

async function applyCorrections() {
  const [monsterModule, itemModule, atlasItemModule, deepAuditModule, technoModule, highFantasyAffinityModule, naturalFantasyDeepModule] = await Promise.all([
    import('./officialSourceCorrections'),
    import('./officialItemSourceCorrections'),
    import('./officialAtlasItemSourceCorrections'),
    import('./officialDeepAuditCorrections'),
    import('./officialTechnoModuleDeepCorrections'),
    import('./officialHighFantasyAffinityCorrections'),
    import('./officialNaturalFantasyDeepCorrections'),
  ])
  monsterModule.applyOfficialSourceCorrections()
  itemModule.applyOfficialItemSourceCorrections()
  atlasItemModule.applyOfficialAtlasItemSourceCorrections()
  deepAuditModule.applyOfficialDeepAuditCorrections()
  technoModule.applyOfficialTechnoModuleDeepCorrections()
  // Run these direct rendered-page audit layers after the older correction layers.
  highFantasyAffinityModule.applyOfficialHighFantasyAffinityCorrections()
  naturalFantasyDeepModule.applyOfficialNaturalFantasyDeepCorrections()
}

export async function ensureOfficialData() {
  const currentVersion = localStorage.getItem(VERSION_KEY)
  if (currentVersion === OFFICIAL_DATA_VERSION && officialLibraryReady()) {
    await applyCorrections()
    return false
  }

  const { seedOfficialData } = await import('./officialSeedData')
  seedOfficialData()
  await applyCorrections()
  localStorage.setItem(VERSION_KEY, OFFICIAL_DATA_VERSION)
  return true
}
