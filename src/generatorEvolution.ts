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

export function officialInspiredMonsterSettings(official:Monster[],level:number,species:string,rank:Rank,fallbackStyle:CombatStyle,fallbackComplexity:Complexity){
  const sample=nearestOfficialMonsters(official,level,species,rank)
  if(!sample.length)return{style:fallbackStyle,complexity:fallbackComplexity,note:'Official-pattern inspiration unavailable: no official profiles are currently loaded.'}
  const styleCounts=new Map<CombatStyle,number>()
  sample.forEach(m=>{const s=m.combatStyle||'Mixed';styleCounts.set(s,(styleCounts.get(s)||0)+1)})
  const sampledStyle=[...styleCounts.entries()].sort((a,b)=>b[1]-a[1])[0]?.[0]||fallbackStyle
  // A deliberate player-selected role wins. Mixed means “let the reference set decide”.
  const style=fallbackStyle==='Mixed'?sampledStyle:fallbackStyle
  const avgSkills=sample.reduce((n,m)=>n+(m.skills||[]).length,0)/sample.length
  const avgSpells=sample.reduce((n,m)=>n+(m.spells||[]).length,0)/sample.length
  const sampledComplexity:Complexity=avgSkills+avgSpells>=6?'Crunchy':avgSkills+avgSpells<=2?'Simple':'Standard'
  // Explicit Simple/Crunchy are treated as intentional; Standard can be nudged by the reference set.
  const complexity=fallbackComplexity==='Standard'?sampledComplexity:fallbackComplexity
  return{style,complexity,note:`Official-pattern inspiration: structure sampled from ${sample.length} nearby official ${species} profiles (role/complexity only; explicit role choices are preserved; names and rules text are not copied).`}
}

export function powerAdjustedItemBudget(maxCost:number,intent:GeneratorPowerIntent){
  if(intent==='Conservative') return Math.max(500,Math.min(maxCost,900))
  if(intent==='Dangerous') return Math.min(3000,Math.max(maxCost,1800))
  if(intent==='Legendary') return 3000
  return maxCost
}

export function officialInspiredItemBudget(official:GeneratedItem[],type:ItemType,fallback:number){
  const sample=official.filter(item=>item.source==='Official'&&item.type===type&&Number(item.cost)>0)
  if(!sample.length)return{maxCost:fallback,note:'Official-pattern inspiration unavailable: no matching official items are currently loaded.'}
  const costs=sample.map(item=>Number(item.cost)).sort((a,b)=>a-b)
  const median=costs[Math.floor(costs.length/2)]
  // Reference data nudges the requested power band instead of replacing it. This keeps
  // Conservative/Dangerous/Legendary meaningful even when the official median is low.
  const lower=fallback*0.75, upper=fallback*1.15
  const blended=fallback*0.7+median*0.3
  const centered=clampCost(Math.max(lower,Math.min(upper,blended)))
  return{maxCost:centered,note:`Official-pattern inspiration: budget nudged toward the median cost of ${sample.length} official ${type.toLowerCase()} entries while preserving the selected power intent; item text is not copied.`}
}