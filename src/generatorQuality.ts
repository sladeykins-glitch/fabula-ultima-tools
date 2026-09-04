import type { Monster } from './rules'
import type { GeneratedItem } from './items'

export type QualityReport={score:number;issues:string[];strengths:string[]}

function duplicateNames(values:{name:string}[]):string[]{
  const seen=new Set<string>(),duplicates=new Set<string>()
  for(const value of values){const key=value.name.trim().toLowerCase();if(!key)continue;if(seen.has(key))duplicates.add(value.name);seen.add(key)}
  return [...duplicates]
}
function clamp(value:number){return Math.max(0,Math.min(100,Math.round(value)))}
function words(value:string){return value.toLowerCase().match(/[a-z][a-z-]{2,}/g)||[]}
function overlap(a:string,b:string){
  const stop=new Set(['the','and','with','from','that','this','when','your','target','damage','attack','effect','monster','item','aestra','generated','quality','power','intent'])
  const left=new Set(words(a).filter(x=>!stop.has(x)))
  return [...new Set(words(b).filter(x=>!stop.has(x)))].filter(x=>left.has(x))
}
function entryText(entry:unknown){return JSON.stringify(entry).toLowerCase()}
function normalizedEffect(entry:unknown){
  const raw=entryText(entry)
  return raw.replace(/"name":"[^"]+"/g,'').replace(/\d+/g,'#').replace(/\s+/g,' ')
}
function thematicNotes(monster:Monster){return (monster.notes||[]).filter(line=>/^(Theme|Core gimmick|Combat loop|Champion phase|Aestra|Environment|Origin|Regional design|Crystal influence):/i.test(line)).join(' ')}

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
  const loop=(monster.notes||[]).find(x=>x.startsWith('Combat loop: '))||''
  const match=gimmick.match(/sets up ([a-z-]+)/i),status=match?.[1]?.toLowerCase()
  if(status){
    const all=[...attacks,...spells,...skills]
    const setupIndexes=all.map((entry,index)=>entryText(entry).includes(status)?index:-1).filter(index=>index>=0)
    const payoffTexts=[...attacks.slice(1),...spells,...skills].map(entryText)
    const payoff=payoffTexts.some(text=>text.includes(status)&&/(bonus|extra|more|additional|increase|recover|inflict|suffer|against|if |while |already|status)/.test(text))
    if(!setupIndexes.length)issues.push(`Core status ${status} is named in the gimmick but never established by an ability.`)
    else strengths.push(`Core status ${status} is represented in the generated abilities.`)
    if(!payoff)issues.push(`Core status ${status} has no clear mechanical payoff beyond being mentioned.`)
    else strengths.push(`The ${status} setup has a visible mechanical payoff.`)
    if(setupIndexes.length>=2)strengths.push(`Multiple abilities can feed the ${status} combat loop.`)
  }
  if(loop){
    const loopTokens=overlap(loop,[...attacks,...skills,...spells].map(entryText).join(' '))
    if(loopTokens.length<2)issues.push('The stated combat loop is only weakly represented by the actual abilities.')
    else strengths.push('The written combat loop is reinforced by the ability set.')
  }

  const attackFingerprints=attacks.map(normalizedEffect)
  let redundantPairs=0
  for(let i=0;i<attackFingerprints.length;i++)for(let j=i+1;j<attackFingerprints.length;j++){
    const left=new Set(words(attackFingerprints[i])),right=new Set(words(attackFingerprints[j]))
    const shared=[...left].filter(token=>right.has(token)).length
    const union=new Set([...left,...right]).size||1
    if(shared/union>=0.72)redundantPairs++
  }
  if(redundantPairs)issues.push(`${redundantPairs} attack pair${redundantPairs===1?' is':'s are'} mechanically too similar; distinct attacks should create different decisions.`)
  else if(attacks.length>1)strengths.push('Attacks are mechanically differentiated rather than near-duplicates.')

  const damageTypes=attacks.map(a=>a.damageType).filter(Boolean)
  if(damageTypes.length>1&&new Set(damageTypes).size===1){
    const distinctEffects=new Set(attacks.map(a=>normalizedEffect(a))).size
    if(distinctEffects===attacks.length)strengths.push('Shared damage identity is supported by distinct attack functions.')
  }

  const championPhases=skills.filter(x=>x.name.startsWith('Champion Phase —'))
  if(monster.rank==='Champion'){
    if(championPhases.length===0)issues.push('Champion has no themed Crisis phase.')
    if(championPhases.length>1)issues.push('Champion has more than one themed Crisis phase.')
    if(championPhases.length===1){
      strengths.push('Exactly one themed Champion Crisis phase is present.')
      const phaseText=entryText(championPhases[0]),identity=`${gimmick} ${loop} ${thematicNotes(monster)} ${attacks.map(entryText).join(' ')}`
      const phaseOverlap=overlap(phaseText,identity)
      const phaseUsesCoreStatus=status?phaseText.includes(status):false
      const primaryDamage=damageTypes[0],phaseUsesDamage=primaryDamage?phaseText.includes(String(primaryDamage)):false
      if(!phaseUsesCoreStatus&&!phaseUsesDamage&&phaseOverlap.length<2)issues.push('Champion phase feels disconnected from the monster’s established gimmick and damage identity.')
      else strengths.push('Champion phase escalates an existing gimmick, damage type, or thematic motif.')
    }
    if(skills.length>Math.max(monster.skillBudget||0,1)+1)issues.push('Champion skill list appears larger than its generated skill budget; review the phase slot.')
  }else if(championPhases.length)issues.push('Non-Champion contains a Champion phase.')

  if(monster.hp<=0||monster.mp<0)issues.push('Invalid HP or MP value.')
  if(monster.crisis!==Math.floor(monster.hp/2))issues.push('Crisis value does not match half of current HP.')
  else strengths.push('Crisis threshold matches current HP.')
  if(monster.defense<=0||monster.magicDefense<=0)issues.push('Defense values appear invalid.')
  if(new Set(monster.traits||[]).size!==(monster.traits||[]).length)issues.push('Duplicate traits are present.')
  else if((monster.traits||[]).length)strengths.push('Traits are distinct.')

  const identityText=`${monster.name} ${(monster.traits||[]).join(' ')} ${thematicNotes(monster)}`
  const abilityText=[...attacks,...skills,...spells].map(entryText).join(' ')
  const identityOverlap=overlap(identityText,abilityText)
  if(identityOverlap.length>=3)strengths.push('Name, traits, regional/theme notes and mechanics share a coherent vocabulary.')
  else if((monster.notes||[]).some(line=>line.startsWith('Theme: ')||line.startsWith('Aestra: ')))issues.push('Mechanical vocabulary only weakly reinforces the monster’s stated identity.')

  let score=100
  score-=duplicateAttacks.length*8+duplicateSkills.length*8+duplicateSpells.length*6
  score-=issues.filter(x=>!x.startsWith('Duplicate')).length*8
  score-=redundantPairs*5
  score+=Math.min(6,strengths.filter(x=>/payoff|combat loop|differentiated|escalates|coherent vocabulary/i.test(x)).length*2)
  return {score:clamp(score),issues,strengths}
}

export function validateItemDesign(item:GeneratedItem & {material?:{name:string}}):QualityReport{
  const issues:string[]=[],strengths:string[]=[]
  const breakdown=item.breakdown||[],text=`${item.name} ${item.effect||''} ${item.quality||''} ${breakdown.join(' ')}`.toLowerCase()
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
    const materialName=item.material.name.toLowerCase()
    const mismatched=materialLines.filter(x=>x.startsWith('Concept material: ')&&!x.toLowerCase().includes(materialName))
    if(mismatched.length)issues.push('Actual Natural Fantasy material conflicts with a separate conceptual material.')
    else strengths.push(`${item.material.name} is treated as the authoritative material identity.`)
    const materialMentioned=`${item.name} ${item.effect||''} ${item.quality||''} ${breakdown.join(' ')}`.toLowerCase().includes(materialName)
    if(materialMentioned)strengths.push('The actual material is visible in the item’s presented identity.')
  }
  const aestraLines=breakdown.filter(x=>x.startsWith('Aestra: '))
  if(aestraLines.length>1)issues.push('Multiple Aestra identity markers are present after rerolling.')
  if(aestraLines.length===1)strengths.push('Aestra provenance is singular and traceable.')
  if((text.match(/aestra —/g)||[]).length>2)issues.push('Item effect contains stacked Aestra clauses; reroll identity should be normalised.')

  const exactBreakdownDuplicates=breakdown.filter((line,index)=>breakdown.indexOf(line)!==index)
  if(exactBreakdownDuplicates.length)issues.push('Duplicate rule-breakdown lines are present.')
  else strengths.push('Rule breakdown contains no exact duplicate lines.')

  const themeLine=breakdown.find(line=>/^Theme: /i.test(line))||''
  const provenanceLines=breakdown.filter(line=>/^(Aestra:|Region:|Environment:|Origin:|Crystal influence:|Material:)/i.test(line)).join(' ')
  const conceptSource=`${themeLine} ${provenanceLines} ${item.material?.name||''}`
  const conceptTarget=`${item.name} ${item.quality||''} ${item.effect||''}`
  const conceptOverlap=overlap(conceptSource,conceptTarget)
  if(conceptSource.trim()){
    if(conceptOverlap.length>=2)strengths.push('Name, effect, material and provenance reinforce the same concept.')
    else issues.push('Name/effect only weakly reinforce the selected theme, material, or provenance.')
  }

  if(item.type==='Weapon'&&item.damageType){
    const effectAgrees=new RegExp(`\\b${item.damageType} damage\\b`,'i').test(item.effect||'')
    const identityAgrees=text.includes(String(item.damageType).toLowerCase())
    if(effectAgrees)strengths.push('Weapon effect text agrees with its damage type.')
    else if(identityAgrees)strengths.push('Weapon name or provenance supports its damage identity.')
    else issues.push(`Weapon’s ${item.damageType} damage type is not reflected anywhere in its name, effect, quality, or provenance.`)
  }

  const repeatedClauses=(item.effect||'').split(/[.;]/).map(x=>x.trim().toLowerCase()).filter(Boolean)
  if(new Set(repeatedClauses).size!==repeatedClauses.length)issues.push('Item effect repeats the same clause more than once.')

  let score=100-issues.length*8
  score+=Math.min(6,strengths.filter(x=>/same concept|damage type|provenance|material is visible/i.test(x)).length*2)
  return {score:clamp(score),issues,strengths}
}

export function monsterQualitySummary(monster:Monster):string{
  const report=validateMonsterDesign(monster)
  return `Quality ${report.score}/100${report.issues.length?` · Review: ${report.issues.join(' ')}`:` · No structural or thematic issues detected.`}`
}
export function itemQualitySummary(item:GeneratedItem & {material?:{name:string}}):string{
  const report=validateItemDesign(item)
  return `Quality ${report.score}/100${report.issues.length?` · Review: ${report.issues.join(' ')}`:` · No structural or thematic issues detected.`}`
}
