import type { CombatStyle, DamageType, Monster, Species } from './rules'

export type MonsterTheme = 'Wild' | 'Infernal' | 'Arcane' | 'Industrial' | 'Floral' | 'Spectral' | 'Draconic' | 'Aquatic'

type ThemeProfile = {
  nouns: string[]
  titles: string[]
  traits: string[]
  damage: DamageType[]
  status: string[]
  attackWords: string[]
  flavour: string
}

const profiles: Record<MonsterTheme, ThemeProfile> = {
  Wild: { nouns:['Razorback','Direfang','Clawbeast','Hornmaw','Stalker'], titles:['Alpha','Elder','Feral','Great'], traits:['feral','territorial','predatory','relentless','keen-scented'], damage:['physical','earth','poison'], status:['slow','weak','poisoned'], attackWords:['Maul','Gore','Pounce','Rend','Savage Charge'], flavour:'A territorial predator whose abilities revolve around pursuit, brute force, and wearing prey down.' },
  Infernal: { nouns:['Hellion','Ashfiend','Cinder Devil','Ember Wraith','Brimstone Beast'], titles:['Burning','Accursed','Infernal','Blazing'], traits:['malevolent','smouldering','cruel','unstable','hungry'], damage:['fire','dark'], status:['shaken','enraged','weak'], attackWords:['Hellfire','Cinder Claw','Brimstone Lash','Ashen Brand','Infernal Burst'], flavour:'A destructive fiend whose attacks and supernatural effects share a fire-and-darkness identity.' },
  Arcane: { nouns:['Runeborn','Mana Chimera','Aetherling','Glyph Beast','Astral Sentinel'], titles:['Arcane','Runic','Astral','Eldritch'], traits:['mystical','calculating','mana-fed','ancient','unnatural'], damage:['light','bolt','dark'], status:['dazed','weak','slow'], attackWords:['Rune Lance','Aether Pulse','Glyph Break','Mana Ray','Astral Burst'], flavour:'A creature shaped by magic; its attacks, wards, and control effects all draw from the same arcane source.' },
  Industrial: { nouns:['Ironhound','Warframe','Gearstalker','Siege Unit','Chrome Reaper'], titles:['Mk II','Prototype','Armoured','Heavy'], traits:['mechanical','armoured','programmed','unyielding','overclocked'], damage:['physical','bolt','fire'], status:['slow','dazed','weak'], attackWords:['Piston Slam','Arc Cannon','Rotary Strike','Overdrive','Shock Ram'], flavour:'A constructed combat unit whose weapons, defenses, and reactions feel like parts of one engineered system.' },
  Floral: { nouns:['Thornkin','Bloom Horror','Briar Beast','Petal Warden','Rootmaw'], titles:['Ancient','Blooming','Verdant','Withered'], traits:['overgrown','rooted','patient','toxic','regenerative'], damage:['earth','poison','physical'], status:['poisoned','slow','weak'], attackWords:['Thorn Lash','Root Snare','Pollen Burst','Briar Crush','Toxic Bloom'], flavour:'A living growth whose roots, thorns, spores, and defensive adaptations reinforce one botanical concept.' },
  Spectral: { nouns:['Grave Echo','Pale Revenant','Mourning Shade','Soul Warden','Hollow Knight'], titles:['Restless','Pale','Forsaken','Mourning'], traits:['incorporeal','haunting','cold','vengeful','silent'], damage:['dark','ice','light'], status:['shaken','dazed','weak'], attackWords:['Soul Rend','Grave Chill','Wailing Touch','Pale Brand','Haunting Cry'], flavour:'A supernatural remnant built around fear, draining force, and the boundary between life and death.' },
  Draconic: { nouns:['Drake','Wyrm','Wyvern','Scale Tyrant','Dragonkin'], titles:['Ancient','Crowned','Storm','Ember','Frost'], traits:['proud','scaled','predatory','majestic','hoarding'], damage:['fire','ice','bolt','air'], status:['shaken','slow','weak'], attackWords:['Fang','Tail Sweep','Wing Buffet','Elemental Breath','Tyrant Claw'], flavour:'A draconic threat whose elemental affinity, breath, physical attacks, and imposing presence form a single identity.' },
  Aquatic: { nouns:['Tidebeast','Abyssal Hunter','Reef Stalker','Deepmaw','Leviathan Spawn'], titles:['Abyssal','Drowned','Tidal','Deep'], traits:['amphibious','patient','slippery','deep-dwelling','predatory'], damage:['ice','air','physical'], status:['slow','weak','dazed'], attackWords:['Tidal Crush','Riptide Lash','Abyssal Bite','Pressure Wave','Drowning Grasp'], flavour:'A deep-water predator whose movement, pressure, cold, and control effects all evoke the same aquatic ecology.' },
}

const speciesDefaults: Record<Species, MonsterTheme[]> = {
  Beast:['Wild','Aquatic','Draconic'], Construct:['Industrial','Arcane'], Demon:['Infernal','Arcane','Spectral'], Elemental:['Arcane','Draconic','Aquatic'], Humanoid:['Industrial','Arcane','Wild'], Monster:['Wild','Draconic','Aquatic','Arcane'], Plant:['Floral'], Undead:['Spectral'],
}

function pick<T>(values: readonly T[]) { return values[Math.floor(Math.random()*values.length)] }
function unique<T>(values:T[]) { return [...new Set(values)] }

export function chooseMonsterTheme(species: Species, style: CombatStyle): MonsterTheme {
  const pool=[...speciesDefaults[species]]
  if(style==='Spellcaster'||style==='Controller') pool.push('Arcane','Arcane')
  if(style==='Brute') pool.push('Wild','Draconic')
  if(style==='Defender'&&species==='Construct') pool.push('Industrial','Industrial')
  return pick(pool)
}

export function applyMonsterTheme(monster: Monster, requested?: MonsterTheme): Monster {
  const theme=requested || chooseMonsterTheme(monster.species, monster.combatStyle || 'Mixed')
  const p=profiles[theme]
  const title=pick(p.titles), noun=pick(p.nouns)
  const name = Math.random()<0.58 ? `${title} ${noun}` : noun
  const primary=pick(p.damage)
  const secondary=pick(p.damage.filter(x=>x!==primary).length ? p.damage.filter(x=>x!==primary) : p.damage)
  const attacks=(monster.attacks||[]).map((attack,index)=>({
    ...attack,
    name:p.attackWords[index%p.attackWords.length],
    damageType:index===0 ? primary : secondary,
    effect:attack.effect ? attack.effect.replace(/inflicts (dazed|shaken|slow|weak|poisoned)/gi,`inflicts ${pick(p.status)}`) : undefined,
  }))
  const spells=(monster.spells||[]).map(spell=>({
    ...spell,
    name: spell.name==='Breath'||spell.name==='Cursed Breath' ? `${title} Breath` : spell.name,
    effect:spell.effect.replace(/\b(physical|air|bolt|dark|earth|fire|ice|light|poison) damage\b/gi,`${primary} damage`).replace(/suffers (dazed|shaken|slow|weak|poisoned)/gi,`suffers ${pick(p.status)}`),
  }))
  const traits=unique([...p.traits.sort(()=>Math.random()-0.5).slice(0,3), ...(monster.traits||[]).slice(0,1)]).slice(0,4)
  const skills=(monster.skills||[]).map(skill=>({ ...skill, summary:skill.summary.replace(/inflicts (dazed|shaken|slow|weak|poisoned)/gi,`inflicts ${pick(p.status)}`) }))
  return { ...monster, name, traits, attacks, spells, skills, notes:[`Theme: ${theme}. ${p.flavour}`,...(monster.notes||[])] }
}

export const monsterThemes = Object.keys(profiles) as MonsterTheme[]
