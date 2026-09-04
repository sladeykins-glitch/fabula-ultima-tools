export function applyOfficialSourceCorrections() {
  try {
    const monsters = JSON.parse(localStorage.getItem('fu-monsters') || '[]')
    if (!Array.isArray(monsters)) return
    let changed = false
    const next = monsters.map(monster => {
      if (monster?.id !== 'official-techno-pure-concept') return monster
      const note = 'Printed Species is “???”. The app represents this profile as Monster because its Species field currently supports only the standard Fabula Ultima species categories.'
      const notes = Array.isArray(monster.notes) ? monster.notes : []
      if (notes.includes(note)) return monster
      changed = true
      return { ...monster, notes: [...notes, note] }
    })
    if (changed) localStorage.setItem('fu-monsters', JSON.stringify(next))
  } catch {
    // Official bootstrap and data-health tools handle malformed storage separately.
  }
}
