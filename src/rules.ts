export type AttributeKey = 'dex' | 'ins' | 'mig' | 'wlp'
export type Die = 6 | 8 | 10 | 12
export type Species = 'Beast' | 'Construct' | 'Demon' | 'Elemental' | 'Humanoid' | 'Monster' | 'Plant' | 'Undead'
export type Rank = 'Soldier' | 'Elite' | 'Champion'
export type Affinity = 'Normal' | 'Vulnerable' | 'Resistant' | 'Immune' | 'Absorb'
export type Complexity = 'Simple' | 'Standard' | 'Crunchy'

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
export type DamageType = (typeof damageTypes)[number]
const nonPhysical = damageTypes.filter(t => t !== 'physical')
const basicStatuses = ['dazed', 'shaken', 'slow', 'weak'] as const
const allStatuses = ['dazed', 'shaken', 'slow', 'weak', 'enraged', 'poisoned'] as const

export interface MonsterAttack {
  name: string
  formula: string
  damageType: string
  effect?: string
}

export interface MonsterSkill {
  name: string
  summary: string
}

export interface MonsterSpell {
  name: string
  mp: string
  target: string
  duration: string
  effect: string
}

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
  affinities: Record<DamageType, Affinity>
  attacks: MonsterAttack[]
  skills: MonsterSkill[]
  spells: MonsterSpell[]
  notes: string[]
}

function increaseDie(die: Die): Die {
  return die === 6 ? 8 : die === 8 ? 10 : 12
}

function applyLevelAttributeIncreases(level: number, attrs: Record<AttributeKey, Die>) {
  const result = { ...attrs }
  const increases = (level >= 20 ? 1 : 0) + (level >= 40 ? 1 : 0) + (level >= 60 ? 1 : 0)
  for (let i = 0; i < increases; i++) {
    const eligible = (Object.keys(result) as AttributeKey[]).filter(k => result[k] < 12)
    if (!eligible.length) break
    const key = pick(eligible)
    result[key] = increaseDie(result[key])
  }
  return result
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

function sampleTwo<T>(values: readonly T[]): [T, T] {
  const first = pick(values)
  let second = pick(values)
  while (second === first) second = pick(values)
  return [first, second]
}

function makeSpell(level: number, rank: Rank): MonsterSpell {
  const type = pick(damageTypes)
  const status = pick(basicStatuses)
  const status2 = pick(basicStatuses.filter(s => s !== status))
  const options: MonsterSpell[] = [
    { name: 'Area Status', mp: '20', target: 'Any visible creatures', duration: 'Instantaneous', effect: `Each chosen target suffers ${status}.` },
    { name: 'Breath', mp: '5', target: 'One creature', duration: 'Instantaneous', effect: `Magic Check; target suffers HR + 10 ${type} damage.` },
    { name: 'Curse', mp: '5', target: 'One creature', duration: 'Instantaneous', effect: `Magic Check; target suffers ${status}.` },
    { name: 'Curse XL', mp: '10', target: 'One creature', duration: 'Instantaneous', effect: `Magic Check; target suffers ${status} and ${status2}.` },
    { name: 'Cursed Breath', mp: '10', target: 'One creature', duration: 'Instantaneous', effect: `Magic Check; target suffers HR + 15 ${type} damage and ${status}.` },
    { name: 'Lick Wounds', mp: '5', target: 'Self', duration: 'Instantaneous', effect: `Recover ${level >= 60 ? 50 : level >= 40 ? 40 : level >= 20 ? 30 : 20} HP.` },
    { name: 'Life Theft', mp: '10', target: 'One creature', duration: 'Instantaneous', effect: `Magic Check; target suffers HR + 15 ${type} damage, then recover HP equal to half the HP loss caused.` },
    { name: 'Mind Theft', mp: '10', target: 'One creature', duration: 'Instantaneous', effect: `Magic Check; target suffers HR + 15 ${type} damage, then recover MP equal to half the HP loss caused.` },
    { name: 'Poison', mp: '10 × T', target: 'Up to three creatures', duration: 'Instantaneous', effect: 'Each target hit suffers poisoned.' },
    { name: 'Quicken', mp: '20', target: 'One creature', duration: 'Instantaneous', effect: 'The target may immediately perform a free attack.' },
    { name: 'Rage', mp: '10 × T', target: 'Up to three creatures', duration: 'Instantaneous', effect: 'Each target hit suffers enraged.' },
    { name: 'Shell', mp: '10', target: 'Self', duration: 'Scene', effect: 'Gain Resistance to physical damage until the spell ends.' },
    { name: 'War Cry', mp: '10 × T', target: 'Up to three creatures', duration: 'Scene', effect: 'Each target gains +1 to Accuracy Checks until the spell ends.' },
    { name: 'Weaken', mp: '10', target: 'One creature', duration: 'Scene', effect: `Magic Check; target suffers 5 extra damage from all sources dealing ${type} damage.` },
  ]
  if (level >= 30 && rank !== 'Soldier') {
    options.push({ name: 'Devastation', mp: '30', target: 'Any visible creatures', duration: 'Instantaneous', effect: `Each chosen target suffers 30 ${type} damage. Once per turn; only on this NPC's last turn in the round.` })
  }
  return pick(options)
}

function chooseSkillName(complexity: Complexity, species: Species, chosen: MonsterSkill[], affinities: Record<DamageType, Affinity>) {
  const limited = new Set(chosen.filter(s => ['Final Act', 'Flying', 'Improved Initiative', 'Use Equipment'].includes(s.name)).map(s => s.name))
  const simple = ['Improved Damage','Improved Defenses','Improved Hit Points','Damage Resistance','Damage Immunity','Status Effect Immunity','Specialized']
  const standard = [...simple,'Crisis Effect','Special Attack','Spellcaster','Unique Action','Reaction']
  const crunchy = [...standard,'Final Act','Flying','Improved Initiative']
  let pool = complexity === 'Simple' ? simple : complexity === 'Standard' ? standard : crunchy
  if (species !== 'Beast') pool = [...pool, 'Use Equipment']
  pool = pool.filter(name => !limited.has(name))
  if (!Object.values(affinities).some(a => a === 'Resistant' || a === 'Immune')) pool = pool.filter(n => n !== 'Damage Absorption')
  else pool = [...pool, 'Damage Absorption']
  return pick(pool)
}

export function generateMonster(options: {
  level: number
  rank: Rank
  soldierEquivalent: number
  species: Species
  complexity: Complexity
}): Monster {
  const { level, rank, species, complexity } = options
  const soldierEquivalent = rank === 'Elite' ? 2 : rank === 'Champion' ? Math.max(2, options.soldierEquivalent) : 1
  const arrayName = pick(Object.keys(attributeArrays))
  const dice = shuffle(attributeArrays[arrayName])
  const rawAttrs: Record<AttributeKey, Die> = { dex: dice[0], ins: dice[1], mig: dice[2], wlp: dice[3] }
  const attrs = applyLevelAttributeIncreases(level, rawAttrs)
  const base = calculateBaseStats(level, attrs)

  let hp = base.hp
  let mp = base.mp
  let initiative = base.initiative
  let defense = base.defense
  let magicDefense = base.magicDefense
  let accuracyBonus = base.accuracyBonus
  let magicBonus = base.magicBonus
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

  const affinities = Object.fromEntries(damageTypes.map(t => [t, 'Normal'])) as Record<DamageType, Affinity>
  if (species === 'Construct') { affinities.poison = 'Immune'; affinities.earth = 'Resistant' }
  if (species === 'Demon') shuffle(nonPhysical).slice(0, 2).forEach(t => affinities[t] = 'Resistant')
  if (species === 'Elemental') { affinities.poison = 'Immune'; affinities[pick(nonPhysical.filter(t => t !== 'poison'))] = 'Immune' }
  if (species === 'Plant') affinities[pick(['air', 'bolt', 'fire', 'ice'] as const)] = 'Vulnerable'
  if (species === 'Undead') { affinities.dark = 'Immune'; affinities.poison = 'Immune'; affinities.light = 'Vulnerable' }

  const attackCount = complexity === 'Simple' ? 1 : complexity === 'Standard' ? 2 : 3
  const attackNames = ['Rending Strike', 'Arc Burst', 'Crushing Blow', 'Venom Lash', 'Howling Fang', 'Runic Shot', 'Shadow Claw']
  const pairs: [AttributeKey, AttributeKey][] = [['dex','mig'], ['dex','ins'], ['mig','mig'], ['ins','wlp'], ['dex','dex']]
  const attacks: MonsterAttack[] = Array.from({ length: attackCount }, (_, i) => {
    const [a, b] = pick(pairs)
    const type = pick(damageTypes)
    const mod = 5 + base.levelDamageBonus
    return { name: attackNames[(Math.floor(Math.random() * attackNames.length) + i) % attackNames.length], formula: `[${a.toUpperCase()} + ${b.toUpperCase()}] +${accuracyBonus} / HR + ${mod}`, damageType: type }
  })

  const budget = skillBudget(level, species, rank, soldierEquivalent)
  const skills: MonsterSkill[] = []
  const spells: MonsterSpell[] = []
  const freeSkills: MonsterSkill[] = species === 'Humanoid' ? [{ name:'Use Equipment', summary:'Free from Humanoid Species; gains accessory, armor, main-hand and off-hand equipment slots.' }] : []

  for (let i = 0; i < budget; i++) {
    let skillName = chooseSkillName(complexity, species, skills, affinities)

    if (skillName === 'Improved Damage') {
      const attack = pick(attacks)
      const match = attack.formula.match(/HR \+ (\d+)/)
      if (match) attack.formula = attack.formula.replace(/HR \+ \d+/, `HR + ${Number(match[1]) + 5}`)
      skills.push({ name:skillName, summary:`${attack.name} deals 5 extra damage.` })
    } else if (skillName === 'Improved Defenses') {
      const previous = skills.filter(s => s.name === skillName).length
      if (previous >= 2) { i--; continue }
      if (Math.random() < 0.5) { defense += 2; magicDefense += 1; skills.push({ name:skillName, summary:'+2 Defense and +1 Magic Defense.' }) }
      else { defense += 1; magicDefense += 2; skills.push({ name:skillName, summary:'+1 Defense and +2 Magic Defense.' }) }
    } else if (skillName === 'Improved Hit Points') {
      hp += 10
      skills.push({ name:skillName, summary:'+10 maximum HP.' })
    } else if (skillName === 'Improved Initiative') {
      initiative += 4
      skills.push({ name:skillName, summary:'+4 Initiative.' })
    } else if (skillName === 'Damage Resistance') {
      const [a,b] = sampleTwo(damageTypes)
      for (const t of [a,b]) affinities[t] = affinities[t] === 'Vulnerable' ? 'Normal' : 'Resistant'
      skills.push({ name:skillName, summary:`Resistance to ${a} and ${b}; a Species-caused Vulnerability is removed instead.` })
    } else if (skillName === 'Damage Immunity') {
      const eligible = damageTypes.filter(t => affinities[t] !== 'Vulnerable')
      const t = pick(eligible)
      affinities[t] = 'Immune'
      skills.push({ name:skillName, summary:`Immunity to ${t} damage.` })
    } else if (skillName === 'Damage Absorption') {
      const eligible = damageTypes.filter(t => affinities[t] === 'Resistant' || affinities[t] === 'Immune')
      if (!eligible.length) { i--; continue }
      const t = pick(eligible)
      affinities[t] = 'Absorb'
      skills.push({ name:skillName, summary:`Absorbs ${t} damage.` })
    } else if (skillName === 'Status Effect Immunity') {
      const [a,b] = sampleTwo(allStatuses)
      skills.push({ name:skillName, summary:`Immune to ${a} and ${b}.` })
    } else if (skillName === 'Specialized') {
      const used = skills.filter(s => s.name === skillName).map(s => s.summary)
      const choices = ['+3 to all Accuracy Checks.','+3 to all Magic Checks.','+3 to Opposed Checks in a specific context.'].filter(x => !used.includes(x))
      if (!choices.length) { i--; continue }
      const choice = pick(choices)
      if (choice.startsWith('+3 to all Accuracy')) accuracyBonus += 3
      if (choice.startsWith('+3 to all Magic')) magicBonus += 3
      skills.push({ name:skillName, summary:choice })
    } else if (skillName === 'Spellcaster') {
      if (Math.random() < 0.5) {
        mp += 10
        const spell = makeSpell(level, rank)
        spells.push(spell)
        skills.push({ name:skillName, summary:`Learns ${spell.name} and gains +10 maximum MP.` })
      } else {
        const first = makeSpell(level, rank)
        let second = makeSpell(level, rank)
        for (let tries=0; second.name === first.name && tries < 10; tries++) second = makeSpell(level, rank)
        spells.push(first, second)
        skills.push({ name:skillName, summary:`Learns ${first.name} and ${second.name}.` })
      }
    } else if (skillName === 'Special Attack') {
      const attack = pick(attacks)
      const effects = [
        'gains multi (2)', 'targets Magic Defense instead of Defense', `inflicts ${pick(basicStatuses)}`,
        'recovers HP equal to half the HP loss it causes', 'prevents a specific action on the target’s next turn',
        'grants the NPC a temporary bonus until its next turn'
      ]
      const effect = pick(effects)
      attack.effect = effect
      skills.push({ name:skillName, summary:`${attack.name}: ${effect}.` })
    } else if (skillName === 'Crisis Effect') {
      const effect = pick(['attacks gain multi (2)','damage ignores Resistances','one or more damage Affinities change'])
      skills.push({ name:skillName, summary:`While in Crisis, ${effect}.` })
    } else if (skillName === 'Reaction') {
      const reaction = pick(['after being missed by a melee attack, performs a basic attack','when hit by an offensive spell, deals minor damage to the attacker','when damaged, recovers some MP'])
      skills.push({ name:skillName, summary:`Reaction: ${reaction}.` })
    } else if (skillName === 'Unique Action') {
      const action = pick(['next attack or spell deals 10 extra damage','changes stance and alters damage Affinities','calls very weak reinforcements'])
      skills.push({ name:skillName, summary:`Skill action: ${action}.` })
    } else if (skillName === 'Final Act') {
      skills.push({ name:skillName, summary:'Limited. When reduced to 0 HP, immediately performs a special action or attack; damaging versions should deal minor damage.' })
    } else if (skillName === 'Flying') {
      skills.push({ name:skillName, summary:'Limited. Can fly; cannot normally be targeted by melee attacks from non-flying attackers. Vulnerable damage forces it to land until end of round; loses this benefit in Crisis.' })
    } else if (skillName === 'Use Equipment') {
      skills.push({ name:skillName, summary:'Limited. Gains accessory, armor, main-hand and off-hand equipment slots.' })
    }
  }

  const allSkills = [...freeSkills, ...skills]
  const notes = [speciesRules[species].note, `${arrayName} attribute array.`]
  if (level >= 20) notes.push(`Level-based Attribute increases applied at ${[20,40,60].filter(n=>level>=n).join(', ')}.`)
  notes.push(...allSkills.map(s => `${s.name}: ${s.summary}`))
  notes.push(...spells.map(s => `Spell — ${s.name} (${s.mp} MP, ${s.target}, ${s.duration}): ${s.effect}`))

  return {
    id: crypto.randomUUID(),
    name: `${pick(['Ash', 'Storm', 'Moon', 'Iron', 'Thorn', 'Grave', 'Crystal'])}${pick(['fang', 'wing', 'maw', 'shade', 'horn', 'bloom', 'shell'])}`,
    source: 'Generated', level, rank, soldierEquivalent, species,
    traits: shuffle(['aggressive', 'cunning', 'ancient', 'restless', 'territorial', 'hungry', 'mysterious', 'unyielding']).slice(0, 4),
    attributes: attrs,
    hp, crisis: Math.floor(hp / 2), mp, initiative,
    defense, magicDefense,
    accuracyBonus, magicBonus, levelDamageBonus: base.levelDamageBonus,
    turnsPerRound, skillBudget: budget,
    affinities, attacks, skills: allSkills, spells, notes,
  }
}
