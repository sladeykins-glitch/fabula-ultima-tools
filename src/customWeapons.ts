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
const nouns = ['Armament','Blade','Breaker','Cannon','Edge','Fang','Glaive','Harbinger','Lance','Relic','Reaver','Weapon']

function pick<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)]
}

function shuffle<T>(values: readonly T[]): T[] {
  return [...values].sort(() => Math.random() - 0.5)
}

function buildCustomizationSet(category: string, allowMartial: boolean, allowTransforming: boolean): CustomWeaponCustomization[] {
  const singles: CustomWeaponCustomization[] = ['Accurate','Defense Boost','Elemental']
  if (allowMartial) {
    singles.push('Magic Defense Boost')
    if (!['Arcane','Dagger'].includes(category)) singles.push('Powerful')
  }
  if (allowTransforming) singles.push('Transforming')

  // Quick is martial, counts as two slots, and cannot coexist with Powerful.
  if (allowMartial && Math.random() < 0.22) {
    const partnerPool = singles.filter(c => c !== 'Powerful')
    return ['Quick', pick(partnerPool)]
  }

  return shuffle(singles).slice(0, 3)
}

function forceTransforming(set: CustomWeaponCustomization[]): CustomWeaponCustomization[] {
  if (set.includes('Transforming')) return set
  const copy = [...set]
  const replaceIndex = copy.includes('Quick') ? 1 : Math.max(0, copy.length - 1)
  copy[replaceIndex] = 'Transforming'
  return copy
}

function applyForm(category: string, range: 'Melee'|'Ranged', accuracy: 'DEX + INS'|'DEX + MIG', customizations: CustomWeaponCustomization[], preferredDamageType: DamageType|'random') {
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

export function generateCustomWeapon(options: {
  allowMartial?: boolean
  allowTransforming?: boolean
  preferredDamageType?: DamageType|'random'
}): GeneratedItem {
  const allowMartial = options.allowMartial !== false
  const allowTransforming = options.allowTransforming !== false
  const preferred = options.preferredDamageType || 'random'

  const category = pick(categories)
  const range = pick(['Melee','Ranged'] as const)
  const accuracy = pick(['DEX + INS','DEX + MIG'] as const)
  const customizations = buildCustomizationSet(category, allowMartial, allowTransforming)
  const form1 = applyForm(category, range, accuracy, customizations, preferred)

  const transforming = customizations.includes('Transforming')
  const cost = 300 + (transforming ? 100 : 0)
  const breakdown = [
    'Custom weapon base: 300z',
    'Always two-handed and occupies both hand slots.',
    `Category: ${category}; ${range}; Accuracy [${accuracy}]; base damage HR + 5 physical.`,
    `Customizations (${customizations.includes('Quick') ? 'Quick uses two of the three slots' : 'three one-slot customizations'}): ${customizations.join(', ')}`,
  ]
  if (transforming) breakdown.push('Transforming: +100z; the second form costs no additional zenit and any later rare Quality/modification applies to both forms.')

  const effectParts = [...form1.effects]
  let baseItem = 'Atlas Custom Weapon'
  let martial = form1.martial

  if (transforming) {
    const category2 = pick(categories)
    const range2 = pick(['Melee','Ranged'] as const)
    const accuracy2 = pick(['DEX + INS','DEX + MIG'] as const)
    const secondSet = forceTransforming(buildCustomizationSet(category2, allowMartial, true))
    const form2 = applyForm(category2, range2, accuracy2, secondSet, preferred)

    breakdown.push(`Form II: ${category2}; ${range2}; [${accuracy2}]${form2.accuracyBonus ? ` +${form2.accuracyBonus}` : ''}; HR + ${form2.damage} ${form2.damageType}; customizations: ${secondSet.join(', ')}.`)
    effectParts.push(`Transforming Form II: ${category2}, ${range2}, [${accuracy2}]${form2.accuracyBonus ? ` +${form2.accuracyBonus}` : ''}, HR + ${form2.damage} ${form2.damageType}.`)
    effectParts.push(...form2.effects)
    baseItem = 'Atlas Transforming Custom Weapon'
    martial = martial || form2.martial
  }

  return {
    id: crypto.randomUUID(),
    name: `${pick(prefixes)} ${pick(nouns)}`,
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
