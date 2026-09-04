type StoredRecord = Record<string, any>

function mergeAffinity(record: StoredRecord, patch: Record<string, unknown>) {
  const next = { ...record, ...patch }
  if (patch.affinities && typeof patch.affinities === 'object') {
    next.affinities = { ...(record.affinities || {}), ...(patch.affinities as Record<string, unknown>) }
  }
  return next
}

const monsterPatches: Record<string, Record<string, unknown>> = {
  // Atlas: High Fantasy p.181 — paladin's cuirass is steel plate with light Resistance.
  'official-high-cecilia': {
    magicDefense: 8,
    affinities: { light:'Resistant' },
  },
}

const itemPatches: Record<string, Record<string, unknown>> = {
  // Atlas: High Fantasy pp.78-79 — wording/details omitted by the original import.
  'official-hf-chimera-tail': {
    effect:'Attacks with this weapon deal 1 extra damage for every different creature Species among those you learned your known Chimerist spells from. Spells learned and later forgotten do not count.',
  },
  'official-hf-bestiarium': {
    effect:'You gain a +2 bonus to Magic Checks targeting the Magic Defense of creatures of which you know two or more Traits. This bonus also applies to Opposed Checks against those creatures.',
  },
}

const coreRareWeaponPages: Record<string, number> = {
  Arcane:270,
  Bow:271,
  Brawling:272,
  Dagger:273,
  Firearm:274,
  Flail:275,
  Heavy:276,
  Spear:277,
  Sword:278,
  Thrown:279,
}

export function applyOfficialDeepAuditCorrections() {
  try {
    const monsters = JSON.parse(localStorage.getItem('fu-monsters') || '[]')
    if (Array.isArray(monsters)) {
      let changed = false
      const next = monsters.map((monster: StoredRecord) => {
        if (monster?.source !== 'Official') return monster
        const patch = monsterPatches[String(monster?.id || '')]
        if (!patch) return monster
        const patched = mergeAffinity(monster, patch)
        if (JSON.stringify(patched) !== JSON.stringify(monster)) changed = true
        return patched
      })
      if (changed) localStorage.setItem('fu-monsters', JSON.stringify(next))
    }
  } catch {
    // Other startup maintenance handles malformed storage.
  }

  try {
    const items = JSON.parse(localStorage.getItem('fu-items') || '[]')
    if (Array.isArray(items)) {
      let changed = false
      const next = items.map((item: StoredRecord) => {
        if (item?.source !== 'Official') return item
        const id = String(item?.id || '')
        const patch = itemPatches[id]
        let updated = patch ? { ...item, ...patch } : item

        // Core rare weapons were checked category-by-category against printed pp.270-279.
        if (id.startsWith('official-core-rare-')) {
          const page = coreRareWeaponPages[String(updated.category || '')]
          if (page) {
            const sourceNote = `Source audit: Core Rulebook v1.02, printed page ${page}.`
            const breakdown = Array.isArray(updated.breakdown) ? updated.breakdown : []
            if (!breakdown.includes(sourceNote)) updated = { ...updated, breakdown:[...breakdown, sourceNote] }
          }
        }

        if (JSON.stringify(updated) !== JSON.stringify(item)) changed = true
        return updated
      })
      if (changed) localStorage.setItem('fu-items', JSON.stringify(next))
    }
  } catch {
    // Other startup maintenance handles malformed storage.
  }
}
