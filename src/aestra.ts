import type { Affinity, CombatStyle, DamageType, Monster, MonsterAttack, MonsterSkill, Species } from './rules'

export type AestraNation = 'Garlond' | 'Rübenberg' | 'Palmeria' | 'Valdoria'
export type AestraOrigin = 'Military' | 'Civic' | 'Scientific' | 'Imperial' | 'Market' | 'Black Market' | 'Deep Below' | 'Wilderness' | 'Lost Era'
export type AestraInfluence = 'Stable' | 'Fading' | 'Crystal-Starved' | 'Overcharged' | 'Corrupted'
export type ValdoriaDepth = 'Market' | 'Lower City' | 'Deep Below' | 'Buried / Ancient'

type NationProfile = {
  identity: string
  motifs: string[]
  preferredSpecies: Species[]
  preferredStyles: CombatStyle[]
  damage: DamageType[]
  origins: AestraOrigin[]
  prefixes: string[]
  places: string[]
}

export const aestraNations: Record<AestraNation, NationProfile> = {
  Garlond: {
    identity:'Industrial and militaristic; a frozen, smog-choked authoritarian nation with xenophobic Soviet-inspired aesthetics.',
    motifs:['military issue','frost-plated','smog-stained','mass-produced','armoured','utilitarian'],
    preferredSpecies:['Construct','Humanoid'], preferredStyles:['Brute','Defender','Controller'], damage:['ice','bolt','fire','physical'],
    origins:['Military','Scientific','Wilderness','Lost Era'], prefixes:['GR','Red','Iron','Winter','State'], places:['Frostworks','Western Foundry','Smog Line','State Arsenal']
  },
  'Rübenberg': {
    identity:'Dutch-inspired, wind-powered and diplomatic; engineering, trade and international diplomacy shape its identity.',
    motifs:['wind-driven','precision-made','civic','diplomatic','trade-built','turbine-powered'],
    preferredSpecies:['Construct','Humanoid','Elemental'], preferredStyles:['Defender','Support','Mixed'], damage:['air','bolt','physical'],
    origins:['Civic','Scientific','Market','Wilderness','Lost Era'], prefixes:['Gale','Civic','Canal','Wind','Crown'], places:['Canal Ward','Windworks','Embassy Ring','Low Polder']
  },
  Palmeria: {
    identity:'Philosophical, scientific and imperial, expressed through a high-fantasy culture of scholarship and ambitious advancement.',
    motifs:['scholarly','imperial','experimental','ornate','philosophical','aetheric'],
    preferredSpecies:['Humanoid','Construct','Elemental'], preferredStyles:['Spellcaster','Controller','Support'], damage:['light','bolt','fire','dark'],
    origins:['Scientific','Imperial','Civic','Wilderness','Lost Era'], prefixes:['Imperial','Axiom','Laurel','Solar','Academy'], places:['Grand Academy','Imperial Forum','Laurel Court','Observatory']
  },
  Valdoria: {
    identity:'A dense Kowloon-Walled-City-inspired city that delves deep into the earth; markets, black markets, scavenging and subterranean discovery define it.',
    motifs:['scavenged','crowded','improvised','subterranean','market-made','relic-patched'],
    preferredSpecies:['Humanoid','Monster','Construct','Undead'], preferredStyles:['Assassin','Mixed','Controller'], damage:['earth','poison','dark','physical'],
    origins:['Market','Black Market','Deep Below','Lost Era'], prefixes:['Lower','Deep','Bazaar','Pit','Under'], places:['Night Market','Lower Warrens','Deep Shaft','Buried Arcade']
  }
}

export const valdoriaDepths: ValdoriaDepth[]=['Market','Lower City','Deep Below','Buried / Ancient']

function pick<T>(values: readonly T[]):T { return values[Math.floor(Math.random()*values.length)] }
function appendEffect(attack:MonsterAttack,text:string):MonsterAttack {
  const base=(attack.effect||'').trim()
  return {...attack,effect:base ? `${base} ${text}` : text}
}
function replaceFirstSkill(skills:MonsterSkill[],name:string,summary:string):MonsterSkill[] {
  if(!skills.length) return skills
  const [first,...rest]=skills
  return [{...first,name,summary},...rest]
}
function replaceOriginSkill(skills:MonsterSkill[],name:string,summary:string):MonsterSkill[] {
  if(!skills.length) return skills
  const index=skills.length>1?1:0
  return skills.map((skill,i)=>i===index?{...skill,name,summary}:skill)
}
function improveAffinity(current:Affinity):Affinity {
  if(current==='Vulnerable') return 'Normal'
  if(current==='Normal') return 'Resistant'
  if(current==='Resistant') return 'Immune'
  return current
}
function worsenAffinity(current:Affinity):Affinity {
  if(current==='Immune') return 'Resistant'
  if(current==='Resistant') return 'Normal'
  if(current==='Normal') return 'Vulnerable'
  return current
}
function rewriteDamage(attack:MonsterAttack,type:DamageType):MonsterAttack {
  return {...attack,damageType:type,effect:(attack.effect||'').replace(/\b(physical|air|bolt|dark|earth|fire|ice|light|poison) damage\b/gi,`${type} damage`)}
}

function applyNationMechanics(monster:Monster,nation:AestraNation,origin:AestraOrigin,depth:ValdoriaDepth):Monster {
  const attacks=[...(monster.attacks||[])]
  let skills=[...(monster.skills||[])]
  const affinities={...monster.affinities}
  let magicBonus=monster.magicBonus
  let accuracyBonus=monster.accuracyBonus

  if(nation==='Garlond') {
    if(attacks[0]) attacks[0]=appendEffect(rewriteDamage(attacks[0],pick(['ice','bolt','physical'] as DamageType[])),'If this attack hits, the target suffers slow as Garlond suppression pins it down.')
    if(attacks[1]) attacks[1]=rewriteDamage(attacks[1],pick(['ice','fire','bolt'] as DamageType[]))
    skills=replaceFirstSkill(skills,'State Suppression Doctrine','The first enemy each round that becomes slow or weak from this NPC takes 5 extra damage from the next Garlond attack that hits it before the end of the round.')
    affinities.ice=improveAffinity(affinities.ice)
    affinities.fire=worsenAffinity(affinities.fire)
  }

  if(nation==='Rübenberg') {
    if(attacks[0]) attacks[0]=appendEffect(rewriteDamage(attacks[0],'air'),'On a hit, this NPC may immediately shift its attention to another visible enemy; its next Check against that enemy gains +1.')
    if(attacks[1]) attacks[1]=rewriteDamage(attacks[1],pick(['air','bolt'] as DamageType[]))
    skills=replaceFirstSkill(skills,'Gale Redirection','Once per round after this NPC or an ally is missed, one ally gains +1 Defense and Magic Defense until the start of this NPC’s next turn.')
    affinities.air=improveAffinity(affinities.air)
  }

  if(nation==='Palmeria') {
    const palmerian=pick(['light','bolt','fire','dark'] as DamageType[])
    if(attacks[0]) attacks[0]=appendEffect(rewriteDamage(attacks[0],palmerian),'If the target is suffering a status effect, this attack deals 5 extra damage as the design exploits an observed weakness.')
    skills=replaceFirstSkill(skills,'Applied Axiom','Once per round after a visible creature suffers a status effect, this NPC gains +1 to its next Magic Check or Accuracy Check against that creature.')
    magicBonus+=1
    affinities[palmerian]=improveAffinity(affinities[palmerian])
  }

  if(nation==='Valdoria') {
    if(depth==='Market') {
      if(attacks[0]) attacks[0]=appendEffect(rewriteDamage(attacks[0],pick(['physical','poison'] as DamageType[])),'If the target is already suffering a status effect, this attack gains +1 Accuracy.')
      skills=replaceFirstSkill(skills,'Crowdwise Opportunist','The first time each round another creature suffers a status effect, this NPC gains +1 Accuracy until the end of its next turn.')
    }
    if(depth==='Lower City') {
      if(attacks[0]) attacks[0]=appendEffect(rewriteDamage(attacks[0],pick(['earth','poison','dark'] as DamageType[])),'On a hit, the target suffers slow as cramped terrain and improvised hazards close around it.')
      skills=replaceFirstSkill(skills,'Warren Ambush','Against an enemy suffering slow, this NPC deals 5 extra damage with its first successful attack each round.')
      accuracyBonus+=1
    }
    if(depth==='Deep Below') {
      if(attacks[0]) attacks[0]=appendEffect(rewriteDamage(attacks[0],pick(['earth','dark','poison'] as DamageType[])),'On a hit, the target loses 5 MP as something beneath Valdoria disrupts ordinary crystal use.')
      if(attacks[1]) attacks[1]=rewriteDamage(attacks[1],pick(['dark','earth'] as DamageType[]))
      skills=replaceFirstSkill(skills,'Pressure From Below','When an enemy spends MP, this NPC gains +1 to its next Check against that enemy; this bonus does not stack.')
      affinities.earth=improveAffinity(affinities.earth)
    }
    if(depth==='Buried / Ancient') {
      if(attacks[0]) attacks[0]=appendEffect(rewriteDamage(attacks[0],pick(['dark','light','earth'] as DamageType[])),'On a hit, choose slow or dazed; the target suffers that status as an incompletely understood ancient function activates.')
      if(attacks[1]) attacks[1]=appendEffect(rewriteDamage(attacks[1],pick(['light','dark','bolt'] as DamageType[])),'This effect ignores Resistance the first time it is used each round.')
      skills=replaceFirstSkill(skills,'Buried Protocol','At the start of each round, choose one: improve this NPC’s dark, light, earth, or bolt Affinity by one step until the round ends; or gain +1 Magic and Accuracy for the round.')
      affinities.dark=improveAffinity(affinities.dark)
      affinities.light=improveAffinity(affinities.light)
      magicBonus+=1
    }
  }

  if(origin==='Lost Era') {
    skills=replaceFirstSkill(skills,'Misunderstood Original Function',skills[0]?.summary ? `${skills[0].summary} Its modern users do not fully understand what this function was originally for.` : 'Its modern users do not fully understand what this function was originally for.')
  }

  return {...monster,attacks,skills,affinities,magicBonus,accuracyBonus}
}

function applyOriginMechanics(monster:Monster,nation:AestraNation,origin:AestraOrigin):Monster {
  const attacks=[...(monster.attacks||[])]
  let skills=[...(monster.skills||[])]
  const affinities={...monster.affinities}
  let hp=monster.hp, crisis=monster.crisis, mp=monster.mp
  let magicBonus=monster.magicBonus, accuracyBonus=monster.accuracyBonus
  let note=''

  if(origin==='Military') {
    if(nation==='Garlond') {
      if(attacks[1]) attacks[1]=appendEffect(attacks[1],'If another Garlond ally has already acted this round, this attack deals 5 extra damage.')
      skills=replaceOriginSkill(skills,'Combined Arms Drill','Once per round when an ally hits an enemy suffering slow or weak, this NPC gains +1 Accuracy against that enemy until the end of its next turn.')
      accuracyBonus+=1
      note='Garlond Military: formation discipline, suppression and coordinated fire turn individual units into parts of one state war machine.'
    } else {
      skills=replaceOriginSkill(skills,'Field Doctrine','Once per round after an ally acts, this NPC gains +1 to its next Check against the same target.')
      note=`${nation} Military: trained battlefield doctrine shapes its behaviour.`
    }
  }

  if(origin==='Civic') {
    if(nation==='Rübenberg') {
      skills=replaceOriginSkill(skills,'Civic Safeguard','Once per round when an ally is targeted, that ally gains +1 Defense and Magic Defense against that effect; if it misses, this NPC gains +1 to its next Check.')
      affinities.air=improveAffinity(affinities.air)
      note='Rübenberg Civic: public engineering and defensive infrastructure favour redirection, protection and keeping people out of harm’s way.'
    } else if(nation==='Palmeria') {
      skills=replaceOriginSkill(skills,'Civic Mandate','The first time each round this NPC inflicts a status effect, one ally gains +1 Magic or Accuracy until its next turn.')
      note='Palmeria Civic: institutional authority turns learned principles into coordinated public control.'
    }
  }

  if(origin==='Scientific') {
    if(nation==='Garlond') {
      if(attacks[1]) attacks[1]=appendEffect(rewriteDamage(attacks[1],pick(['bolt','ice','fire'] as DamageType[])),'After this attack resolves, this NPC suffers 5 HP loss if it missed; the prototype was built for output, not reliability.')
      skills=replaceOriginSkill(skills,'State Prototype Trial','At the start of each round choose ice, bolt, or fire. The first attack dealing that damage this round gains +1 Accuracy and deals 5 extra damage.')
      hp+=5; crisis=Math.floor(hp/2)
      note='Garlond Scientific: state research prioritises battlefield output, repeatability and expendable prototype testing.'
    } else if(nation==='Rübenberg') {
      skills=replaceOriginSkill(skills,'Vector Calibration','After this NPC misses, its next air or bolt effect gains +2 to the relevant Check; the bonus is lost after that Check.')
      magicBonus+=1
      note='Rübenberg Scientific: precision engineering studies motion, airflow and repeatable calibration rather than brute-force output.'
    } else if(nation==='Palmeria') {
      skills=replaceOriginSkill(skills,'Empirical Thesis','Once per round after an enemy reveals a Resistance, Immunity, Absorb, or Vulnerability, this NPC gains +2 to its next Check against that enemy and may change that effect’s damage type to light, bolt, fire, or dark.')
      magicBonus+=1
      mp+=10
      note='Palmeria Scientific: observation, hypothesis and magical experimentation convert discovered weaknesses into tactical advantage.'
    }
  }

  if(origin==='Imperial' && nation==='Palmeria') {
    if(attacks[0]) attacks[0]=appendEffect(attacks[0],'If this NPC has an allied subordinate present, this attack gains +1 Accuracy.')
    skills=replaceOriginSkill(skills,'Imperial Command','Once per round after this NPC succeeds on a Check, one ally may gain +1 to its next Check; if that ally is lower Rank, it also gains +1 Defense until its next turn.')
    hp+=5; crisis=Math.floor(hp/2)
    note='Palmeria Imperial: hierarchy, prestige and command presence make the enemy stronger when fighting as the centre of an organised retinue.'
  }

  if(origin==='Market') {
    if(nation==='Valdoria') {
      if(attacks[1]) attacks[1]=appendEffect(attacks[1],'Against a target suffering any status effect, this attack gains +1 Accuracy as the attacker exploits distraction and crowd pressure.')
      skills=replaceOriginSkill(skills,'Market Instinct','Once per round when another creature loses HP or MP, this NPC may gain +1 Accuracy or +1 Magic until the end of its next turn.')
      note='Valdoria Market: survival depends on reading openings, distractions and moment-to-moment shifts in a crowded marketplace.'
    } else if(nation==='Rübenberg') {
      skills=replaceOriginSkill(skills,'Trade Network','The first time each round this NPC aids or protects an ally, that ally also gains +1 to its next Check.')
      note='Rübenberg Market: commercial networks reward cooperation, positioning and reciprocal support.'
    }
  }

  if(origin==='Black Market' && nation==='Valdoria') {
    const contraband=pick(['poison','dark','bolt'] as DamageType[])
    if(attacks[1]) attacks[1]=appendEffect(rewriteDamage(attacks[1],contraband),'On a hit, choose weak or shaken; the target suffers that status. After this attack is used, roll with the risk: this NPC suffers 5 HP loss if the attack missed.')
    skills=replaceOriginSkill(skills,'Contraband Modification','Once per round before making a Check, choose +2 Accuracy or +2 Magic for that Check; after it resolves, this NPC loses 5 MP.')
    mp=Math.max(0,mp+5)
    note='Valdoria Black Market: illegal modifications buy sudden power at the cost of reliability, resources and personal safety.'
  }

  if(origin==='Deep Below' && nation==='Valdoria') {
    if(attacks[1]) attacks[1]=appendEffect(rewriteDamage(attacks[1],pick(['earth','dark'] as DamageType[])),'If the target spent MP since its previous turn, this attack deals 5 extra damage.')
    skills=replaceOriginSkill(skills,'Below the Crystal Line','The first time each round an enemy spends MP, this NPC recovers 5 MP and gains +1 Magic until the end of its next turn.')
    affinities.earth=improveAffinity(affinities.earth)
    note='Valdoria Deep Below: distance from ordinary habitation and crystal infrastructure produces threats that interact unnaturally with MP and power use.'
  }

  if(origin==='Wilderness') {
    if(nation==='Garlond') {
      if(attacks[1]) attacks[1]=appendEffect(rewriteDamage(attacks[1],pick(['ice','physical'] as DamageType[])),'Against a target suffering slow, this attack deals 5 extra damage; the frozen wastes punish anything that cannot keep moving.')
      skills=replaceOriginSkill(skills,'Whiteout Hunter','The first time each round an enemy suffers slow, this NPC gains +1 Defense and Accuracy until the end of its next turn.')
      affinities.ice=improveAffinity(affinities.ice)
      note='Garlond Wilderness: the frozen exterior rewards endurance, pursuit and exploiting creatures slowed by cold or terrain.'
    } else if(nation==='Rübenberg') {
      skills=replaceOriginSkill(skills,'Open-Sky Current','After this NPC is missed, its next air-damage attack gains +2 Accuracy; if it hits, one ally gains +1 Defense until its next turn.')
      note='Rübenberg Wilderness: open winds turn movement and missed attacks into changing currents of advantage.'
    } else if(nation==='Palmeria') {
      skills=replaceOriginSkill(skills,'Field Naturalist','The first time each round this NPC inflicts a status effect, it may learn the target’s strongest non-Normal Affinity and gain +1 to its next Check against that target.')
      note='Palmeria Wilderness: scholarly field traditions turn observation of natural phenomena into practical combat knowledge.'
    }
  }

  if(origin==='Lost Era') {
    const strange=pick(['light','dark','bolt','earth'] as DamageType[])
    if(attacks[1]) attacks[1]=appendEffect(rewriteDamage(attacks[1],strange),'The first time this attack is used each round, treat one Resistance to its damage as Normal; its actual original purpose is unknown.')
    skills=replaceOriginSkill(skills,'Recovered Subroutine','At the start of each round choose one protocol: +1 Magic; +1 Accuracy; improve one Affinity by one step; or recover 5 MP. The visible effect suggests only a fragment of the original function survives.')
    if(nation==='Garlond') note='Garlond Lost Era: recovered technology has been forced into military service, often without understanding the system it came from.'
    if(nation==='Rübenberg') note='Rübenberg Lost Era: old mechanisms are studied, adapted and integrated cautiously into modern engineering.'
    if(nation==='Palmeria') note='Palmeria Lost Era: scholars classify and theorise about ancient systems, then deliberately test those theories in practical use.'
    if(nation==='Valdoria') note='Valdoria Lost Era: relics surface from below through salvage, private deals and black markets long before anyone fully understands them.'
  }

  return {...monster,attacks,skills,affinities,hp,crisis,mp,magicBonus,accuracyBonus,notes:[`Origin mechanics: ${note}`,...(monster.notes||[]).filter(n=>!n.startsWith('Origin mechanics: '))]}
}

export function applyAestraCrystalInfluence(monster:Monster,influence:AestraInfluence):Monster {
  const attacks=[...(monster.attacks||[])]
  const affinities={...monster.affinities}
  let hp=monster.hp, crisis=monster.crisis, mp=monster.mp

  if(influence==='Fading') {
    mp=Math.max(0,mp-10)
    if(attacks[0]) attacks[0]=appendEffect(attacks[0],'While this NPC is in Crisis, this attack deals 5 extra damage as failing crystal power forces unstable compensation.')
  }
  if(influence==='Crystal-Starved') {
    mp=Math.max(0,mp-20)
    if(attacks[0]) attacks[0]=appendEffect(attacks[0],'On a hit, the target loses 5 MP and this NPC recovers 5 MP, representing its hunger for usable power.')
  }
  if(influence==='Overcharged') {
    hp+=10
    crisis=Math.floor(hp/2)
    if(attacks[0]) attacks[0]=appendEffect(attacks[0],'This attack deals 5 extra damage, but after it is used this NPC suffers 5 HP loss from crystal instability.')
  }
  if(influence==='Corrupted') {
    if(attacks[0]) attacks[0]=rewriteDamage(attacks[0],pick(['dark','poison'] as DamageType[]))
    affinities.dark=improveAffinity(affinities.dark)
    affinities.light=worsenAffinity(affinities.light)
  }
  return {...monster,attacks,affinities,hp,crisis,mp}
}

export function aestraOrigins(nation:AestraNation):AestraOrigin[] { return aestraNations[nation].origins }

export function applyAestraMonsterIdentity(monster:Monster,nation:AestraNation,origin:AestraOrigin,influence:AestraInfluence='Stable',depth:ValdoriaDepth='Market'):Monster {
  const p=aestraNations[nation]
  const motif=pick(p.motifs), place=pick(p.places), prefix=pick(p.prefixes)
  const effectiveDepth=nation==='Valdoria'?depth:'Market'
  let influenceNote='Its relationship with local crystal power is stable.'
  if(influence==='Fading') influenceNote='Fading crystal power makes its systems or instincts unreliable; its Crisis state represents compensating for that loss.'
  if(influence==='Crystal-Starved') influenceNote='It is starved of crystal energy and behaves as though seeking, conserving, or stealing power.'
  if(influence==='Overcharged') influenceNote='Excess crystal energy has pushed it beyond its intended limits and makes its strongest effects unstable.'
  if(influence==='Corrupted') influenceNote='Crystal influence has warped its original purpose or ecology into something recognisably wrong.'
  const depthNote=nation==='Valdoria'?`Valdoria depth: ${effectiveDepth}. ${effectiveDepth==='Market'?'A recognisable urban threat shaped by crowds, trade and opportunism.':effectiveDepth==='Lower City'?'A lower-warren threat shaped by cramped passages, hazards and ambushes.':effectiveDepth==='Deep Below'?'A subterranean threat where ordinary crystal behaviour becomes unreliable.':'A buried or ancient threat whose functions no longer fit modern assumptions.'}`:undefined
  const originNote=origin==='Deep Below' ? 'It comes from beneath Valdoria’s familiar inhabited depths.' : origin==='Lost Era' ? 'Its true Lost Era purpose is only partially understood by modern Aestra.' : `Its immediate context is ${origin.toLowerCase()}.`
  const nationalName = monster.species==='Construct' ? `${prefix}-${Math.floor(10+Math.random()*90)} ${monster.name}` : `${prefix} ${monster.name}`
  let result:Monster={
    ...monster,
    name:nationalName,
    traits:[motif,...monster.traits.filter(t=>t!==motif)].slice(0,4),
  }
  result=applyNationMechanics(result,nation,origin,effectiveDepth)
  result=applyOriginMechanics(result,nation,origin)
  result=applyAestraCrystalInfluence(result,influence)
  result={...result,notes:[
      `Aestra: ${nation} — ${origin}.`,
      `National identity: ${p.identity}`,
      `Regional design: ${motif}; associated with the ${place}.`,
      ...(depthNote?[depthNote]:[]),
      `Crystal influence: ${influence}. ${influenceNote}`,
      `Origin context: ${originNote}`,
      `Aestra mechanics: nation, origin, regional depth and crystal state each alter combat behaviour while reusing the generated skill budget.`,
      ...result.notes.filter(n=>!n.startsWith('Aestra: ')&&!n.startsWith('National identity: ')&&!n.startsWith('Regional design: ')&&!n.startsWith('Valdoria depth: ')&&!n.startsWith('Crystal influence: ')&&!n.startsWith('Origin context: ')&&!n.startsWith('Aestra mechanics: '))
    ]}
  return result
}

export function aestraGenerationHint(nation:AestraNation) {
  const p=aestraNations[nation]
  return { species:pick(p.preferredSpecies), combatStyle:pick(p.preferredStyles), damageType:pick(p.damage), origins:p.origins }
}

export function refreshAestraMonsterLabel(monster:Monster,nation:AestraNation):Monster {
  const p=aestraNations[nation], motif=pick(p.motifs), prefix=pick(p.prefixes)
  const nationalName=monster.species==='Construct'?`${prefix}-${Math.floor(10+Math.random()*90)} ${monster.name}`:`${prefix} ${monster.name}`
  return {...monster,name:nationalName,traits:[motif,...(monster.traits||[]).filter(t=>t!==motif)].slice(0,4)}
}

export function refreshAestraMonsterTraits(monster:Monster,nation:AestraNation):Monster {
  const p=aestraNations[nation], motif=pick(p.motifs)
  const nationalMotifs=new Set(Object.values(aestraNations).flatMap(profile=>profile.motifs))
  return {...monster,traits:[motif,...(monster.traits||[]).filter(t=>!nationalMotifs.has(t))].slice(0,4)}
}

export function refreshAestraAffinities(monster:Monster,nation:AestraNation,influence:AestraInfluence='Stable',depth:ValdoriaDepth='Market'):Monster {
  const affinities={...monster.affinities}
  if(nation==='Garlond'){affinities.ice=improveAffinity(affinities.ice);affinities.fire=worsenAffinity(affinities.fire)}
  if(nation==='Rübenberg')affinities.air=improveAffinity(affinities.air)
  if(nation==='Palmeria'){
    const type=(monster.attacks?.[0]?.damageType||'light') as DamageType
    affinities[type]=improveAffinity(affinities[type])
  }
  if(nation==='Valdoria'&&depth==='Deep Below')affinities.earth=improveAffinity(affinities.earth)
  if(nation==='Valdoria'&&depth==='Buried / Ancient'){
    affinities.dark=improveAffinity(affinities.dark);affinities.light=improveAffinity(affinities.light)
  }
  if(influence==='Corrupted'){
    affinities.dark=improveAffinity(affinities.dark);affinities.light=worsenAffinity(affinities.light)
  }
  return {...monster,affinities}
}

