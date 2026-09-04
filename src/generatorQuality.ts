import type { Monster } from './rules'
import type { GeneratedItem } from './items'

export type QualityReport={score:number;issues:string[];strengths:string[]}

function duplicateNames(values:{name:string}[]):string[]{
  const seen=new Set<string>(),duplicates=new Set<string>()
  for(const value of values){const key=value.name.trim().toLowerCase();if(!key)continue;if(seen.has(key))duplicates.add(value.name);seen.add(key)}
  return [...duplicates]
}
function clamp(value:number){return Math.max(0,Math.min(100,Math.round(value)))}

export function validateMonsterDesign(monster:Monster):QualityReport{
  const issues:string[]=[],strengths:string[]=[]
  const attacks=monster.attacks||[],skills=monster.skills||[],spells=monster.spells||[]
  const duplicateAttacks=duplicateNames(attacks),duplicateSkills=duplicateNames(skills),duplicateSpells=duplicateNames(spells)
  if(duplicateAttacks.length)issues.push(`Duplicate attack name${duplicateAttacks.length>1?'s':''}: ${duplicateAttacks.join(', ')}.`)
  if(duplicateSkills.length)issues.push(`Duplicate skill name${duplicateSkills.length>1?'s':''}: ${duplicateSkills.join(', ')}.`)
  if(duplicateSpells.length)issues.push(`Duplicate spell name${duplicateSpells.length>1?'s':''}: ${duplicateSpells.join(', ')}.`)
  if(!attacks.length)issues.push('No basic attack was generated.')
  else strengths.push(`${attacks.length} distinct attack${attacks.length===1?'':'s'} present.`)

  const gimmick=(monster.notes||[]).find(x=>x.startsWith('Core gimmick: '))||''
  const match=gimmick.match(/sets up ([a-z]+)/i),status=match?.[1]?.toLowerCase()
  if(status){
    const setup=[...attacks,...spells,...skills].some(entry=>JSON.stringify(entry).toLowerCase().includes(status))
    const payoff=[...attacks.slice(1),...spells,...skills].some(entry=>JSON.stringify(entry).toLowerCase().includes(status))
    if(!setup)issues.push(`Core status ${status} is named in the gimmick but never established by an ability.`)
    else strengths.push(`Core status ${status} is represented in the generated abilities.`)
    if(!payoff)issues.push(`Core status ${status} has no visible payoff beyond the setup.`)
    else strengths.push(`The ${status} setup has at least one payoff.`)
  }

  const championPhases=skills.filter(x=>x.name.startsWith('Champion Phase —'))
  if(monster.rank==='Champion'){
    if(championPhases.length===0)issues.push('Champion has no themed Crisis phase.')
    if(championPhases.length>1)issues.push('Champion has more than one themed Crisis phase.')
    if(championPhases.length===1)strengths.push('Exactly one themed Champion Crisis phase is present.')
    if(skills.length>Math.max(monster.skillBudget||0,1)+1)issues.push('Champion skill list appears larger than its generated skill budget; review the phase slot.')
  }else if(championPhases.length)issues.push('Non-Champion contains a Champion phase.')

  if(monster.hp<=0||monster.mp<0)issues.push('Invalid HP or MP value.')
  if(monster.crisis!==Math.floor(monster.hp/2))issues.push('Crisis value does not match half of current HP.')
  else strengths.push('Crisis threshold matches current HP.')
  if(monster.defense<=0||monster.magicDefense<=0)issues.push('Defense values appear invalid.')
  if(new Set(monster.traits||[]).size!==(monster.traits||[]).length)issues.push('Duplicate traits are present.')
  else if((monster.traits||[]).length)strengths.push('Traits are distinct.')

  let score=100
  score-=duplicateAttacks.length*8+duplicateSkills.length*8+duplicateSpells.length*6
  score-=issues.filter(x=>!x.startsWith('Duplicate')).length*9
  return {score:clamp(score),issues,strengths}
}

export function validateItemDesign(item:GeneratedItem & {material?:{name:string}}):QualityReport{
  const issues:string[]=[],strengths:string[]=[]
  const breakdown=item.breakdown||[],text=`${item.effect||''} ${item.quality||''} ${breakdown.join(' ')}`.toLowerCase()
  if(item.cost<0)issues.push('Item has an invalid negative cost.')
  else strengths.push('Listed cost is valid.')
  if(item.type==='Weapon'){
    if(!item.category)issues.push('Weapon has no category.')
    if(!item.range)issues.push('Weapon has no range.')
    if(!item.accuracy)issues.push('Weapon has no accuracy formula.')
    if(!item.damageType)issues.push('Weapon has no damage type.')
    if(item.category==='Bow'&&item.range!=='Ranged')issues.push('Bow category conflicts with melee range.')
    if(item.category==='Firearm'&&item.range!=='Ranged')issues.push('Firearm category conflicts with melee range.')
    if(['Flail','Heavy','Spear','Sword'].includes(String(item.category))&&item.range==='Ranged')issues.push(`${item.category} category conflicts with ranged-only presentation.`)
    if(item.damageType)strengths.push(`Weapon damage identity is ${item.damageType}.`)
  }
  if((item.type==='Armor'||item.type==='Shield')&&(item.defense==null||item.magicDefense==null))issues.push('Protective item is missing Defense or Magic Defense data.')

  const materialLines=breakdown.filter(x=>x.startsWith('Material: ')||x.startsWith('Material identity: ')||x.startsWith('Concept material: '))
  if(item.material){
    const mismatched=materialLines.filter(x=>x.startsWith('Concept material: ')&&!x.toLowerCase().includes(item.material!.name.toLowerCase()))
    if(mismatched.length)issues.push('Actual Natural Fantasy material conflicts with a separate conceptual material.')
    else strengths.push(`${item.material.name} is treated as the authoritative material identity.`)
  }
  const aestraLines=breakdown.filter(x=>x.startsWith('Aestra: '))
  if(aestraLines.length>1)issues.push('Multiple Aestra identity markers are present after rerolling.')
  if(aestraLines.length===1)strengths.push('Aestra provenance is singular and traceable.')
  if((text.match(/aestra —/g)||[]).length>2)issues.push('Item effect contains stacked Aestra clauses; reroll identity should be normalised.')

  const exactBreakdownDuplicates=breakdown.filter((line,index)=>breakdown.indexOf(line)!==index)
  if(exactBreakdownDuplicates.length)issues.push('Duplicate rule-breakdown lines are present.')
  else strengths.push('Rule breakdown contains no exact duplicate lines.')

  let score=100-issues.length*10
  if(item.type==='Weapon'&&item.damageType&&new RegExp(`\\b${item.damageType} damage\\b`,'i').test(item.effect||''))strengths.push('Weapon effect text agrees with its damage type.')
  return {score:clamp(score),issues,strengths}
}

export function monsterQualitySummary(monster:Monster):string{
  const report=validateMonsterDesign(monster)
  return `Quality ${report.score}/100${report.issues.length?` · Review: ${report.issues.join(' ')}`:` · No structural issues detected.`}`
}
export function itemQualitySummary(item:GeneratedItem & {material?:{name:string}}):string{
  const report=validateItemDesign(item)
  return `Quality ${report.score}/100${report.issues.length?` · Review: ${report.issues.join(' ')}`:` · No structural issues detected.`}`
}
