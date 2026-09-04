import type { GeneratedItem, DamageType, ItemType } from './items'

export type ItemTheme = 'Heroic' | 'Arcane' | 'Infernal' | 'Verdant' | 'Spectral' | 'Industrial' | 'Tidal'
export type ItemRerollPart = 'name' | 'quality' | 'element' | 'theme'

type ItemProfile = {
  adjectives:string[]
  nouns:Record<ItemType,string[]>
  damage:DamageType[]
  statuses:string[]
  materials:string[]
  epithets:string[]
  flavour:string
}

const profiles:Record<ItemTheme,ItemProfile>={
  Heroic:{adjectives:['Lionheart','Radiant','Valiant','Crowned'],nouns:{Weapon:['Blade','Spear','Edge','Arms'],Armor:['Mail','Cuirass','Raiment','Plate'],Shield:['Aegis','Bulwark','Guard','Ward'],Accessory:['Medal','Signet','Charm','Crest']},damage:['physical','light'],statuses:['shaken','weak'],materials:['sunsteel','white bronze','royal leather'],epithets:['of Resolve','of the Vanguard','of First Light','of the Oath'],flavour:'A prestigious piece built around resolve, protection, and decisive action.'},
  Arcane:{adjectives:['Runic','Aether','Astral','Glyphbound'],nouns:{Weapon:['Focus','Brand','Rod','Edge'],Armor:['Mantle','Vestment','Weave','Shell'],Shield:['Sigil','Ward','Disk','Aegis'],Accessory:['Lens','Talisman','Prism','Seal']},damage:['light','bolt','dark'],statuses:['dazed','weak','slow'],materials:['mana crystal','rune glass','star-silver'],epithets:['of the Seventh Sigil','of Aether','of the Glass Star','of Binding'],flavour:'A magically engineered item whose name, damage and quality share one arcane identity.'},
  Infernal:{adjectives:['Cinder','Brimstone','Ashen','Hellforged'],nouns:{Weapon:['Fang','Brand','Cleaver','Scourge'],Armor:['Carapace','Plate','Hide','Harness'],Shield:['Pyre Guard','Cinder Ward','Hellshield','Bulwark'],Accessory:['Ember Heart','Brand','Coal Charm','Ash Ring']},damage:['fire','dark'],statuses:['shaken','enraged','weak'],materials:['brimstone iron','emberglass','charred horn'],epithets:['of Cinders','of the Furnace','of Black Flame','of Ruin'],flavour:'A dangerous item built around heat, aggression, and dark power.'},
  Verdant:{adjectives:['Verdant','Briar','Blooming','Rootbound'],nouns:{Weapon:['Thorn','Branch','Fang','Staff'],Armor:['Barkmail','Leafweave','Cuirass','Mantle'],Shield:['Rootwall','Briar Guard','Petal Ward','Buckler'],Accessory:['Seed','Brooch','Garland','Charm']},damage:['earth','poison','physical'],statuses:['poisoned','slow','weak'],materials:['ironwood','witchvine','amber sap'],epithets:['of the Old Grove','of Thorns','of Spring Sap','of the Deep Root'],flavour:'A living or cultivated item whose material, effect and imagery grow from the same natural concept.'},
  Spectral:{adjectives:['Pale','Mourning','Grave','Eclipsed'],nouns:{Weapon:['Requiem','Fang','Edge','Bell'],Armor:['Shroud','Funeral Mail','Vestment','Cuirass'],Shield:['Grave Ward','Pale Guard','Reliquary','Aegis'],Accessory:['Locket','Bell','Reliquary','Veil']},damage:['dark','ice','light'],statuses:['shaken','dazed','weak'],materials:['grave-silver','moon bone','spirit glass'],epithets:['of the Last Bell','of Mourning','of the Pale Moon','of Remembrance'],flavour:'A relic associated with memory, death, cold, and lingering spiritual force.'},
  Industrial:{adjectives:['Prototype','Chrome','Overclocked','Mk-II'],nouns:{Weapon:['Driver','Cutter','Cannon','Unit'],Armor:['Frame','Exoshell','Rig','Plating'],Shield:['Deflector','Barrier','Guard Unit','Plate'],Accessory:['Module','Regulator','Core','Interface']},damage:['physical','bolt','fire'],statuses:['slow','dazed','weak'],materials:['alloy composite','ceramic steel','conductive mesh'],epithets:['Series-7','Foundry Pattern','Redline Model','Siege Pattern'],flavour:'An engineered device whose mechanics, materials and naming feel like parts of one technological system.'},
  Tidal:{adjectives:['Tidal','Abyssal','Drowned','Reefborn'],nouns:{Weapon:['Harpoon','Fang','Current','Trident'],Armor:['Scaleweave','Diver Mail','Shell','Mantle'],Shield:['Reef Guard','Tidewall','Shell Ward','Aegis'],Accessory:['Pearl','Compass','Coral Charm','Tideglass']},damage:['ice','air','physical'],statuses:['slow','weak','dazed'],materials:['abyssal coral','tideglass','leviathan bone'],epithets:['of the Black Reef','of Undertow','of the Deep','of Cold Currents'],flavour:'A sea-born item whose form and effects evoke pressure, current, cold and deep water.'},
}

const weaponCategoryNouns:Record<string,string[]>={
  Arcane:['Focus','Rod','Scepter','Grimoire'],
  Bow:['Bow','Longbow','Arc','Repeater'],
  Brawling:['Gauntlet','Knuckle','Claw','Fist'],
  Dagger:['Dagger','Knife','Needle','Fang'],
  Firearm:['Pistol','Handcannon','Revolver','Carbine'],
  Flail:['Flail','Chain','Morningstar','Lash'],
  Heavy:['Maul','Hammer','Breaker','Greataxe'],
  Spear:['Spear','Lance','Pike','Glaive'],
  Sword:['Sword','Blade','Sabre','Edge'],
  Thrown:['Chakram','Disc','Throwing Star','Javelin'],
}

function pick<T>(v:readonly T[]):T{return v[Math.floor(Math.random()*v.length)]}
function replaceFirstStatus(text:string,status:string){return text.replace(/\b(dazed|shaken|slow|weak|enraged|poisoned)\b/i,status)}
function replaceDamage(text:string,damage:DamageType){return text.replace(/\b(air|bolt|dark|earth|fire|ice|light|poison) damage\b/i,`${damage} damage`)}
function themeFromItem(item:GeneratedItem):ItemTheme|undefined {
  const line=(item.breakdown||[]).find(entry=>entry.startsWith('Theme: '))
  const value=line?.replace('Theme: ','').replace('.','') as ItemTheme|undefined
  return value&&profiles[value]?value:undefined
}

function itemNoun(item:GeneratedItem,theme:ItemTheme):string {
  if(item.type==='Weapon') {
    const category=String(item.category||'')
    const nouns=weaponCategoryNouns[category]
    if(nouns?.length) return pick(nouns)
  }
  return pick(profiles[theme].nouns[item.type])
}

function themedName(item:GeneratedItem,theme:ItemTheme,avoid?:string):string {
  const p=profiles[theme]
  const candidates:string[]=[]
  for(const adjective of p.adjectives) {
    const noun=item.type==='Weapon'&&weaponCategoryNouns[String(item.category||'')]
      ? pick(weaponCategoryNouns[String(item.category||'')])
      : pick(p.nouns[item.type])
    candidates.push(`${adjective} ${noun}`)
    candidates.push(`${adjective} ${noun} ${pick(p.epithets)}`)
  }
  const usable=candidates.filter(name=>name!==avoid)
  return pick(usable.length?usable:candidates)
}

export function chooseItemTheme(item:GeneratedItem):ItemTheme{
  const category=String(item.category||'').toLowerCase()
  if(category.includes('arcane')) return 'Arcane'
  if(category.includes('firearm')) return 'Industrial'
  if(item.damageType==='fire'||item.damageType==='dark') return Math.random()<0.55?'Infernal':'Spectral'
  if(item.damageType==='ice'||item.damageType==='air') return 'Tidal'
  if(item.damageType==='earth'||item.damageType==='poison') return 'Verdant'
  return pick(['Heroic','Arcane','Industrial'] as const)
}

export function applyItemTheme(item:GeneratedItem,requested?:ItemTheme):GeneratedItem{
  const theme=requested||chooseItemTheme(item), p=profiles[theme]
  const damage=pick(p.damage), status=pick(p.statuses), material=pick(p.materials)
  const baseLabel=item.baseItem||item.category||item.type
  const name=themedName(item,theme,item.name)
  let effect=item.effect||''
  effect=replaceFirstStatus(effect,status)
  effect=replaceDamage(effect,damage)
  const themedDamage=item.type==='Weapon'&&item.damageType&&item.damageType!=='physical'?damage:item.damageType
  const quality=item.quality ? `${item.quality.split(' · ')[0]} · ${theme} theme` : `${theme} theme`
  const origin=`${theme} design built around ${material}; ${p.flavour}`
  const retained=(item.breakdown||[]).filter(line=>!line.startsWith('Theme: ')&&!line.startsWith('Concept material: ')&&!line.startsWith('Base identity: ')&&!line.startsWith('Coherence: ')&&!line.startsWith('Thematic accent: '))
  return {...item,name,damageType:themedDamage,quality,effect,breakdown:[...retained,`Theme: ${theme}.`,`Concept material: ${material}.`,`Base identity: ${baseLabel}.`,origin,`Thematic accent: ${themedDamage||damage} / ${status}.`,`Coherence: ${item.type}${item.category?` · ${item.category}`:''} · ${theme}${themedDamage?` · ${themedDamage}`:''}.`]}
}

export function rerollItemPart(item:GeneratedItem,part:ItemRerollPart):GeneratedItem{
  const theme=themeFromItem(item)||chooseItemTheme(item),p=profiles[theme]
  if(part==='name') return {...item,name:themedName(item,theme,item.name)}
  if(part==='element') {
    if(item.type!=='Weapon') return item
    const alternatives=p.damage.filter(damage=>damage!==item.damageType)
    const damage=pick(alternatives.length?alternatives:p.damage)
    return {...item,damageType:damage,effect:replaceDamage(item.effect||'',damage),breakdown:[...(item.breakdown||[]).filter(x=>!x.startsWith('Coherence: ')&&!x.startsWith('Thematic accent: ')),`Thematic accent: ${damage} / ${pick(p.statuses)}.`,`Coherence: ${item.type}${item.category?` · ${item.category}`:''} · ${theme} · ${damage}.`]}
  }
  if(part==='quality') {
    const status=pick(p.statuses),damage=pick(p.damage)
    const effect=replaceDamage(replaceFirstStatus(item.effect||'',status),damage)
    return {...item,effect,quality:item.quality?`${item.quality.split(' · ')[0]} · ${theme} theme`:`${theme} theme`,breakdown:[...(item.breakdown||[]).filter(x=>!x.startsWith('Thematic accent: ')),`Thematic accent: ${damage} / ${status}.`]}
  }
  const choices=itemThemes.filter(t=>t!==theme)
  return applyItemTheme({...item,quality:item.quality?.split(' · ')[0]},pick(choices))
}

export function itemCoherenceSummary(item:GeneratedItem):string{
  const theme=themeFromItem(item)||chooseItemTheme(item)
  const accent=(item.breakdown||[]).find(line=>line.startsWith('Thematic accent: '))?.replace('Thematic accent: ','').replace('.','')
  const parts=[`Theme: ${theme}`,`Type: ${item.type}`]
  if(item.category) parts.push(`Category: ${item.category}`)
  if(item.damageType) parts.push(`Damage: ${item.damageType}`)
  if(accent) parts.push(`Accent: ${accent}`)
  if(item.quality) parts.push(`Quality: ${item.quality.split(' · ')[0]}`)
  return parts.join(' · ')
}

export const itemThemes=Object.keys(profiles) as ItemTheme[]