from pathlib import Path

p=Path('src/monsterThemeEngine.ts')
s=p.read_text()
old="""  let skills=opts.skills ? rewriteSkills(monster.skills||[],style,primary,status,theme) : (monster.skills||[]).filter(skill=>!skill.name.startsWith('Champion Phase —'))
  if(monster.rank==='Champion') skills=[...skills,championPhase(theme,style,primary,status)]
"""
new="""  let skills=opts.skills ? rewriteSkills(monster.skills||[],style,primary,status,theme) : (monster.skills||[]).filter(skill=>!skill.name.startsWith('Champion Phase —'))
  if(monster.rank==='Champion') {
    const phase=championPhase(theme,style,primary,status)
    // A Champion phase is part of the existing skill budget, not a free extra skill.
    // Prefer replacing Crisis Effect because both occupy the same Crisis-facing design space;
    // otherwise replace Unique Action, then the final generated skill. Only a zero-skill
    // Champion needs the phase appended so it still has a defining Champion mechanic.
    const replaceIndex=skills.findIndex(skill=>skill.name==='Crisis Effect')>=0
      ? skills.findIndex(skill=>skill.name==='Crisis Effect')
      : skills.findIndex(skill=>skill.name==='Unique Action')>=0
        ? skills.findIndex(skill=>skill.name==='Unique Action')
        : skills.length-1
    if(replaceIndex>=0) skills=skills.map((skill,index)=>index===replaceIndex?phase:skill)
    else skills=[phase]
  }
"""
if old not in s: raise SystemExit('champion block not found')
s=s.replace(old,new,1)
p.write_text(s)

p=Path('src/generatorEvolution.ts')
s=p.read_text()
start=s.index('export function createMonsterVariant(')
end=s.index('\nexport function monsterCoherenceSummary',start)
new_func=r'''function gimmickNote(monster:Monster){
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
'''
s=s[:start]+new_func+s[end:]
p.write_text(s)
# migration trigger v2
