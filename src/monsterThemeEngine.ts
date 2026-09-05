import type { Affinity, CombatStyle, DamageType, Monster, MonsterAttack, MonsterSkill, MonsterSpell, Rank, Species } from './rules'

export type MonsterTheme = 'Wild' | 'Infernal' | 'Arcane' | 'Industrial' | 'Floral' | 'Spectral' | 'Draconic' | 'Aquatic'
export type MonsterRerollPart = 'name' | 'traits' | 'attacks' | 'skills' | 'spells' | 'affinities' | 'theme'

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

const humanoidNames=['Aldren','Cael','Doria','Eris','Kael','Mara','Orin','Rhea','Soren','Veyra']
const demonNames=['Azharel','Belzun','Cairax','Draziel','Ithraka','Malphas','Neruz','Varkesh']
const constructSeries=['A-7','CX-12','MK-IX','R-03','VX-8','Unit 17','Frame 06','Pattern IV']

function pick<T>(values: readonly T[]) { return values[Math.floor(Math.random()*values.length)] }
function unique<T>(values:T[]) { return [...new Set(values)] }
function capital(value:string){ return value.charAt(0).toUpperCase()+value.slice(1) }
function shuffled<T>(values: readonly T[]) { return [...values].sort(()=>Math.random()-0.5) }
function pickDifferent<T>(values:readonly T[], current:T){const choices=values.filter(value=>value!==current);return pick(choices.length?choices:values)}

export function chooseMonsterTheme(species: Species, style: CombatStyle): MonsterTheme {
  const pool=[...speciesDefaults[species]]
  if(style==='Spellcaster'||style==='Controller') pool.push('Arcane','Arcane')
  if(style==='Brute') pool.push('Wild','Draconic')
  if(style==='Defender'&&species==='Construct') pool.push('Industrial','Industrial')
  if(style==='Assassin') pool.push(species==='Undead'?'Spectral':'Wild')
  if(style==='Support') pool.push('Arcane','Floral','Spectral')
  return pick(pool)
}

function rankTitle(rank:Rank, theme:MonsterTheme) {
  if(rank==='Soldier') return ''
  if(rank==='Elite') return pick(theme==='Industrial'?['Prime','Veteran','Advanced']:['Elder','Veteran','Exalted','Prime'])
  return pick(theme==='Industrial'?['Command','Omega','Sovereign']:['Sovereign','Apex','Lord','Tyrant'])
}

function speciesAwareName(monster:Monster, p:ThemeProfile, theme:MonsterTheme) {
  const {species,rank}=monster
  const title=pick(p.titles), noun=pick(p.nouns), place=pick(p.places), tier=rankTitle(rank,theme)
  if(species==='Construct') {
    const series=pick(constructSeries)
    return rank==='Soldier' ? `${noun} ${series}` : `${tier} ${noun} ${series}`
  }
  if(species==='Humanoid') {
    const personal=pick(humanoidNames)
    return rank==='Soldier' ? `${personal}, ${title} ${noun}` : rank==='Elite' ? `${personal}, ${tier} of the ${place}` : `${personal}, ${tier} of ${place}`
  }
  if(species==='Demon') {
    const personal=pick(demonNames)
    return rank==='Soldier' ? `${personal} the ${title}` : rank==='Elite' ? `${personal}, ${tier} ${noun}` : `${personal}, ${tier} of the ${place}`
  }
  if(species==='Plant') return rank==='Champion' ? `The ${tier} ${noun} of ${place}` : rank==='Elite' ? `${tier} ${noun}` : `${noun} of ${place}`
  if(species==='Undead') return rank==='Champion' ? `The ${tier} of the ${place}` : rank==='Elite' ? `The ${tier} ${noun}` : `${noun} of the ${place}`
  if(species==='Elemental') return rank==='Champion' ? `${tier} ${noun} of ${place}` : `${noun} of ${place}`
  if(species==='Beast') return rank==='Champion' ? `${tier} ${noun} of the ${place}` : rank==='Elite' ? `${title} ${noun}` : noun
  return rank==='Champion' ? `${tier} ${noun} of ${place}` : rank==='Elite' ? `${title} ${noun}` : `${noun} of ${place}`
}

function chooseGimmick(profile:ThemeProfile,style:CombatStyle){
  let damagePool=[...profile.damage],statusPool=[...profile.status]
  if(style==='Brute') damagePool=[...damagePool.filter(x=>x==='physical'||x==='fire'||x==='earth'),...damagePool]
  if(style==='Defender') statusPool=[...statusPool.filter(x=>x==='slow'||x==='weak'),...statusPool]
  if(style==='Controller') statusPool=[...statusPool.filter(x=>x==='slow'||x==='dazed'||x==='weak'),...statusPool,...statusPool]
  if(style==='Spellcaster') damagePool=[...damagePool.filter(x=>x!=='physical'),...damagePool,...damagePool]
  if(style==='Assassin') statusPool=[...statusPool.filter(x=>x==='shaken'||x==='slow'||x==='poisoned'||x==='weak'),...statusPool]
  if(style==='Support') statusPool=[...statusPool.filter(x=>x==='weak'||x==='shaken'||x==='dazed'),...statusPool]
  return {primary:pick(damagePool.length?damagePool:profile.damage),status:pick(statusPool.length?statusPool:profile.status)}
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

function championPhase(theme:MonsterTheme, style:CombatStyle, damage:DamageType, status:string) {
  const phaseName:Record<MonsterTheme,string>={ Wild:'Blood Hunt', Infernal:'Open the Furnace', Arcane:'Second Pattern', Industrial:'Limit Release', Floral:'Second Bloom', Spectral:'Unquiet Ascension', Draconic:'Tyrant Unbound', Aquatic:'Abyssal Pressure' }
  const styleEffect:Record<CombatStyle,string>={
    Mixed:`Immediately choose one visible enemy; it suffers ${status}. Until the end of the conflict, the first ${damage}-damage effect this Champion uses each round gains multi (2).`,
    Brute:`Immediately perform one basic attack. Until the end of the conflict, its ${damage} attacks deal 5 extra damage, or 10 extra damage against targets suffering ${status}.`,
    Defender:`Immediately gain Resistance to ${damage}. Until the end of the conflict, the first time each round an ally is damaged, this Champion may become the target instead and the attacker suffers ${status}.`,
    Controller:`Immediately inflict ${status} on one visible enemy. Until the end of the conflict, whenever this Champion inflicts ${status}, it may inflict slow or weak on a second visible enemy.`,
    Spellcaster:`Immediately recover 20 MP. Until the end of the conflict, its damaging spells become ${damage} damage, and the first spell each round against a target suffering ${status} deals 5 extra damage.`,
    Assassin:`Immediately mark one visible enemy suffering ${status}, or inflict ${status} on one enemy if none qualify. Until the end of the conflict, attacks against the marked target gain +2 Accuracy and deal 5 extra damage.`,
    Support:`Immediately choose one ally; it recovers 10 HP and gains Resistance to ${damage}. Until the end of the conflict, the first ally this Champion aids each round also removes one basic status effect.`,
  }
  return { name:`Champion Phase — ${phaseName[theme]}`, summary:`When this Champion first enters Crisis: ${styleEffect[style]}` }
}

function rewriteSkills(skills:MonsterSkill[], style:CombatStyle, primary:DamageType, status:string, theme:MonsterTheme) {
  let specialAssigned=false
  return skills.filter(skill=>!skill.name.startsWith('Champion Phase —')).map(skill=>{
    if(skill.name==='Crisis Effect') return {...skill,summary:thematicCrisis(style,primary,status)}
    if(skill.name==='Unique Action') return {...skill,summary:thematicUnique(style,primary,status,theme)}
    if(skill.name==='Special Attack' && !specialAssigned){
      specialAssigned=true
      return {...skill,summary:`The setup attack inflicts ${status}; the payoff attack deals 5 extra ${primary} damage against a target already suffering ${status}.`}
    }
    if(skill.name==='Reaction') return {...skill,summary:`Reaction: after a nearby enemy suffering ${status} acts, this NPC gains +2 to its next Check against that enemy.`}
    return {...skill,summary:skill.summary.replace(/inflicts (dazed|shaken|slow|weak|poisoned|enraged)/gi,`inflicts ${status}`).replace(/(physical|air|bolt|dark|earth|fire|ice|light|poison) damage/gi,`${primary} damage`)}
  })
}

function roleAttackEffect(style:CombatStyle,index:number,status:string,primary:DamageType){
  if(index===0) {
    if(style==='Brute') return `Setup: on a hit, the target suffers ${status}.`
    if(style==='Defender') return `Setup: on a hit, the target suffers ${status}; if it attacks one of this NPC’s allies before the start of this NPC’s next turn, this NPC gains +2 Defense against that attack.`
    if(style==='Controller') return `Setup: on a hit, the target suffers ${status}. The next control effect used by this NPC against it gains +2 to its Check.`
    if(style==='Spellcaster') return `Setup: on a hit, the target suffers ${status}; the next damaging spell this NPC casts against it deals ${primary} damage.`
    if(style==='Assassin') return `Setup: on a hit, the target suffers ${status} and is marked until the start of this NPC’s next turn.`
    if(style==='Support') return `Setup: on a hit, the target suffers ${status}; the next ally to damage it gains +1 to that Check.`
    return `Setup: on a hit, the target suffers ${status}.`
  }
  if(style==='Brute') return `Payoff: against a target suffering ${status}, deal 5 extra ${primary} damage.`
  if(style==='Defender') return `Payoff: against a target suffering ${status}, this NPC gains Resistance to that target’s next damaging attack before its next turn.`
  if(style==='Controller') return `Payoff: against a target suffering ${status}, also inflict slow or weak.`
  if(style==='Spellcaster') return `Payoff: against a target suffering ${status}, recover 5 MP after resolving the attack.`
  if(style==='Assassin') return `Payoff: against a target suffering ${status}, gain +2 Accuracy and deal 5 extra damage.`
  if(style==='Support') return `Payoff: when this hits a target suffering ${status}, one ally recovers 5 HP.`
  return `Payoff: against a target suffering ${status}, deal 5 extra ${primary} damage.`
}

function themedAttacks(attacks:MonsterAttack[], p:ThemeProfile, primary:DamageType, secondary:DamageType, status:string,style:CombatStyle) {
  const words=shuffled(p.attackWords)
  return attacks.map((attack,index)=>{
    const damage=index===0?primary:secondary
    const existing=attack.effect ? attack.effect.replace(/inflicts (dazed|shaken|slow|weak|poisoned|enraged)/gi,`inflicts ${status}`).replace(/(physical|air|bolt|dark|earth|fire|ice|light|poison) damage/gi,`${damage} damage`) : ''
    const plan=roleAttackEffect(style,index===0?0:1,status,primary)
    return {...attack,name:words[index%words.length],damageType:damage,effect:[existing,plan].filter(Boolean).join(' ')}
  })
}

function themedSpells(spells:MonsterSpell[], p:ThemeProfile, primary:DamageType, status:string,style:CombatStyle) {
  const words=shuffled(p.spellWords)
  return spells.map((spell,index)=>{
    const generic=['Breath','Cursed Breath','Curse','Curse XL','Area Status','Weaken',...p.spellWords].includes(spell.name)
    let effect=spell.effect.replace(/\b(physical|air|bolt|dark|earth|fire|ice|light|poison) damage\b/gi,`${primary} damage`).replace(/suffers (dazed|shaken|slow|weak|poisoned|enraged)/gi,`suffers ${status}`)
    if(index===0&&style==='Controller'&&!effect.toLowerCase().includes(status)) effect+=` Affected targets also suffer ${status}.`
    if(index===0&&style==='Spellcaster') effect+=` Against a target suffering ${status}, this spell deals 5 extra damage.`
    return {...spell,name:generic?words[index%words.length]:spell.name,effect}
  })
}

function detailedMonsterNotes(monster:Monster, theme:MonsterTheme, profile:ThemeProfile, primary:DamageType, status:string) {
  const style=monster.combatStyle||'Mixed'
  const rankTone=monster.rank==='Champion'?'an apex specimen whose presence dominates the scene':monster.rank==='Elite'?'a dangerous veteran specimen with obvious adaptations':'a representative specimen of its kind'
  const sizeTone=monster.attributes.mig>=12?'massive and powerfully built':monster.attributes.mig>=10?'broad, heavy, or visibly strong':monster.attributes.dex>=10?'lean, quick, and tightly coiled':'compact and deceptively ordinary at first glance'
  const sense=theme==='Infernal'?'heat haze, scorched air, and a faint sulphurous tang':theme==='Arcane'?'a pressure in the air, crawling light, and tiny motes of displaced aether':theme==='Industrial'?'oil, hot metal, ticking relays, and the vibration of an idling engine':theme==='Floral'?'wet soil, crushed leaves, pollen, and the sweet smell of sap':theme==='Spectral'?'a sudden drop in temperature, muffled sound, and the sensation of being watched':theme==='Draconic'?'hot breath, mineral dust, old scales, and the weight of an apex predator':theme==='Aquatic'?'brine, cold spray, slick surfaces, and a deep pressure felt more than heard':'musky fur, churned earth, snapped brush, and the quiet of nearby prey animals'
  const movement=style==='Brute'?'It moves directly and violently, committing its whole weight once it chooses a target.':style==='Defender'?'It constantly places its toughest side toward danger and instinctively interposes itself between threats and whatever it protects.':style==='Controller'?'It circles, probes, and manipulates distance, preferring to make opponents move where it wants before committing.':style==='Spellcaster'?'It keeps deliberate distance, gathering power in visible pulses before releasing it through practiced patterns.':style==='Assassin'?'It rarely stays in the centre of attention; its posture is still until the instant it commits to a precise burst of violence.':style==='Support'?'Its attention is divided across the whole battlefield, repeatedly repositioning to protect, empower, or coordinate nearby allies.':'Its behaviour shifts with the situation, alternating between cautious observation and sudden aggression.'
  const habitat=theme==='Infernal'?'ruined furnaces, volcanic scars, cursed battlefields, and places where destructive magic has soaked into the land':theme==='Arcane'?'relic vaults, abandoned observatories, crystal ruins, and regions distorted by unstable magic':theme==='Industrial'?'foundries, military facilities, buried machine halls, rail works, and other relic-industrial sites':theme==='Floral'?'overgrown ruins, deep gardens, humid forests, sinkholes, and places reclaimed by aggressive vegetation':theme==='Spectral'?'crypts, memorial grounds, abandoned settlements, old battlefields, and locations burdened by unresolved death':theme==='Draconic'?'high ridges, cavern systems, ruined keeps, mineral-rich badlands, and territories that offer commanding sight lines':theme==='Aquatic'?'flooded ruins, black reefs, rivers, cisterns, sea caves, and low places where water gathers':'forests, scrub, mountain paths, old hunting grounds, and the wild margins beyond settled roads'
  const behaviour=monster.species==='Construct'?'It behaves according to an embedded purpose rather than hunger: patrol, guard, pursue, retrieve, or destroy. Damage may make that purpose more rigid rather than less.':monster.species==='Undead'?'It repeats habits from life in distorted form, reacting strongly to symbols, places, or people that touch the memory binding it to the world.':monster.species==='Plant'?'It is patient enough to remain motionless for hours or days, reacting to vibration, heat, magic, or trespass more readily than to sight.':monster.species==='Humanoid'?'It shows planning, fear, pride, and self-preservation. Even when hostile, it can read a room, bargain, retreat, or exploit a social weakness.':monster.species==='Demon'?'It is intelligent in a predatory way and enjoys testing emotional weaknesses before escalating to open violence.':monster.species==='Beast'?'Its aggression is purposeful rather than random: territory, hunger, offspring, injury, or competition usually explains why it attacks.':'Its instincts are coherent even when alien; observation can reveal what it wants, what it fears, and what makes it abandon a fight.'
  const tell=style==='Brute'?`Before its heaviest attacks, its body visibly loads with force; heroes who notice the tell can anticipate where the impact will land.`:style==='Defender'?`It repeatedly turns attacks aside and guards space. Pulling it away from allies or forcing it to choose between two threats weakens its ideal battle plan.`:style==='Controller'?`Its most dangerous effects begin with positioning and ${status}; once that setup is established, it tries to chain control rather than simply trade damage.`:style==='Spellcaster'?`Its strongest effects are telegraphed by concentrated ${primary} energy. Pressure, interruption, or forcing movement can disrupt its preferred rhythm.`:style==='Assassin'?`It becomes most dangerous once a target is isolated or suffering ${status}; it watches for that moment instead of attacking indiscriminately.`:style==='Support'?`Its power is multiplied by allies. Separating it from the group or forcing it to spend turns protecting itself sharply reduces its impact.`:`It tests the party first, then leans into ${primary} damage and ${status} once it finds a weakness.`
  const hook=theme==='Industrial'?'A damaged identification plate, command seal, or repeating transmission may reveal who built it and what objective it is still trying to complete.':theme==='Spectral'?'Objects nearby may replay fragments of its final memories, giving the party a way to learn what keeps it from resting.':theme==='Floral'?'Its growth may be feeding on a buried relic, corpse, crystal vein, or contaminated water source that explains why the local ecosystem has changed.':theme==='Arcane'?'The same magical pattern visible across its body may also appear on nearby ruins, doors, or relics, turning the creature into a clue as well as a threat.':theme==='Infernal'?'Its presence may be the symptom of a bargain, ritual, battlefield atrocity, or sealed breach rather than an isolated monster attack.':theme==='Draconic'?'Its territory likely contains something it values: a nesting site, relic cache, mineral seam, oath-bound ruin, or object it considers part of its hoard.':theme==='Aquatic'?'Unusual tides, missing animals, flooded passages, or pressure-damaged structures can foreshadow it well before the party sees the creature itself.':'Tracks, half-eaten prey, damaged vegetation, territorial markings, and the behaviour of smaller animals can reveal its presence before combat.'
  return [
    `Description: ${capital(theme)} ${monster.species.toLowerCase()}, ${rankTone}. ${profile.flavour}`,
    `Appearance: ${capital(sizeTone)}. Its defining traits are ${(monster.traits||[]).slice(0,3).join(', ') || 'unusual and immediately noticeable'}, with visual signs of ${primary} power worked into its body, equipment, or surrounding aura. Up close, the strongest impression is ${sense}.`,
    `Behaviour: ${behaviour} ${movement}`,
    `Habitat & signs: Most often found around ${habitat}. Signs of its territory include ${sense}.`,
    `Combat read: ${tell}`,
    `GM hook: ${hook}`,
  ]
}

function cleanThemeNotes(notes:string[]) {
  return notes.filter(note=>!['Theme: ','Core gimmick: ','Combat loop: ','Champion phase: ','Description: ','Appearance: ','Behaviour: ','Habitat & signs: ','Combat read: ','GM hook: '].some(prefix=>note.startsWith(prefix)))
}

function themeFromMonster(monster:Monster):MonsterTheme {
  const note=(monster.notes||[]).find(value=>value.startsWith('Theme: '))
  const match=note?.match(/^Theme: ([^.]+)/)
  const candidate=match?.[1] as MonsterTheme | undefined
  return candidate && candidate in profiles ? candidate : chooseMonsterTheme(monster.species,monster.combatStyle||'Mixed')
}

function gimmickFromMonster(monster:Monster, theme:MonsterTheme) {
  const note=(monster.notes||[]).find(value=>value.startsWith('Core gimmick: ')) || ''
  const match=note.match(/^Core gimmick: ([A-Za-z]+) damage sets up ([a-z]+)/)
  const profile=profiles[theme]
  const primary=(match?.[1]?.toLowerCase() as DamageType | undefined)
  const status=match?.[2]
  if(primary && profile.damage.includes(primary) && status && profile.status.includes(status)) return {primary,status}
  return chooseGimmick(profile,monster.combatStyle||'Mixed')
}

function secondaryFor(profile:ThemeProfile, primary:DamageType) {
  const choices=profile.damage.filter(type=>type!==primary)
  return pick(choices.length?choices:profile.damage)
}

function thematicAffinities(monster:Monster, theme:MonsterTheme, primary:DamageType):Record<DamageType,Affinity> {
  const next={...monster.affinities}
  const protectedTypes=new Set<DamageType>()
  if(monster.species==='Construct'){ protectedTypes.add('earth'); protectedTypes.add('poison') }
  if(monster.species==='Elemental') protectedTypes.add('poison')
  if(monster.species==='Undead'){ protectedTypes.add('dark'); protectedTypes.add('poison'); protectedTypes.add('light') }
  if(monster.species==='Plant') for(const type of ['air','bolt','fire','ice'] as DamageType[]) if(next[type]==='Vulnerable') protectedTypes.add(type)
  for(const type of Object.keys(next) as DamageType[]) if(!protectedTypes.has(type) && next[type] !== 'Absorb') next[type]='Normal'
  if(!protectedTypes.has(primary)) next[primary]=Math.random()<0.22?'Immune':'Resistant'
  const profile=profiles[theme]
  const weaknessPool=(['air','bolt','dark','earth','fire','ice','light','poison'] as DamageType[]).filter(type=>!profile.damage.includes(type)&&!protectedTypes.has(type))
  if(weaknessPool.length && Math.random()<0.7) next[pick(weaknessPool)]='Vulnerable'
  return next
}

function finishTheme(monster:Monster, theme:MonsterTheme, primary:DamageType, status:string, options?:{name?:boolean;attacks?:boolean;skills?:boolean;spells?:boolean;traits?:boolean;affinities?:boolean}) {
  const p=profiles[theme], style=monster.combatStyle||'Mixed', secondary=secondaryFor(p,primary)
  const opts={name:true,attacks:true,skills:true,spells:true,traits:true,affinities:false,...options}
  let skills=opts.skills ? rewriteSkills(monster.skills||[],style,primary,status,theme) : (monster.skills||[]).filter(skill=>!skill.name.startsWith('Champion Phase —'))
  if(monster.rank==='Champion') {
    const phase=championPhase(theme,style,primary,status)
    // A Champion phase is part of the existing skill budget, not a free extra skill.
    // Prefer replacing Crisis Effect because both occupy the same Crisis-facing design space;
    // otherwise replace Unique Action, then the final generated skill. Only a zero-skill
    // Champion needs the phase appended so it still has a defining Champion mechanic.
    const replaceIndex=skills.findIndex(skill=>skill.name==='Crisis Effect')>=0
      ? skills.findIndex(skill=>skill.name==='Crisis Effect')
      : skills.findIndex(skill=>skill.name==='Unique Action')>=0
        ? skills.findIndex(skill=>skill.name==='Unique Action')
        : skills.length-1
    if(replaceIndex>=0) skills=skills.map((skill,index)=>index===replaceIndex?phase:skill)
    else skills=[phase]
  }
  const baseNotes=cleanThemeNotes(monster.notes||[])
  const gimmick=`Core gimmick: ${capital(primary)} damage sets up ${status}; ${style.toLowerCase()} abilities exploit that setup.`
  const combatLoop=`Combat loop: establish ${status} with the setup attack or spell, exploit it with the payoff attack or role skill${monster.rank==='Champion'?', then escalate the same loop through Crisis':''}.`
  const phaseNote=monster.rank==='Champion' ? `Champion phase: ${theme} identity intensifies on first entering Crisis instead of introducing an unrelated mechanic.` : undefined
  return {
    ...monster,
    name:opts.name ? speciesAwareName(monster,p,theme) : monster.name,
    traits:opts.traits ? unique([...shuffled(p.traits).slice(0,3), ...(monster.traits||[]).slice(0,1)]).slice(0,4) : monster.traits,
    attacks:opts.attacks ? themedAttacks(monster.attacks||[],p,primary,secondary,status,style) : monster.attacks,
    spells:opts.spells ? themedSpells(monster.spells||[],p,primary,status,style) : monster.spells,
    skills,
    affinities:opts.affinities ? thematicAffinities(monster,theme,primary) : monster.affinities,
    notes:[...detailedMonsterNotes({...monster,traits:opts.traits ? unique([...shuffled(p.traits).slice(0,3), ...(monster.traits||[]).slice(0,1)]).slice(0,4) : monster.traits},theme,p,primary,status),`Theme: ${theme}. ${p.flavour}`,gimmick,combatLoop,...(phaseNote?[phaseNote]:[]),...baseNotes],
  }
}

export function applyMonsterTheme(monster: Monster, requested?: MonsterTheme): Monster {
  const theme=requested || chooseMonsterTheme(monster.species, monster.combatStyle || 'Mixed')
  const {primary,status}=chooseGimmick(profiles[theme],monster.combatStyle||'Mixed')
  return finishTheme(monster,theme,primary,status)
}

export function rerollMonsterPart(monster:Monster, part:MonsterRerollPart):Monster {
  const currentTheme=themeFromMonster(monster)
  if(part==='traits') return {...monster,traits:unique(shuffled(profiles[currentTheme].traits).slice(0,2))}
  if(part==='theme') {
    const nextTheme=pickDifferent(monsterThemes,currentTheme)
    const {primary,status}=chooseGimmick(profiles[nextTheme],monster.combatStyle||'Mixed')
    return finishTheme(monster,nextTheme,primary,status,{name:true,attacks:true,skills:true,spells:true,traits:true,affinities:false})
  }
  const {primary,status}=gimmickFromMonster(monster,currentTheme)
  if(part==='name') return finishTheme(monster,currentTheme,primary,status,{name:true,attacks:false,skills:false,spells:false,traits:false,affinities:false})
  if(part==='attacks') return finishTheme(monster,currentTheme,primary,status,{name:false,attacks:true,skills:false,spells:false,traits:false,affinities:false})
  if(part==='skills') return finishTheme(monster,currentTheme,primary,status,{name:false,attacks:false,skills:true,spells:false,traits:false,affinities:false})
  if(part==='spells') return finishTheme(monster,currentTheme,primary,status,{name:false,attacks:false,skills:false,spells:true,traits:false,affinities:false})
  const next=chooseGimmick(profiles[currentTheme],monster.combatStyle||'Mixed')
  return finishTheme(monster,currentTheme,next.primary,next.status,{name:false,attacks:false,skills:true,spells:false,traits:false,affinities:true})
}

export const monsterThemes = Object.keys(profiles) as MonsterTheme[]