export type ItemType = 'Weapon' | 'Armor' | 'Shield' | 'Accessory'
export type ItemSource = 'Generated' | 'Custom' | 'Official'
export type DamageType = 'physical' | 'air' | 'bolt' | 'dark' | 'earth' | 'fire' | 'ice' | 'light' | 'poison'
export type Status = 'dazed' | 'shaken' | 'slow' | 'weak' | 'enraged' | 'poisoned'

export interface GeneratedItem {
  id: string
  name: string
  type: ItemType
  source: ItemSource
  cost: number
  martial: boolean
  baseItem?: string
  category?: string
  handedness?: 'One-handed' | 'Two-handed'
  range?: 'Melee' | 'Ranged'
  accuracy?: string
  accuracyBonus?: number
  damage?: number
  damageType?: DamageType
  defense?: string
  magicDefense?: string
  initiative?: number
  quality?: string
  effect: string
  breakdown: string[]
}

type BaseWeapon = {
  name: string
  category: string
  cost: number
  martial: boolean
  accuracy: string
  accuracyBonus: number
  damage: number
  handedness: 'One-handed' | 'Two-handed'
  range: 'Melee' | 'Ranged'
}

type BaseArmor = {
  name: string
  cost: number
  martial: boolean
  defense: string
  magicDefense: string
  initiative: number
}

type BaseShield = {
  name: string
  cost: number
  martial: boolean
  defense: string
  magicDefense: string
  initiative: number
}

type Quality = {
  name: string
  cost: number
  effect: (parameter?: string) => string
  parameter?: 'status-basic' | 'status-plus' | 'damage-nonphysical' | 'damage-two' | 'species' | 'species-two' | 'weapon-range'
}

const nonPhysical: DamageType[] = ['air','bolt','dark','earth','fire','ice','light','poison']
const statusesBasic: Status[] = ['dazed','shaken','slow','weak']
const statusesPlus: Status[] = ['enraged','poisoned']
const species = ['beasts','constructs','demons','elementals','humanoids','monsters','plants','undead']

export const baseWeapons: BaseWeapon[] = [
  { name:'Staff', category:'Arcane', cost:100, martial:false, accuracy:'WLP + WLP', accuracyBonus:0, damage:6, handedness:'Two-handed', range:'Melee' },
  { name:'Tome', category:'Arcane', cost:100, martial:false, accuracy:'INS + INS', accuracyBonus:0, damage:6, handedness:'Two-handed', range:'Melee' },
  { name:'Crossbow', category:'Bow', cost:150, martial:false, accuracy:'DEX + INS', accuracyBonus:0, damage:8, handedness:'Two-handed', range:'Ranged' },
  { name:'Shortbow', category:'Bow', cost:200, martial:false, accuracy:'DEX + DEX', accuracyBonus:0, damage:8, handedness:'Two-handed', range:'Ranged' },
  { name:'Iron Knuckle', category:'Brawling', cost:150, martial:false, accuracy:'DEX + MIG', accuracyBonus:0, damage:6, handedness:'One-handed', range:'Melee' },
  { name:'Steel Dagger', category:'Dagger', cost:150, martial:false, accuracy:'DEX + INS', accuracyBonus:1, damage:4, handedness:'One-handed', range:'Melee' },
  { name:'Pistol', category:'Firearm', cost:250, martial:true, accuracy:'DEX + INS', accuracyBonus:0, damage:8, handedness:'One-handed', range:'Ranged' },
  { name:'Chain Whip', category:'Flail', cost:150, martial:false, accuracy:'DEX + DEX', accuracyBonus:0, damage:8, handedness:'Two-handed', range:'Melee' },
  { name:'Iron Hammer', category:'Heavy', cost:200, martial:false, accuracy:'MIG + MIG', accuracyBonus:0, damage:6, handedness:'One-handed', range:'Melee' },
  { name:'Broadaxe', category:'Heavy', cost:250, martial:true, accuracy:'MIG + MIG', accuracyBonus:0, damage:10, handedness:'One-handed', range:'Melee' },
  { name:'Waraxe', category:'Heavy', cost:250, martial:true, accuracy:'MIG + MIG', accuracyBonus:0, damage:14, handedness:'Two-handed', range:'Melee' },
  { name:'Light Spear', category:'Spear', cost:200, martial:true, accuracy:'DEX + MIG', accuracyBonus:0, damage:8, handedness:'One-handed', range:'Melee' },
  { name:'Heavy Spear', category:'Spear', cost:200, martial:true, accuracy:'DEX + MIG', accuracyBonus:0, damage:12, handedness:'Two-handed', range:'Melee' },
  { name:'Bronze Sword', category:'Sword', cost:200, martial:true, accuracy:'DEX + MIG', accuracyBonus:1, damage:6, handedness:'One-handed', range:'Melee' },
  { name:'Greatsword', category:'Sword', cost:200, martial:true, accuracy:'DEX + MIG', accuracyBonus:1, damage:10, handedness:'Two-handed', range:'Melee' },
  { name:'Katana', category:'Sword', cost:200, martial:true, accuracy:'DEX + INS', accuracyBonus:1, damage:10, handedness:'Two-handed', range:'Melee' },
  { name:'Rapier', category:'Sword', cost:200, martial:true, accuracy:'DEX + INS', accuracyBonus:1, damage:6, handedness:'One-handed', range:'Melee' },
  { name:'Shuriken', category:'Thrown', cost:150, martial:false, accuracy:'DEX + INS', accuracyBonus:0, damage:4, handedness:'One-handed', range:'Ranged' },
]

export const baseArmors: BaseArmor[] = [
  { name:'Silk Shirt', cost:100, martial:false, defense:'DEX', magicDefense:'INS +2', initiative:-1 },
  { name:'Travel Garb', cost:100, martial:false, defense:'DEX +1', magicDefense:'INS +1', initiative:-1 },
  { name:'Combat Tunic', cost:150, martial:false, defense:'DEX +1', magicDefense:'INS +1', initiative:0 },
  { name:'Sage Robe', cost:200, martial:false, defense:'DEX +1', magicDefense:'INS +2', initiative:-2 },
  { name:'Brigandine', cost:150, martial:true, defense:'10', magicDefense:'INS', initiative:-2 },
  { name:'Bronze Plate', cost:200, martial:true, defense:'11', magicDefense:'INS', initiative:-3 },
  { name:'Runic Plate', cost:250, martial:true, defense:'11', magicDefense:'INS +1', initiative:-3 },
  { name:'Steel Plate', cost:300, martial:true, defense:'12', magicDefense:'INS', initiative:-4 },
]

export const baseShields: BaseShield[] = [
  { name:'Bronze Shield', cost:100, martial:false, defense:'+2', magicDefense:'—', initiative:0 },
  { name:'Runic Shield', cost:150, martial:true, defense:'+2', magicDefense:'+2', initiative:0 },
]

export const weaponQualities: Quality[] = [
  { name:'Antistatus', cost:500, parameter:'status-basic', effect:p=>`You are immune to ${p}.` },
  { name:'Resistance', cost:700, parameter:'damage-nonphysical', effect:p=>`You have Resistance to ${p} damage.` },
  { name:'Amulet', cost:800, effect:()=>`You gain a +1 bonus to Magic Defense.` },
  { name:'Bulwark', cost:800, effect:()=>`You gain a +1 bonus to Defense.` },
  { name:'Dual Resistance', cost:1000, parameter:'damage-two', effect:p=>`You have Resistance to ${p} damage.` },
  { name:'Swordbreaker', cost:1000, effect:()=>`You have Resistance to physical damage.` },
  { name:'Immunity', cost:1500, parameter:'damage-nonphysical', effect:p=>`You have Immunity to ${p} damage.` },
  { name:'Omnishield', cost:2000, effect:()=>`You gain a +1 bonus to Defense and Magic Defense.` },
  { name:'Perfect Health', cost:2000, effect:()=>`You are immune to all status effects.` },
  { name:'Magical', cost:100, effect:()=>`Attacks with this weapon target Magic Defense instead of Defense.` },
  { name:'Hunter', cost:300, parameter:'species', effect:p=>`This weapon deals 5 extra damage to ${p}.` },
  { name:'Piercing', cost:400, effect:()=>`Damage dealt by this weapon ignores Resistances.` },
  { name:'Dual Hunter', cost:500, parameter:'species-two', effect:p=>`This weapon deals 5 extra damage to ${p}.` },
  { name:'Multi', cost:1000, effect:()=>`Attacks with this weapon have multi (2).` },
  { name:'Status', cost:1500, parameter:'status-basic', effect:p=>`Each target hit by this weapon suffers ${p}.` },
  { name:'Status Plus', cost:2000, parameter:'status-plus', effect:p=>`Each target hit by this weapon suffers ${p}.` },
]

export const armorShieldQualities: Quality[] = [
  { name:'Antistatus', cost:500, parameter:'status-basic', effect:p=>`You are immune to ${p}.` },
  { name:'Resistance', cost:700, parameter:'damage-nonphysical', effect:p=>`You have Resistance to ${p} damage.` },
  { name:'Dual Resistance', cost:1000, parameter:'damage-two', effect:p=>`You have Resistance to ${p} damage.` },
  { name:'Swordbreaker', cost:1000, effect:()=>`You have Resistance to physical damage.` },
  { name:'Immunity', cost:1500, parameter:'damage-nonphysical', effect:p=>`You have Immunity to ${p} damage.` },
  { name:'Perfect Health', cost:2000, effect:()=>`You are immune to all status effects.` },
  { name:'Initiative Up', cost:500, effect:()=>`You gain a +4 bonus to your Initiative modifier.` },
  { name:'Accuracy Up', cost:1000, effect:()=>`You gain a +1 bonus to your Accuracy Checks.` },
  { name:'Magic Up', cost:1000, effect:()=>`You gain a +1 bonus to your Magic Checks.` },
  { name:'Vitality Up', cost:1000, effect:()=>`Whenever you recover Hit Points, you recover 5 extra Hit Points.` },
  { name:'Healing Up', cost:1500, effect:()=>`Spells you cast whose effects restore Hit Points restore 5 extra Hit Points.` },
  { name:'Spell Up', cost:2000, effect:()=>`Spells you cast deal 5 extra damage.` },
  { name:'Weapon Up', cost:2000, parameter:'weapon-range', effect:p=>`Your attacks with ${p} weapons deal 5 extra damage.` },
]

export const accessoryQualities: Quality[] = [
  { name:'Damage Change', cost:300, parameter:'damage-nonphysical', effect:p=>`All damage dealt by your weapons, spells, and Skills becomes ${p}.` },
  { name:'Antistatus', cost:500, parameter:'status-basic', effect:p=>`You are immune to ${p}.` },
  { name:'Initiative Up', cost:500, effect:()=>`If equipped at the start of a conflict, you gain a +4 bonus to Initiative.` },
  { name:'Resistance', cost:700, parameter:'damage-nonphysical', effect:p=>`You have Resistance to ${p} damage.` },
  { name:'Amulet', cost:800, effect:()=>`You gain a +1 bonus to Magic Defense.` },
  { name:'Bulwark', cost:800, effect:()=>`You gain a +1 bonus to Defense.` },
  { name:'Dual Resistance', cost:1000, parameter:'damage-two', effect:p=>`You have Resistance to ${p} damage.` },
  { name:'Swordbreaker', cost:1000, effect:()=>`You have Resistance to physical damage.` },
  { name:'Accuracy Up', cost:1000, effect:()=>`You gain a +1 bonus to your Accuracy Checks.` },
  { name:'Magic Up', cost:1000, effect:()=>`You gain a +1 bonus to your Magic Checks.` },
  { name:'Vitality Up', cost:1000, effect:()=>`Whenever you recover Hit Points, you recover 5 extra Hit Points.` },
  { name:'Healing Up', cost:1500, effect:()=>`Spells you cast whose effects restore Hit Points restore 5 extra Hit Points.` },
  { name:'Immunity', cost:1500, parameter:'damage-nonphysical', effect:p=>`You have Immunity to ${p} damage.` },
  { name:'Omnishield', cost:2000, effect:()=>`You gain a +1 bonus to Defense and Magic Defense.` },
  { name:'Perfect Health', cost:2000, effect:()=>`You are immune to all status effects.` },
  { name:'Spell Up', cost:2000, effect:()=>`Spells you cast deal 5 extra damage.` },
  { name:'Weapon Up', cost:2000, parameter:'weapon-range', effect:p=>`Your attacks with ${p} weapons deal 5 extra damage.` },
]

function pick<T>(arr: readonly T[]): T { return arr[Math.floor(Math.random() * arr.length)] }
function sampleTwo<T>(arr: readonly T[]): [T,T] {
  const first = pick(arr)
  let second = pick(arr)
  while (second === first) second = pick(arr)
  return [first, second]
}

function weightedPick<T>(values: readonly T[], weightFor: (value:T)=>number): T {
  const weighted = values.map(value => ({ value, weight: Math.max(1, Math.round(weightFor(value))) }))
  const total = weighted.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = Math.floor(Math.random() * total)
  for (const entry of weighted) {
    roll -= entry.weight
    if (roll < 0) return entry.value
  }
  return weighted[weighted.length - 1].value
}

function parameterFor(q: Quality): string | undefined {
  switch (q.parameter) {
    case 'status-basic': return pick(statusesBasic)
    case 'status-plus': return pick(statusesPlus)
    case 'damage-nonphysical': return pick(nonPhysical)
    case 'damage-two': { const [a,b] = sampleTwo(nonPhysical); return `${a} and ${b}` }
    case 'species': return pick(species)
    case 'species-two': { const [a,b] = sampleTwo(species); return `${a} or ${b}` }
    case 'weapon-range': return pick(['melee','ranged'])
  }
}

function weaponQualityWeight(q: Quality, base: BaseWeapon, damageType: DamageType): number {
  const offensive = ['Magical','Hunter','Piercing','Dual Hunter','Multi','Status','Status Plus']
  const defensive = ['Antistatus','Resistance','Amulet','Bulwark','Dual Resistance','Swordbreaker','Immunity','Omnishield','Perfect Health']
  let weight = 2

  if (offensive.includes(q.name)) weight += 2
  if (defensive.includes(q.name)) weight -= 1
  if (base.category === 'Arcane' && ['Magical','Status','Status Plus'].includes(q.name)) weight += 3
  if (base.range === 'Ranged' && ['Hunter','Dual Hunter','Multi','Piercing'].includes(q.name)) weight += 2
  if (['Heavy','Spear','Sword','Brawling'].includes(base.category) && ['Piercing','Hunter','Dual Hunter'].includes(q.name)) weight += 2
  if (['Dagger','Flail','Thrown'].includes(base.category) && ['Status','Status Plus','Magical'].includes(q.name)) weight += 2
  if (damageType !== 'physical' && q.name === 'Magical') weight += 1
  if (base.handedness === 'One-handed' && ['Bulwark','Amulet'].includes(q.name)) weight += 1

  return Math.max(1, weight)
}

function armorQualityWeight(q: Quality, base: BaseArmor): number {
  const defensive = ['Antistatus','Resistance','Dual Resistance','Swordbreaker','Immunity','Perfect Health']
  const offensiveSupport = ['Initiative Up','Accuracy Up','Magic Up','Vitality Up','Healing Up','Spell Up','Weapon Up']
  let weight = 2

  if (base.martial && defensive.includes(q.name)) weight += 3
  if (base.martial && ['Accuracy Up','Weapon Up','Vitality Up'].includes(q.name)) weight += 1
  if (!base.martial && offensiveSupport.includes(q.name)) weight += 2
  if (base.name === 'Sage Robe' && ['Magic Up','Healing Up','Spell Up','Vitality Up'].includes(q.name)) weight += 3
  if (base.name === 'Combat Tunic' && ['Initiative Up','Accuracy Up','Weapon Up'].includes(q.name)) weight += 2
  if (base.name.includes('Plate') && ['Resistance','Dual Resistance','Swordbreaker','Immunity'].includes(q.name)) weight += 2

  return Math.max(1, weight)
}

function shieldQualityWeight(q: Quality, base: BaseShield): number {
  const defensive = ['Antistatus','Resistance','Dual Resistance','Swordbreaker','Immunity','Perfect Health']
  let weight = defensive.includes(q.name) ? 5 : 2
  if (base.name === 'Runic Shield' && ['Magic Up','Healing Up','Spell Up','Resistance','Immunity'].includes(q.name)) weight += 2
  if (['Initiative Up','Accuracy Up','Weapon Up'].includes(q.name)) weight += 1
  return Math.max(1, weight)
}

function accessoryQualityWeight(q: Quality): number {
  const versatile = ['Damage Change','Initiative Up','Accuracy Up','Magic Up','Vitality Up','Resistance','Antistatus']
  const premium = ['Omnishield','Perfect Health','Spell Up','Weapon Up','Healing Up','Immunity']
  let weight = versatile.includes(q.name) ? 4 : 2
  if (premium.includes(q.name)) weight += 1
  return weight
}

const prefixes = ['Ashen','Moonlit','Runic','Storm','Crimson','Verdant','Ivory','Gilded','Grave','Starforged','Silent','Radiant']
const weaponNouns: Record<string,string[]> = {
  Arcane:['Focus','Codex','Scepter','Grimoire'], Bow:['Arc','Longshot','Windbow','Repeater'], Brawling:['Fist','Knuckle','Claw','Gauntlet'], Dagger:['Needle','Fang','Edge','Knife'], Firearm:['Shot','Pistol','Handcannon','Revolver'], Flail:['Whip','Chain','Morningstar','Lash'], Heavy:['Hammer','Axe','Breaker','Maul'], Spear:['Pike','Lance','Glaive','Spear'], Sword:['Blade','Edge','Sabre','Sword'], Thrown:['Star','Disc','Needle','Chakram']
}

function itemName(type: ItemType, category?: string) {
  const prefix = pick(prefixes)
  if (type === 'Weapon' && category) return `${prefix} ${pick(weaponNouns[category] || ['Weapon'])}`
  if (type === 'Armor') return `${prefix} ${pick(['Garb','Mail','Vest','Plate','Robe','Coat'])}`
  if (type === 'Shield') return `${prefix} ${pick(['Aegis','Guard','Wall','Ward','Shield'])}`
  return `${prefix} ${pick(['Charm','Ring','Brooch','Pendant','Talisman','Belt'])}`
}

export function generateItem(options: {
  type: ItemType
  maxCost?: number
  allowMartial?: boolean
  preferredDamageType?: DamageType | 'random'
}): GeneratedItem {
  const maxCost = Math.max(300, options.maxCost || 2000)
  const allowMartial = options.allowMartial !== false

  if (options.type === 'Weapon') {
    const candidates = baseWeapons.filter(w => (allowMartial || !w.martial) && w.cost < maxCost)
    const base = pick(candidates.length ? candidates : baseWeapons.filter(w=>!w.martial))
    let cost = base.cost
    let damage = base.damage
    let accuracyBonus = base.accuracyBonus
    let handedness = base.handedness
    let damageType: DamageType = 'physical'
    const breakdown = [`Base: ${base.name} (${base.cost}z)`]

    const desiredType = options.preferredDamageType && options.preferredDamageType !== 'random' ? options.preferredDamageType : pick(['physical', ...nonPhysical] as DamageType[])
    if (desiredType !== 'physical' && cost + 100 <= maxCost) {
      damageType = desiredType
      cost += 100
      breakdown.push(`Damage type changed to ${damageType}: +100z`)
    }

    if (Math.random() < 0.35) {
      if (base.handedness === 'Two-handed') {
        handedness = 'One-handed'
        damage = Math.max(0, damage - 4)
        breakdown.push('Two-handed → one-handed: damage -4')
      } else if (!['Brawling','Dagger','Thrown'].includes(base.category)) {
        handedness = 'Two-handed'
        damage += 4
        breakdown.push('One-handed → two-handed: damage +4')
      }
    }

    if (accuracyBonus < 1 && cost + 100 <= maxCost && Math.random() < 0.4) {
      accuracyBonus += 1
      cost += 100
      breakdown.push('Accuracy +1: +100z')
    }
    if (cost + 200 <= maxCost && Math.random() < 0.45) {
      damage += 4
      cost += 200
      breakdown.push('Damage +4: +200z')
    }

    const qualityChoices = weaponQualities.filter(q => cost + q.cost <= maxCost)
    const quality = qualityChoices.length ? weightedPick(qualityChoices, q => weaponQualityWeight(q, base, damageType)) : undefined
    const param = quality ? parameterFor(quality) : undefined
    const effect = quality ? quality.effect(param) : 'No Quality; generated as a modified rare weapon.'
    if (quality) {
      cost += quality.cost
      breakdown.push(`${quality.name}: +${quality.cost}z`)
    }

    const martial = base.martial || damage >= 10
    return {
      id: crypto.randomUUID(), name:itemName('Weapon', base.category), type:'Weapon', source:'Generated', cost, martial,
      baseItem:base.name, category:base.category, handedness, range:base.range, accuracy:base.accuracy, accuracyBonus,
      damage, damageType, quality:quality?.name, effect, breakdown
    }
  }

  if (options.type === 'Armor') {
    const candidates = baseArmors.filter(a => (allowMartial || !a.martial) && a.cost < maxCost)
    const base = pick(candidates.length ? candidates : baseArmors.filter(a=>!a.martial))
    const qualityChoices = armorShieldQualities.filter(q => base.cost + q.cost <= maxCost)
    const quality = qualityChoices.length ? weightedPick(qualityChoices, q => armorQualityWeight(q, base)) : undefined
    const param = quality ? parameterFor(quality) : undefined
    const effect = quality ? quality.effect(param) : 'No Quality available within this cost limit.'
    const cost = base.cost + (quality?.cost || 0)
    return { id:crypto.randomUUID(), name:itemName('Armor'), type:'Armor', source:'Generated', cost, martial:base.martial, baseItem:base.name, defense:base.defense, magicDefense:base.magicDefense, initiative:base.initiative, quality:quality?.name, effect, breakdown:[`Base: ${base.name} (${base.cost}z)`, ...(quality ? [`${quality.name}: +${quality.cost}z`] : [])] }
  }

  if (options.type === 'Shield') {
    const candidates = baseShields.filter(s => (allowMartial || !s.martial) && s.cost < maxCost)
    const base = pick(candidates.length ? candidates : baseShields.filter(s=>!s.martial))
    const qualityChoices = armorShieldQualities.filter(q => base.cost + q.cost <= maxCost)
    const quality = qualityChoices.length ? weightedPick(qualityChoices, q => shieldQualityWeight(q, base)) : undefined
    const param = quality ? parameterFor(quality) : undefined
    const effect = quality ? quality.effect(param) : 'No Quality available within this cost limit.'
    const cost = base.cost + (quality?.cost || 0)
    return { id:crypto.randomUUID(), name:itemName('Shield'), type:'Shield', source:'Generated', cost, martial:base.martial, baseItem:base.name, defense:base.defense, magicDefense:base.magicDefense, initiative:base.initiative, quality:quality?.name, effect, breakdown:[`Base: ${base.name} (${base.cost}z)`, ...(quality ? [`${quality.name}: +${quality.cost}z`] : [])] }
  }

  const qualityChoices = accessoryQualities.filter(q => q.cost <= maxCost)
  const available = qualityChoices.length ? qualityChoices : accessoryQualities
  const quality = weightedPick(available, accessoryQualityWeight)
  const param = parameterFor(quality)
  return { id:crypto.randomUUID(), name:itemName('Accessory'), type:'Accessory', source:'Generated', cost:quality.cost, martial:false, quality:quality.name, effect:quality.effect(param), breakdown:[`${quality.name}: ${quality.cost}z`] }
}
