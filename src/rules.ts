export type AttributeKey = 'dex' | 'ins' | 'mig' | 'wlp'
export type Die = 6 | 8 | 10 | 12
export type Species = 'Beast' | 'Construct' | 'Demon' | 'Elemental' | 'Humanoid' | 'Monster' | 'Plant' | 'Undead'
export type Rank = 'Soldier' | 'Elite' | 'Champion'
export type Affinity = 'Normal' | 'Vulnerable' | 'Resistant' | 'Immune' | 'Absorb'

export const speciesRules: Record<Species, { startingSkills: number; note: string }> = {
  Beast: { startingSkills: 4, note: 'Cannot acquire Use Equipment.' },
  Construct: { startingSkills: 2, note: 'Immune to poison damage; resistant to earth; immune to poisoned.' },
  Demon: { startingSkills: 3, note: 'Resistant to two chosen damage types.' },
  Elemental: { startingSkills: 2, note: 'Immune to poison damage and poisoned; immune to one additional chosen damage type.' },
  Humanoid: { startingSkills: 3, note: 'Gains Use Equipment for free.' },
  Monster: { startingSkills: 4, note: 'No additional species rule.' },
  Plant: { startingSkills: 3, note: 'Immune to dazed, shaken and enraged; choose air, bolt, fire or ice vulnerability.' },
  Undead: { startingSkills: 2, note: 'Immune to dark and poison; immune to poisoned; vulnerable to light.' },
}

export const attributeArrays: Record<string, Die[]> = {
  'Jack of All Trades': [8, 8, 8, 8],
  Standard: [10, 8, 8, 6],
  Specialized: [10, 10, 6, 6],
  'Super Specialized': [12, 8, 6, 6],
}

export const damageTypes = ['physical', 'air', 'bolt', 'dark', 'earth', 'fire', 'ice', 'light', 'poison'] as const

export interface Monster {
  id: string
  name: string
  source: 'Generated' | 'Custom' | 'Official'
  level: number
  rank: Rank
  soldierEquivalent: number
  species: Species
  traits: string[]
  attributes: Record<AttributeKey, Die>
  hp: number
  crisis: number
  mp: number
  initiative: number
  defense: number
  magicDefense: number
  accuracyBonus: number
  magicBonus: number
  levelDamageBonus: number
  turnsPerRound: number
  skillBudget: number
  affinities: Record<(typeof damageTypes)[number], Affinity>
  attacks: { name: string; formula: string; damageType: string }[]
  notes: string[]
}

export function calculateBaseStats(level: number, attrs: Record<AttributeKey, Die>) {
  const hp = level * 2 + attrs.mig * 5
  return {
    hp,
    crisis: Math.floor(hp / 2),
    mp: level + attrs.wlp * 5,
    initiative: Math.floor((attrs.dex + attrs.ins) / 2),
    defense: attrs.dex,
    magicDefense: attrs.ins,
    accuracyBonus: Math.floor(level / 10),
    magicBonus: Math.floor(level / 10),
    levelDamageBonus: level >= 60 ? 15 : level >= 40 ? 10 : level >= 20 ? 5 : 0,
  }
}

export function skillBudget(level: number, species: Species, rank: Rank, soldierEquivalent: number) {
  const base = speciesRules[species].startingSkills + Math.floor(level / 10)
  if (rank === 'Elite') return base + 1
  if (rank === 'Champion') return base + Math.max(2, soldierEquivalent)
  return base
}

function pick<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)]
}

function shuffle<T>(values: readonly T[]): T[] {
  return [...values].sort(() => Math.random() - 0.5)
}

export function generateMonster(options: {
  level: number
  rank: Rank
  soldierEquivalent: number
  species: Species
  complexity: 'Simple' | 'Standard' | 'Crunchy'
}): Monster {
  const { level, rank, species, complexity } = options
  const soldierEquivalent = rank === 'Elite' ? 2 : rank === 'Champion' ? Math.max(2, options.soldierEquivalent) : 1
  const arrayName = pick(Object.keys(attributeArrays))
  const dice = shuffle(attributeArrays[arrayName])
  const attrs: Record<AttributeKey, Die> = { dex: dice[0], ins: dice[1], mig: dice[2], wlp: dice[3] }
  const base = calculateBaseStats(level, attrs)

  let hp = base.hp
  let mp = base.mp
  let initiative = base.initiative
  let turnsPerRound = 1
  if (rank === 'Elite') {
    hp *= 2
    initiative += 2
    turnsPerRound = 2
  } else if (rank === 'Champion') {
    hp *= soldierEquivalent
    mp *= 2
    initiative += soldierEquivalent
    turnsPerRound = soldierEquivalent
  }

  const affinities = Object.fromEntries(damageTypes.map(t => [t, 'Normal'])) as Monster['affinities']
  if (species === 'Construct') { affinities.poison = 'Immune'; affinities.earth = 'Resistant' }
  if (species === 'Demon') shuffle(damageTypes.filter(t => t !== 'physical')).slice(0, 2).forEach(t => affinities[t] = 'Resistant')
  if (species === 'Elemental') { affinities.poison = 'Immune'; affinities[pick(damageTypes.filter(t => t !== 'poison'))] = 'Immune' }
  if (species === 'Plant') affinities[pick(['air', 'bolt', 'fire', 'ice'] as const)] = 'Vulnerable'
  if (species === 'Undead') { affinities.dark = 'Immune'; affinities.poison = 'Immune'; affinities.light = 'Vulnerable' }

  const attackCount = complexity === 'Simple' ? 1 : complexity === 'Standard' ? 2 : 3
  const attackNames = ['Rending Strike', 'Arc Burst', 'Crushing Blow', 'Venom Lash', 'Howling Fang', 'Runic Shot', 'Shadow Claw']
  const pairs: [AttributeKey, AttributeKey][] = [['dex','mig'], ['dex','ins'], ['mig','mig'], ['ins','wlp'], ['dex','dex']]
  const attacks = Array.from({ length: attackCount }, (_, i) => {
    const [a, b] = pick(pairs)
    const type = pick(damageTypes)
    const mod = 5 + base.levelDamageBonus + (complexity === 'Crunchy' && i === 0 ? 5 : 0)
    return { name: attackNames[(Math.floor(Math.random() * attackNames.length) + i) % attackNames.length], formula: `[${a.toUpperCase()} + ${b.toUpperCase()}] +${base.accuracyBonus} / HR + ${mod}`, damageType: type }
  })

  return {
    id: crypto.randomUUID(),
    name: `${pick(['Ash', 'Storm', 'Moon', 'Iron', 'Thorn', 'Grave', 'Crystal'])}${pick(['fang', 'wing', 'maw', 'shade', 'horn', 'bloom', 'shell'])}`,
    source: 'Generated', level, rank, soldierEquivalent, species,
    traits: shuffle(['aggressive', 'cunning', 'ancient', 'restless', 'territorial', 'hungry', 'mysterious', 'unyielding']).slice(0, 4),
    attributes: attrs,
    hp, crisis: Math.floor(hp / 2), mp, initiative,
    defense: base.defense, magicDefense: base.magicDefense,
    accuracyBonus: base.accuracyBonus, magicBonus: base.magicBonus, levelDamageBonus: base.levelDamageBonus,
    turnsPerRound, skillBudget: skillBudget(level, species, rank, soldierEquivalent),
    affinities, attacks,
    notes: [speciesRules[species].note, `${arrayName} attribute array.`],
  }
}
