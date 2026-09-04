type StoredItem = Record<string, any>

type SourceRef = { book: string; page: number }

const sourceRefs: Record<string, SourceRef> = {
  // Core Rulebook v1.02 — sample rare armor, shields and accessories.
  'official-core-slimy-jacket': { book:'Core Rulebook v1.02', page:281 },
  'official-core-fox-garb': { book:'Core Rulebook v1.02', page:281 },
  'official-core-shadow-tunic': { book:'Core Rulebook v1.02', page:281 },
  'official-core-desperado-coat': { book:'Core Rulebook v1.02', page:281 },
  'official-core-butler-uniform': { book:'Core Rulebook v1.02', page:281 },
  'official-core-maid-uniform': { book:'Core Rulebook v1.02', page:281 },
  'official-core-bandit-jacket': { book:'Core Rulebook v1.02', page:281 },
  'official-core-crystal-plate': { book:'Core Rulebook v1.02', page:281 },
  'official-core-valkyrie-wings': { book:'Core Rulebook v1.02', page:281 },
  'official-core-armor-of-heroes': { book:'Core Rulebook v1.02', page:281 },
  'official-core-black-belt': { book:'Core Rulebook v1.02', page:282 },
  'official-core-meditation-robe': { book:'Core Rulebook v1.02', page:282 },
  'official-core-archmage-robe': { book:'Core Rulebook v1.02', page:282 },
  'official-core-automaton-suit': { book:'Core Rulebook v1.02', page:282 },
  'official-core-adamantorso': { book:'Core Rulebook v1.02', page:282 },
  'official-core-ardent-yoroi': { book:'Core Rulebook v1.02', page:282 },
  'official-core-demongrin': { book:'Core Rulebook v1.02', page:282 },
  'official-core-bio-plate': { book:'Core Rulebook v1.02', page:282 },
  'official-core-white-tunic': { book:'Core Rulebook v1.02', page:282 },
  'official-core-granny-vest': { book:'Core Rulebook v1.02', page:282 },
  'official-core-black-tunic': { book:'Core Rulebook v1.02', page:282 },
  'official-core-red-tunic': { book:'Core Rulebook v1.02', page:282 },
  'official-core-aegis-fulgur': { book:'Core Rulebook v1.02', page:283 },
  'official-core-aegis-gelum': { book:'Core Rulebook v1.02', page:283 },
  'official-core-aegis-gorgonis': { book:'Core Rulebook v1.02', page:283 },
  'official-core-aegis-ignis': { book:'Core Rulebook v1.02', page:283 },
  'official-core-aegis-lux': { book:'Core Rulebook v1.02', page:283 },
  'official-core-aegis-terra': { book:'Core Rulebook v1.02', page:283 },
  'official-core-aegis-umbra': { book:'Core Rulebook v1.02', page:283 },
  'official-core-aegis-ventus': { book:'Core Rulebook v1.02', page:283 },
  'official-core-demonshield': { book:'Core Rulebook v1.02', page:283 },
  'official-core-shield-of-spring': { book:'Core Rulebook v1.02', page:283 },
  'official-core-seraph-shield': { book:'Core Rulebook v1.02', page:283 },
  'official-core-adamantower': { book:'Core Rulebook v1.02', page:283 },
  'official-core-explorers-belt': { book:'Core Rulebook v1.02', page:285 },
  'official-core-gloves-elegant': { book:'Core Rulebook v1.02', page:285 },
  'official-core-gloves-rough': { book:'Core Rulebook v1.02', page:285 },
  'official-core-gloves-silky': { book:'Core Rulebook v1.02', page:285 },
  'official-core-gloves-warm': { book:'Core Rulebook v1.02', page:285 },
  'official-core-rookies-boots': { book:'Core Rulebook v1.02', page:285 },
  'official-core-hannya-mask': { book:'Core Rulebook v1.02', page:286 },
  'official-core-pendant-amber': { book:'Core Rulebook v1.02', page:286 },
  'official-core-pendant-amethyst': { book:'Core Rulebook v1.02', page:286 },
  'official-core-pendant-diamond': { book:'Core Rulebook v1.02', page:286 },
  'official-core-pendant-emerald': { book:'Core Rulebook v1.02', page:286 },
  'official-core-pendant-opal': { book:'Core Rulebook v1.02', page:286 },
  'official-core-pendant-ruby': { book:'Core Rulebook v1.02', page:286 },
  'official-core-pendant-sapphire': { book:'Core Rulebook v1.02', page:286 },
  'official-core-pendant-topaz': { book:'Core Rulebook v1.02', page:286 },
  'official-core-ring-of-sorcery': { book:'Core Rulebook v1.02', page:286 },
  'official-core-wanderers-boots': { book:'Core Rulebook v1.02', page:286 },
  'official-core-crested-helm': { book:'Core Rulebook v1.02', page:286 },
  'official-core-gloves-crimson': { book:'Core Rulebook v1.02', page:287 },
  'official-core-pointy-yellow-hat': { book:'Core Rulebook v1.02', page:287 },
  'official-core-ring-of-the-lion': { book:'Core Rulebook v1.02', page:287 },
  'official-core-ring-of-the-owl': { book:'Core Rulebook v1.02', page:287 },
  'official-core-ring-of-the-pupil': { book:'Core Rulebook v1.02', page:287 },
  'official-core-ring-of-tales': { book:'Core Rulebook v1.02', page:287 },
  'official-core-gloves-multigroa': { book:'Core Rulebook v1.02', page:287 },
  'official-core-ring-of-onions': { book:'Core Rulebook v1.02', page:287 },
  'official-core-ring-of-frost': { book:'Core Rulebook v1.02', page:287 },
  'official-core-ring-of-magma': { book:'Core Rulebook v1.02', page:287 },
  'official-core-ring-of-the-egg': { book:'Core Rulebook v1.02', page:287 },

  // Atlas: High Fantasy — sample rare weapons, armor, shields and accessories.
  'official-hf-bringer-of-justice': { book:'Atlas: High Fantasy', page:78 },
  'official-hf-chimera-tail': { book:'Atlas: High Fantasy', page:78 },
  'official-hf-major-arcana': { book:'Atlas: High Fantasy', page:78 },
  'official-hf-midas': { book:'Atlas: High Fantasy', page:78 },
  'official-hf-achilles': { book:'Atlas: High Fantasy', page:78 },
  'official-hf-bestiarium': { book:'Atlas: High Fantasy', page:78 },
  'official-hf-chiaroscuro': { book:'Atlas: High Fantasy', page:78 },
  'official-hf-floating-edge': { book:'Atlas: High Fantasy', page:79 },
  'official-hf-grim-waltz': { book:'Atlas: High Fantasy', page:79 },
  'official-hf-heavy-metal': { book:'Atlas: High Fantasy', page:79 },
  'official-hf-tametomo': { book:'Atlas: High Fantasy', page:79 },
  'official-hf-immernacht': { book:'Atlas: High Fantasy', page:79 },
  'official-hf-ultimatum': { book:'Atlas: High Fantasy', page:79 },
  'official-hf-revenger': { book:'Atlas: High Fantasy', page:79 },
  'official-hf-dancing-dress': { book:'Atlas: High Fantasy', page:80 },
  'official-hf-elemental-robe': { book:'Atlas: High Fantasy', page:80 },
  'official-hf-orichalcum': { book:'Atlas: High Fantasy', page:80 },
  'official-hf-bag-shield': { book:'Atlas: High Fantasy', page:80 },
  'official-hf-drumshield': { book:'Atlas: High Fantasy', page:80 },
  'official-hf-argus': { book:'Atlas: High Fantasy', page:80 },
  'official-hf-shield-of-blades': { book:'Atlas: High Fantasy', page:80 },
  'official-hf-parry-shield': { book:'Atlas: High Fantasy', page:80 },
  'official-hf-ring-of-denial': { book:'Atlas: High Fantasy', page:81 },
  'official-hf-ring-of-the-occultist': { book:'Atlas: High Fantasy', page:81 },
  'official-hf-ivory-ring': { book:'Atlas: High Fantasy', page:81 },
  'official-hf-magic-palette': { book:'Atlas: High Fantasy', page:81 },
  'official-hf-tacticians-diadem': { book:'Atlas: High Fantasy', page:81 },
  'official-hf-alchemists-bag': { book:'Atlas: High Fantasy', page:81 },
  'official-hf-sorcerers-pendant': { book:'Atlas: High Fantasy', page:81 },
  'official-hf-dancing-ribbon': { book:'Atlas: High Fantasy', page:81 },
}

export function applyOfficialItemSourceCorrections() {
  try {
    const items = JSON.parse(localStorage.getItem('fu-items') || '[]')
    if (!Array.isArray(items)) return
    let changed = false
    const next = items.map((item: StoredItem) => {
      if (item?.source !== 'Official') return item
      const ref = sourceRefs[String(item?.id || '')]
      if (!ref) return item
      const sourceNote = `Source audit: ${ref.book}, printed page ${ref.page}.`
      const breakdown = Array.isArray(item.breakdown) ? item.breakdown : []
      if (breakdown.includes(sourceNote)) return item
      changed = true
      return { ...item, breakdown:[...breakdown, sourceNote] }
    })
    if (changed) localStorage.setItem('fu-items', JSON.stringify(next))
  } catch {
    // Seed and maintenance tools handle malformed local storage separately.
  }
}
