type StoredMonster = Record<string, any>

type Correction = {
  patch?: Record<string, unknown>
  note?: string
}

const corrections: Record<string, Correction> = {
  'official-techno-pure-concept': {
    note: 'Printed Species is “???”. The app represents this profile as Monster because its Species field currently supports only the standard Fabula Ultima species categories.',
  },

  // Core Rulebook v1.02 — verified against the printed Bestiary pages.
  'official-core-cutterpillar': { note: 'Source audit: Core Rulebook v1.02, printed page 324.' },
  'official-core-giant-rat': { note: 'Source audit: Core Rulebook v1.02, printed page 324.' },
  'official-core-grey-howler': { note: 'Source audit: Core Rulebook v1.02, printed page 325.' },

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
  'official-high-spectral-servant': { note: 'Source audit: Atlas: High Fantasy, printed page 182.' },
  'official-high-maximilian-prince': { note: 'Source audit: Atlas: High Fantasy, printed page 186.' },
  'official-high-maximilian-bastion': { note: 'Source audit: Atlas: High Fantasy, printed page 187.' },
  'official-high-nike': { note: 'Source audit: Atlas: High Fantasy, printed page 188.' },
  'official-high-theo': {
    patch: { magicDefense: 12 },
    note: 'Source audit: Atlas: High Fantasy, printed page 189. M. DEF is INS d10 +2 = 12.',
  },
  'official-high-mimesis': {
    patch: { magicDefense: 12 },
    note: 'Source audit: Atlas: High Fantasy, printed page 192. M. DEF is INS d10 +2 = 12.',
  },
  'official-high-anagnorisis': {
    patch: { magicDefense: 12 },
    note: 'Source audit: Atlas: High Fantasy, printed page 194. M. DEF is INS d10 +2 = 12.',
  },
  'official-high-dramatists-quill': { note: 'Source audit: Atlas: High Fantasy, printed page 195.' },
  'official-high-catharsis': {
    patch: { magicDefense: 14 },
    note: 'Source audit: Atlas: High Fantasy, printed page 196. M. DEF is INS d12 +2 = 14.',
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
      const correction = corrections[monster?.id]
      if (!correction) return monster

      let updated = monster
      if (correction.patch) {
        const patched = mergePatch(updated, correction.patch)
        if (JSON.stringify(patched) !== JSON.stringify(updated)) {
          updated = patched
          changed = true
        }
      }

      if (correction.note) {
        const notes = Array.isArray(updated.notes) ? updated.notes : []
        if (!notes.includes(correction.note)) {
          updated = { ...updated, notes: [...notes, correction.note] }
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
