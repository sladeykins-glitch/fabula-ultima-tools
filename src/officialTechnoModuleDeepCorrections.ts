type StoredItem = Record<string, any>

const patches: Record<string, Record<string, unknown>> = {
  // Atlas: Techno Fantasy p.86 — names and module rules verified against the printed table.
  'official-tf-flimvolver-battery': {
    name:'Fimbulvetr Battery',
  },
  'official-tf-emp-cannon': {
    effect:'Each construct hit by an attack with this weapon suffers the dazed status effect. A personal vehicle with this module enabled cannot have any other weapon module enabled.',
  },
  'official-tf-holockaw': {
    name:'Hookclaw',
  },
}

export function applyOfficialTechnoModuleDeepCorrections() {
  try {
    const items = JSON.parse(localStorage.getItem('fu-items') || '[]')
    if (!Array.isArray(items)) return
    let changed = false
    const next = items.map((item: StoredItem) => {
      if (item?.source !== 'Official') return item
      const patch = patches[String(item?.id || '')]
      if (!patch) return item
      const updated = { ...item, ...patch }
      if (JSON.stringify(updated) !== JSON.stringify(item)) changed = true
      return updated
    })
    if (changed) localStorage.setItem('fu-items', JSON.stringify(next))
  } catch {
    // Other startup maintenance handles malformed storage.
  }
}
