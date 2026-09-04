type StoredMonster = Record<string, any>

type Affinity = 'Normal' | 'Vulnerable' | 'Resistant' | 'Immune' | 'Absorb'

type AffinityRow = Record<'physical' | 'air' | 'bolt' | 'dark' | 'earth' | 'fire' | 'ice' | 'light' | 'poison', Affinity>

const N: Affinity = 'Normal'
const V: Affinity = 'Vulnerable'
const R: Affinity = 'Resistant'
const I: Affinity = 'Immune'
const A: Affinity = 'Absorb'

const affinityRows: Record<string, { page: number; row: AffinityRow }> = {
  'official-natural-tonitranea-abdomen': { page: 178, row: { physical:N, air:R, bolt:I, dark:N, earth:V, fire:V, ice:N, light:N, poison:R } },
  'official-natural-tonitranea-head': { page: 178, row: { physical:V, air:R, bolt:R, dark:N, earth:N, fire:N, ice:N, light:V, poison:I } },
  'official-natural-tonitranea-thorax': { page: 179, row: { physical:N, air:R, bolt:I, dark:N, earth:V, fire:N, ice:V, light:N, poison:R } },
  'official-natural-node': { page: 184, row: { physical:N, air:N, bolt:R, dark:N, earth:V, fire:R, ice:V, light:N, poison:N } },
  'official-natural-dylon': { page: 185, row: { physical:N, air:N, bolt:V, dark:N, earth:R, fire:V, ice:R, light:N, poison:N } },
  'official-natural-brightvale-back': { page: 188, row: { physical:N, air:V, bolt:I, dark:R, earth:I, fire:R, ice:V, light:N, poison:I } },
  'official-natural-will-o-wisp': { page: 189, row: { physical:R, air:V, bolt:R, dark:I, earth:R, fire:R, ice:V, light:V, poison:I } },
  'official-natural-funerary-lantern': { page: 190, row: { physical:N, air:N, bolt:N, dark:V, earth:R, fire:N, ice:V, light:A, poison:I } },
  'official-natural-brightvale-head': { page: 191, row: { physical:N, air:V, bolt:I, dark:I, earth:I, fire:N, ice:V, light:V, poison:I } },
  'official-natural-titania-midday': { page: 194, row: { physical:R, air:I, bolt:N, dark:V, earth:V, fire:I, ice:V, light:A, poison:I } },
  'official-natural-sun-poppy': { page: 195, row: { physical:N, air:R, bolt:N, dark:V, earth:N, fire:R, ice:V, light:I, poison:I } },
  'official-natural-titania-midnight': { page: 196, row: { physical:R, air:V, bolt:N, dark:A, earth:I, fire:V, ice:I, light:V, poison:I } },
  'official-natural-moon-orchid': { page: 197, row: { physical:N, air:V, bolt:N, dark:I, earth:R, fire:N, ice:R, light:V, poison:I } },
  'official-natural-ashen-radande': { page: 201, row: { physical:N, air:V, bolt:N, dark:N, earth:R, fire:I, ice:V, light:N, poison:R } },
  'official-natural-eldgren': { page: 203, row: { physical:N, air:V, bolt:R, dark:N, earth:V, fire:I, ice:R, light:N, poison:A } },
  'official-natural-eldgren-heart': { page: 205, row: { physical:A, air:A, bolt:A, dark:A, earth:A, fire:A, ice:A, light:A, poison:A } },
}

function patchNamed<T extends Record<string, any>>(entries: T[] | undefined, name: string, patch: Partial<T>) {
  if (!Array.isArray(entries)) return entries
  return entries.map(entry => entry?.name === name ? { ...entry, ...patch } : entry)
}

function patchMechanics(monster: StoredMonster) {
  let next = monster

  if (monster.id === 'official-natural-tonitranea-abdomen') {
    next = {
      ...next,
      attacks: patchNamed(next.attacks, 'Trampling Slam', {
        effect: 'HR + 5 physical damage. If the Abdomen is electrified, this attack deals 10 extra damage and all its damage becomes bolt. If the Thorax is dangling, this attack gains multi (2). After this attack is resolved, the Thorax stops dangling and the Abdomen is no longer electrified.',
      }),
    }
  }

  if (monster.id === 'official-natural-tonitranea-thorax') {
    next = {
      ...next,
      skills: patchNamed(patchNamed(next.skills, 'Predator Ascent', {
        summary: 'Use an action and spend 10 MP to become dangling until the Thorax suffers fire damage, ice damage, or damage of a type it is Vulnerable to. The Thorax also stops dangling after the Abdomen uses Trampling Slam. While dangling, no part of the Tonitranea Rex can be targeted with melee attacks unless the attacker is flying or able to target flying creatures.',
      }), 'Survival Instinct', {
        summary: 'At the end of each round, if the Tonitranea Rex is within its lair and the Abdomen and/or Head are at 0 HP, the Thorax must spend 1 Ultima Point to bring both parts back into the scene at their Crisis HP, suffering no status effects and at full MP.',
      }),
    }
  }

  if (monster.id === 'official-natural-brightvale-back') {
    next = {
      ...next,
      spells: patchNamed(next.spells, 'Compact Terrain', {
        effect: 'The Back of Brightvale gains Resistance to physical damage. This spell ends when the Back enters Crisis, and the Back cannot cast it while in Crisis.',
        duration: 'Scene',
      }),
      skills: patchNamed(next.skills, 'Sandy Dive', {
        summary: 'Use an action and spend 20 MP. All enemies present perform a Group Check [INS + MIG] against DL 10. If the Group Check fails, the Back deals 15 earth damage to each enemy it can see and those enemies suffer shaken.',
      }),
    }
  }

  if (monster.id === 'official-natural-funerary-lantern') {
    next = {
      ...next,
      spells: patchNamed(next.spells, 'Follow Me...', {
        effect: '[INS + WLP] +2. All damage dealt by the target becomes light and its damage type cannot be changed. After the target takes a turn, this spell ends.',
        duration: 'Scene',
      }),
      skills: patchNamed(next.skills, 'Quiet in the Dark', {
        summary: 'When reduced to 0 HP while lit, the Funerary Lantern becomes extinguished and its current HP become 1. While extinguished, it cannot regain or lose HP, nor perform actions or free attacks.',
      }),
    }
  }

  if (monster.id === 'official-natural-brightvale-head') {
    next = {
      ...next,
      spells: patchNamed(next.spells, 'Dust to Dust', {
        effect: '[MIG + WLP] +5. The Head of Brightvale deals HR + 20 earth damage to the target, and the target suffers weak.',
      }),
      skills: patchNamed(next.skills, 'Life Craving', {
        summary: 'After a Player Character spends a Fabula Point to Invoke a Trait, if the Funerary Lantern is lit, the Head of Brightvale recovers 10 HP and that PC becomes feeble until the Lantern is extinguished. A feeble PC cannot Invoke their Traits.',
      }),
    }
  }

  if (monster.id === 'official-natural-titania-midday') {
    next = {
      ...next,
      spells: patchNamed(next.spells, 'Solar Mantle', {
        effect: '[INS + WLP] +3. Titania deals HR + 20 light damage to each target.',
      }),
      skills: patchNamed(patchNamed(next.skills, 'Fairy Decree', {
        summary: 'Use an action to impose one decree, ending any previous decree; then perform a free Royal Fan attack against a random target. Season of the Opposites: when an enemy performs a Check other than an Open or Opposed Check, they succeed when the Result is lower than the Difficulty Level instead of equal or higher; critical successes and fumbles work normally. Mirror Mirror: when an enemy chooses one or more targets for an effect, they must choose randomly among eligible targets. Law of the Fairies: when an enemy performs an Opposed Check, Titania chooses which Attributes they use.',
      }), 'Dusk', {
        summary: 'When reduced to 0 HP as Queen of Midday, Titania must spend 1 Ultima Point; Titania and all remaining Sun Poppies leave the conflict, and at the end of the current round Titania returns as Queen of Midnight accompanied by two Moon Orchids. If Titania has no Ultima Points left, they surrender.',
      }),
    }
  }

  if (monster.id === 'official-natural-titania-midnight') {
    next = {
      ...next,
      spells: patchNamed(next.spells, 'Lunar Blanket', {
        effect: '[INS + MIG] +3. Titania deals HR + 20 dark damage to the target, and the target suffers weak.',
      }),
      skills: patchNamed(patchNamed(next.skills, 'Wild Hunt', {
        summary: 'Use an action to declare one hunt, ending any previous hunt; then perform a free Fairy Arrow attack against a random target. Hound the Prey: Titania and Moon Orchids deal 5 extra damage against weak targets. Gathering Horn: choose a Moon Orchid on the scene; it performs its turn immediately after Titania’s turn this round. Thrill of the Hunt: the next time a source would deal damage to Titania and/or one or more Moon Orchids, that source deals no damage instead.',
      }), 'Dawn', {
        summary: 'When reduced to 0 HP as Queen of Midnight, Titania must spend 1 Ultima Point; Titania and all remaining Moon Orchids leave the conflict, and at the end of the current round Titania returns as Queen of Midday accompanied by two Sun Poppies. If Titania has no Ultima Points left, they surrender.',
      }),
    }
  }

  if (monster.id === 'official-natural-eldgren') {
    next = {
      ...next,
      skills: patchNamed(next.skills, 'Ancestral Grudge', {
        summary: 'When an opponent causes Eldgren to lose HP, she starts bearing a grudge toward them; she can bear only one grudge at a time. If Eldgren recovers HP while bearing a grudge, she instead recovers no HP and stops bearing a grudge.',
      }),
    }
  }

  if (monster.id === 'official-natural-eldgren-heart') {
    next = {
      ...next,
      spells: patchNamed(next.spells, 'Parasite Grasp', {
        effect: 'The Heart loses the exact amount of HP required to enter Crisis. Then each creature present on the scene, including the Heart, suffers poison damage equal to the HP lost with this spell divided by the number of creatures present. If a Player Character learns this spell with Spell Mimic, they immediately lose all Fabula Points and suffer enraged.',
      }),
    }
  }

  return next
}

export function applyOfficialNaturalFantasyDeepCorrections() {
  try {
    const records = JSON.parse(localStorage.getItem('fu-monsters') || '[]')
    if (!Array.isArray(records)) return

    let changed = false
    const next = records.map((monster: StoredMonster) => {
      const verified = affinityRows[monster?.id]
      if (!verified) return monster

      let updated = patchMechanics(monster)
      const note = `Deep source audit: Atlas: Natural Fantasy, printed page ${verified.page}; full affinity row and profile mechanics checked against the rendered source page.`
      const notes = Array.isArray(updated.notes) ? updated.notes : []
      updated = {
        ...updated,
        affinities: { ...verified.row },
        notes: notes.includes(note) ? notes : [...notes, note],
      }

      if (JSON.stringify(updated) !== JSON.stringify(monster)) changed = true
      return updated
    })

    if (changed) localStorage.setItem('fu-monsters', JSON.stringify(next))
  } catch {
    // Leave existing records untouched if stored data is malformed.
  }
}
