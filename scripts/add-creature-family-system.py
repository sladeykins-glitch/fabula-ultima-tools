from pathlib import Path

rules=Path('src/rules.ts'); evo=Path('src/generatorEvolution.ts'); app=Path('src/App.tsx'); styles=Path('src/styles.css')

text=rules.read_text()
if 'export interface MonsterFamilyIdentity' not in text:
    text=text.replace('export interface Monster {\n',"export interface MonsterFamilyIdentity {\n  familyId: string\n  familyName: string\n  baseMonsterId: string\n  baseMonsterName: string\n  form: string\n  generation: number\n}\n\nexport interface Monster {\n",1)
if 'family?: MonsterFamilyIdentity' not in text:
    text=text.replace('  visualIdentity?: MonsterVisualIdentity\n','  visualIdentity?: MonsterVisualIdentity\n  family?: MonsterFamilyIdentity\n',1)
rules.write_text(text)

text=evo.read_text()
text=text.replace("import type { CombatStyle, Complexity, Monster, Rank } from './rules'","import type { CombatStyle, Complexity, Monster, MonsterFamilyIdentity, MonsterVisualIdentity, Rank } from './rules'",1)
text=text.replace("export type MonsterVariant = 'Minion' | 'Elite' | 'Champion' | 'Corrupted' | 'Elemental' | 'Role Shift'","export type MonsterVariant = 'Minion' | 'Elite' | 'Champion' | 'Corrupted' | 'Elemental' | 'Role Shift' | 'Juvenile' | 'Mature' | 'Elder' | 'Domesticated' | 'Regional Strain'",1)
if 'function ensureFamilyIdentity' not in text:
    marker='function gimmickNote(monster:Monster){\n'
    block=r'''function slug(value:string){return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48)||'creature'}
function ensureFamilyIdentity(base:Monster):MonsterFamilyIdentity{
  if(base.family)return base.family
  const familyName=cleanFamilyName(base.name)||'Creature'
  return {familyId:`family-${slug(familyName)}-${base.id.slice(-8)}`,familyName,baseMonsterId:base.id,baseMonsterName:base.name,form:'Base',generation:0}
}
function familyVisualIdentity(base:Monster,generated:Monster,variant:MonsterVariant):MonsterVisualIdentity|undefined{
  const original=base.visualIdentity
  if(!original)return generated.visualIdentity
  const next={...original}
  if(variant==='Juvenile')return {...next,scale:'smaller than the adult form',signatureFeature:`a less-developed version of ${original.signatureFeature}`,relicFeature:`an immature or partially formed version of ${original.relicFeature}`}
  if(variant==='Mature')return {...next,signatureFeature:`a fully developed ${original.signatureFeature}`}
  if(variant==='Elder')return {...next,scale:`large for its family; ${original.scale}`,surface:`aged, scarred and weathered ${original.surface}`,signatureFeature:`an exaggerated elder form of ${original.signatureFeature}`}
  if(variant==='Domesticated')return {...next,face:`${original.face}, with a calmer and more readable expression`,surface:`well-kept or harness-worn ${original.surface}`,signatureFeature:`a controlled, practical version of ${original.signatureFeature}`}
  if(variant==='Corrupted')return {...next,palette:`${original.palette}, disrupted by black-violet corruption`,face:`${original.face}, distorted by one obvious corrupted asymmetry`,relicFeature:`${original.relicFeature}, visibly corrupted and unstable`}
  if(variant==='Elemental')return {...next,surface:`${original.surface}, overlaid by elemental adaptation`,signatureFeature:`${original.signatureFeature}, transformed into an elemental display structure`}
  if(variant==='Champion')return {...next,scale:'larger and more imposing than the common family form',signatureFeature:`an apex expression of ${original.signatureFeature}`}
  if(variant==='Elite')return {...next,signatureFeature:`a veteran, reinforced expression of ${original.signatureFeature}`}
  if(variant==='Minion')return {...next,scale:'smaller and slighter than the common family form'}
  if(variant==='Regional Strain')return {...next,signatureFeature:`a regional adaptation built around ${original.signatureFeature}`}
  return next
}

'''
    if marker not in text: raise SystemExit('gimmick marker missing')
    text=text.replace(marker,block+marker,1)
old="function inheritFamilyIdentity(base:Monster,generated:Monster,variant:MonsterVariant):Monster{\n  const signature=signatureAttack(base)"
if old in text:text=text.replace(old,"function inheritFamilyIdentity(base:Monster,generated:Monster,variant:MonsterVariant):Monster{\n  const family=ensureFamilyIdentity(base)\n  const signature=signatureAttack(base)",1)
old="  return {...generated,traits:inheritedTraits,attacks,notes}\n}"
if old in text:
    text=text.replace(old,"  const formName:Record<MonsterVariant,string>={Minion:'Lesser',Elite:'Elite',Champion:'Apex',Corrupted:'Corrupted',Elemental:'Elemental','Role Shift':'Role Shift',Juvenile:'Juvenile',Mature:'Mature',Elder:'Elder',Domesticated:'Domesticated','Regional Strain':'Regional Strain'}\n  const familyIdentity={...family,form:formName[variant],generation:family.generation+1}\n  return {...generated,traits:inheritedTraits,attacks,notes,visualIdentity:familyVisualIdentity(base,generated,variant),family:familyIdentity}\n}",1)
needle="  if(variant==='Minion'){rank='Soldier';level=clampLevel(base.level-5);soldierEquivalent=1}\n"
if "variant==='Juvenile'" not in text:
    text=text.replace(needle,needle+"  if(variant==='Juvenile'){rank='Soldier';level=clampLevel(base.level-10);soldierEquivalent=1}\n  if(variant==='Mature'){level=clampLevel(base.level+5)}\n  if(variant==='Elder'){rank=base.rank==='Soldier'?'Elite':base.rank;level=clampLevel(base.level+10)}\n  if(variant==='Domesticated'){rank='Soldier';level=clampLevel(Math.max(5,base.level-5));style='Support'}\n  if(variant==='Regional Strain'){level=base.level}\n",1)
old="  const suffix:Record<MonsterVariant,string>={Minion:'Lesser',Elite:'Ascendant',Champion:'Apex',Corrupted:'Corrupted',Elemental:'Elemental', 'Role Shift':'Variant'}\n"
if old in text:text=text.replace(old,"  const suffix:Record<MonsterVariant,string>={Minion:'Lesser',Elite:'Ascendant',Champion:'Apex',Corrupted:'Corrupted',Elemental:'Elemental','Role Shift':'Variant',Juvenile:'Juvenile',Mature:'Mature',Elder:'Elder',Domesticated:'Domesticated','Regional Strain':'Regional'}\n",1)
evo.write_text(text)

text=app.read_text()
marker='<div className="monsterIdentity"><span>LV <b>{monster.level}</b></span><span>{monster.rank}</span><span>{monster.species}</span><span>{style}</span></div>'
if 'monsterFamilyBadge' not in text:text=text.replace(marker,marker+'{monster.family && <div className="monsterFamilyBadge"><strong>{monster.family.familyName}</strong><span>{monster.family.form}</span><small>Family generation {monster.family.generation}</small></div>}',1)
needle="  const identity = `${monster.rank.toLowerCase()} ${theme.toLowerCase()} ${monster.species.toLowerCase()}`\n"
if 'const family = monster.family' not in text:text=text.replace(needle,needle+"  const family = monster.family ? `creature family ${monster.family.familyName}, ${monster.family.form.toLowerCase()} form, visibly related to ${monster.family.baseMonsterName}` : ''\n",1)
for old,new in [
("identity,visualBlock","identity,family,visualBlock"),
("`${monster.name}, ${identity}`,visualBlock","`${monster.name}, ${identity}`,family,visualBlock"),
("`${identity}, level ${monster.level}`,visualBlock","`${identity}, level ${monster.level}`,family,visualBlock")]:
    text=text.replace(old,new)
old_ui="<button onClick={()=>variant('Minion')}>Lesser / Minion</button><button onClick={()=>variant('Elite')}>Elite</button><button onClick={()=>variant('Champion')}>Champion / Boss</button><button onClick={()=>variant('Corrupted')}>Corrupted</button><button onClick={()=>variant('Elemental')}>Elemental</button><button onClick={()=>variant('Role Shift')}>Different Role</button>"
new_ui="<button onClick={()=>variant('Juvenile')}>Juvenile</button><button onClick={()=>variant('Mature')}>Mature</button><button onClick={()=>variant('Elder')}>Elder</button><button onClick={()=>variant('Minion')}>Lesser / Minion</button><button onClick={()=>variant('Elite')}>Elite</button><button onClick={()=>variant('Champion')}>Champion / Boss</button><button onClick={()=>variant('Domesticated')}>Domesticated</button><button onClick={()=>variant('Regional Strain')}>Regional Strain</button><button onClick={()=>variant('Corrupted')}>Corrupted</button><button onClick={()=>variant('Elemental')}>Elemental</button><button onClick={()=>variant('Role Shift')}>Different Role</button>"
if "variant('Juvenile')" not in text:
    if old_ui not in text: raise SystemExit('variant UI missing')
    text=text.replace(old_ui,new_ui,1)
text=text.replace('Variants regenerate a rules-aware chassis while preserving species, family identity, signature combat motif, and the current Aestra region settings instead of merely multiplying HP or damage.','Family variants preserve species, core visual identity, face structure, signature feature, relic motif, signature attack and family lineage while changing age, rank, role, corruption or regional adaptation. Each derived creature is marked as part of the same family.',1)
app.write_text(text)

text=styles.read_text()
if '.monsterFamilyBadge' not in text:
    text += '\n.monsterFamilyBadge { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin:-4px 0 10px; padding:8px 10px; border:1px solid rgba(134,216,200,.32); border-left:3px solid var(--crystal); background:rgba(134,216,200,.055); }\n.monsterFamilyBadge strong { color:var(--crystal-bright); }\n.monsterFamilyBadge span { padding:2px 6px; border:1px solid #40534f; background:#0b1919; font-size:.75rem; text-transform:uppercase; letter-spacing:.07em; }\n.monsterFamilyBadge small { color:var(--muted); margin-left:auto; }\n'
styles.write_text(text)
print('Creature family system applied')
