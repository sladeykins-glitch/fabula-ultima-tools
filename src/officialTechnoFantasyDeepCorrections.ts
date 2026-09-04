type StoredMonster = Record<string, any>

type Affinity = 'Normal' | 'Vulnerable' | 'Resistant' | 'Immune' | 'Absorb'
type Affinities = Record<'physical'|'air'|'bolt'|'dark'|'earth'|'fire'|'ice'|'light'|'poison', Affinity>

const N: Affinity = 'Normal'
const V: Affinity = 'Vulnerable'
const R: Affinity = 'Resistant'
const I: Affinity = 'Immune'
const A: Affinity = 'Absorb'

const affinities: Record<string, Affinities> = {
  'official-techno-commissioner-vyne': { physical:N, air:N, bolt:R, dark:R, earth:V, fire:N, ice:N, light:V, poison:V },
  'official-techno-syntech-cop': { physical:N, air:R, bolt:N, dark:N, earth:R, fire:N, ice:V, light:N, poison:N },
  'official-techno-surveillance-drone': { physical:N, air:V, bolt:V, dark:N, earth:R, fire:N, ice:N, light:N, poison:I },
  'official-techno-eight': { physical:N, air:V, bolt:R, dark:V, earth:R, fire:N, ice:N, light:R, poison:I },
  'official-techno-nine': { physical:N, air:R, bolt:V, dark:N, earth:R, fire:V, ice:N, light:N, poison:I },
  'official-techno-seven': { physical:N, air:N, bolt:N, dark:R, earth:R, fire:R, ice:V, light:V, poison:I },
  'official-techno-primary-core': { physical:N, air:N, bolt:I, dark:N, earth:V, fire:V, ice:A, light:R, poison:I },
  'official-techno-digital-limb-a': { physical:I, air:V, bolt:N, dark:V, earth:N, fire:N, ice:R, light:R, poison:I },
  'official-techno-digital-limb-b': { physical:I, air:N, bolt:N, dark:V, earth:V, fire:N, ice:R, light:R, poison:I },
  'official-techno-relentless': { physical:R, air:R, bolt:N, dark:N, earth:R, fire:R, ice:N, light:R, poison:I },
  'official-techno-attack-wing': { physical:N, air:R, bolt:V, dark:N, earth:R, fire:R, ice:N, light:N, poison:I },
  'official-techno-support-wing': { physical:R, air:R, bolt:R, dark:N, earth:R, fire:V, ice:N, light:R, poison:I },
  'official-techno-admiral-ceryon': { physical:R, air:R, bolt:R, dark:R, earth:R, fire:R, ice:R, light:N, poison:N },
  'official-techno-bioengine': { physical:N, air:R, bolt:A, dark:R, earth:R, fire:R, ice:V, light:V, poison:R },
  'official-techno-patriarch': { physical:N, air:N, bolt:N, dark:I, earth:N, fire:N, ice:V, light:I, poison:V },
  'official-techno-right-hand': { physical:N, air:R, bolt:N, dark:R, earth:N, fire:V, ice:R, light:V, poison:R },
  'official-techno-left-hand': { physical:R, air:R, bolt:V, dark:V, earth:N, fire:R, ice:R, light:R, poison:R },
  'official-techno-conceptual-dyad': { physical:R, air:N, bolt:N, dark:N, earth:V, fire:N, ice:N, light:N, poison:R },
  'official-techno-pure-concept': { physical:R, air:R, bolt:V, dark:R, earth:I, fire:V, ice:R, light:A, poison:I },
}

const scores: Record<string, { defense:number; magicDefense:number }> = {
  'official-techno-commissioner-vyne': { defense:9, magicDefense:10 },
  'official-techno-syntech-cop': { defense:10, magicDefense:8 },
  'official-techno-surveillance-drone': { defense:9, magicDefense:12 },
  'official-techno-eight': { defense:9, magicDefense:12 },
  'official-techno-nine': { defense:6, magicDefense:8 },
  'official-techno-seven': { defense:8, magicDefense:10 },
  'official-techno-primary-core': { defense:8, magicDefense:10 },
  'official-techno-digital-limb-a': { defense:10, magicDefense:8 },
  'official-techno-digital-limb-b': { defense:9, magicDefense:12 },
  'official-techno-relentless': { defense:6, magicDefense:10 },
  'official-techno-attack-wing': { defense:12, magicDefense:10 },
  'official-techno-support-wing': { defense:10, magicDefense:12 },
  'official-techno-admiral-ceryon': { defense:11, magicDefense:11 },
  'official-techno-bioengine': { defense:14, magicDefense:10 },
  'official-techno-patriarch': { defense:10, magicDefense:15 },
  'official-techno-right-hand': { defense:13, magicDefense:12 },
  'official-techno-left-hand': { defense:14, magicDefense:10 },
  'official-techno-conceptual-dyad': { defense:11, magicDefense:13 },
  'official-techno-pure-concept': { defense:11, magicDefense:11 },
}

const pages: Record<string, number> = {
  'official-techno-commissioner-vyne':186,
  'official-techno-syntech-cop':187,
  'official-techno-surveillance-drone':188,
  'official-techno-eight':192,
  'official-techno-nine':193,
  'official-techno-seven':194,
  'official-techno-primary-core':198,
  'official-techno-digital-limb-a':199,
  'official-techno-digital-limb-b':199,
  'official-techno-relentless':202,
  'official-techno-attack-wing':203,
  'official-techno-support-wing':203,
  'official-techno-admiral-ceryon':204,
  'official-techno-bioengine':205,
  'official-techno-patriarch':210,
  'official-techno-right-hand':211,
  'official-techno-left-hand':211,
  'official-techno-conceptual-dyad':212,
  'official-techno-pure-concept':213,
}

const skillText: Record<string, Record<string, string>> = {
  'official-techno-commissioner-vyne': {
    "You're Done When I Say So": 'When a creature Vyne can see reaches 0 HP and is not shaken, she immediately makes a free Shock Baton attack against it. If the attack hits, it deals no damage; the target cannot Surrender or Sacrifice, recovers 20 HP, and suffers dazed and shaken. This special rule can only be applied once per creature.',
  },
  'official-techno-eight': {
    'Squad Tactics': 'At the start of each round, choose Defensive Formation (+2 DEF/M.DEF to Eight and all allies), Magebreaker Protocol (+10 MP cost to enemy spells and Skills), or No Quarter (+5 damage dealt by Eight/allies and +5 damage suffered from all sources). Each tactic lasts until end of round, and Eight cannot declare the same tactic twice in a row.',
  },
  'official-techno-nine': {
    'Seven, Eight! No!': 'The first time Seven and/or Eight reach 0 HP during the conflict, Nine may immediately perform the Spell action for free, using Gamma Cannon against the enemy who brought her allies to 0 HP; she must still pay the required MP. Afterwards, until end of scene, all damage dealt by Nine ignores Resistances.',
  },
  'official-techno-relentless': {
    'No Hesitation': 'While in Crisis, the Relentless may use an action and spend 10 MP to increase its offensive potential. It suffers dazed, but deals +5 damage with all attacks for as long as it remains dazed.',
    'Target Locked': 'Use an action to choose one visible enemy. If the Relentless locks on, roll d6 for Aurora Batteries: 1-2 air, 3-4 fire, 5-6 light. The ship becomes Vulnerable to the corresponding opposite type (bolt for air, ice for fire, dark for light) until it performs Aurora Batteries.',
  },
  'official-techno-bioengine': {
    'Adrenal Overcharge': 'The Bioengine loses 30 HP and Lightning Quill gains multi (2) until the end of its next turn.',
    'Growing Anger': 'When the Bioengine suffers damage that is neither bolt nor physical, it gains 1 Rage Point. At the end of its turn, if it has 5 or more Rage Points, it loses all of them, recovers 10 HP per point lost, and makes a free Lightning Quill attack that deals extra damage equal to the number of points lost.',
    'Painful Anger': 'The first time the Bioengine enters Crisis in a scene, it immediately gains 5 Rage Points.',
  },
  'official-techno-patriarch': {
    'Ontological Proscription': 'Use an action to name a Class chosen randomly from those of the PCs present. Until this action is used again, no character with that Class can use the Skill or Spell actions to activate Skills of that Class or cast spells found on that Class list.',
    'Deep Insight': 'When the Patriarch completely fills a Clock during a conflict using diplomacy, charm, deception, or intimidation, he learns a secret about another creature present. If the target is a PC, that Player decides which secret is learned.',
  },
  'official-techno-left-hand': {
    'Outrageous!': 'After a creature hits the Right Hand with an attack or offensive spell, the Left Hand performs Ipse Dixit against that creature after the triggering attack or spell has been resolved.',
  },
  'official-techno-conceptual-dyad': {
    'Imperishable Dyad': 'Use an action to recover from all status effects. If the Dyad does so, it loses 20 MP for each status effect healed this way.',
    'Manifest Dyad': 'Use an action and roll d6 to declare an amplified concept: 1-2 Pneuma (dark and light), 3-4 Psyche (air and bolt), 5-6 Soma (fire and ice). Until the next use of Manifest Dyad, while the Dyad has at least 1 MP and is not in Crisis, it is Immune to all damage types except those of its current amplified concept. The same concept cannot be manifested twice in a row.',
  },
  'official-techno-pure-concept': {
    'Glory': 'Use an action to treat all Attributes as one die size higher until the end of the scene. This is cumulative, up to d12 in each Attribute.',
    'Transcendence': 'Use an action to recover from all status effects, remove any symbol currently being borne, and stop being affected by all Scene-duration spells currently affecting the Pure Concept.',
    'Paradise Lost': 'The first time the Pure Concept enters Crisis, erase all sections of the Foundations of a New Universe Clock. Then each PC present recovers 9999 MP and gains Fabula Points equal to the number of erased sections divided by the number of PCs present.',
  },
}

const attackText: Record<string, Record<string, string>> = {
  'official-techno-digital-limb-b': {
    'IF (...) ELSE': 'Targets Magic Defense and deals no damage. Apply an effect based on a status the target currently suffers: dazed - during their next turn they must perform the Attack action (including the primary core among targets if possible); weak - lose 20 HP; slow - perform one fewer action during the next turn (minimum 0); shaken - lose 20 MP. If the target suffers two or more of these statuses, apply only one in this priority: dazed, then weak, then slow, then shaken.',
  },
}

const spellText: Record<string, Record<string, string>> = {
  'official-techno-surveillance-drone': {
    'Painting Laser': 'Magic Check: INS + WLP +4. Until this spell ends, when the target suffers damage, they suffer 5 extra damage and that damage ignores Resistances. Once that happens, this spell ends.',
  },
  'official-techno-nine': {
    'Ventus': 'Magic Check: INS + WLP +5. Each target suffers HR + 20 air damage. Opportunity: each flying target hit by this spell is forced to land immediately.',
  },
  'official-techno-primary-core': {
    'Computer Virus': 'Magic Check: INS + WLP +3. Each target suffers poisoned.',
  },
  'official-techno-pure-concept': {
    'Kaleidomachy': 'Magic Check: MIG + WLP +5. Each target suffers HR + 25 damage; the damage type is the same as the last damage type suffered by the Pure Concept during this scene.',
  },
}

function replaceNamed<T extends { name?: string }>(entries: T[] | undefined, replacements: Record<string,string> | undefined, field: 'summary'|'effect') {
  if (!Array.isArray(entries) || !replacements) return entries
  return entries.map(entry => {
    const name = String(entry?.name || '')
    const replacement = replacements[name]
    return replacement ? { ...entry, [field]: replacement } : entry
  })
}

export function applyOfficialTechnoFantasyDeepCorrections() {
  try {
    const records = JSON.parse(localStorage.getItem('fu-monsters') || '[]')
    if (!Array.isArray(records)) return
    let changed = false

    const next = records.map((monster: StoredMonster) => {
      const id = String(monster?.id || '')
      const exactAffinity = affinities[id]
      const exactScores = scores[id]
      const page = pages[id]
      if (!exactAffinity && !exactScores && !page) return monster

      let updated = monster
      if (exactAffinity && JSON.stringify(monster.affinities) !== JSON.stringify(exactAffinity)) {
        updated = { ...updated, affinities: exactAffinity }
      }
      if (exactScores && (updated.defense !== exactScores.defense || updated.magicDefense !== exactScores.magicDefense)) {
        updated = { ...updated, ...exactScores }
      }

      const skills = replaceNamed(updated.skills, skillText[id], 'summary')
      const attacks = replaceNamed(updated.attacks, attackText[id], 'effect')
      const spells = replaceNamed(updated.spells, spellText[id], 'effect')
      if (skills !== updated.skills || attacks !== updated.attacks || spells !== updated.spells) {
        updated = { ...updated, skills, attacks, spells }
      }

      if (page) {
        const note = `Deep source audit: Atlas: Techno Fantasy, printed page ${page}; affinities, DEF/M.DEF and profile mechanics checked against the rendered source page.`
        const notes = Array.isArray(updated.notes) ? updated.notes : []
        if (!notes.includes(note)) updated = { ...updated, notes: [...notes, note] }
      }

      if (JSON.stringify(updated) !== JSON.stringify(monster)) changed = true
      return updated
    })

    if (changed) localStorage.setItem('fu-monsters', JSON.stringify(next))
  } catch {
    // Leave stored records untouched if correction application fails.
  }
}
