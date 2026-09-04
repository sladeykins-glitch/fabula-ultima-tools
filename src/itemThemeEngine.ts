import type { GeneratedItem, DamageType, ItemType } from './items'

export type ItemTheme = 'Heroic' | 'Arcane' | 'Infernal' | 'Verdant' | 'Spectral' | 'Industrial' | 'Tidal'

type ItemProfile = {
  adjectives:string[]
  nouns:Record<ItemType,string[]>
  damage:DamageType[]
  statuses:string[]
  materials:string[]
  flavour:string
}

const profiles:Record<ItemTheme,ItemProfile>={
  Heroic:{adjectives:['Lionheart','Radiant','Valiant','Crowned'],nouns:{Weapon:['Blade','Spear','Edge','Arms'],Armor:['Mail','Cuirass','Raiment','Plate'],Shield:['Aegis','Bulwark','Guard','Ward'],Accessory:['Medal','Signet','Charm','Crest']},damage:['physical','light'],statuses:['shaken','weak'],materials:['sunsteel','white bronze','royal leather'],flavour:'A prestigious piece built around resolve, protection, and decisive action.'},
  Arcane:{adjectives:['Runic','Aether','Astral','Glyphbound'],nouns:{Weapon:['Focus','Brand','Rod','Edge'],Armor:['Mantle','Vestment','Weave','Shell'],Shield:['Sigil','Ward','Disk','Aegis'],Accessory:['Lens','Talisman','Prism','Seal']},damage:['light','bolt','dark'],statuses:['dazed','weak','slow'],materials:['mana crystal','rune glass','star-silver'],flavour:'A magically engineered item whose name, damage and quality share one arcane identity.'},
  Infernal:{adjectives:['Cinder','Brimstone','Ashen','Hellforged'],nouns:{Weapon:['Fang','Brand','Cleaver','Scourge'],Armor:['Carapace','Plate','Hide','Harness'],Shield:['Pyre Guard','Cinder Ward','Hellshield','Bulwark'],Accessory:['Ember Heart','Brand','Coal Charm','Ash Ring']},damage:['fire','dark'],statuses:['shaken','enraged','weak'],materials:['brimstone iron','emberglass','charred horn'],flavour:'A dangerous item built around heat, aggression, and dark power.'},
  Verdant:{adjectives:['Verdant','Briar','Blooming','Rootbound'],nouns:{Weapon:['Thorn','Branch','Fang','Staff'],Armor:['Barkmail','Leafweave','Cuirass','Mantle'],Shield:['Rootwall','Briar Guard','Petal Ward','Buckler'],Accessory:['Seed','Brooch','Garland','Charm']},damage:['earth','poison','physical'],statuses:['poisoned','slow','weak'],materials:['ironwood','witchvine','amber sap'],flavour:'A living or cultivated item whose material, effect and imagery grow from the same natural concept.'},
  Spectral:{adjectives:['Pale','Mourning','Grave','Eclipsed'],nouns:{Weapon:['Requiem','Fang','Edge','Bell'],Armor:['Shroud','Funeral Mail','Vestment','Cuirass'],Shield:['Grave Ward','Pale Guard','Reliquary','Aegis'],Accessory:['Locket','Bell','Reliquary','Veil']},damage:['dark','ice','light'],statuses:['shaken','dazed','weak'],materials:['grave-silver','moon bone','spirit glass'],flavour:'A relic associated with memory, death, cold, and lingering spiritual force.'},
  Industrial:{adjectives:['Prototype','Chrome','Overclocked','Mk-II'],nouns:{Weapon:['Driver','Cutter','Cannon','Unit'],Armor:['Frame','Exoshell','Rig','Plating'],Shield:['Deflector','Barrier','Guard Unit','Plate'],Accessory:['Module','Regulator','Core','Interface']},damage:['physical','bolt','fire'],statuses:['slow','dazed','weak'],materials:['alloy composite','ceramic steel','conductive mesh'],flavour:'An engineered device whose mechanics, materials and naming feel like parts of one technological system.'},
  Tidal:{adjectives:['Tidal','Abyssal','Drowned','Reefborn'],nouns:{Weapon:['Harpoon','Fang','Current','Trident'],Armor:['Scaleweave','Diver Mail','Shell','Mantle'],Shield:['Reef Guard','Tidewall','Shell Ward','Aegis'],Accessory:['Pearl','Compass','Coral Charm','Tideglass']},damage:['ice','air','physical'],statuses:['slow','weak','dazed'],materials:['abyssal coral','tideglass','leviathan bone'],flavour:'A sea-born item whose form and effects evoke pressure, current, cold and deep water.'},
}

function pick<T>(v:readonly T[]):T{return v[Math.floor(Math.random()*v.length)]}
function replaceFirstStatus(text:string,status:string){return text.replace(/\b(dazed|shaken|slow|weak|enraged|poisoned)\b/i,status)}
function replaceDamage(text:string,damage:DamageType){return text.replace(/\b(air|bolt|dark|earth|fire|ice|light|poison) damage\b/i,`${damage} damage`)}

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
  const name=`${pick(p.adjectives)} ${pick(p.nouns[item.type])}`
  let effect=item.effect||''
  effect=replaceFirstStatus(effect,status)
  effect=replaceDamage(effect,damage)
  const themedDamage=item.type==='Weapon'&&item.damageType&&item.damageType!=='physical'?damage:item.damageType
  const quality=item.quality ? `${item.quality} · ${theme} theme` : `${theme} theme`
  const origin=`${theme} design built around ${material}; ${p.flavour}`
  return {...item,name,damageType:themedDamage,quality,effect,breakdown:[...(item.breakdown||[]),`Theme: ${theme}.`,`Concept material: ${material}.`,`Base identity: ${baseLabel}.`,origin]}
}

export const itemThemes=Object.keys(profiles) as ItemTheme[]