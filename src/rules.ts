export type AttributeKey = 'dex' | 'ins' | 'mig' | 'wlp'
export type Die = 6 | 8 | 10 | 12
export type Species = 'Beast' | 'Construct' | 'Demon' | 'Elemental' | 'Humanoid' | 'Monster' | 'Plant' | 'Undead'
export type Rank = 'Soldier' | 'Elite' | 'Champion'
export type Affinity = 'Normal' | 'Vulnerable' | 'Resistant' | 'Immune' | 'Absorb'
export type Complexity = 'Simple' | 'Standard' | 'Crunchy'
export type CombatStyle = 'Mixed' | 'Brute' | 'Defender' | 'Controller' | 'Spellcaster' | 'Assassin' | 'Support'

export const speciesRules: Record<Species, { startingSkills: number; note: string }> = {
  Beast: { startingSkills: 4, note: 'Cannot acquire Use Equipment.' },
  Construct: { startingSkills: 2, note: 'Immune to poison damage; resistant to earth; immune to poisoned.' },
  Demon: { startingSkills: 3, note: 'Resistant to two chosen damage types.' },
  Elemental: { startingSkills: 2, note: 'Immune to poison damage and poisoned; immune to one additional chosen damage type.' },
  Humanoid: { startingSkills: 3, note: 'Gains Use Equipment for free.' },
  Monster: { startingSkills: 4, note: 'No additional species rule.' },
  Plant: { startingSkills: 3, note: 'Immune to dazed, shaken and enraged; choose air, bolt, fire or ice vulnerability.' },
  Undead: { startingSkills: 2, note: 'Immune to dark and poison; immune to poisoned; vulnerable to light. When an effect would make this NPC recover HP, its controller may instead have it lose half as many HP.' },
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

const styleAttributePriorities: Record<CombatStyle, AttributeKey[]> = {
  Mixed: ['dex', 'ins', 'mig', 'wlp'],
  Brute: ['mig', 'dex', 'wlp', 'ins'],
  Defender: ['mig', 'ins', 'wlp', 'dex'],
  Controller: ['ins', 'wlp', 'dex', 'mig'],
  Spellcaster: ['ins', 'wlp', 'dex', 'mig'],
  Assassin: ['dex', 'ins', 'mig', 'wlp'],
  Support: ['wlp', 'ins', 'dex', 'mig'],
}

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
  combatStyle?: CombatStyle
}

function increaseDie(die: Die): Die {
  return die === 6 ? 8 : die === 8 ? 10 : 12
}

function applyLevelAttributeIncreases(level: number, attrs: Record<AttributeKey, Die>, combatStyle: CombatStyle) {
  const result = { ...attrs }
  const increases = (level >= 20 ? 1 : 0) + (level >= 40 ? 1 : 0) + (level >= 60 ? 1 : 0)
  for (let i = 0; i < increases; i++) {
    const eligible = (Object.keys(result) as AttributeKey[]).filter(k => result[k] < 12)
    if (!eligible.length) break
    const preferred = styleAttributePriorities[combatStyle].filter(k => eligible.includes(k)).slice(0, 2)
    const key = combatStyle === 'Mixed' || !preferred.length ? pick(eligible) : pick(preferred)
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

function assignAttributesForStyle(dice: Die[], combatStyle: CombatStyle): Record<AttributeKey, Die> {
  if (combatStyle === 'Mixed') {
    const shuffled = shuffle(dice)
    return { dex: shuffled[0], ins: shuffled[1], mig: shuffled[2], wlp: shuffled[3] }
  }

  const sorted = [...dice].sort((a, b) => b - a)
  const attrs = {} as Record<AttributeKey, Die>
  styleAttributePriorities[combatStyle].forEach((key, index) => { attrs[key] = sorted[index] })
  return attrs
}

function makeSpell(level: number, rank: Rank, combatStyle: CombatStyle): MonsterSpell {
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

  const preferredNames: Record<CombatStyle, string[]> = {
    Mixed: [],
    Brute: ['Breath', 'Cursed Breath', 'Life Theft', 'Rage'],
    Defender: ['Shell', 'Lick Wounds', 'War Cry'],
    Controller: ['Area Status', 'Curse', 'Curse XL', 'Poison', 'Rage', 'Weaken'],
    Spellcaster: ['Breath', 'Cursed Breath', 'Curse XL', 'Mind Theft', 'Devastation'],
    Assassin: ['Cursed Breath', 'Curse', 'Life Theft', 'Weaken'],
    Support: ['Quicken', 'War Cry', 'Lick Wounds', 'Shell', 'Mind Theft'],
  }
  const preferred = options.filter(spell => preferredNames[combatStyle].includes(spell.name))
  return pick(preferred.length ? [...options, ...preferred, ...preferred] : options)
}

function chooseSkillName(complexity: Complexity, species: Species, chosen: MonsterSkill[], affinities: Record<DamageType, Affinity>, combatStyle: CombatStyle) {
  const limited = new Set(chosen.filter(s => ['Final Act', 'Flying', 'Improved Initiative', 'Use Equipment'].includes(s.name)).map(s => s.name))
  const simple = ['Improved Damage','Improved Defenses','Improved Hit Points','Damage Resistance','Damage Immunity','Status Effect Immunity','Specialized']
  const standard = [...simple,'Crisis Effect','Special Attack','Spellcaster','Unique Action','Reaction']
  const crunchy = [...standard,'Final Act','Flying','Improved Initiative']
  let pool = complexity === 'Simple' ? simple : complexity === 'Standard' ? standard : crunchy
  const styleBias: Record<CombatStyle, string[]> = {
    Mixed: [],
    Brute: ['Improved Damage','Improved Damage','Special Attack','Crisis Effect'],
    Defender: ['Improved Defenses','Improved Hit Points','Damage Resistance','Damage Immunity','Reaction'],
    Controller: ['Special Attack','Status Effect Immunity','Spellcaster','Unique Action'],
    Spellcaster: ['Spellcaster','Spellcaster','Specialized','Crisis Effect'],
    Assassin: ['Improved Damage','Specialized','Improved Initiative','Special Attack'],
    Support: ['Spellcaster','Reaction','Unique Action','Improved Defenses'],
  }
  pool = [...pool, ...styleBias[combatStyle].filter(name => pool.includes(name))]
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
  combatStyle?: CombatStyle
}): Monster {
  const { level, rank, species, complexity } = options
  const combatStyle = options.combatStyle || 'Mixed'
  const soldierEquivalent = rank === 'Elite' ? 2 : rank === 'Champion' ? Math.max(2, options.soldierEquivalent) : 1
  const arrayName = pick(Object.keys(attributeArrays))
  const dice = attributeArrays[arrayName]
  const rawAttrs = assignAttributesForStyle(dice, combatStyle)
  const attrs = applyLevelAttributeIncreases(level, rawAttrs, combatStyle)
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
  const basePairs: [AttributeKey, AttributeKey][] = [['dex','mig'], ['dex','ins'], ['mig','mig'], ['ins','wlp'], ['dex','dex']]
  const stylePairs: Partial<Record<CombatStyle, [AttributeKey, AttributeKey][]>> = {
    Brute: [['mig','mig'], ['dex','mig']],
    Defender: [['mig','mig'], ['dex','mig'], ['ins','wlp']],
    Controller: [['ins','wlp'], ['dex','ins']],
    Spellcaster: [['ins','wlp'], ['ins','wlp'], ['dex','ins']],
    Assassin: [['dex','dex'], ['dex','ins'], ['dex','mig']],
    Support: [['ins','wlp'], ['dex','ins']],
  }
  const preferredPairs = stylePairs[combatStyle] || []
  const pairs = combatStyle === 'Mixed' ? basePairs : [...preferredPairs, ...preferredPairs, ...basePairs]
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
    let skillName = chooseSkillName(complexity, species, skills, affinities, combatStyle)

    if (skillName === 'Improved Damage') {
      const alreadyImproved = new Set(skills.filter(s => s.name === skillName).map(s => s.summary.split(' deals 5 extra damage.')[0]))
      const eligible = attacks.filter(a => !alreadyImproved.has(a.name))
      if (!eligible.length) { i--; continue }
      const attack = pick(eligible)
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
      for (const t of [a,b]) {
        if (affinities[t] === 'Vulnerable') affinities[t] = 'Normal'
        else if (affinities[t] === 'Normal') affinities[t] = 'Resistant'
      }
      skills.push({ name:skillName, summary:`Resistance to ${a} and ${b}; a Species-caused Vulnerability is removed instead.` })
    } else if (skillName === 'Damage Immunity') {
      const eligible = damageTypes.filter(t => affinities[t] === 'Normal' || affinities[t] === 'Resistant')
      if (!eligible.length) { i--; continue }
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
        const spell = makeSpell(level, rank, combatStyle)
        spells.push(spell)
        skills.push({ name:skillName, summary:`Learns ${spell.name} and gains +10 maximum MP.` })
      } else {
        const first = makeSpell(level, rank, combatStyle)
        let second = makeSpell(level, rank, combatStyle)
        for (let tries=0; second.name === first.name && tries < 10; tries++) second = makeSpell(level, rank, combatStyle)
        spells.push(first, second)
        skills.push({ name:skillName, summary:`Learns ${first.name} and ${second.name}.` })
      }
    } else if (skillName === 'Special Attack') {
      const attack = pick(attacks)
      const styleEffects: Partial<Record<CombatStyle, string[]>> = {
        Brute: ['gains multi (2)', 'recovers HP equal to half the HP loss it causes'],
        Defender: ['grants the NPC a temporary bonus until its next turn', 'prevents a specific action on the target’s next turn'],
        Controller: [`inflicts ${pick(basicStatuses)}`, 'prevents a specific action on the target’s next turn', 'targets Magic Defense instead of Defense'],
        Spellcaster: ['targets Magic Defense instead of Defense', `inflicts ${pick(basicStatuses)}`],
        Assassin: [`inflicts ${pick(basicStatuses)}`, 'targets Magic Defense instead of Defense', 'gains multi (2)'],
        Support: ['grants the NPC a temporary bonus until its next turn', 'prevents a specific action on the target’s next turn'],
      }
      const effects = [
        'gains multi (2)', 'targets Magic Defense instead of Defense', `inflicts ${pick(basicStatuses)}`,
        'recovers HP equal to half the HP loss it causes', 'prevents a specific action on the target’s next turn',
        'grants the NPC a temporary bonus until its next turn', ...(styleEffects[combatStyle] || []), ...(styleEffects[combatStyle] || [])
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
  const notes = [speciesRules[species].note, `${arrayName} attribute array.`, `Combat style profile: ${combatStyle}.`]
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
    affinities, attacks, skills: allSkills, spells, notes, combatStyle,
  }
}
