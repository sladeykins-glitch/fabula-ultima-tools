import type { Affinity, DamageType, Monster, MonsterAttack, MonsterSkill } from './rules'

export type AestraEnvironment='Green Reaches'|'Scarlands'|'Ruin Belts'|'Frontier'|'Deep Wilds'
export type AestraExposure='Borderlands'|'Wild'|'Remote'|'Uncharted'
export type AestraWildOrigin='Natural'|'Frontier Settlement'|'Ancient Ruin'|'Abandoned Site'|'Lost Era'
export const aestraEnvironments:AestraEnvironment[]=['Green Reaches','Scarlands','Ruin Belts','Frontier','Deep Wilds']
export const aestraExposures:AestraExposure[]=['Borderlands','Wild','Remote','Uncharted']
export const aestraWildOrigins:AestraWildOrigin[]=['Natural','Frontier Settlement','Ancient Ruin','Abandoned Site','Lost Era']

function pick<T>(a:readonly T[]):T{return a[Math.floor(Math.random()*a.length)]}
function add(a:MonsterAttack,t:string):MonsterAttack{return {...a,effect:`${a.effect||''} ${t}`.trim()}}
function damage(a:MonsterAttack,t:DamageType):MonsterAttack{return {...a,damageType:t}}
function improve(a:Affinity):Affinity{return a==='Vulnerable'?'Normal':a==='Normal'?'Resistant':a==='Resistant'?'Immune':a}
function skill(skills:MonsterSkill[],name:string,summary:string,index=0){if(!skills.length)return skills;const i=Math.min(index,skills.length-1);return skills.map((s,n)=>n===i?{...s,name,summary}:s)}

export function applyAestraWildIdentity(monster:Monster,environment:AestraEnvironment,exposure:AestraExposure,origin:AestraWildOrigin):Monster{
 let attacks=[...monster.attacks],skills=[...monster.skills],affinities={...monster.affinities},traits=[...monster.traits]
 let magicBonus=monster.magicBonus,accuracyBonus=monster.accuracyBonus,mp=monster.mp
 let environmentNote=''
 if(environment==='Green Reaches'){
  if(attacks[0])attacks[0]=add(damage(attacks[0],pick(['earth','poison'] as DamageType[])),'If the target is suffering a status effect, this attack deals 5 extra damage as the surrounding ecology joins the assault.')
  skills=skill(skills,'Living Ecology','Once per round when this NPC inflicts a status effect, it recovers 5 HP or one allied Beast, Plant, or Monster gains +1 to its next Check.')
  affinities.earth=improve(affinities.earth);traits=['overgrown',...traits].slice(0,4)
  environmentNote='Nature has reclaimed old civilisation here; creatures behave as parts of an aggressive, interconnected ecology.'
 }
 if(environment==='Scarlands'){
  const t=pick(['fire','bolt','dark','earth'] as DamageType[]);if(attacks[0])attacks[0]=add(damage(attacks[0],t),'While in Crisis, this attack changes to a different non-physical damage type after each use.')
  skills=skill(skills,'Scar Instability','At the start of each round, improve one elemental Affinity by one step and worsen a different elemental Affinity by one step until the round ends.')
  traits=['war-scarred',...traits].slice(0,4);environmentNote='Ancient damage never healed cleanly; unstable terrain and energy produce shifting elemental behaviour.'
 }
 if(environment==='Ruin Belts'){
  if(attacks[0])attacks[0]=add(damage(attacks[0],pick(['bolt','light','dark'] as DamageType[])),'The first time this attack hits each round, the target loses 5 MP as dormant systems reactivate.')
  skills=skill(skills,'Dormant Protocol','Once per round after an enemy spends MP, this NPC gains +1 to its next Check against that enemy.')
  affinities.bolt=improve(affinities.bolt);traits=['relic-touched',...traits].slice(0,4);environmentNote='Lost structures and dormant mechanisms shape the local ecosystem and threats.'
 }
 if(environment==='Frontier'){
  if(attacks[0])attacks[0]=add(attacks[0],'If an ally has already acted against this target this round, this attack gains +1 Accuracy.')
  skills=skill(skills,'Frontier Improvisation','Once per round after this NPC misses or suffers a status effect, it gains +1 to its next Check as it changes tactics with whatever is at hand.')
  accuracyBonus+=1;traits=['weathered',...traits].slice(0,4);environmentNote='Settlements and travellers survive beyond national protection through improvisation, cooperation and scavenging.'
 }
 if(environment==='Deep Wilds'){
  if(attacks[0])attacks[0]=add(damage(attacks[0],pick(['dark','light','poison','earth'] as DamageType[])),'On a hit, choose slow or dazed; the target suffers that status through an unfamiliar biological or arcane function.')
  skills=skill(skills,'Unfamiliar Adaptation','At the start of each round, choose Accuracy, Magic, Defense, or Magic Defense; this NPC gains +1 to that value until the round ends.')
  magicBonus+=1;traits=['unclassified',...traits].slice(0,4);environmentNote='Far from mapped civilisation, familiar assumptions about species, relics and ecology become unreliable.'
 }

 let exposureNote=''
 if(exposure==='Borderlands')exposureNote='Known enough that travellers have practical names and warnings for threats like this.'
 if(exposure==='Wild'){if(attacks[1])attacks[1]=add(attacks[1],'If the target is suffering a status effect, this attack gains +1 Accuracy.');exposureNote='Beyond routine patrols, adaptation to residual crystal and old-world conditions is obvious.'}
 if(exposure==='Remote'){skills=skill(skills,'Remote Adaptation','Once per round when this NPC is targeted by a damage type it has already suffered this scene, it gains +1 Defense and Magic Defense against that effect.',1);exposureNote='Rarely observed; its adaptations are documented mostly through fragments, tracks and survivor accounts.'}
 if(exposure==='Uncharted'){skills=skill(skills,'Uncharted Function','At the start of each round choose one damage type. The first effect of that type against this NPC this round treats its Affinity as one step better.',1);mp+=10;exposureNote='Its behaviour is not meaningfully catalogued. Apparent anatomy or purpose may be misleading.'}

 let originNote=''
 if(origin==='Natural')originNote='No known maker or modern institution is responsible for it; treat its place in the ecology as primary.'
 if(origin==='Frontier Settlement')originNote='Its story is tied to an independent settlement beyond direct national rule.'
 if(origin==='Ancient Ruin')originNote='Its present behaviour is tied to an ancient ruin, though that does not prove it was originally created there.'
 if(origin==='Abandoned Site')originNote='It occupies something civilisation left behind and has adapted that place to its own needs.'
 if(origin==='Lost Era'){skills=skill(skills,'Misunderstood Original Function','A surviving behaviour appears purposeful, but modern observers do not know what that original purpose was.',Math.min(2,skills.length-1));originNote='There is credible Lost Era involvement, but the generator does not assert a hidden campaign truth beyond that.'}

 return {...monster,attacks,skills,affinities,traits,magicBonus,accuracyBonus,mp,notes:[`Aestra: uncontrolled lands.`,`Environment: ${environment}. ${environmentNote}`,`Exposure: ${exposure}. ${exposureNote}`,`Origin: ${origin}. ${originNote}`,...monster.notes.filter(n=>!n.startsWith('Aestra: ')&&!n.startsWith('Environment: ')&&!n.startsWith('Exposure: ')&&!n.startsWith('Origin: '))]}
}
