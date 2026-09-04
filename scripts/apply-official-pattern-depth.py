from pathlib import Path

p=Path('src/generatorEvolution.ts')
s=p.read_text()
start=s.index('export function officialInspiredMonsterSettings(')
end=s.index('\nexport function powerAdjustedItemBudget',start)
monster_block="""function medianInt(values:number[],fallback=0){
  if(!values.length)return fallback
  const sorted=[...values].sort((a,b)=>a-b)
  return Math.round(sorted[Math.floor(sorted.length/2)])
}

function mode<T extends string>(values:(T|undefined)[]):T|undefined{
  const counts=new Map<T,number>()
  for(const value of values)if(value)counts.set(value,(counts.get(value)||0)+1)
  return [...counts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]
}

export type OfficialMonsterPattern={style:CombatStyle;complexity:Complexity;attackCount:number;skillCount:number;spellCount:number;affinityCount:number;sampleCount:number;note:string}

export function officialInspiredMonsterSettings(official:Monster[],level:number,species:string,rank:Rank,fallbackStyle:CombatStyle,fallbackComplexity:Complexity):OfficialMonsterPattern{
  const sample=nearestOfficialMonsters(official,level,species,rank)
  if(!sample.length)return{style:fallbackStyle,complexity:fallbackComplexity,attackCount:fallbackComplexity==='Simple'?1:fallbackComplexity==='Standard'?2:3,skillCount:99,spellCount:99,affinityCount:99,sampleCount:0,note:'Official-pattern inspiration unavailable: no official profiles are currently loaded.'}
  const styleCounts=new Map<CombatStyle,number>()
  sample.forEach(m=>{const st=m.combatStyle||'Mixed';styleCounts.set(st,(styleCounts.get(st)||0)+1)})
  const sampledStyle=[...styleCounts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||fallbackStyle
  const style=fallbackStyle==='Mixed'?sampledStyle:fallbackStyle
  const attackCount=Math.max(1,Math.min(3,medianInt(sample.map(m=>(m.attacks||[]).length),2)))
  const skillCount=Math.max(0,medianInt(sample.map(m=>(m.skills||[]).length),3))
  const spellCount=Math.max(0,medianInt(sample.map(m=>(m.spells||[]).length),0))
  const affinityCount=Math.max(0,medianInt(sample.map(m=>Object.values(m.affinities||{}).filter(value=>value!=='Normal').length),0))
  const avgFeatures=skillCount+spellCount+attackCount
  const sampledComplexity:Complexity=avgFeatures>=9?'Crunchy':avgFeatures<=4?'Simple':'Standard'
  const complexity=fallbackComplexity==='Standard'?sampledComplexity:fallbackComplexity
  return{style,complexity,attackCount,skillCount,spellCount,affinityCount,sampleCount:sample.length,note:`Official-pattern inspiration: sampled ${sample.length} nearby official ${species} profiles — median structure ${attackCount} attack${attackCount===1?'':'s'}, ${skillCount} skill${skillCount===1?'':'s'}, ${spellCount} spell${spellCount===1?'':'s'}, about ${affinityCount} non-Normal Affinities. Explicit role choices remain authoritative; official names and rules text are never copied.`}
}

export function applyOfficialMonsterStructure(monster:Monster,pattern:OfficialMonsterPattern):Monster{
  if(!pattern.sampleCount)return monster
  const attacks=(monster.attacks||[]).slice(0,Math.max(1,pattern.attackCount))
  const spells=(monster.spells||[]).slice(0,pattern.spellCount)
  const free=(monster.skills||[]).filter(skill=>skill.name==='Use Equipment')
  const paid=(monster.skills||[]).filter(skill=>skill.name!=='Use Equipment'&&!(pattern.spellCount===0&&skill.name==='Spellcaster'))
  const targetPaid=Math.max(0,pattern.skillCount-free.length)
  const skills=[...free,...paid.slice(0,targetPaid)]
  return {...monster,attacks,skills,spells,notes:[...(monster.notes||[]).filter(line=>!line.startsWith('Official-pattern structure: ')),`Official-pattern structure: generated chassis trimmed toward the sampled medians (${attacks.length} attacks, ${skills.length} skills, ${spells.length} spells). Affinity complexity is observed for reference but Species, Theme and Aestra Affinities remain authoritative.`]}
}
"""
s=s[:start]+monster_block+s[end:]
start=s.index('export function officialInspiredItemBudget(')
item_block="""export type OfficialItemPattern={maxCost:number;sampleCount:number;martialRate:number;category?:string;range?:GeneratedItem['range'];handedness?:GeneratedItem['handedness'];qualityRate:number;note:string}

export function officialInspiredItemBudget(official:GeneratedItem[],type:ItemType,fallback:number):OfficialItemPattern{
  const sample=official.filter(item=>item.source==='Official'&&item.type===type&&Number(item.cost)>0)
  if(!sample.length)return{maxCost:fallback,sampleCount:0,martialRate:0.5,qualityRate:0.5,note:'Official-pattern inspiration unavailable: no matching official items are currently loaded.'}
  const costs=sample.map(item=>Number(item.cost)).sort((a,b)=>a-b)
  const median=costs[Math.floor(costs.length/2)]
  const lower=fallback*0.75, upper=fallback*1.15
  const blended=fallback*0.7+median*0.3
  const centered=clampCost(Math.max(lower,Math.min(upper,blended)))
  const martialRate=sample.filter(item=>item.martial).length/sample.length
  const qualityRate=sample.filter(item=>Boolean(item.quality)).length/sample.length
  const category=mode(sample.map(item=>item.category))
  const range=mode(sample.map(item=>item.range))
  const handedness=mode(sample.map(item=>item.handedness))
  const shape=[category?`category ${category}`:'',range?`${range.toLowerCase()} range`:'',handedness?handedness.toLowerCase():'',`${Math.round(martialRate*100)}% martial`,`${Math.round(qualityRate*100)}% named quality`].filter(Boolean).join(', ')
  return{maxCost:centered,sampleCount:sample.length,martialRate,category,range,handedness,qualityRate,note:`Official-pattern inspiration: ${sample.length} official ${type.toLowerCase()} entries inform both budget and shape (${shape}); generated candidates are ranked for similarity without copying item names or effects.`}
}

export function chooseOfficialInspiredItemCandidate<T extends GeneratedItem>(candidates:T[],pattern:OfficialItemPattern):T{
  if(!candidates.length)throw new Error('No item candidates supplied')
  if(!pattern.sampleCount)return candidates[0]
  const wantsMartial=pattern.martialRate>=0.5,wantsQuality=pattern.qualityRate>=0.5
  const score=(item:T)=>{
    let value=0
    if(item.martial===wantsMartial)value+=4
    if(pattern.category&&item.category===pattern.category)value+=4
    if(pattern.range&&item.range===pattern.range)value+=3
    if(pattern.handedness&&item.handedness===pattern.handedness)value+=2
    if(Boolean(item.quality)===wantsQuality)value+=2
    value-=Math.min(4,Math.abs(Number(item.cost||0)-pattern.maxCost)/500)
    return value
  }
  return [...candidates].sort((a,b)=>score(b)-score(a))[0]
}
"""
s=s[:start]+item_block+'\n'
p.write_text(s)

p=Path('src/App.tsx')
s=p.read_text()
old="import { createMonsterVariant, GeneratorPowerIntent, MonsterVariant, monsterCoherenceSummary, officialInspiredItemBudget, officialInspiredMonsterSettings, powerAdjustedItemBudget, powerAdjustedMonsterSettings } from './generatorEvolution'"
new="import { applyOfficialMonsterStructure, chooseOfficialInspiredItemCandidate, createMonsterVariant, GeneratorPowerIntent, MonsterVariant, monsterCoherenceSummary, officialInspiredItemBudget, officialInspiredMonsterSettings, powerAdjustedItemBudget, powerAdjustedMonsterSettings } from './generatorEvolution'"
if old in s:s=s.replace(old,new,1)
elif 'applyOfficialMonsterStructure' not in s:raise SystemExit('generatorEvolution import not found')
monster_fallback=":{style:hintedStyle,complexity:adjusted.complexity,note:''};"
monster_full=":{style:hintedStyle,complexity:adjusted.complexity,attackCount:adjusted.complexity==='Simple'?1:adjusted.complexity==='Standard'?2:3,skillCount:99,spellCount:99,affinityCount:99,sampleCount:0,note:''};"
if monster_fallback in s:s=s.replace(monster_fallback,monster_full,1)
elif 'sampleCount:0,note' not in s:raise SystemExit('monster fallback missing')
item_fallback=":{maxCost:budget,note:''};budget=pattern.maxCost;"
item_full=":{maxCost:budget,sampleCount:0,martialRate:0.5,qualityRate:0.5,note:''};budget=pattern.maxCost;"
if item_fallback in s:s=s.replace(item_fallback,item_full,1)
elif 'martialRate:0.5' not in s:raise SystemExit('item fallback missing')
old="let monster=applyMonsterTheme(generateMonster({level,rank:adjusted.rank,soldierEquivalent:adjusted.soldierEquivalent,species:sp,complexity:pattern.complexity,combatStyle:pattern.style}),theme==='Auto'?undefined:theme);monster=applyMonsterSetting(monster);"
new="let chassis=generateMonster({level,rank:adjusted.rank,soldierEquivalent:adjusted.soldierEquivalent,species:sp,complexity:pattern.complexity,combatStyle:pattern.style});if(inspiration==='Official Pattern')chassis=applyOfficialMonsterStructure(chassis,pattern);let monster=applyMonsterTheme(chassis,theme==='Auto'?undefined:theme);monster=applyMonsterSetting(monster);"
if old in s:s=s.replace(old,new,1)
elif 'applyOfficialMonsterStructure(chassis,pattern)' not in s:raise SystemExit('monster generation missing')
old="let item:AppItem=type==='Weapon'&&weaponMethod==='Atlas Custom'?generateCustomWeapon({allowMartial,allowTransforming:powerIntent==='Legendary'?true:allowTransforming,preferredDamageType:damageType}):generateItem({type,maxCost:budget,allowMartial,preferredDamageType:damageType});item=applyItemTheme(item,itemTheme==='Auto'?undefined:itemTheme);"
new="const makeCandidate=():AppItem=>type==='Weapon'&&weaponMethod==='Atlas Custom'?generateCustomWeapon({allowMartial,allowTransforming:powerIntent==='Legendary'?true:allowTransforming,preferredDamageType:damageType}):generateItem({type,maxCost:budget,allowMartial,preferredDamageType:damageType});let item:AppItem=inspiration==='Official Pattern'?chooseOfficialInspiredItemCandidate(Array.from({length:6},()=>makeCandidate()),pattern):makeCandidate();item=applyItemTheme(item,itemTheme==='Auto'?undefined:itemTheme);"
if old in s:s=s.replace(old,new,1)
elif 'Array.from({length:6}' not in s:raise SystemExit('item generation missing')
s=s.replace('Official Pattern centers that budget on matching official equipment already in the database without copying item text.','Official Pattern uses matching official equipment to nudge the budget and rank several fresh candidates by common martial/category/range/handedness/quality structure without copying item text.',1)
p.write_text(s)
