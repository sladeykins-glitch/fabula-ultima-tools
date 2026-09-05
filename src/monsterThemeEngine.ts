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

  const bodyPlans:Record<Species,string[]>={
    Beast:['low-slung quadruped with a deep chest','rangy predator with long limbs and a narrow skull','thick-bodied hunter with oversized forelimbs','compact ambush beast built close to the ground','lean runner with a counterbalancing tail','broad-backed brute with horn, tusk, or crest-like growths'],
    Construct:['riveted humanoid frame with exposed joints','low armoured chassis carried on multiple articulated limbs','tall sentinel body wrapped around a glowing core','asymmetrical war-machine assembled from mismatched plates','compact pursuit frame with piston-driven legs','heavy industrial shell repurposed into a combat body'],
    Demon:['distorted humanoid silhouette with exaggerated limbs','predatory body that only loosely resembles an animal','gaunt figure whose proportions seem subtly wrong','massive horned form with too many joints','elegant but unsettling shape that moves without natural weight','charred, cracked body held together by inner light'],
    Elemental:['rough humanoid mass constantly shedding fragments','serpentine body formed from a continuous elemental flow','floating core surrounded by orbiting debris','animal-like outline made from unstable matter','towering column that briefly forms limbs as needed','shifting knot of elemental material with no fixed anatomy'],
    Humanoid:['scarred veteran with practical layered gear','lightly equipped hunter built for mobility','heavily protected enforcer carrying visible field equipment','ritual-marked combatant with carefully maintained tools','weathered survivor with improvised armour and trophies','disciplined specialist whose equipment reflects a clear battlefield role'],
    Monster:['six-limbed predator with an unfamiliar gait','hulking body combining reptilian and mammalian features','long-bodied crawler with layered plates along its spine','top-heavy creature with grasping forelimbs and a smaller rear body','bizarrely symmetrical organism with mirrored appendages','massive shell-backed creature with a vulnerable-looking underside'],
    Plant:['rooted central trunk supported by walking tendrils','flowering predator with layered petal-like armour','low mat of roots surrounding a raised feeding body','vine-bound humanoid shape grown around a hard wooden core','bulbous spore body carried on rootlike legs','thorned mass whose limbs continually regrow into new shapes'],
    Undead:['desiccated humanoid held together by old bindings','armoured corpse whose posture still recalls military training','skeletal figure wrapped in drifting fragments of clothing','partially incorporeal body fading away below the torso','swollen corpse marked by the manner of its death','preserved revenant whose damaged body moves with impossible precision'],
  }

  const surfaces:Record<MonsterTheme,string[]>={
    Wild:['scarred hide','matted fur broken by old wounds','thick overlapping scales','coarse bristles along the spine','dust-caked skin patterned by natural camouflage'],
    Infernal:['charred skin split by ember-red cracks','blackened horn and vitrified flesh','ash-grey hide that smokes at the edges','obsidian plates with heat glowing beneath','burned flesh continually renewing under a crust of soot'],
    Arcane:['translucent tissue threaded with luminous sigils','smooth surfaces interrupted by floating glyphs','crystal growths following geometric lines','skin or plating patterned by moving runes','a faint afterimage that never perfectly matches its body'],
    Industrial:['riveted steel plates','oil-streaked brass and iron','painted armour worn down to bare metal','ceramic panels around exposed mechanisms','patchwork plating repaired across several eras'],
    Floral:['bark plated with thorn ridges','waxy leaves layered like scales','pale fungal growth among dark roots','thick petals hiding fibrous muscle','green-black vines wrapped around a woody skeleton'],
    Spectral:['translucent flesh mottled by corpse-light','frosted armour fading into mist','ragged shadow where solid matter should be','pale skin stretched over a cold inner glow','surfaces that lose detail whenever viewed directly'],
    Draconic:['dense scales scarred by age','interlocking plates with brighter colour at the joints','ridged hide crowned by horn growth','mineral-hard scales dusted with elemental residue','old scale layers broken by newer, sharper growth'],
    Aquatic:['slick skin filmed with brine','armoured shell crusted with mineral deposits','rubbery hide marked by pressure scars','iridescent scales under a layer of cold water','pale deep-water flesh around darker sensory organs'],
  }

  const locomotion:Record<CombatStyle,string[]>={
    Mixed:['It changes pace constantly, testing distance before committing.','It alternates between measured movement and sudden bursts that make its intentions hard to read.','It advances only when a clear advantage appears, then withdraws before the exchange turns against it.'],
    Brute:['It moves with direct, committed force and rarely gives ground once engaged.','Every step loads its body for another impact, making even simple movement feel like a charge.','It closes distance aggressively, trusting mass and momentum over caution.'],
    Defender:['It keeps its strongest side toward danger and uses its body to occupy important space.','Its movements are short and economical, always preserving a position from which it can protect something.','It constantly repositions just enough to stay between threats and whatever it has chosen to guard.'],
    Controller:['It circles and probes, shaping distance before choosing where violence happens.','It prefers diagonal movement and awkward angles, herding opponents rather than pursuing them directly.','It gives ground deliberately, drawing enemies into positions where its control effects become harder to avoid.'],
    Spellcaster:['It maintains deliberate distance and pauses in brief, ritualised beats before releasing power.','Its movement follows the rhythm of its magic: reposition, gather power, release, repeat.','It avoids being pinned down, drifting toward clear sight lines from which its strongest effects can be used.'],
    Assassin:['It spends long moments unnaturally still, then crosses distance in one precise burst.','It avoids the centre of attention, moving along edges, cover, and blind spots.','Its body stays relaxed until a vulnerable target appears, at which point every motion becomes sudden and exact.'],
    Support:['It rarely moves for its own safety alone, instead shifting wherever an ally needs protection or reinforcement.','Its path constantly crosses those of its allies, suggesting practiced coordination.','It keeps enough distance to see the whole fight and repeatedly moves to stabilise whichever part of the formation is failing.'],
  }

  const minds:Record<Species,string[]>={
    Beast:['animal-cunning and highly observant','driven by instinct but capable of learning from pain','territorial rather than malicious','patient enough to stalk before committing','quick to distinguish prey, threat, and rival'],
    Construct:['literal-minded and objective-driven','methodical, repeating proven responses until they fail','capable of tactical adjustment inside a narrow directive','eerily patient, with no fatigue or panic','reactive to commands, insignia, or encoded authority'],
    Demon:['socially perceptive and cruelly curious','predatory, theatrical, and fond of testing fear','clever enough to lie, bargain, and feign weakness','obsessed with provoking emotional mistakes','more interested in corruption or humiliation than a clean kill'],
    Elemental:['alien but internally consistent','responsive to disturbance rather than morality','drawn toward concentrations of its native energy','simple in motive but difficult to communicate with','possessed of an instinctive awareness of changes in its environment'],
    Humanoid:['fully sapient and capable of negotiation','disciplined but still subject to fear, pride, and doubt','willing to retreat if the objective becomes impossible','observant enough to exploit social as well as tactical weaknesses','capable of planning beyond the immediate conflict'],
    Monster:['intelligent in an unfamiliar, non-humanoid way','guided by strong instincts that can still be studied','capable of recognising patterns and repeated tactics','protective of specific resources, places, or offspring','curious until threatened, then frighteningly decisive'],
    Plant:['slow-thinking but intensely sensitive to its surroundings','reactive to vibration, heat, magic, and chemical signals','patient enough to remain inert for days','guided by growth, feeding, and territorial competition','linked to nearby growths through scent, root, or spore signals'],
    Undead:['bound to repeating memories and unfinished impulses','capable of recognising fragments from life','coldly purposeful until confronted with a personal trigger','erratic around symbols tied to its death','less concerned with survival than completing whatever keeps it moving'],
  }

  const motives:Record<Species,string[]>={
    Beast:['defending territory','protecting young','hunting because normal prey has disappeared','competing with a larger predator','guarding a den or seasonal feeding ground'],
    Construct:['continuing an obsolete patrol','guarding a sealed facility','retrieving a lost object','enforcing credentials nobody remembers','destroying anything matching an ancient threat profile'],
    Demon:['collecting fear or suffering','fulfilling the wording of an old bargain','tempting mortals into a repeated mistake','feeding on conflict around a cursed site','seeking release from a binding it cannot break directly'],
    Elemental:['restoring an environmental imbalance','moving toward a source of elemental energy','reacting to contamination in its territory','defending the place where it formed','following a natural cycle that settlements have interrupted'],
    Humanoid:['protecting an employer or faction','holding territory for strategic reasons','recovering valuable relics','surviving under desperate conditions','carrying out orders it may not fully believe in'],
    Monster:['protecting a nesting ground','following a migration route','hoarding an unusual resource','responding to an injury or environmental disruption','competing for territory after being displaced'],
    Plant:['spreading into nutrient-rich ground','defending a root network','feeding on magic or mineral deposits','responding to seasonal bloom behaviour','overgrowing an artificial structure that altered the local soil'],
    Undead:['repeating the duty it held in life','seeking a person or object it can no longer properly identify','defending the site of its death','trying to complete a broken oath','acting out the final hours before it died'],
  }

  const social:Record<Species,string[]>={
    Beast:['usually solitary except during breeding or migration','travels in a loose pair or family group','may tolerate smaller scavengers that benefit from its kills','dominates a small hierarchy of lesser predators','signals others of its kind through scent and territorial marks'],
    Construct:['often operates as one node in a larger dormant system','may coordinate silently with identical units','treats nearby maintenance drones as extensions of itself','functions alone but expects support that no longer exists','shares target data with any compatible machine it encounters'],
    Demon:['rarely trusts its own kind for long','may command weaker entities through fear','prefers temporary alliances built on leverage','often keeps mortal servants who do not understand the full bargain','competes constantly for status even while cooperating'],
    Elemental:['gathers loosely with others where conditions are favourable','shows little social hierarchy but strong environmental synchrony','may merge or divide when energy conditions change','tolerates beings that do not disturb its territory','responds collectively when one of its kind is harmed'],
    Humanoid:['works within recognisable chains of loyalty and authority','likely belongs to a squad, crew, clan, or faction','uses signals, passwords, and practiced teamwork','may have personal bonds that override formal orders','understands surrender, negotiation, and hostage value'],
    Monster:['may live alone but recognise neighbouring territories','forms temporary hunting groups around abundant prey','protects offspring fiercely','uses calls, posture, scent, or vibration to communicate','may tolerate symbiotic creatures around its lair'],
    Plant:['connected to nearby growths by root or spore networks','forms colonies that behave like one distributed organism','competes aggressively with unrelated plant life','may shelter insects or animals that spread its seeds','responds to damage in one area by thickening growth elsewhere'],
    Undead:['may gather around a shared memory or death-site','ignores other undead unless their purposes conflict','can fall into old military or ritual formations without conscious thought','may follow the strongest surviving personality among them','often reacts more strongly to the living than to its own kind'],
  }

  const feeding:Record<Species,string[]>={
    Beast:['feeds on fresh meat and marrow','is opportunistic and will eat carrion','prefers mineral-rich organs or bones','feeds infrequently after large kills','supplements hunting with roots, fungi, or hard seeds'],
    Construct:['requires no food but periodically seeks fuel, charge, coolant, or replacement parts','draws power from an internal relic cell','scavenges compatible machinery to repair itself','returns to fixed recharge points between patrols','can remain active for years on a slowly decaying power source'],
    Demon:['feeds metaphorically as much as physically, drawing strength from fear, rage, pain, or broken promises','can consume ordinary matter but gains little from it','feeds on magical residue left by conflict','grows stronger when mortals act according to its temptation','survives through the terms of a binding rather than normal sustenance'],
    Elemental:['absorbs ambient elemental energy','feeds on heat, pressure, current, mineral content, or magical saturation','weakens if kept away from its native environment too long','replenishes itself by incorporating local matter','does not eat in any biological sense'],
    Humanoid:['uses ordinary rations appropriate to its culture and situation','forages or scavenges when supply lines fail','carries compact field provisions','may rely on contraband, ration tokens, or faction stores','eats normally, though scarcity may strongly shape its decisions'],
    Monster:['feeds on whatever its anatomy is adapted to process','may prey on magical creatures rather than mundane animals','can digest material most species cannot','stores food near its lair','feeds rarely but causes dramatic ecological damage when it does'],
    Plant:['absorbs nutrients through roots and specialised feeding tendrils','supplements sunlight by trapping animals','draws minerals from stone or ruins','feeds on magical residue in soil and water','stores nutrients in swollen bulbs or root masses'],
    Undead:['does not need ordinary food','may ritualistically mimic eating from life','draws strength from places, memories, or emotions associated with death','can remain dormant for long periods without sustenance','is sustained by the force or vow binding it to the world'],
  }

  const signs:Record<MonsterTheme,string[]>={
    Wild:['deep tracks crossing the same route repeatedly','trees or stone scraped by territorial marking','half-eaten prey dragged into cover','smaller animals going abruptly silent','tufts of fur, shed scales, or broken horn caught on brush'],
    Infernal:['fine ash collecting where nothing has burned','metal or stone warped by unexplained heat','a persistent smell of smoke or sulphur','small flames leaning toward the same direction without wind','burn marks forming repeated symbols or footprints'],
    Arcane:['dust suspended in geometric patterns','brief flashes of light behind closed doors','compasses or simple mechanisms behaving incorrectly','repeating glyphs scorched onto nearby surfaces','small objects drifting a finger-width above the ground'],
    Industrial:['oil droplets forming a patrol trail','regular impact marks spaced like mechanical footsteps','discarded bolts, shavings, or snapped cable','faint vibration through floors before the machine is audible','old doors forced open with identical tool marks'],
    Floral:['unseasonal blossoms along its route','root cracks spreading through worked stone','pollen collecting in sheltered indoor spaces','small animals found entangled rather than eaten','plant growth turning toward a common hidden point'],
    Spectral:['frost forming on the inside of objects','sound becoming strangely muffled','old lamps dimming without going out','footprints appearing without visible feet','objects associated with the dead shifting position overnight'],
    Draconic:['scored stone where claws sharpened','shed scales lodged in crevices','bones broken open for marrow','mineral or coin-like objects gathered into small caches','high vantage points repeatedly disturbed or cleared'],
    Aquatic:['brackish water appearing above the normal tide line','pressure cracks in containers and masonry','fish or small animals abandoning otherwise healthy water','slick trails that dry unusually slowly','distant knocking or whale-like sound through solid structures'],
  }

  const quirks:Record<MonsterTheme,string[]>={
    Wild:['collects one oddly specific kind of object','always approaches water before sleeping','refuses to cross a particular scent or material','mimics the alarm call of local prey','has learned to associate a common tool or uniform with danger'],
    Infernal:['speaks politely even while threatening violence','cannot resist correcting broken promises','leaves one survivor to spread fear','becomes visibly agitated by sincere acts of mercy','keeps trophies that symbolise emotional rather than material victories'],
    Arcane:['repeats short sequences of movement like a ritual','casts a second shadow at the wrong angle','reacts strongly to spoken mathematical patterns','briefly mirrors the posture of nearby spellcasters','causes written text nearby to rearrange for a heartbeat'],
    Industrial:['announces actions with obsolete system phrases','still waits for clearance at doors it could easily break','salutes an insignia from a dead regime','performs maintenance rituals during moments of safety','keeps trying to contact a command network that no longer exists'],
    Floral:['blooms more brightly around fresh blood','closes its flowers when someone lies nearby','grows small copies of objects left near its roots','turns all leaves toward active magic rather than sunlight','releases a harmless scent shortly before becoming aggressive'],
    Spectral:['repeats a single mundane gesture from life','cannot cross a threshold until invited or provoked','mistakes one party member for someone long dead','leaves wet or dusty footprints despite being incorporeal','quietly hums a tune associated with its death'],
    Draconic:['is vain about one scar, horn, or scale pattern','counts valuables by touching them rather than looking','remembers insults more clearly than injuries','tests intruders before deciding whether to kill them','has an unexpected fondness for a mundane smell, sound, or food'],
    Aquatic:['taps surfaces to sense hollow spaces','collects polished glass and metal from wreckage','reacts aggressively to sudden bright light','circles a target several times before attacking','produces a low vibration that nearby water visibly ripples to'],
  }

  const sensePools:Record<MonsterTheme,string[]>={
    Wild:['musky fur and churned soil','dry hide, old blood, and crushed brush','a sudden silence among nearby animals','warm breath and the mineral smell of fresh tracks'],
    Infernal:['heat haze and sulphurous smoke','hot iron and bitter ash','dry air that stings the throat','the faint crackle of embers under every movement'],
    Arcane:['pressure behind the eyes and crawling light','ozone and the faint taste of metal','tiny motes of displaced aether','a hum felt through teeth more than heard'],
    Industrial:['oil, hot metal, and ticking relays','coolant vapour and electrical ozone','piston vibration through the floor','grinding bearings under otherwise precise movement'],
    Floral:['wet soil, pollen, and sweet sap','crushed leaves and fungal damp','green resin and the sharp smell of thorns','heavy floral perfume over decomposing vegetation'],
    Spectral:['a sudden drop in temperature','muffled sound and pale condensation','old dust stirred without wind','the sensation of being watched from just behind'],
    Draconic:['hot breath and mineral dust','old scales and scorched stone','a deep vibration in the chest','ozone, smoke, or frost depending on its elemental nature'],
    Aquatic:['brine and cold spray','deep pressure and the smell of wet stone','slick surfaces beaded with condensation','a low resonance like distant sound underwater'],
  }

  const tells:Record<CombatStyle,string[]>={
    Mixed:[`It probes for a weakness first, then leans into ${primary} damage and ${status} once one appears.`,`Its opening actions are diagnostic; after seeing what the party resists, it changes approach quickly.`,`It rarely repeats a failed tactic twice in a row, making observation more useful than simply enduring it.`],
    Brute:[`Before its heaviest attacks, its frame visibly loads with force and its stance narrows toward the intended line of impact.`,`Its strongest blows require full commitment; once it starts the motion, changing direction is difficult.`,`It telegraphs danger through posture rather than magic: lowered centre of gravity, tightened limbs, then explosive release.`],
    Defender:[`It repeatedly turns its strongest side toward attacks and guards specific lanes of approach.`,`Forcing it to choose between two threatened allies disrupts its ideal battle plan.`,`Its attention constantly returns to whatever it is protecting; threats elsewhere can pull it out of position.`],
    Controller:[`Its most dangerous effects begin with positioning and ${status}; breaking that setup weakens everything that follows.`,`It repeatedly steers targets toward the same zones, revealing where its control is strongest.`,`It values arrangement over damage; unpredictable movement can make it waste actions rebuilding the battlefield.`],
    Spellcaster:[`Concentrated ${primary} energy gathers before its strongest effects, giving attentive heroes a clear warning.`,`Its casting rhythm is visible: acquire sight line, gather power, release. Pressure between those steps is especially disruptive.`,`It prefers stable distance and clean vision; smoke, cover, forced movement, or close pressure spoil its ideal sequence.`],
    Assassin:[`It becomes most dangerous once a target is isolated or suffering ${status}; before then it watches more than it attacks.`,`Its attention fixes on one vulnerable target at a time, making its intended victim readable to anyone watching carefully.`,`It avoids fair exchanges. Denying isolation or forcing it into sustained contact removes much of its advantage.`],
    Support:[`Its real threat is the efficiency it gives nearby allies; separation sharply lowers its impact.`,`It keeps scanning the entire conflict instead of focusing on one opponent, revealing that its priorities are coordination and rescue.`,`When forced to defend itself repeatedly, its allies immediately become less effective.`],
  }

  const hooks:Record<MonsterTheme,string[]>={
    Wild:['Its altered territory suggests something larger has displaced it from its normal range.','A distinctive scar or embedded relic fragment hints that someone has hunted, trained, or experimented on it before.','Its prey remains contain something that should not exist in this region, pointing toward a wider ecological problem.'],
    Infernal:['Its presence may be the symptom of a bargain, atrocity, or sealed breach rather than an isolated attack.','The demon seems bound by a rule it hates, and learning that rule could matter more than defeating it.','Its trophies correspond to local disappearances in a pattern that reveals what emotion or promise it is collecting.'],
    Arcane:['The same magical pattern across its body appears on nearby ruins, turning the creature into a clue as well as a threat.','Its unstable form may be a living side effect of a relic experiment whose source still operates nearby.','A repeating glyph in its aura matches a forgotten map, laboratory mark, or crystal inscription.'],
    Industrial:['A damaged identification plate or repeating transmission can reveal who built it and what objective it still follows.','Its route forms part of an old logistical network that may lead to a sealed facility.','One component has been replaced with technology from a different nation or era, implying recent interference.'],
    Floral:['Its growth may be feeding on a buried relic, corpse, crystal vein, or contaminated water source.','Cuttings from it react to a nearby location, suggesting the whole colony shares one hidden root-heart.','The plant is not invading randomly; its spread traces the outline of something buried beneath the area.'],
    Spectral:['Objects nearby replay fragments of its final memories, offering another way to understand what keeps it from resting.','The haunting becomes calmer around one seemingly mundane item the dead clearly recognised in life.','Several ghosts in the region repeat different parts of the same event, allowing the truth to be reconstructed.'],
    Draconic:['Its territory contains something it values: a nesting site, relic cache, mineral seam, oath-bound ruin, or object it considers part of its hoard.','Its hoard contains items chosen for personal meaning rather than price, hinting at an unexpected history.','Old territorial marks show another draconic creature once claimed the same place and may return.'],
    Aquatic:['Unusual tides, missing animals, flooded passages, or pressure damage foreshadow it long before the encounter.','Debris lodged in its territory comes from a wreck or structure no local map records.','Its migration follows an underground water route that may provide access to otherwise unreachable ruins.'],
  }

  const sizeTone=monster.attributes.mig>=12?'massive and powerfully built':monster.attributes.mig>=10?'broad, heavy, or visibly strong':monster.attributes.dex>=10?'lean, quick, and tightly coiled':'compact and deceptively ordinary at first glance'
  const body=pick(bodyPlans[monster.species])
  const surface=pick(surfaces[theme])
  const movement=pick(locomotion[style])
  const mind=pick(minds[monster.species])
  const motive=pick(motives[monster.species])
  const sociality=pick(social[monster.species])
  const sustenance=pick(feeding[monster.species])
  const sensory=pick(sensePools[theme])
  const territorySigns=shuffled(signs[theme]).slice(0,2).join(' and ')
  const quirk=pick(quirks[theme])
  const tell=pick(tells[style])
  const hook=pick(hooks[theme])
  const habitat=theme==='Infernal'?'ruined furnaces, volcanic scars, cursed battlefields, and places saturated by destructive magic':theme==='Arcane'?'relic vaults, abandoned observatories, crystal ruins, and regions distorted by unstable magic':theme==='Industrial'?'foundries, military facilities, buried machine halls, rail works, and relic-industrial sites':theme==='Floral'?'overgrown ruins, deep gardens, humid forests, sinkholes, and places reclaimed by aggressive vegetation':theme==='Spectral'?'crypts, memorial grounds, abandoned settlements, old battlefields, and locations burdened by unresolved death':theme==='Draconic'?'high ridges, cavern systems, ruined keeps, mineral-rich badlands, and commanding territory':theme==='Aquatic'?'flooded ruins, black reefs, rivers, cisterns, sea caves, and low places where water gathers':'forests, scrub, mountain paths, old hunting grounds, and the wild margins beyond settled roads'

  return [
    `Description: ${capital(theme)} ${monster.species.toLowerCase()}, ${rankTone}. ${profile.flavour}`,
    `Appearance: ${capital(sizeTone)}, built as a ${body}, with ${surface}. Its defining traits are ${(monster.traits||[]).slice(0,3).join(', ') || 'unusual and immediately noticeable'}. Signs of ${primary} power show through its body, equipment, or aura, while the strongest nearby sensory impression is ${sensory}.`,
    `Behaviour: It is ${mind} and is currently motivated by ${motive}. ${movement}`,
    `Ecology: It ${sustenance}. Socially, it ${sociality}. This means an encounter with one may imply others, dependants, prey, servants, or infrastructure nearby rather than existing in isolation.`,
    `Habitat & signs: Most often found around ${habitat}. Reliable signs include ${territorySigns}.`,
    `Quirk: It ${quirk}. This detail has no required combat effect, but gives the GM a memorable behavioural tell to repeat before and during the encounter.`,
    `Combat read: ${tell}`,
    `GM hook: ${hook}`,
  ]
}

function cleanThemeNotes(notes:string[]) {
  return notes.filter(note=>!['Theme: ','Core gimmick: ','Combat loop: ','Champion phase: ','Description: ','Appearance: ','Behaviour: ','Ecology: ','Habitat & signs: ','Quirk: ','Combat read: ','GM hook: '].some(prefix=>note.startsWith(prefix)))
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
  const themedTraits=opts.traits ? unique([...shuffled(p.traits).slice(0,3), ...(monster.traits||[]).slice(0,1)]).slice(0,4) : monster.traits
  const gimmick=`Core gimmick: ${capital(primary)} damage sets up ${status}; ${style.toLowerCase()} abilities exploit that setup.`
  const combatLoop=`Combat loop: establish ${status} with the setup attack or spell, exploit it with the payoff attack or role skill${monster.rank==='Champion'?', then escalate the same loop through Crisis':''}.`
  const phaseNote=monster.rank==='Champion' ? `Champion phase: ${theme} identity intensifies on first entering Crisis instead of introducing an unrelated mechanic.` : undefined
  return {
    ...monster,
    name:opts.name ? speciesAwareName(monster,p,theme) : monster.name,
    traits:themedTraits,
    attacks:opts.attacks ? themedAttacks(monster.attacks||[],p,primary,secondary,status,style) : monster.attacks,
    spells:opts.spells ? themedSpells(monster.spells||[],p,primary,status,style) : monster.spells,
    skills,
    affinities:opts.affinities ? thematicAffinities(monster,theme,primary) : monster.affinities,
    notes:[...detailedMonsterNotes({...monster,traits:themedTraits},theme,p,primary,status),`Theme: ${theme}. ${p.flavour}`,gimmick,combatLoop,...(phaseNote?[phaseNote]:[]),...baseNotes],
  }
}

export function applyMonsterTheme(monster: Monster, requested?: MonsterTheme): Monster {
  const theme=requested || chooseMonsterTheme(monster.species, monster.combatStyle || 'Mixed')
  const {primary,status}=chooseGimmick(profiles[theme],monster.combatStyle||'Mixed')
  return finishTheme(monster,theme,primary,status)
}

export function rerollMonsterPart(monster:Monster, part:MonsterRerollPart):Monster {
  const currentTheme=themeFromMonster(monster)
  if(part==='traits') {
    const {primary,status}=gimmickFromMonster(monster,currentTheme)
    const nextTraits=unique(shuffled(profiles[currentTheme].traits).slice(0,2))
    return finishTheme({...monster,traits:nextTraits},currentTheme,primary,status,{name:false,attacks:false,skills:false,spells:false,traits:false,affinities:false})
  }
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