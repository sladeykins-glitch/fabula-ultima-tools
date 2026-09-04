import type { DamageType, GeneratedItem } from './items'
import type { GeneratedMaterial } from './materials'
import type { AestraInfluence, AestraNation, AestraOrigin, ValdoriaDepth } from './aestra'
import type { AestraEnvironment, AestraExposure, AestraWildOrigin } from './aestraWilds'

export type AestraItem = GeneratedItem & { material?: GeneratedMaterial; origin?: string }
export type AestraItemRegion = AestraNation | 'Aestra'

type ItemProfile = {
  adjectives: string[]
  damage: DamageType[]
  provenance: string
  effect: string
}

const nationProfiles: Record<AestraNation, ItemProfile> = {
  Garlond: {
    adjectives:['State-Issue','Winterworks','Foundry','Arsenal'],
    damage:['ice','bolt','fire','physical'],
    provenance:'Garlond manufacture favours rugged, standardised equipment intended for cold, dirty and highly controlled conditions.',
    effect:'Aestra — Garlond construction favours reliability under pressure: once per scene when the item’s main effect succeeds against a target suffering slow or weak, its user gains +1 to their next Check against that target.'
  },
  'Rübenberg': {
    adjectives:['Gale-Wrought','Canalworks','Civic','Windline'],
    damage:['air','bolt','physical'],
    provenance:'Rübenberg craft favours precision, maintainability, motion and civic usefulness over brute-force excess.',
    effect:'Aestra — Rübenberg balance and redirection: once per scene after the bearer or an ally is missed, the bearer may grant that ally +1 Defense or Magic Defense until the start of the bearer’s next turn.'
  },
  Palmeria: {
    adjectives:['Axiom','Laurel','Academy','Imperial'],
    damage:['light','bolt','fire','dark'],
    provenance:'Palmerian equipment combines scholarship, experimentation and prestige, often treating a tool as an argument made physical.',
    effect:'Aestra — Palmerian analysis: once per scene after the bearer observes a Resistance, Immunity, Absorb or Vulnerability, they gain +1 to their next Check involving this item against that creature.'
  },
  Valdoria: {
    adjectives:['Bazaar','Patchwork','Understreet','Salvaged'],
    damage:['earth','poison','dark','physical'],
    provenance:'Valdorian equipment is rebuilt, traded, repurposed and modified repeatedly; provenance is often a chain of owners rather than a maker’s mark.',
    effect:'Aestra — Valdorian opportunism: once per scene when another creature nearby loses HP or MP, the bearer gains +1 to the next Check made with or because of this item.'
  }
}

const environmentProfiles: Record<AestraEnvironment, ItemProfile> = {
  'Green Reaches': {
    adjectives:['Overgrown','Rootbound','Green-Reach','Wildgrown'], damage:['earth','poison','physical'],
    provenance:'Recovered or made in heavily reclaimed country where living systems have overtaken roads, ruins and old infrastructure.',
    effect:'Aestra — Green Reaches adaptation: once per scene after the bearer suffers or inflicts poisoned, slow or weak, they may recover 5 MP.'
  },
  Scarlands: {
    adjectives:['Scarseared','Glassland','Crater-Forged','Stormscar'], damage:['fire','bolt','earth','dark'],
    provenance:'Recovered from damaged terrain where old destruction still shapes weather, stone and surviving machinery.',
    effect:'Aestra — Scarland instability: once per scene the bearer may gain +5 damage or +1 Defense for one effect involving this item; after that effect resolves, the bearer loses 5 HP.'
  },
  'Ruin Belts': {
    adjectives:['Ruin-Belt','Vaultborn','Recovered','Oldworks'], damage:['light','dark','bolt','earth'],
    provenance:'Recovered from concentrations of old structures whose original purpose is only partially understood.',
    effect:'Aestra — recovered function: once per scene one effect involving this item may treat a single Resistance as Normal.'
  },
  Frontier: {
    adjectives:['Frontier','Roadworn','Waypost','Freehold'], damage:['physical','air','earth','fire'],
    provenance:'Built, repaired or traded in settlements beyond reliable national infrastructure, where versatility matters more than pedigree.',
    effect:'Aestra — frontier practicality: once per scene after failing a Check involving this item, the bearer gains +2 to the next Check involving it.'
  },
  'Deep Wilds': {
    adjectives:['Deep-Wild','Unmapped','Strangeborn','Far-Reach'], damage:['dark','poison','light','earth','air'],
    provenance:'Found far beyond dependable maps, where its makers, users or even intended function may be unknown.',
    effect:'Aestra — poorly understood property: at the start of each scene choose +1 Accuracy, +1 Magic, or +1 Defense while using or carrying this item; the choice cannot be changed during that scene.'
  }
}

function pick<T>(values: readonly T[]): T { return values[Math.floor(Math.random()*values.length)] }
function titleCore(item:AestraItem):string {
  const stored=(item.breakdown||[]).find(x=>x.startsWith('Aestra base name: '))?.slice('Aestra base name: '.length)
  const tagged=/^(State-Issue|Winterworks|Foundry|Arsenal|Gale-Wrought|Canalworks|Civic|Windline|Axiom|Laurel|Academy|Imperial|Bazaar|Patchwork|Understreet|Salvaged|Overgrown|Rootbound|Green-Reach|Wildgrown|Scarseared|Glassland|Crater-Forged|Stormscar|Ruin-Belt|Vaultborn|Recovered|Oldworks|Frontier|Roadworn|Waypost|Freehold|Deep-Wild|Unmapped|Strangeborn|Far-Reach)\s/.test(item.name)
  return tagged && stored ? stored : item.name
}
function baseEffect(item:AestraItem):string { return (item.effect||'').split(' Aestra — ')[0].trim() }
function cleanBreakdown(item:AestraItem):string[] {
  return (item.breakdown||[]).filter(x=>!x.startsWith('Aestra: ')&&!x.startsWith('Aestra provenance: ')&&!x.startsWith('Aestra mechanics: ')&&!x.startsWith('Aestra base name: ')&&!x.startsWith('Material identity: ')&&!x.startsWith('Concept material: '))
}
function materialLine(item:AestraItem):string|undefined {
  if(!item.material) return undefined
  return `Material identity: ${item.material.name} is the authoritative material for this item; thematic material wording is secondary flavour only.`
}
function withProfile(item:AestraItem, profile:ItemProfile, label:string, damage:DamageType[]):AestraItem {
  const base=titleCore(item)
  const adjective=pick(profile.adjectives)
  const chosen=item.type==='Weapon' ? pick(damage) : item.damageType
  const breakdown=cleanBreakdown(item)
  const material=materialLine(item)
  const provenance=item.material ? `${profile.provenance} This example is specifically made with ${item.material.name.toLowerCase()}.` : profile.provenance
  return {
    ...item,
    name:`${adjective} ${base}`,
    damageType:chosen,
    effect:`${baseEffect(item)} ${profile.effect}`.trim(),
    origin:provenance,
    breakdown:[...breakdown,`Aestra base name: ${base}`,`Aestra: ${label}.`,`Aestra provenance: ${provenance}`,`Aestra mechanics: identity modifies existing equipment behaviour without changing its listed zenny cost.`,...(material?[material]:[])]
  }
}

function originClause(nation:AestraNation, origin:AestraOrigin):string {
  const special:Partial<Record<AestraOrigin,string>>={
    Military:'Military provenance emphasises doctrine, field reliability and coordinated use.',
    Civic:'Civic provenance emphasises protection, public infrastructure and dependable everyday operation.',
    Scientific:'Scientific provenance marks the item as experimental, calibrated or research-derived.',
    Imperial:'Imperial provenance emphasises prestige, hierarchy and symbolic authority.',
    Market:'Market provenance suggests legal trade, multiple owners and modifications made for practical resale.',
    'Black Market':'Black-market provenance suggests illicit modification, hidden functions or uncertain safety.',
    'Deep Below':'Deep-below provenance implies subterranean salvage and functions affected by unusual underground conditions.',
    Wilderness:'Wilderness provenance indicates adaptation for exposed travel, field repair and scarce infrastructure.',
    'Lost Era':'Lost Era provenance means its current users do not fully understand its original purpose.'
  }
  return `${nation} ${special[origin]||'provenance shapes how the item is used.'}`
}

function influenceEffect(item:AestraItem,influence:AestraInfluence):AestraItem {
  if(influence==='Stable') return item
  const extra:Record<Exclude<AestraInfluence,'Stable'>,string>={
    Fading:'Aestra — Fading crystal state: once per scene while in Crisis, the bearer may gain +1 to a Check involving this item.',
    'Crystal-Starved':'Aestra — Crystal-starved state: once per scene when the bearer spends MP on an effect involving this item, recover 5 MP after that effect resolves.',
    Overcharged:'Aestra — Overcharged state: once per scene add +5 damage or +1 Defense to an effect involving this item; after resolving it, the bearer loses 5 HP.',
    Corrupted:'Aestra — Corrupted state: once per scene the bearer may change damage from this item to dark or poison; after doing so, they suffer weak until the end of the scene.'
  }
  const clean=(item.effect||'').trim()
  return {...item,effect:`${clean} ${extra[influence]}`.trim(),breakdown:[...(item.breakdown||[]).filter(x=>!x.startsWith('Crystal influence: ')),`Crystal influence: ${influence}.`]}
}

export function applyAestraNationItemIdentity(item:AestraItem,nation:AestraNation,origin:AestraOrigin,influence:AestraInfluence,depth:ValdoriaDepth='Market'):AestraItem {
  const profile=nationProfiles[nation]
  let transformed=withProfile(item,profile,`${nation} — ${origin}`,profile.damage)
  transformed={...transformed,breakdown:[...(transformed.breakdown||[]),`Aestra provenance detail: ${originClause(nation,origin)}`]}
  if(nation==='Valdoria') {
    const depthText:Record<ValdoriaDepth,string>={
      Market:'Market level: visible trade, fast repairs and opportunistic resale.',
      'Lower City':'Lower City: cramped workshops, improvised fittings and hidden routes influence the design.',
      'Deep Below':'Deep Below: salvage is scarce, pressure-tested and often interacts strangely with MP-driven technology.',
      'Buried / Ancient':'Buried / Ancient: the object may preserve a function older than Valdoria itself.'
    }
    transformed={...transformed,breakdown:[...(transformed.breakdown||[]),`Valdoria depth: ${depth} — ${depthText[depth]}`]}
  }
  return influenceEffect(transformed,influence)
}

export function applyAestraWildItemIdentity(item:AestraItem,environment:AestraEnvironment,exposure:AestraExposure,origin:AestraWildOrigin,influence:AestraInfluence='Stable'):AestraItem {
  const p=environmentProfiles[environment]
  let transformed=withProfile(item,p,`Aestra uncontrolled lands — ${environment} — ${exposure} — ${origin}`,p.damage)
  const exposureText:Record<AestraExposure,string>={
    Borderlands:'Known enough to be traded, repaired or described reliably.',
    Wild:'Adapted to conditions beyond routine national infrastructure.',
    Remote:'Rarely documented; provenance and purpose are uncertain.',
    Uncharted:'Its behaviour or original purpose may not fit current assumptions at all.'
  }
  const originText:Record<AestraWildOrigin,string>={
    Natural:'Made from or adapted to the local environment rather than a national industrial tradition.',
    'Frontier Settlement':'Built or repaired by an independent settlement with limited supply chains.',
    'Ancient Ruin':'Recovered from old structures and repurposed with incomplete understanding.',
    'Abandoned Site':'Left behind by a vanished expedition, settlement or installation.',
    'Lost Era':'Predates current nations and may no longer be used for its original purpose.'
  }
  transformed={...transformed,breakdown:[...(transformed.breakdown||[]),`Exposure: ${exposure} — ${exposureText[exposure]}`,`Wild origin: ${origin} — ${originText[origin]}`]}
  return influenceEffect(transformed,influence)
}
