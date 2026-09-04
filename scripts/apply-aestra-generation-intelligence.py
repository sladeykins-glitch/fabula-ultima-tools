from pathlib import Path

# Extend nation helpers with idempotent reroll refresh helpers.
p=Path('src/aestra.ts')
s=p.read_text()
needle="export function aestraGenerationHint(nation:AestraNation) {\n  const p=aestraNations[nation]\n  return { species:pick(p.preferredSpecies), combatStyle:pick(p.preferredStyles), damageType:pick(p.damage), origins:p.origins }\n}"
replacement=needle+"""

export function refreshAestraMonsterLabel(monster:Monster,nation:AestraNation):Monster {
  const p=aestraNations[nation], motif=pick(p.motifs), prefix=pick(p.prefixes)
  const nationalName=monster.species==='Construct'?`${prefix}-${Math.floor(10+Math.random()*90)} ${monster.name}`:`${prefix} ${monster.name}`
  return {...monster,name:nationalName,traits:[motif,...(monster.traits||[]).filter(t=>t!==motif)].slice(0,4)}
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
"""
if needle not in s: raise SystemExit('aestra hint needle missing')
s=s.replace(needle,replacement,1)
p.write_text(s)

# Add wild generation + affinity refresh helpers.
p=Path('src/aestraWilds.ts')
s=p.read_text()
insert="""

export function aestraWildGenerationHint(environment:AestraEnvironment){
 const styles:Record<AestraEnvironment,import('./rules').CombatStyle[]>={
  'Green Reaches':['Controller','Brute','Mixed'],
  'Scarlands':['Controller','Spellcaster','Brute'],
  'Ruin Belts':['Defender','Controller','Spellcaster'],
  'Frontier':['Mixed','Support','Assassin'],
  'Deep Wilds':['Controller','Assassin','Mixed'],
 }
 return {combatStyle:pick(styles[environment])}
}

export function refreshAestraWildAffinities(monster:Monster,environment:AestraEnvironment):Monster{
 const affinities={...monster.affinities}
 if(environment==='Green Reaches')affinities.earth=improve(affinities.earth)
 if(environment==='Ruin Belts')affinities.bolt=improve(affinities.bolt)
 return {...monster,affinities}
}
"""
if 'export function aestraWildGenerationHint' not in s:
    s=s+insert
p.write_text(s)

# Wire into Monster Generator.
p=Path('src/App.tsx')
s=p.read_text()
old="import { aestraNations, aestraOrigins, applyAestraMonsterIdentity, AestraInfluence, AestraNation, AestraOrigin, valdoriaDepths, ValdoriaDepth } from './aestra'"
new="import { aestraNations, aestraOrigins, applyAestraMonsterIdentity, aestraGenerationHint, refreshAestraAffinities, refreshAestraMonsterLabel, AestraInfluence, AestraNation, AestraOrigin, valdoriaDepths, ValdoriaDepth } from './aestra'"
if old not in s: raise SystemExit('aestra import needle missing')
s=s.replace(old,new,1)
old="import { aestraEnvironments, aestraExposures, aestraWildOrigins, applyAestraWildIdentity, AestraEnvironment, AestraExposure, AestraWildOrigin } from './aestraWilds'"
new="import { aestraEnvironments, aestraExposures, aestraWildOrigins, applyAestraWildIdentity, aestraWildGenerationHint, refreshAestraWildAffinities, AestraEnvironment, AestraExposure, AestraWildOrigin } from './aestraWilds'"
if old not in s: raise SystemExit('wild import needle missing')
s=s.replace(old,new,1)
old="const make=()=>{const adjusted=powerAdjustedMonsterSettings(rank,complexity,soldierEquivalent,powerIntent);const pattern=inspiration==='Official Pattern'?officialInspiredMonsterSettings(readStored<Monster[]>('fu-monsters',[]),level,sp,adjusted.rank,combatStyle,adjusted.complexity):{style:combatStyle,complexity:adjusted.complexity,note:''};let monster=applyMonsterTheme(generateMonster({level,rank:adjusted.rank,soldierEquivalent:adjusted.soldierEquivalent,species:sp,complexity:pattern.complexity,combatStyle:pattern.style}),theme==='Auto'?undefined:theme);if(setting==='Aestra') monster=nation==='Aestra'?applyAestraWildIdentity(monster,environment,exposure,wildOrigin):applyAestraMonsterIdentity(monster,nation,origin,influence,depth);monster={...monster,notes:[...(monster.notes||[]),`Power intent: ${powerIntent}.${powerIntent==='Legendary'?' Legendary intent promotes the generated chassis to Champion.':''}`,...(pattern.note?[pattern.note]:[])]};setResult(monster)}\n  const reroll=(part:MonsterRerollPart)=>setResult(current=>current?rerollMonsterPart(current,part):current)\n  const variant=(kind:MonsterVariant)=>setResult(current=>current?createMonsterVariant(current,kind):current)"
new="const applyMonsterSetting=(monster:Monster):Monster=>setting!=='Aestra'?monster:(nation==='Aestra'?applyAestraWildIdentity(monster,environment,exposure,wildOrigin):applyAestraMonsterIdentity(monster,nation,origin,influence,depth));const make=()=>{const adjusted=powerAdjustedMonsterSettings(rank,complexity,soldierEquivalent,powerIntent);const hintedStyle=setting==='Aestra'&&combatStyle==='Mixed'?(nation==='Aestra'?aestraWildGenerationHint(environment).combatStyle:aestraGenerationHint(nation).combatStyle):combatStyle;const pattern=inspiration==='Official Pattern'?officialInspiredMonsterSettings(readStored<Monster[]>('fu-monsters',[]),level,sp,adjusted.rank,hintedStyle,adjusted.complexity):{style:hintedStyle,complexity:adjusted.complexity,note:''};let monster=applyMonsterTheme(generateMonster({level,rank:adjusted.rank,soldierEquivalent:adjusted.soldierEquivalent,species:sp,complexity:pattern.complexity,combatStyle:pattern.style}),theme==='Auto'?undefined:theme);monster=applyMonsterSetting(monster);monster={...monster,notes:[...(monster.notes||[]),...(setting==='Aestra'&&combatStyle==='Mixed'?[`Aestra generation hint: regional identity selected ${pattern.style} as the starting combat role because Combat Style was left Mixed.`]:[]),`Power intent: ${powerIntent}.${powerIntent==='Legendary'?' Legendary intent promotes the generated chassis to Champion.':''}`,...(pattern.note?[pattern.note]:[])]};setResult(monster)}\n  const reroll=(part:MonsterRerollPart)=>setResult(current=>{if(!current)return current;let next=rerollMonsterPart(current,part);if(setting==='Aestra'&&(part==='name'||part==='theme')&&nation!=='Aestra')next=refreshAestraMonsterLabel(next,nation);if(setting==='Aestra'&&part==='affinities')next=nation==='Aestra'?refreshAestraWildAffinities(next,environment):refreshAestraAffinities(next,nation,influence,depth);return next})\n  const variant=(kind:MonsterVariant)=>setResult(current=>current?applyMonsterSetting(createMonsterVariant(current,kind)):current)"
if old not in s: raise SystemExit('monster generator make/reroll/variant needle missing')
s=s.replace(old,new,1)
old='Variants regenerate a rules-aware chassis while preserving species and family identity, instead of merely multiplying HP or damage.'
new='Variants regenerate a rules-aware chassis while preserving species, family identity, signature combat motif, and the current Aestra region settings instead of merely multiplying HP or damage.'
s=s.replace(old,new,1)
old='Targeted rerolls preserve level, rank, attributes, HP, MP and the rest of the current monster.'
new='Targeted rerolls preserve level, rank, attributes, HP, MP and Aestra regional identity; name/theme/affinity rerolls refresh the relevant regional layer without stacking duplicate mechanics.'
s=s.replace(old,new,1)
p.write_text(s)
# trigger migration
