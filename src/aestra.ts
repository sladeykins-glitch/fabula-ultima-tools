import type { CombatStyle, DamageType, Monster, Species } from './rules'

export type AestraNation = 'Garlond' | 'Rübenberg' | 'Palmeria' | 'Valdoria'
export type AestraOrigin = 'Military' | 'Civic' | 'Scientific' | 'Imperial' | 'Market' | 'Black Market' | 'Deep Below' | 'Wilderness' | 'Lost Era'
export type AestraInfluence = 'Stable' | 'Fading' | 'Crystal-Starved' | 'Overcharged' | 'Corrupted'

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

function pick<T>(values: readonly T[]):T { return values[Math.floor(Math.random()*values.length)] }

export function aestraOrigins(nation:AestraNation):AestraOrigin[] { return aestraNations[nation].origins }

export function applyAestraMonsterIdentity(monster:Monster,nation:AestraNation,origin:AestraOrigin,influence:AestraInfluence='Stable'):Monster {
  const p=aestraNations[nation]
  const motif=pick(p.motifs), place=pick(p.places), prefix=pick(p.prefixes)
  let influenceNote='Its relationship with local crystal power is stable.'
  if(influence==='Fading') influenceNote='Fading crystal power makes its systems or instincts unreliable; its Crisis state represents compensating for that loss.'
  if(influence==='Crystal-Starved') influenceNote='It is starved of crystal energy and behaves as though seeking, conserving, or stealing power.'
  if(influence==='Overcharged') influenceNote='Excess crystal energy has pushed it beyond its intended limits and makes its strongest effects unstable.'
  if(influence==='Corrupted') influenceNote='Crystal influence has warped its original purpose or ecology into something recognisably wrong.'
  const originNote=origin==='Deep Below' ? 'It comes from beneath Valdoria’s familiar inhabited depths; its design should become stranger the farther down its origin lies.' : origin==='Lost Era' ? 'Its true Lost Era purpose is only partially understood by modern Aestra.' : `Its immediate context is ${origin.toLowerCase()}.`
  const nationalName = monster.species==='Construct' ? `${prefix}-${Math.floor(10+Math.random()*90)} ${monster.name}` : `${prefix} ${monster.name}`
  return {
    ...monster,
    name:nationalName,
    traits:[motif,...monster.traits.filter(t=>t!==motif)].slice(0,4),
    notes:[
      `Aestra: ${nation} — ${origin}.`,
      `National identity: ${p.identity}`,
      `Regional design: ${motif}; associated with the ${place}.`,
      `Crystal influence: ${influence}. ${influenceNote}`,
      `Origin context: ${originNote}`,
      ...monster.notes.filter(n=>!n.startsWith('Aestra: ')&&!n.startsWith('National identity: ')&&!n.startsWith('Regional design: ')&&!n.startsWith('Crystal influence: ')&&!n.startsWith('Origin context: '))
    ]
  }
}

export function aestraGenerationHint(nation:AestraNation) {
  const p=aestraNations[nation]
  return { species:pick(p.preferredSpecies), combatStyle:pick(p.preferredStyles), damageType:pick(p.damage), origins:p.origins }
}
