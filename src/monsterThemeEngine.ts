import type { CombatStyle, DamageType, Monster, MonsterSkill, Species } from './rules'

export type MonsterTheme = 'Wild' | 'Infernal' | 'Arcane' | 'Industrial' | 'Floral' | 'Spectral' | 'Draconic' | 'Aquatic'

type ThemeProfile = {
  nouns: string[]
  titles: string[]
  traits: string[]
  damage: DamageType[]
  status: string[]
  attackWords: string[]
  spellWords: string[]
  places: string[]
  flavour: string
}

const profiles: Record<MonsterTheme, ThemeProfile> = {
  Wild: { nouns:['Razorback','Direfang','Clawbeast','Hornmaw','Stalker'], titles:['Alpha','Elder','Feral','Great'], traits:['feral','territorial','predatory','relentless','keen-scented'], damage:['physical','earth','poison'], status:['slow','weak','poisoned'], attackWords:['Maul','Gore','Pounce','Rend','Savage Charge'], spellWords:['Predator’s Roar','Earthshaker','Blood Scent'], places:['Redwood','High Crag','Old Hunt'], flavour:'A territorial predator whose abilities revolve around pursuit, brute force, and wearing prey down.' },
  Infernal: { nouns:['Hellion','Ashfiend','Cinder Devil','Ember Wraith','Brimstone Beast'], titles:['Burning','Accursed','Infernal','Blazing'], traits:['malevolent','smouldering','cruel','unstable','hungry'], damage:['fire','dark'], status:['shaken','enraged','weak'], attackWords:['Hellfire','Cinder Claw','Brimstone Lash','Ashen Brand','Infernal Burst'], spellWords:['Pyre Curse','Black Flame','Cinder Hex'], places:['Ashen Gate','Black Furnace','Ember Pit'], flavour:'A destructive fiend whose attacks and supernatural effects share a fire-and-darkness identity.' },
  Arcane: { nouns:['Runeborn','Mana Chimera','Aetherling','Glyph Beast','Astral Sentinel'], titles:['Arcane','Runic','Astral','Eldritch'], traits:['mystical','calculating','mana-fed','ancient','unnatural'], damage:['light','bolt','dark'], status:['dazed','weak','slow'], attackWords:['Rune Lance','Aether Pulse','Glyph Break','Mana Ray','Astral Burst'], spellWords:['Runic Seal','Aether Bind','Mana Fracture'], places:['Seventh Sigil','Glass Observatory','Aether Vault'], flavour:'A creature shaped by magic; its attacks, wards, and control effects all draw from the same arcane source.' },
  Industrial: { nouns:['Ironhound','Warframe','Gearstalker','Siege Unit','Chrome Reaper'], titles:['Mk II','Prototype','Armoured','Heavy'], traits:['mechanical','armoured','programmed','unyielding','overclocked'], damage:['physical','bolt','fire'], status:['slow','dazed','weak'], attackWords:['Piston Slam','Arc Cannon','Rotary Strike','Overdrive','Shock Ram'], spellWords:['Target Lock','Overcharge Field','Static Burst'], places:['Assembly Nine','Foundry Core','Red Line'], flavour:'A constructed combat unit whose weapons, defenses, and reactions feel like parts of one engineered system.' },
  Floral: { nouns:['Thornkin','Bloom Horror','Briar Beast','Petal Warden','Rootmaw'], titles:['Ancient','Blooming','Verdant','Withered'], traits:['overgrown','rooted','patient','toxic','regenerative'], damage:['earth','poison','physical'], status:['poisoned','slow','weak'], attackWords:['Thorn Lash','Root Snare','Pollen Burst','Briar Crush','Toxic Bloom'], spellWords:['Spore Cloud','Verdant Bind','Sap Drain'], places:['Thorn Garden','Hollow Grove','Red Orchard'], flavour:'A living growth whose roots, thorns, spores, and defensive adaptations reinforce one botanical concept.' },
  Spectral: { nouns:['Grave Echo','Pale Revenant','Mourning Shade','Soul Warden','Hollow Knight'], titles:['Restless','Pale','Forsaken','Mourning'], traits:['incorporeal','haunting','cold','vengeful','silent'], damage:['dark','ice','light'], status:['shaken','dazed','weak'], attackWords:['Soul Rend','Grave Chill','Wailing Touch','Pale Brand','Haunting Cry'], spellWords:['Dirge','Soul Chain','Funeral Frost'], places:['Silent Crypt','Moon Grave','Last Bell'], flavour:'A supernatural remnant built around fear, draining force, and the boundary between life and death.' },
  Draconic: { nouns:['Drake','Wyrm','Wyvern','Scale Tyrant','Dragonkin'], titles:['Ancient','Crowned','Storm','Ember','Frost'], traits:['proud','scaled','predatory','majestic','hoarding'], damage:['fire','ice','bolt','air'], status:['shaken','slow','weak'], attackWords:['Fang','Tail Sweep','Wing Buffet','Elemental Breath','Tyrant Claw'], spellWords:['Dragon Roar','Elemental Dominion','Scale Ward'], places:['Cinder Peak','Storm Crown','Frozen Roost'], flavour:'A draconic threat whose elemental affinity, breath, physical attacks, and imposing presence form a single identity.' },
  Aquatic: { nouns:['Tidebeast','Abyssal Hunter','Reef Stalker','Deepmaw','Leviathan Spawn'], titles:['Abyssal','Drowned','Tidal','Deep'], traits:['amphibious','patient','slippery','deep-dwelling','predatory'], damage:['ice','air','physical'], status:['slow','weak','dazed'], attackWords:['Tidal Crush','Riptide Lash','Abyssal Bite','Pressure Wave','Drowning Grasp'], spellWords:['Undertow','Pressure Hex','Frozen Current'], places:['Black Reef','Sunken Bell','Deep Trench'], flavour:'A deep-water predator whose movement, pressure, cold, and control effects all evoke the same aquatic ecology.' },
}

const speciesDefaults: Record<Species, MonsterTheme[]> = {
  Beast:['Wild','Aquatic','Draconic'], Construct:['Industrial','Arcane'], Demon:['Infernal','Arcane','Spectral'], Elemental:['Arcane','Draconic','Aquatic'], Humanoid:['Industrial','Arcane','Wild'], Monster:['Wild','Draconic','Aquatic','Arcane'], Plant:['Floral'], Undead:['Spectral'],
}

function pick<T>(values: readonly T[]) { return values[Math.floor(Math.random()*values.length)] }
function unique<T>(values:T[]) { return [...new Set(values)] }
function capital(value:string){ return value.charAt(0).toUpperCase()+value.slice(1) }

export function chooseMonsterTheme(species: Species, style: CombatStyle): MonsterTheme {
  const pool=[...speciesDefaults[species]]
  if(style==='Spellcaster'||style==='Controller') pool.push('Arcane','Arcane')
  if(style==='Brute') pool.push('Wild','Draconic')
  if(style==='Defender'&&species==='Construct') pool.push('Industrial','Industrial')
  if(style==='Assassin') pool.push(species==='Undead'?'Spectral':'Wild')
  return pick(pool)
}

function speciesAwareName(species:Species, p:ThemeProfile) {
  const title=pick(p.titles), noun=pick(p.nouns), place=pick(p.places)
  if(species==='Construct') return Math.random()<0.5 ? `${noun} ${title}` : `${title} ${noun} — ${place}`
  if(species==='Plant') return Math.random()<0.5 ? `${title} ${noun}` : `${noun} of the ${place}`
  if(species==='Undead') return Math.random()<0.5 ? `The ${title} ${noun}` : `${noun} of the ${place}`
  if(species==='Humanoid') return Math.random()<0.45 ? `${title} ${noun}` : `${noun}, ${title} of the ${place}`
  if(species==='Elemental') return Math.random()<0.5 ? `${noun} of ${place}` : `${title} ${noun}`
  if(species==='Demon') return Math.random()<0.5 ? `${title} ${noun}` : `${noun}, Scourge of the ${place}`
  return Math.random()<0.55 ? `${title} ${noun}` : `${noun} of the ${place}`
}

function thematicCrisis(style:CombatStyle, damage:DamageType, status:string) {
  const byStyle:Record<CombatStyle,string>={
    Mixed:`While in Crisis, the first time each round this NPC deals ${damage} damage, the target also suffers ${status}.`,
    Brute:`While in Crisis, attacks dealing ${damage} damage deal 5 extra damage; a target already suffering ${status} suffers 5 additional damage.`,
    Defender:`While in Crisis, this NPC gains Resistance to ${damage} damage, and enemies that hit it with melee attacks suffer ${status}.`,
    Controller:`While in Crisis, whenever this NPC inflicts ${status}, it may also inflict slow or weak on the same target.`,
    Spellcaster:`While in Crisis, damaging spells become ${damage} damage and deal 5 extra damage to targets suffering ${status}.`,
    Assassin:`While in Crisis, attacks against targets suffering ${status} gain +2 Accuracy and deal 5 extra damage.`,
    Support:`While in Crisis, when this NPC aids an ally, that ally gains Resistance to ${damage} damage until the start of this NPC’s next turn.`,
  }
  return byStyle[style]
}

function thematicUnique(style:CombatStyle, damage:DamageType, status:string, theme:MonsterTheme) {
  const label=theme==='Industrial'?'Overclock':theme==='Floral'?'Root Network':theme==='Spectral'?'Mourning Veil':theme==='Infernal'?'Hellbrand':theme==='Aquatic'?'Undertow':theme==='Draconic'?'Dominion':theme==='Arcane'?'Runic Pattern':'Predator’s Instinct'
  const effects:Record<CombatStyle,string>={
    Mixed:`Skill action — ${label}: choose one visible creature; it suffers ${status}, and this NPC’s next damaging effect against it becomes ${damage}.`,
    Brute:`Skill action — ${label}: this NPC’s next basic attack deals 10 extra ${damage} damage; if the target suffers ${status}, gain multi (2).`,
    Defender:`Skill action — ${label}: until its next turn this NPC gains Resistance to ${damage}; an ally may also gain that Resistance.`,
    Controller:`Skill action — ${label}: one visible creature suffers ${status}; until this NPC’s next turn, that creature takes 5 extra damage whenever it suffers ${damage} damage.`,
    Spellcaster:`Skill action — ${label}: recover 10 MP; the next damaging spell this NPC casts deals ${damage} damage and inflicts ${status}.`,
    Assassin:`Skill action — ${label}: mark one creature suffering ${status}; this NPC gains +2 Accuracy against it until its next turn.`,
    Support:`Skill action — ${label}: one ally gains +1 Accuracy and Resistance to ${damage} until this NPC’s next turn.`,
  }
  return effects[style]
}

function rewriteSkills(skills:MonsterSkill[], style:CombatStyle, primary:DamageType, status:string, theme:MonsterTheme) {
  let specialAssigned=false
  return skills.map(skill=>{
    if(skill.name==='Crisis Effect') return {...skill,summary:thematicCrisis(style,primary,status)}
    if(skill.name==='Unique Action') return {...skill,summary:thematicUnique(style,primary,status,theme)}
    if(skill.name==='Special Attack' && !specialAssigned){
      specialAssigned=true
      return {...skill,summary:`The themed basic attack tied to this skill also inflicts ${status}; if the target already suffers ${status}, it deals 5 extra ${primary} damage.`}
    }
    if(skill.name==='Reaction') return {...skill,summary:`Reaction: after a nearby enemy suffering ${status} acts, this NPC gains +2 to its next Check against that enemy.`}
    return {...skill,summary:skill.summary.replace(/inflicts (dazed|shaken|slow|weak|poisoned|enraged)/gi,`inflicts ${status}`).replace(/(physical|air|bolt|dark|earth|fire|ice|light|poison) damage/gi,`${primary} damage`)}
  })
}

export function applyMonsterTheme(monster: Monster, requested?: MonsterTheme): Monster {
  const theme=requested || chooseMonsterTheme(monster.species, monster.combatStyle || 'Mixed')
  const p=profiles[theme], style=monster.combatStyle||'Mixed'
  const primary=pick(p.damage)
  const secondaryChoices=p.damage.filter(x=>x!==primary)
  const secondary=pick(secondaryChoices.length?secondaryChoices:p.damage)
  const status=pick(p.status)
  const attacks=(monster.attacks||[]).map((attack,index)=>({
    ...attack,
    name:p.attackWords[index%p.attackWords.length],
    damageType:index===0 ? primary : secondary,
    effect:attack.effect ? attack.effect.replace(/inflicts (dazed|shaken|slow|weak|poisoned|enraged)/gi,`inflicts ${status}`).replace(/(physical|air|bolt|dark|earth|fire|ice|light|poison) damage/gi,`${index===0?primary:secondary} damage`) : undefined,
  }))
  const spells=(monster.spells||[]).map((spell,index)=>({
    ...spell,
    name: ['Breath','Cursed Breath','Curse','Curse XL','Area Status','Weaken'].includes(spell.name) ? p.spellWords[index%p.spellWords.length] : spell.name,
    effect:spell.effect.replace(/\b(physical|air|bolt|dark|earth|fire|ice|light|poison) damage\b/gi,`${primary} damage`).replace(/suffers (dazed|shaken|slow|weak|poisoned|enraged)/gi,`suffers ${status}`),
  }))
  const traits=unique([...p.traits.sort(()=>Math.random()-0.5).slice(0,3), ...(monster.traits||[]).slice(0,1)]).slice(0,4)
  const skills=rewriteSkills(monster.skills||[],style,primary,status,theme)
  const gimmick=`Core gimmick: ${capital(primary)} damage sets up ${status}; ${style.toLowerCase()} abilities are biased toward exploiting that setup.`
  return { ...monster, name:speciesAwareName(monster.species,p), traits, attacks, spells, skills, notes:[`Theme: ${theme}. ${p.flavour}`,gimmick,...(monster.notes||[])] }
}

export const monsterThemes = Object.keys(profiles) as MonsterTheme[]