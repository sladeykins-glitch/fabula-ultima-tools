type StoredMonster = Record<string, any>

const patches: Record<string, Record<string, unknown>> = {
  'official-high-cerine': {
    affinities: {
      earth: 'Vulnerable',
      light: 'Normal',
    },
  },
  'official-high-cecilia': {
    affinities: {
      light: 'Normal',
    },
  },
  'official-high-maximilian-prince': {
    affinities: {
      physical: 'Resistant',
      air: 'Normal',
      bolt: 'Normal',
      dark: 'Vulnerable',
      earth: 'Normal',
      fire: 'Resistant',
      ice: 'Normal',
      light: 'Resistant',
      poison: 'Normal',
    },
  },
  'official-high-maximilian-bastion': {
    affinities: {
      physical: 'Resistant',
      air: 'Normal',
      bolt: 'Resistant',
      dark: 'Vulnerable',
      earth: 'Normal',
      fire: 'Vulnerable',
      ice: 'Resistant',
      light: 'Normal',
      poison: 'Normal',
    },
  },
  'official-high-anagnorisis': {
    affinities: {
      physical: 'Normal',
      air: 'Normal',
      bolt: 'Normal',
      dark: 'Resistant',
      earth: 'Normal',
      fire: 'Normal',
      ice: 'Normal',
      light: 'Resistant',
      poison: 'Normal',
    },
  },
  'official-high-dramatists-quill': {
    affinities: {
      physical: 'Normal',
      air: 'Normal',
      bolt: 'Resistant',
      dark: 'Resistant',
      earth: 'Resistant',
      fire: 'Resistant',
      ice: 'Resistant',
      light: 'Immune',
      poison: 'Immune',
    },
  },
}

const auditNotes: Record<string, string> = {
  'official-high-cerine': 'Deep affinity audit: Atlas: High Fantasy, printed page 180. Cerine is Vulnerable to earth; her holy cloak cancels the normal Undead light Vulnerability, leaving light Normal.',
  'official-high-cecilia': 'Deep affinity audit: Atlas: High Fantasy, printed page 181. Cecilia’s paladin cuirass cancels the normal Undead light Vulnerability, leaving light Normal.',
  'official-high-maximilian-prince': 'Deep affinity audit: Atlas: High Fantasy, printed page 186. Affinity row verified directly from the printed profile.',
  'official-high-maximilian-bastion': 'Deep affinity audit: Atlas: High Fantasy, printed page 187. Affinity row verified directly from the printed profile.',
  'official-high-anagnorisis': 'Deep affinity audit: Atlas: High Fantasy, printed page 194. Affinity row verified directly from the printed profile.',
  'official-high-dramatists-quill': 'Deep affinity audit: Atlas: High Fantasy, printed page 195. Affinity row verified directly from the printed profile.',
}

export function applyOfficialHighFantasyAffinityCorrections() {
  try {
    const monsters = JSON.parse(localStorage.getItem('fu-monsters') || '[]')
    if (!Array.isArray(monsters)) return

    let changed = false
    const next = monsters.map((monster: StoredMonster) => {
      if (monster?.source !== 'Official') return monster
      const id = String(monster?.id || '')
      const patch = patches[id]
      const note = auditNotes[id]
      if (!patch && !note) return monster

      let updated = monster
      if (patch) {
        const nextAffinities = patch.affinities && typeof patch.affinities === 'object'
          ? { ...(monster.affinities || {}), ...(patch.affinities as Record<string, unknown>) }
          : monster.affinities
        const patched = { ...updated, ...patch, affinities: nextAffinities }
        if (JSON.stringify(patched) !== JSON.stringify(updated)) {
          updated = patched
          changed = true
        }
      }

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
    // Other startup maintenance handles malformed storage.
  }
}
