import { generateMonster } from './rules'
import type { CombatStyle, Complexity, Monster, Rank } from './rules'
import type { GeneratedItem, ItemType } from './items'
import { applyMonsterTheme, type MonsterTheme } from './monsterThemeEngine'

export type GeneratorPowerIntent = 'Conservative' | 'Standard' | 'Dangerous' | 'Legendary'
export type MonsterVariant = 'Minion' | 'Elite' | 'Champion' | 'Corrupted' | 'Elemental' | 'Role Shift'

const styles:CombatStyle[]=['Mixed','Brute','Defender','Controller','Spellcaster','Assassin','Support']
const themes:MonsterTheme[]=['Wild','Infernal','Arcane','Industrial','Floral','Spectral','Draconic','Aquatic']

function pick<T>(values:readonly T[]):T{return values[Math.floor(Math.random()*values.length)]}
function clampLevel(value:number){return Math.max(5,Math.min(60,Math.round(value/5)*5))}
function clampCost(value:number){return Math.max(500,Math.min(3000,Math.round(value/100)*100))}

export function monsterThemeFromNotes(monster:Monster):MonsterTheme|undefined{
  const note=(monster.notes||[]).find(line=>line.startsWith('Theme: '))
  const value=note?.match(/^Theme: ([^.]+)/)?.[1] as MonsterTheme|undefined
  return value&&themes.includes(value)?value:undefined
}

export function powerAdjustedMonsterSettings(rank:Rank,complexity:Complexity,soldierEquivalent:number,intent:GeneratorPowerIntent){
  if(intent==='Conservative') return {rank,complexity:'Simple' as Complexity,soldierEquivalent}
  if(intent==='Dangerous') return {rank,complexity:'Crunchy' as Complexity,soldierEquivalent:rank==='Champion'?Math.max(3,soldierEquivalent):soldierEquivalent}
  if(intent==='Legendary') return {rank:'Champion' as Rank,complexity:'Crunchy' as Complexity,soldierEquivalent:Math.max(4,soldierEquivalent)}
  return {rank,complexity,soldierEquivalent}
}

function cleanFamilyName(name:string){
  return name
    .replace(/^(The |Lesser |Ascendant |Apex |Corrupted |Elemental |Variant )+/i,'')
    .split(/,| — | of the /)[0]
    .trim()
}

function gimmickNote(monster:Monster){
  return (monster.notes||[]).find(line=>line.startsWith('Core gimmick: '))
}

function signatureAttack(base:Monster){
  return (base.attacks||[])[0]
}

function inheritFamilyIdentity(base:Monster,generated:Monster,variant:MonsterVariant):Monster{
  const signature=signatureAttack(base)
  const baseGimmick=gimmickNote(base)
  const inheritedTraits=[...(base.traits||[]).slice(0,2),...(generated.traits||[])].filter((value,index,array)=>array.indexOf(value)===index).slice(0,4)
  const attacks=[...(generated.attacks||[])]
  if(signature&&attacks.length){
    const current=attacks[0]
    attacks[0]={...current,name:signature.name,damageType:signature.damageType,effect:signature.effect||current.effect}
  }
  let notes=(generated.notes||[]).filter(line=>!line.startsWith('Variant lineage: ')&&!line.startsWith('Inherited signature: '))
  if(baseGimmick){
    notes=notes.filter(line=>!line.startsWith('Core gimmick: '))
    notes.splice(Math.min(1,notes.length),0,baseGimmick)
  }
  notes.push(`Variant lineage: ${variant} evolution of ${base.name}. Species, family traits and signature combat motif are inherited rather than regenerated from scratch.`)
  if(signature) notes.push(`Inherited signature: ${signature.name} (${signature.damageType} damage).`)
  return {...generated,traits:inheritedTraits,attacks,notes}
}

export function createMonsterVariant(base:Monster,variant:MonsterVariant):Monster{
  const currentTheme=monsterThemeFromNotes(base)
  let level=base.level,rank=base.rank,style=base.combatStyle||'Mixed',theme=currentTheme,soldierEquivalent=base.soldierEquivalent||3
  if(variant==='Minion'){rank='Soldier';level=clampLevel(base.level-5);soldierEquivalent=1}
  if(variant==='Elite'){rank='Elite';level=clampLevel(base.level+5);soldierEquivalent=1}
  if(variant==='Champion'){rank='Champion';level=clampLevel(base.level+5);soldierEquivalent=Math.max(3,soldierEquivalent)}
  if(variant==='Corrupted') {
    const corruptionThemes=(['Infernal','Spectral','Arcane'] as MonsterTheme[]).filter(value=>value!==currentTheme)
    theme=pick(corruptionThemes.length?corruptionThemes:['Infernal'])
  }
  if(variant==='Elemental') {
    const elementalThemes=(['Arcane','Draconic','Aquatic'] as MonsterTheme[]).filter(value=>value!==currentTheme)
    theme=pick(elementalThemes.length?elementalThemes:['Arcane'])
  }
  if(variant==='Role Shift') style=pick(styles.filter(value=>value!==style))
  const generated=generateMonster({level,rank,soldierEquivalent,species:base.species,complexity:rank==='Champion'?'Crunchy':'Standard',combatStyle:style})
  const themed=applyMonsterTheme(generated,theme)
  const familyName=cleanFamilyName(base.name) || 'Creature'
  const suffix:Record<MonsterVariant,string>={Minion:'Lesser',Elite:'Ascendant',Champion:'Apex',Corrupted:'Corrupted',Elemental:'Elemental', 'Role Shift':'Variant'}
  const inherited=inheritFamilyIdentity(base,themed,variant)
  return {...inherited,name:`${suffix[variant]} ${familyName}`}
}

export function monsterCoherenceSummary(monster:Monster):string{
  const theme=monsterThemeFromNotes(monster)||'Auto'
  const gimmick=(monster.notes||[]).find(line=>line.startsWith('Core gimmick: '))?.replace('Core gimmick: ','').replace(/\.$/,'')
  const phase=(monster.skills||[]).find(skill=>skill.name.startsWith('Champion Phase —'))?.name.replace('Champion Phase — ','')
  const inspiration=(monster.notes||[]).find(line=>line.startsWith('Official-pattern inspiration: '))
  return [`Theme: ${theme}`,`Role: ${monster.combatStyle||'Mixed'}`,gimmick?`Gimmick: ${gimmick}`:'',phase?`Crisis: ${phase}`:'',inspiration?'Official-pattern structure':'' ].filter(Boolean).join(' · ')
}

function nearestOfficialMonsters(official:Monster[],level:number,species:string,rank:Rank){
  const allOfficial=official.filter(m=>m.source==='Official')
  const sameSpecies=allOfficial.filter(m=>m.species===species)
  const sourcePool=sameSpecies.length?sameSpecies:allOfficial
  const nearby=sourcePool.filter(m=>Math.abs(m.level-level)<=15)
  const pool=nearby.length?nearby:sourcePool
  const ranked=pool.filter(m=>m.rank===rank)
  return (ranked.length?ranked:pool).slice().sort((a,b)=>Math.abs(a.level-level)-Math.abs(b.level-level)).slice(0,12)
}

function medianInt(values:number[],fallback=0){
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

export function powerAdjustedItemBudget(maxCost:number,intent:GeneratorPowerIntent){
  if(intent==='Conservative') return Math.max(500,Math.min(maxCost,900))
  if(intent==='Dangerous') return Math.min(3000,Math.max(maxCost,1800))
  if(intent==='Legendary') return 3000
  return maxCost
}

export type OfficialItemPattern={maxCost:number;sampleCount:number;martialRate:number;category?:string;range?:GeneratedItem['range'];handedness?:GeneratedItem['handedness'];qualityRate:number;note:string}

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

