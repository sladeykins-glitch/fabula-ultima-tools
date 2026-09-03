export type MaterialNature = 'Animal' | 'Fungal' | 'Incorporeal' | 'Liquid' | 'Artificial' | 'Mineral' | 'Plant'
export type MaterialFunction = 'Agility and Precision' | 'Damage and Power' | 'Protection' | 'Recovery' | 'Sabotage' | 'Support'
export type MaterialElement = 'air' | 'bolt' | 'dark' | 'earth' | 'fire' | 'ice' | 'light' | 'poison' | 'water'

export interface GeneratedMaterial {
  name: string
  nature: MaterialNature
  form: string
  descriptor: string
  descriptorKind: 'Elemental' | 'Functional'
  element?: MaterialElement
  function?: MaterialFunction
  value?: number
}

const animalForms: Record<string, string[]> = {
  Arthropods: ['Antenna','Carapace','Gland','Horn','Leg','Mandible','Pincer','Shell','Sting','Web'],
  Birds: ['Bone','Cranium','Crest','Egg','Feather','Membrane','Sac','Talon','Tendon','Wattle'],
  Fishes: ['Bone','Cartilage','Crest','Eggs','Fin','Gland','Sac','Scale','Spine','Teeth'],
  Mammals: ['Claw','Cranium','Fang','Fur','Horn','Rib','Tail','Tendons','Vertebra','Whiskers'],
  Mollusks: ['Antenna','Gland','Membrane','Sac','Scale','Seashell','Shell','Slime','Sting','Tentacle'],
  Reptiles: ['Bone','Claw','Cranium','Crest','Egg','Fang','Gland','Scale','Spine','Tail'],
}

const otherForms: Record<Exclude<MaterialNature,'Animal'>, string[]> = {
  Fungal: ['Boletus','Hen','Honeyshroom','Morel','Mucilage','Mushroom','Oyster','Truffle'],
  Incorporeal: ['Ash','Bubble','Essence','Gas','Mirage','Smoke','Strand','Vapor'],
  Liquid: ['Clot','Drop','Extract','Fluid','Ichor','Oil','Reagent','Sludge'],
  Artificial: ['Chain','Core','Fabric','Gear','Leather','Lens','Plate','Propeller','Rope','Scrap','Spring','Valve'],
  Mineral: ['Block','Charcoal','Crystal','Dust','Fragment','Gem','Limestone','Rock','Salt','Shard','Stele','Stone'],
  Plant: ['Algae','Bark','Berry','Bramble','Branch','Flower','Fruit','Leaf','Moss','Petal','Root','Thorn'],
}

const elementalDescriptors: Record<MaterialElement, string[]> = {
  air: ['Cerulean','Dry','Emerald','Green','Hollow','Light'],
  bolt: ['Amber','Conductive','Electrostatic','Magnetic','Thundering','Yellow'],
  dark: ['Amethyst','Astral','Colorless','Fragile','Ruined','Spectral'],
  earth: ['Carved','Diamond','Fossil','Golden','Iron','Sandy'],
  fire: ['Blazing','Explosive','Incendiary','Ruby','Scarlet','Stinging'],
  ice: ['Arctic','Azure','Crystalline','Freezing','Frosty','Pale'],
  light: ['Ethereal','Opaline','Royal','Shining','Silver','Transparent'],
  poison: ['Corrosive','Infected','Speckled','Streaked','Toxic','Violet'],
  water: ['Blue','Coral','Deepwater','Sapphire','Thin','Wet'],
}

const functionalDescriptors: Record<MaterialFunction, string[]> = {
  'Agility and Precision': ['Elastic','Glazed','Grim','Oily','Polished','Scrawny','Sharp','Slender','Slippery','Small'],
  'Damage and Power': ['Bloated','Broken','Chipped','Colossal','Fermented','Heavy','Monstrous','Serrated','Sharp','Thick'],
  Protection: ['Ancient','Curly','Hardened','Holy','Regal','Rough','Rubbery','Scaly','Silky','Tough'],
  Recovery: ['Aromatic','Bitter','Blood','Fragrant','Fresh','Juicy','Purifying','Scarred','Smooth','Sweet'],
  Sabotage: ['Bitter','Dazzling','Echoing','Eerie','Hexed','Hooked','Irritating','Nauseating','Rusty','Sticky'],
  Support: ['Carved','Fairy','Glowing','Harmonious','Iridescent','Lucky','Magical','Noble','Soft','Warm'],
}

function pick<T>(values: readonly T[]): T {
  return values[Math.floor(Math.random() * values.length)]
}

export function generateMaterial(options: {
  nature?: MaterialNature | 'Random'
  descriptorMode?: 'Elemental' | 'Functional' | 'Random'
  element?: MaterialElement | 'Random'
  function?: MaterialFunction | 'Random'
  value?: number
} = {}): GeneratedMaterial {
  const natures: MaterialNature[] = ['Animal','Fungal','Incorporeal','Liquid','Artificial','Mineral','Plant']
  const nature = !options.nature || options.nature === 'Random' ? pick(natures) : options.nature

  let form: string
  if (nature === 'Animal') {
    form = pick(animalForms[pick(Object.keys(animalForms))])
  } else {
    form = pick(otherForms[nature])
  }

  const mode = !options.descriptorMode || options.descriptorMode === 'Random' ? pick(['Elemental','Functional'] as const) : options.descriptorMode

  if (mode === 'Elemental') {
    const elements = Object.keys(elementalDescriptors) as MaterialElement[]
    const element = !options.element || options.element === 'Random' ? pick(elements) : options.element
    const descriptor = pick(elementalDescriptors[element])
    return { name: `${descriptor} ${form}`, nature, form, descriptor, descriptorKind:'Elemental', element, value:options.value }
  }

  const functions = Object.keys(functionalDescriptors) as MaterialFunction[]
  const fn = !options.function || options.function === 'Random' ? pick(functions) : options.function
  const descriptor = pick(functionalDescriptors[fn])
  return { name: `${descriptor} ${form}`, nature, form, descriptor, descriptorKind:'Functional', function:fn, value:options.value }
}
