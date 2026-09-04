type StoredItem = Record<string, any>

type SourceRef = { book: string; page: number }

const sourceRefs: Record<string, SourceRef> = {
  // Atlas: Natural Fantasy — rare weapons (printed pages 84-85).
  'official-nf-ladle': { book:'Atlas: Natural Fantasy', page:84 },
  'official-nf-camera-obscura': { book:'Atlas: Natural Fantasy', page:84 },
  'official-nf-memorialis': { book:'Atlas: Natural Fantasy', page:84 },
  'official-nf-blazing-fan': { book:'Atlas: Natural Fantasy', page:84 },
  'official-nf-derringer': { book:'Atlas: Natural Fantasy', page:84 },
  'official-nf-bronze-libra': { book:'Atlas: Natural Fantasy', page:84 },
  'official-nf-giant-fork': { book:'Atlas: Natural Fantasy', page:84 },
  'official-nf-viper-bone': { book:'Atlas: Natural Fantasy', page:85 },
  'official-nf-summer-masher': { book:'Atlas: Natural Fantasy', page:85 },
  'official-nf-norimitsu': { book:'Atlas: Natural Fantasy', page:85 },
  'official-nf-the-barrel': { book:'Atlas: Natural Fantasy', page:85 },
  'official-nf-pinwheel-rod': { book:'Atlas: Natural Fantasy', page:85 },
  'official-nf-voltaic-hound': { book:'Atlas: Natural Fantasy', page:85 },
  'official-nf-hirundo': { book:'Atlas: Natural Fantasy', page:85 },

  // Atlas: Natural Fantasy — rare armor, shields and accessories (printed pages 86-87).
  'official-nf-woolly-cuirass': { book:'Atlas: Natural Fantasy', page:86 },
  'official-nf-engineer-jacket': { book:'Atlas: Natural Fantasy', page:86 },
  'official-nf-noble-dress': { book:'Atlas: Natural Fantasy', page:86 },
  'official-nf-apothecary-robes': { book:'Atlas: Natural Fantasy', page:86 },
  'official-nf-fairy-tunic': { book:'Atlas: Natural Fantasy', page:86 },
  'official-nf-plate-manica': { book:'Atlas: Natural Fantasy', page:86 },
  'official-nf-lid-shield': { book:'Atlas: Natural Fantasy', page:86 },
  'official-nf-lily-vambrace': { book:'Atlas: Natural Fantasy', page:86 },
  'official-nf-watering-can': { book:'Atlas: Natural Fantasy', page:87 },
  'official-nf-spicy-powder': { book:'Atlas: Natural Fantasy', page:87 },
  'official-nf-dandelion-obi': { book:'Atlas: Natural Fantasy', page:87 },
  'official-nf-clockwork-heart': { book:'Atlas: Natural Fantasy', page:87 },
  'official-nf-needlefrog-mantle': { book:'Atlas: Natural Fantasy', page:87 },
  'official-nf-handmade-scarf': { book:'Atlas: Natural Fantasy', page:87 },
  'official-nf-fallen-leaf-amulet': { book:'Atlas: Natural Fantasy', page:87 },
  'official-nf-eccentrics-cookbook': { book:'Atlas: Natural Fantasy', page:87 },

  // Atlas: Techno Fantasy — rare weapons (printed pages 82-83).
  'official-tf-connector': { book:'Atlas: Techno Fantasy', page:82 },
  'official-tf-therion-ripper': { book:'Atlas: Techno Fantasy', page:82 },
  'official-tf-carbon-bow': { book:'Atlas: Techno Fantasy', page:82 },
  'official-tf-grenade-launcher': { book:'Atlas: Techno Fantasy', page:82 },
  'official-tf-ignition-spear': { book:'Atlas: Techno Fantasy', page:82 },
  'official-tf-interlace-ring': { book:'Atlas: Techno Fantasy', page:82 },
  'official-tf-scale-thresher': { book:'Atlas: Techno Fantasy', page:82 },
  'official-tf-rngenerator': { book:'Atlas: Techno Fantasy', page:83 },
  'official-tf-steady-knuckles': { book:'Atlas: Techno Fantasy', page:83 },
  'official-tf-butterfly-dream': { book:'Atlas: Techno Fantasy', page:83 },
  'official-tf-azotophore': { book:'Atlas: Techno Fantasy', page:83 },
  'official-tf-seismic-pillar': { book:'Atlas: Techno Fantasy', page:83 },
  'official-tf-sniper-rifle': { book:'Atlas: Techno Fantasy', page:83 },
  'official-tf-thunder-vulcan': { book:'Atlas: Techno Fantasy', page:83 },

  // Atlas: Techno Fantasy — rare armor and shields (printed page 84).
  'official-tf-misdirector': { book:'Atlas: Techno Fantasy', page:84 },
  'official-tf-lab-coat': { book:'Atlas: Techno Fantasy', page:84 },
  'official-tf-biocloak': { book:'Atlas: Techno Fantasy', page:84 },
  'official-tf-psykeleton': { book:'Atlas: Techno Fantasy', page:84 },
  'official-tf-icebreaker': { book:'Atlas: Techno Fantasy', page:84 },
  'official-tf-ballistic-shield': { book:'Atlas: Techno Fantasy', page:84 },
  'official-tf-windshield': { book:'Atlas: Techno Fantasy', page:84 },
  'official-tf-hekat-shield': { book:'Atlas: Techno Fantasy', page:84 },

  // Atlas: Techno Fantasy — accessories (printed page 85).
  'official-tf-spare-magazine': { book:'Atlas: Techno Fantasy', page:85 },
  'official-tf-flashbang-grenades': { book:'Atlas: Techno Fantasy', page:85 },
  'official-tf-gas-mask': { book:'Atlas: Techno Fantasy', page:85 },
  'official-tf-maverick-helmet': { book:'Atlas: Techno Fantasy', page:85 },
  'official-tf-ego-mask': { book:'Atlas: Techno Fantasy', page:85 },
  'official-tf-medikit': { book:'Atlas: Techno Fantasy', page:85 },
  'official-tf-portable-assembler': { book:'Atlas: Techno Fantasy', page:85 },
  'official-tf-omnidex': { book:'Atlas: Techno Fantasy', page:85 },

  // Atlas: Techno Fantasy — weapon modules (printed pages 86-87).
  'official-tf-richter-grasp': { book:'Atlas: Techno Fantasy', page:86 },
  'official-tf-scrapper': { book:'Atlas: Techno Fantasy', page:86 },
  'official-tf-flimvolver-battery': { book:'Atlas: Techno Fantasy', page:86 },
  'official-tf-emp-cannon': { book:'Atlas: Techno Fantasy', page:86 },
  'official-tf-vanguard-pike': { book:'Atlas: Techno Fantasy', page:86 },
  'official-tf-crescens': { book:'Atlas: Techno Fantasy', page:86 },
  'official-tf-holockaw': { book:'Atlas: Techno Fantasy', page:86 },
  'official-tf-arbalest-mk-ii': { book:'Atlas: Techno Fantasy', page:86 },
  'official-tf-reactive-deflector': { book:'Atlas: Techno Fantasy', page:87 },
  'official-tf-mercurialis': { book:'Atlas: Techno Fantasy', page:87 },
  'official-tf-morphshield': { book:'Atlas: Techno Fantasy', page:87 },
  'official-tf-plasma-rifle': { book:'Atlas: Techno Fantasy', page:87 },
  'official-tf-aerowitzer': { book:'Atlas: Techno Fantasy', page:87 },
  'official-tf-warp-cannon': { book:'Atlas: Techno Fantasy', page:87 },
}

// Mechanical corrections discovered during the line-by-line source audit.
// Kept here as well as in the seed data so existing browsers receive fixes on reload.
const patches: Record<string, Record<string, unknown>> = {
  'official-nf-memorialis': {
    effect:'When you use the Ripples Skill, recover 5 MP.',
  },
  'official-nf-giant-fork': {
    effect:'When you use this weapon with the Knife and Fork Skill, you may add the High Roll to the attack’s damage; you do not have to treat it as being equal to 0.',
  },
  'official-nf-noble-dress': {
    effect:'When an ally you can see causes you to recover HP, if you are in Crisis, that ally recovers 5 MP.',
  },
  'official-nf-lily-vambrace': {
    effect:'If you have the Battle Gardening Skill, you can use it when you plant a magiseed with the Graft Skill.',
  },
  'official-nf-spicy-powder': {
    effect:'When you deal damage using a delicacy or potion, you may change its type to fire. This effect may change the damage type dealt by the Expiration Date Skill.',
  },
  'official-tf-biocloak': {
    effect:'When you use a Skill that requires you to spend HP, such as Ecdysis or Vismagus, you halve that cost.',
  },
  'official-tf-icebreaker': {
    martial:true,
    magicDefense:'+2',
  },
  'official-tf-medikit': {
    effect:'When you cause one or more creatures to recover HP with a potion or spell, if at least one of those creatures is in Crisis, each of them recovers 5 additional HP.',
  },
  'official-tf-vanguard-pike': {
    effect:'This weapon deals 5 extra damage during the first round of each conflict. A personal vehicle with this module enabled cannot have any other weapon module enabled.',
  },
  'official-tf-arbalest-mk-ii': {
    effect:'This weapon deals 5 extra damage to flying creatures or creatures who are in midair. A personal vehicle with this module enabled cannot have any other weapon module enabled.',
  },
  'official-tf-reactive-deflector': {
    effect:'As long as you are driving your personal vehicle and have a Counterstrike support module enabled, you can apply its effects even when a character aboard your personal vehicle is hit by a melee attack rather than only ranged attacks. This module has all the effects of a Shield module.',
  },
  'official-tf-morphshield': {
    effect:'At the start of your turn during a conflict, you can disable this module to enable a different disabled weapon module of your choice. If you do, at the end of your turn you must disable the chosen module and enable this one again. This module has all the effects of a Shield module.',
  },
}

export function applyOfficialAtlasItemSourceCorrections() {
  try {
    const items = JSON.parse(localStorage.getItem('fu-items') || '[]')
    if (!Array.isArray(items)) return
    let changed = false
    const next = items.map((item: StoredItem) => {
      if (item?.source !== 'Official') return item
      const id = String(item?.id || '')
      const ref = sourceRefs[id]
      const patch = patches[id]
      if (!ref && !patch) return item

      let updated = item
      if (patch) {
        const patched = { ...updated, ...patch }
        if (JSON.stringify(patched) !== JSON.stringify(updated)) {
          updated = patched
          changed = true
        }
      }

      if (ref) {
        const sourceNote = `Source audit: ${ref.book}, printed page ${ref.page}.`
        const breakdown = Array.isArray(updated.breakdown) ? updated.breakdown : []
        if (!breakdown.includes(sourceNote)) {
          updated = { ...updated, breakdown:[...breakdown, sourceNote] }
          changed = true
        }
      }
      return updated
    })
    if (changed) localStorage.setItem('fu-items', JSON.stringify(next))
  } catch {
    // Seed and maintenance tools handle malformed local storage separately.
  }
}
