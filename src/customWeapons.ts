import { DamageType, GeneratedItem } from './items'

export type CustomWeaponCustomization =
  | 'Accurate'
  | 'Defense Boost'
  | 'Elemental'
  | 'Magic Defense Boost'
  | 'Powerful'
  | 'Quick'
  | 'Transforming'

const categories = ['Arcane','Bow','Brawling','Dagger','Firearm','Flail','Heavy','Spear','Sword','Thrown'] as const
const nonPhysical: DamageType[] = ['air','bolt','dark','earth','fire','ice','light','poison']
const prefixes = ['Aether','Astral','Blazing','Celestial','Crimson','Dragon','Eclipse','Gilded','Moon','Runic','Star','Tempest']
const nounsByCategory: Record<string, string[]> = {
  Arcane: ['Focus','Codex','Scepter','Grimoire'],
  Bow: ['Arc','Longbow','Windbow','Repeater'],
  Brawling: ['Fist','Knuckle','Claw','Gauntlet'],
  Dagger: ['Needle','Fang','Edge','Knife'],
  Firearm: ['Pistol','Handcannon','Revolver','Carbine'],
  Flail: ['Flail','Chain','Morningstar','Lash'],
  Heavy: ['Breaker','Maul','Hammer','Reaver'],
  Spear: ['Pike','Lance','Glaive','Spear'],
  Sword: ['Blade','Edge','Sabre','Sword'],
  Thrown: ['Star','Disc','Needle','Chakram'],
}

type Range = 'Melee'|'Ranged'
type Accuracy = 'DEX + INS'|'DEX + MIG'

const categoryRanges: Record<string, readonly Range[]> = {
  Arcane: ['Melee','Ranged'],
  Bow: ['Ranged'],
  Brawling: ['Melee'],
  Dagger: ['Melee','Ranged'],
  Firearm: ['Ranged'],
  Flail: ['Melee'],
  Heavy: ['Melee'],
  Spear: ['Melee'],
  Sword: ['Melee'],
  Thrown: ['Ranged'],
}

const categoryAccuracy: Record<string, readonly Accuracy[]> = {
  Arcane: ['DEX + INS','DEX + INS','DEX + MIG'],
  Bow: ['DEX + INS','DEX + INS','DEX + MIG'],
  Brawling: ['DEX + MIG','DEX + MIG','DEX + INS'],
  Dagger: ['DEX + INS','DEX + MIG'],
  Firearm: ['DEX + INS','DEX + INS','DEX + MIG'],
  Flail: ['DEX + MIG','DEX + MIG','DEX + INS'],
  Heavy: ['DEX + MIG'],
  Spear: ['DEX + MIG','DEX + MIG','DEX + INS'],
  Sword: ['DEX + MIG','DEX + INS'],
  Thrown: ['DEX + INS','DEX + INS','DEX + MIG'],
}

function pick<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)]
}

function shuffle<T>(values: readonly T[]): T[] {
  return [...values].sort(() => Math.random() - 0.5)
}

function rangeForCategory(category:string):Range {
  return pick(categoryRanges[category] || ['Melee'])
}

function accuracyForCategory(category:string):Accuracy {
  return pick(categoryAccuracy[category] || ['DEX + MIG'])
}

function weightedCustomizationPool(category: string, range: Range, singles: CustomWeaponCustomization[]) {
  const preferred: CustomWeaponCustomization[] = []

  if (['Bow','Firearm','Thrown','Dagger'].includes(category) || range === 'Ranged') preferred.push('Accurate','Accurate')
  if (['Heavy','Spear','Sword','Flail','Brawling'].includes(category) && range === 'Melee') preferred.push('Powerful','Defense Boost')
  if (['Arcane','Dagger'].includes(category)) preferred.push('Elemental','Accurate')
  if (['Sword','Spear','Brawling'].includes(category)) preferred.push('Defense Boost')
  if (category === 'Arcane') preferred.push('Magic Defense Boost','Elemental')
  preferred.push('Elemental')

  return [...singles, ...preferred.filter(c => singles.includes(c))]
}

function buildCustomizationSet(category: string, range: Range, allowMartial: boolean, allowTransforming: boolean): CustomWeaponCustomization[] {
  const singles: CustomWeaponCustomization[] = ['Accurate','Defense Boost','Elemental']
  if (allowMartial) {
    singles.push('Magic Defense Boost')
    if (!['Arcane','Dagger'].includes(category)) singles.push('Powerful')
  }
  if (allowTransforming) singles.push('Transforming')

  // Quick is martial, counts as two slots, and cannot coexist with Powerful.
  const quickChance = ['Dagger','Bow','Firearm','Thrown','Brawling'].includes(category) ? 0.28 : 0.14
  if (allowMartial && Math.random() < quickChance) {
    const partnerPool = weightedCustomizationPool(category, range, singles.filter(c => c !== 'Powerful'))
    return ['Quick', pick(partnerPool)]
  }

  const pool = weightedCustomizationPool(category, range, singles)
  const chosen: CustomWeaponCustomization[] = []
  let guard = 0
  while (chosen.length < 3 && guard < 30) {
    guard++
    const candidate = pick(pool)
    if (!chosen.includes(candidate)) chosen.push(candidate)
  }
  return chosen.length === 3 ? chosen : shuffle(singles).slice(0, 3)
}

function forceTransforming(set: CustomWeaponCustomization[]): CustomWeaponCustomization[] {
  if (set.includes('Transforming')) return set
  const copy = [...set]
  const replaceIndex = copy.includes('Quick') ? 1 : Math.max(0, copy.length - 1)
  copy[replaceIndex] = 'Transforming'
  return [...new Set(copy)] as CustomWeaponCustomization[]
}

function applyForm(category: string, range: Range, accuracy: Accuracy, customizations: CustomWeaponCustomization[], preferredDamageType: DamageType|'random') {
  let accuracyBonus = 0
  let damage = 5
  let damageType: DamageType = 'physical'
  let martial = false
  const effects: string[] = []

  for (const customization of customizations) {
    if (customization === 'Accurate') accuracyBonus += 2
    if (customization === 'Defense Boost') effects.push('You gain +2 Defense and are treated as having a shield equipped for your Skills.')
    if (customization === 'Elemental') {
      damageType = preferredDamageType !== 'random' && preferredDamageType !== 'physical' ? preferredDamageType : pick(nonPhysical)
      damage += 2
      effects.push(`Elemental: damage becomes ${damageType} and deals 2 extra damage.`)
    }
    if (customization === 'Magic Defense Boost') {
      martial = true
      effects.push('You gain +2 Magic Defense.')
    }
    if (customization === 'Powerful') {
      martial = true
      damage += category === 'Heavy' ? 7 : 5
    }
    if (customization === 'Quick') {
      martial = true
      effects.push('When you take the Attack action with this weapon, you may make two attacks; both follow the two-weapon fighting rules.')
    }
  }

  return { category, range, accuracy, accuracyBonus, damage, damageType, martial, effects }
}

function chooseDistinctSecondForm(firstCategory: string, firstRange: Range, firstAccuracy: Accuracy) {
  const preferredCategories = categories.filter(category => {
    const ranges = categoryRanges[category]
    return category !== firstCategory && (ranges.includes(firstRange === 'Melee' ? 'Ranged' : 'Melee') || Math.random() < 0.35)
  })
  const category = pick(preferredCategories.length ? preferredCategories : categories.filter(c => c !== firstCategory))
  const range = rangeForCategory(category)
  let accuracy = accuracyForCategory(category)
  if (category === firstCategory && range === firstRange && accuracy === firstAccuracy) {
    const alternatives = (categoryAccuracy[category] || []).filter(value => value !== firstAccuracy)
    if (alternatives.length) accuracy = pick(alternatives)
  }
  return { category, range, accuracy }
}

function weaponName(category: string, transforming: boolean) {
  const noun = pick(nounsByCategory[category] || ['Armament','Relic','Weapon'])
  return `${pick(prefixes)} ${noun}${transforming && Math.random() < 0.35 ? ' Shift' : ''}`
}

export function generateCustomWeapon(options: {
  allowMartial?: boolean
  allowTransforming?: boolean
  preferredDamageType?: DamageType|'random'
}): GeneratedItem {
  const allowMartial = options.allowMartial !== false
  const allowTransforming = options.allowTransforming !== false
  const preferred = options.preferredDamageType || 'random'

  const category = pick(categories)
  const range = rangeForCategory(category)
  const accuracy = accuracyForCategory(category)
  const customizations = buildCustomizationSet(category, range, allowMartial, allowTransforming)
  const form1 = applyForm(category, range, accuracy, customizations, preferred)

  const transforming = customizations.includes('Transforming')
  const cost = 300 + (transforming ? 100 : 0)
  const breakdown = [
    'Custom weapon base: 300z',
    'Always two-handed and occupies both hand slots.',
    `Category: ${category}; ${range}; Accuracy [${accuracy}]; base damage HR + 5 physical.`,
    `Customizations (${customizations.includes('Quick') ? 'Quick uses two of the three slots' : 'three one-slot customizations'}): ${customizations.join(', ')}`,
    `Coherence: ${category} determines its normal ${range.toLowerCase()} profile and biases its accuracy/customization package.`,
  ]
  if (transforming) breakdown.push('Transforming: +100z; the second form costs no additional zenit and any later rare Quality/modification applies to both forms.')

  const effectParts = [...form1.effects]
  let baseItem = 'Atlas Custom Weapon'
  let martial = form1.martial

  if (transforming) {
    const second = chooseDistinctSecondForm(category, range, accuracy)
    const secondSet = forceTransforming(buildCustomizationSet(second.category, second.range, allowMartial, true))
    const form2 = applyForm(second.category, second.range, second.accuracy, secondSet, preferred)

    breakdown.push(`Form II: ${second.category}; ${second.range}; [${second.accuracy}]${form2.accuracyBonus ? ` +${form2.accuracyBonus}` : ''}; HR + ${form2.damage} ${form2.damageType}; customizations: ${secondSet.join(', ')}.`)
    effectParts.push(`Transforming Form II: ${second.category}, ${second.range}, [${second.accuracy}]${form2.accuracyBonus ? ` +${form2.accuracyBonus}` : ''}, HR + ${form2.damage} ${form2.damageType}.`)
    effectParts.push(...form2.effects)
    baseItem = 'Atlas Transforming Custom Weapon'
    martial = martial || form2.martial
  }

  return {
    id: crypto.randomUUID(),
    name: weaponName(category, transforming),
    type: 'Weapon',
    source: 'Generated',
    cost,
    martial,
    baseItem,
    category: form1.category,
    handedness: 'Two-handed',
    range: form1.range,
    accuracy: form1.accuracy,
    accuracyBonus: form1.accuracyBonus,
    damage: form1.damage,
    damageType: form1.damageType,
    quality: `Customizations: ${customizations.join(', ')}`,
    effect: effectParts.length ? effectParts.join(' ') : 'No additional effect beyond its customizations.',
    breakdown,
  }
}