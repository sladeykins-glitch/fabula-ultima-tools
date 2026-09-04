import fs from 'node:fs'
const path='src/App.tsx'
let s=fs.readFileSync(path,'utf8')
const replace=(from,to,label)=>{if(!s.includes(from)){console.error(`Missing ${label}`);process.exitCode=1;return}s=s.replace(from,to)}
replace("import { applyMonsterTheme, monsterThemes, MonsterTheme } from './monsterThemeEngine'", "import { applyMonsterTheme, monsterThemes, MonsterTheme } from './monsterThemeEngine'\nimport { applyItemTheme, itemThemes, ItemTheme } from './itemThemeEngine'", 'item theme import')
replace("materialFunction:'Random' as MaterialFunction|'Random'}),[])", "materialFunction:'Random' as MaterialFunction|'Random',itemTheme:'Auto' as ItemTheme|'Auto'}),[])", 'item defaults')
replace("[materialFunction,setMaterialFunction]=useState<MaterialFunction|'Random'>(initial.materialFunction),[result,setResult]", "[materialFunction,setMaterialFunction]=useState<MaterialFunction|'Random'>(initial.materialFunction),[itemTheme,setItemTheme]=useState<ItemTheme|'Auto'>(initial.itemTheme||'Auto'),[result,setResult]", 'item theme state')
replace("JSON.stringify({type,weaponMethod,maxCost,allowMartial,allowTransforming,damageType,addMaterial,materialNature,descriptorMode,materialFunction})", "JSON.stringify({type,weaponMethod,maxCost,allowMartial,allowTransforming,damageType,addMaterial,materialNature,descriptorMode,materialFunction,itemTheme})", 'persist item theme')
replace("[type,weaponMethod,maxCost,allowMartial,allowTransforming,damageType,addMaterial,materialNature,descriptorMode,materialFunction])", "[type,weaponMethod,maxCost,allowMartial,allowTransforming,damageType,addMaterial,materialNature,descriptorMode,materialFunction,itemTheme])", 'item deps')
replace("if(addMaterial){const material=generateMaterial", "item=applyItemTheme(item,itemTheme==='Auto'?undefined:itemTheme);if(addMaterial){const material=generateMaterial", 'apply item theme')
replace("<div className=\"subpanel\"><label className=\"checkRow\">", "<label>Theme<select value={itemTheme} onChange={e=>setItemTheme(e.target.value as ItemTheme|'Auto')}><option>Auto</option>{itemThemes.map(t=><option key={t}>{t}</option>)}</select></label><p className=\"muted smallText\">Auto chooses a concept from the item’s category and damage profile. The name, damage identity, quality wording and material flavour are then kept in the same theme.</p><div className=\"subpanel\"><label className=\"checkRow\">", 'item theme UI')
if(process.exitCode) process.exit(process.exitCode)
fs.writeFileSync(path,s)
console.log('Item coherence migration applied')