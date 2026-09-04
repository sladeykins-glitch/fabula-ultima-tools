type StoredMonster = Record<string, any>

type Correction = {
  patch?: Record<string, unknown>
  note?: string
}

const corePages: Record<string, number> = {
  'official-core-cutterpillar':324, 'official-core-giant-rat':324,
  'official-core-grey-howler':325, 'official-core-vampire-bat':325,
  'official-core-bombard-ant':326, 'official-core-thornfish':326,
  'official-core-sun-bear':327, 'official-core-white-howler':327,
  'official-core-arcane-lantern':328, 'official-core-clatterclown':328,
  'official-core-gargoyle':329, 'official-core-magitech-trooper':329,
  'official-core-bronze-golem':330, 'official-core-razorbird':330,
  'official-core-forest-golem':331,
  'official-core-imp':332, 'official-core-lightning-wheel':332,
  'official-core-shadow-howler':333, 'official-core-echidna':333,
  'official-core-acorn-pixie':334, 'official-core-chaos-shard':334,
  'official-core-grenado':335, 'official-core-static-ooze':335,
  'official-core-nymph':336, 'official-core-spikeflake':336,
  'official-core-cragboar':337,
  'official-core-brigand':338, 'official-core-guard':338,
  'official-core-kobold-scout':339, 'official-core-kobold-witch':339,
  'official-core-hivekin':340, 'official-core-mercenary':340,
  'official-core-sniper':341, 'official-core-battlemage':341,
  'official-core-cait-sith':342, 'official-core-dreadmoth':342,
  'official-core-mellow-ooze':343, 'official-core-drake':343,
  'official-core-hexeye':344, 'official-core-hydrozoa':344,
  'official-core-cockatrice':345, 'official-core-mimic':345,
  'official-core-alraune':346, 'official-core-cursed-pumpkin':346,
  'official-core-pestervine':347, 'official-core-shroomkin':347,
  'official-core-cactroll':348,
  'official-core-dragontrap':349,
  'official-core-dread-urn':350, 'official-core-zombie':350,
  'official-core-skeletal-mage':351, 'official-core-skeletal-soldier':351,
  'official-core-bone-howler':352, 'official-core-ghoul':352,
  'official-core-mummy':353, 'official-core-shackled-soul':353,
}

const corrections: Record<string, Correction> = {
  // Core Rulebook v1.02 — primary score corrections discovered in the Bestiary audit.
  'official-core-spikeflake': { patch: { magicDefense: 12 } },
  'official-core-cragboar': { patch: { magicDefense: 6 } },
  'official-core-brigand': { patch: { defense: 9 } },
  'official-core-cockatrice': { patch: { magicDefense: 12 } },
  'official-core-mimic': { patch: { defense: 11 } },
  'official-core-shroomkin': { patch: { defense: 8 } },
  'official-core-dread-urn': { patch: { defense: 11, magicDefense: 8 } },
  'official-core-zombie': { patch: { defense: 8, magicDefense: 7 } },
  'official-core-skeletal-mage': { patch: { defense: 8 } },
  'official-core-mummy': { patch: { defense: 6, magicDefense: 8 } },

  // Atlas: High Fantasy — verified directly against the antagonist profiles.
  'official-high-eileen': {
    patch: { defense: 11 },
    note: 'Source audit: Atlas: High Fantasy, printed page 170. Printed DEF is +3/+1: Defense 11 in starting Harpoon form and 9 in Revolver form; the app stores the starting Harpoon-form Defense.',
  },
  'official-high-salamander': { note: 'Source audit: Atlas: High Fantasy, printed page 171.' },
  'official-high-cryomander': { note: 'Source audit: Atlas: High Fantasy, printed page 172.' },
  'official-high-pirate': { note: 'Source audit: Atlas: High Fantasy, printed page 173.' },
  'official-high-flame-dragon': { note: 'Source audit: Atlas: High Fantasy, printed page 176.' },
  'official-high-cerine': {
    patch: { affinities: { light: 'Resistant' } },
    note: 'Source audit: Atlas: High Fantasy, printed page 180. Holy cloak grants Resistance to fire and light damage.',
  },
  'official-high-cecilia': {
    patch: { magicDefense: 8 },
    note: 'Source audit: Atlas: High Fantasy, printed page 181. M. DEF is INS d6 +2 = 8; HP is Special and uses MP as the health track.',
  },
  'official-high-spectral-servant': {
    patch: { defense: 11 },
    note: 'Source audit: Atlas: High Fantasy, printed page 182. DEF is DEX d10 +1 = 11.',
  },
  'official-high-maximilian-prince': { note: 'Source audit: Atlas: High Fantasy, printed page 186.' },
  'official-high-maximilian-bastion': { note: 'Source audit: Atlas: High Fantasy, printed page 187.' },
  'official-high-nike': { note: 'Source audit: Atlas: High Fantasy, printed page 188.' },
  'official-high-theo': {
    patch: { magicDefense: 12 },
    note: 'Source audit: Atlas: High Fantasy, printed page 189. M. DEF is INS d10 +2 = 12.',
  },
  'official-high-mimesis': {
    patch: { magicDefense: 12, levelDamageBonus: 15 },
    note: 'Source audit: Atlas: High Fantasy, printed page 192. M. DEF is INS d10 +2 = 12; level 60 NPCs use the +15 level damage bonus.',
  },
  'official-high-anagnorisis': {
    patch: { magicDefense: 12, levelDamageBonus: 15 },
    note: 'Source audit: Atlas: High Fantasy, printed page 194. M. DEF is INS d10 +2 = 12; level 60 NPCs use the +15 level damage bonus.',
  },
  'official-high-dramatists-quill': {
    patch: { levelDamageBonus: 15 },
    note: 'Source audit: Atlas: High Fantasy, printed page 195. Level 60 NPCs use the +15 level damage bonus.',
  },
  'official-high-catharsis': {
    patch: { magicDefense: 14, levelDamageBonus: 15 },
    note: 'Source audit: Atlas: High Fantasy, printed page 196. M. DEF is INS d12 +2 = 14; level 60 NPCs use the +15 level damage bonus.',
  },

  // Atlas: Natural Fantasy — verified from the full raw scanned PDF pages.
  'official-natural-tonitranea-abdomen': { patch: { magicDefense: 6 }, note: 'Source audit: Atlas: Natural Fantasy, printed page 178. M. DEF is INS d6 +0 = 6.' },
  'official-natural-tonitranea-head': { patch: { magicDefense: 10 }, note: 'Source audit: Atlas: Natural Fantasy, printed page 178. M. DEF is INS d10 +0 = 10.' },
  'official-natural-tonitranea-thorax': { note: 'Source audit: Atlas: Natural Fantasy, printed page 179.' },
  'official-natural-node': { patch: { magicDefense: 7 }, note: 'Source audit: Atlas: Natural Fantasy, printed page 184. M. DEF is INS d6 +1 = 7.' },
  'official-natural-dylon': { patch: { defense: 8, magicDefense: 9 }, note: 'Source audit: Atlas: Natural Fantasy, printed page 185. DEF is DEX d6 +2 = 8; M. DEF is INS d8 +1 = 9.' },
  'official-natural-will-o-wisp': { patch: { defense: 12 }, note: 'Source audit: Atlas: Natural Fantasy, printed page 189. DEF is DEX d12 +0 = 12.' },
  'official-natural-brightvale-head': { patch: { magicDefense: 6 }, note: 'Source audit: Atlas: Natural Fantasy, printed page 191. M. DEF is INS d6 +0 = 6.' },
  'official-natural-titania-midday': { patch: { magicDefense: 12 }, note: 'Source audit: Atlas: Natural Fantasy, printed page 194. M. DEF is INS d10 +2 = 12.' },
  'official-natural-sun-poppy': { patch: { magicDefense: 12 }, note: 'Source audit: Atlas: Natural Fantasy, printed page 195. M. DEF is INS d10 +2 = 12.' },
  'official-natural-titania-midnight': { patch: { defense: 10 }, note: 'Source audit: Atlas: Natural Fantasy, printed page 196. DEF is DEX d10 +0 = 10.' },
  'official-natural-moon-orchid': { patch: { defense: 12 }, note: 'Source audit: Atlas: Natural Fantasy, printed page 197. DEF is DEX d10 +2 = 12.' },
  'official-natural-ashen-radande': { patch: { defense: 10, magicDefense: 12 }, note: 'Source audit: Atlas: Natural Fantasy, printed page 201. DEF is DEX d10 +0 = 10; M. DEF is INS d12 +0 = 12.' },
  'official-natural-eldgren': { patch: { defense: 6 }, note: 'Source audit: Atlas: Natural Fantasy, printed page 203. DEF is DEX d6 +0 = 6.' },
  'official-natural-eldgren-heart': { patch: { magicDefense: 10 }, note: 'Source audit: Atlas: Natural Fantasy, printed page 205. M. DEF is INS d10 +0 = 10.' },

  // Atlas: Techno Fantasy — verified from the full raw scanned PDF pages.
  'official-techno-commissioner-vyne': { patch: { defense: 9 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 186. DEF is DEX d6 +3 = 9.' },
  'official-techno-syntech-cop': { note: 'Source audit: Atlas: Techno Fantasy, printed page 187.' },
  'official-techno-surveillance-drone': { note: 'Source audit: Atlas: Techno Fantasy, printed page 188.' },
  'official-techno-eight': { patch: { magicDefense: 12 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 192. M. DEF is INS d10 +2 = 12.' },
  'official-techno-nine': { patch: { defense: 6 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 193. DEF is DEX d6 +0 = 6.' },
  'official-techno-seven': { patch: { magicDefense: 10 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 194. M. DEF is INS d10 +0 = 10.' },
  'official-techno-primary-core': { patch: { magicDefense: 10 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 198. M. DEF is INS d10 +0 = 10.' },
  'official-techno-digital-limb-a': { patch: { defense: 10 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 199. DEF is DEX d10 +0 = 10.' },
  'official-techno-digital-limb-b': { patch: { magicDefense: 12 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 199. M. DEF is INS d10 +2 = 12.' },
  'official-techno-relentless': { patch: { magicDefense: 10 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 202. M. DEF is INS d10 +0 = 10.' },
  'official-techno-attack-wing': { patch: { defense: 12, magicDefense: 10 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 203. DEF is DEX d12 +0 = 12; M. DEF is INS d10 +0 = 10.' },
  'official-techno-support-wing': { patch: { defense: 10, magicDefense: 12 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 203. DEF is DEX d10 +0 = 10; M. DEF is INS d12 +0 = 12.' },
  'official-techno-admiral-ceryon': { patch: { defense: 11, magicDefense: 11 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 204. DEF and M. DEF are both d10 +1 = 11.' },
  'official-techno-bioengine': { patch: { defense: 14, magicDefense: 10 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 205. DEF is DEX d12 +2 = 14; M. DEF is INS d6 +4 = 10.' },
  'official-techno-patriarch': { patch: { defense: 10, magicDefense: 15 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 210. DEF is DEX d6 +4 = 10; M. DEF is INS d10 +5 = 15.' },
  'official-techno-right-hand': { patch: { defense: 13, magicDefense: 12 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 211. DEF is DEX d10 +3 = 13; M. DEF is INS d10 +2 = 12.' },
  'official-techno-left-hand': { note: 'Source audit: Atlas: Techno Fantasy, printed page 211. Printed DEF is 14; M. DEF is INS d8 +2 = 10.' },
  'official-techno-conceptual-dyad': { patch: { magicDefense: 13 }, note: 'Source audit: Atlas: Techno Fantasy, printed page 212. DEF is DEX d8 +3 = 11; M. DEF is INS d10 +3 = 13.' },
  'official-techno-pure-concept': {
    patch: { magicDefense: 11 },
    note: 'Source audit: Atlas: Techno Fantasy, printed page 213. DEF and M. DEF are both d8 +3 = 11. Printed Species is “???”; the app represents this profile as Monster because its Species field supports only the standard Fabula Ultima species categories.',
  },
}

function mergePatch(monster: StoredMonster, patch: Record<string, unknown>) {
  const next = { ...monster, ...patch }
  if (patch.affinities && typeof patch.affinities === 'object') {
    next.affinities = { ...(monster.affinities || {}), ...(patch.affinities as Record<string, unknown>) }
  }
  return next
}

export function applyOfficialSourceCorrections() {
  try {
    const monsters = JSON.parse(localStorage.getItem('fu-monsters') || '[]')
    if (!Array.isArray(monsters)) return
    let changed = false
    const next = monsters.map((monster: StoredMonster) => {
      const corePage = corePages[monster?.id]
      const explicit = corrections[monster?.id]
      const correction: Correction | undefined = explicit || (corePage ? {} : undefined)
      if (!correction) return monster

      let updated = monster
      if (correction.patch) {
        const patched = mergePatch(updated, correction.patch)
        if (JSON.stringify(patched) !== JSON.stringify(updated)) {
          updated = patched
          changed = true
        }
      }

      const note = correction.note || (corePage ? `Source audit: Core Rulebook v1.02, printed page ${corePage}.` : undefined)
      if (note) {
        const notes = Array.isArray(updated.notes) ? updated.notes : []
        if (!notes.includes(note)) {
          updated = { ...updated, notes: [...notes, note] }
          changed = true
        }
      }
      return updated
    })

    if (changed) localStorage.setItem('fu-monsters', JSON.stringify(next))
  } catch {
    // Official bootstrap and data-health tools handle malformed storage separately.
  }
}
