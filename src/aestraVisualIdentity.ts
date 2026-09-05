import type { Monster, MonsterVisualIdentity } from './rules'
import type { AestraInfluence, AestraNation, ValdoriaDepth } from './aestra'
import type { AestraEnvironment, AestraExposure, AestraWildOrigin } from './aestraWilds'

export type AestraVisualRegion = AestraNation | 'Aestra'

type RegionalVisualPool = {
  silhouettes: string[]
  surfaces: string[]
  palettes: string[]
  faces: string[]
  signatures: string[]
  relics: string[]
  motifs: string[]
}

const regionPools: Record<AestraVisualRegion, RegionalVisualPool> = {
  Garlond: {
    silhouettes: ['low, heavy military silhouette with protected joints','broad utilitarian silhouette built to endure cold and recoil','angular state-engineered silhouette with little decorative excess','compact armoured silhouette designed for narrow industrial corridors'],
    surfaces: ['frost-bloomed steel, soot-stained plating and rough insulating wraps','cold iron armour scarred by factory wear and de-icing salts','mass-produced steel panels with chipped red state markings','dark utilitarian plates over exposed pistons and frost-crusted seams'],
    palettes: ['gunmetal, soot black, frost blue and faded state red','cold steel, dirty white, charcoal and warning crimson','iron grey, desaturated blue and small ember-orange indicators','smoke black, oxidised steel and pale cyan crystal light'],
    faces: ['a severe slit visor or narrow optical band','a blank military faceplate stamped with a unit mark','a respirator-like muzzle framed by frost','small recessed lenses protected behind armoured shutters'],
    signatures: ['a red identification plate, pennant or stamped serial visible even through damage','an oversized radiator spine built for extreme cold','a brutal reinforced shoulder or prow-like armour mass','a visible suppression apparatus mounted like a weaponised industrial tool'],
    relics: ['a state-issued crystal regulator locked behind armour','thick insulated conduits feeding a frost-blue relic core','a bolted Lost Era component crudely standardised for military use','a numbered power cell cage with tamper seals and maintenance stencils'],
    motifs: ['frost vapour, soot flakes and tiny sparks','cold exhaust mist drifting through falling ash','powdered snow blackened by industrial fallout','thin steam plumes and distant factory haze'],
  },
  'Rübenberg': {
    silhouettes: ['upright balanced silhouette with visible turbine or vane elements','light civic-engineering silhouette built around graceful counterweights','broad but elegant wind-machine silhouette with open rotating components','compact precision silhouette with articulated brass vanes'],
    surfaces: ['weathered brass, pale timber, enamelled panels and turquoise energy glass','brushed brass fittings over practical blue-grey housings','polished civic metalwork softened by leather, cloth and old wood','copper-edged plates shaped around exposed wind-driven mechanisms'],
    palettes: ['weathered brass, turquoise, cream and storm grey','copper gold, canal blue and pale wind-glass cyan','warm brass, muted navy and sea-green crystal light','old ivory, burnished metal and cool teal energy'],
    faces: ['a clear glass lens framed by careful brasswork','a friendly civic mask with simple readable features','paired blue-green optics beneath a protective brow','an elegant narrow faceplate shaped more like an instrument than a weapon'],
    signatures: ['a rotating wind-ring or small turbine crown','counterweighted fins that constantly adjust to movement','a civic crest worked into an otherwise functional component','thin streamers, vanes or ribbon-like energy markers showing airflow'],
    relics: ['a turquoise crystal gyro suspended in a brass cage','precision bearings surrounding a softly glowing relic spindle','fine conduits carrying wind-energy through transparent channels','an old navigation or diplomatic instrument repurposed as a control core'],
    motifs: ['wind-tossed dust, small ribbons and drifting teal motes','soft turbine hum with loose leaves circling the feet','condensation beads pulled into little spirals by airflow','fine brass chimes and visible currents in mist'],
  },
  Palmeria: {
    silhouettes: ['tall composed silhouette with ceremonial symmetry','slender scholarly silhouette framed by aetheric ornaments','classical guardian silhouette with flowing geometric lines','elegant experimental silhouette built around visible magical apparatus'],
    surfaces: ['ivory ceramic, warm gold trim and aether-blue crystal inlays','polished pale stone-like plating marked with fine academic script','sun-warmed bronze, white lacquer and luminous geometric seams','ornate but restrained surfaces combining cloth, metal and crystalline research components'],
    palettes: ['imperial gold, ivory, aether blue and touches of laurel green','sunlit bronze, white, cobalt and pale cyan','warm cream, antique gold and luminous sapphire','pale marble, deep blue and small violet research lights'],
    faces: ['a calm mask with symmetrical blue-lit eyes','a classical profile translated into an artificial faceplate','a fine-featured humanoid face marked by subtle research glyphs','a polished visor framed by laurel-like metallic fins'],
    signatures: ['a floating geometric halo of research glyphs','a laurel-shaped crown or crest acting as a magical focusing array','a suspended lens or prism used to study opponents','a ceremonial mantle hiding practical scientific instruments beneath it'],
    relics: ['a calibrated aether crystal held in a gold geometric frame','an observatory lens linked to fine glowing conduits','a relic thesis-engine covered in tiny annotation marks','a polished Lost Era component treated like a museum object and laboratory instrument at once'],
    motifs: ['golden dust, blue aether motes and warm tropical light','thin luminous diagrams briefly appearing around the body','soft drifting petals mixed with geometric sparks','sunlit haze cut by precise blue magical lines'],
  },
  Valdoria: {
    silhouettes: ['narrow vertical silhouette adapted to cramped alleys and shafts','asymmetrical scavenged silhouette with stacked attachments','low crouched silhouette built to move beneath pipes and walkways','top-heavy improvised silhouette balanced by ropes, cages or salvage packs'],
    surfaces: ['rusted copper, patched leather, salvaged plate and damp stone grime','mismatched relic panels stitched together with wire and resin','dark lacquer, oxidised metal and improvised cloth wraps','scrap brass, blackened iron and fungus-stained protective layers'],
    palettes: ['rust orange, oxidised teal, subterranean green and soot black','copper brown, bottle green, dirty cream and dim violet relic light','deep red, blackened brass and mould green','earth brown, patinated metal and low amber market light'],
    faces: ['a scavenged mask assembled from several unrelated devices','multiple cheap lenses clustered around one working relic eye','a cloth-wrapped face with one exposed glowing component','a dented half-mask covered in vendor marks, charms or repair tags'],
    signatures: ['a cage of dangling salvage, charms and traded components','one obviously contraband part cleaner than everything around it','a stack of improvised tools fixed directly to the body','a long cable, chain or rope bundle used like an extra limb'],
    relics: ['a black-market crystal regulator with mismatched connectors','a stolen relic component still bearing another nation’s markings','a deep-below mechanism patched with market electronics','a cracked ancient device kept alive by visible bypass wires and improvised fuses'],
    motifs: ['dripping water, hanging cables and drifting market smoke','greenish condensation and sparks beneath crowded pipework','dust, fungal spores and scraps of paper turning in shaft drafts','dim sign-light reflecting from wet metal and stacked salvage'],
  },
  Aestra: {
    silhouettes: ['organic silhouette partly swallowed by reclaimed relic structure','weathered natural silhouette with one impossible Lost Era interruption','asymmetrical wild silhouette shaped by ruin, crystal and ecology together','strange but readable silhouette where living adaptation has grown around old technology'],
    surfaces: ['moss, bark, hide or shell grown across ancient relic surfaces','weathered natural tissue threaded with mineral and crystal traces','lichen-covered plates, roots and cracked old-world material','soft organic textures interrupted by buried ceramic, brass or glass relic fragments'],
    palettes: ['moss green, bone, weathered teal and soft crystal cyan','lichen grey, deep leaf green and faded relic gold','earth brown, turquoise decay and pale bioluminescent green','muted natural colours broken by one ancient luminous accent'],
    faces: ['an expressive animal or humanoid face altered by subtle relic growth','a mask-like natural face with one ancient lens or crystal eye','a gentle-looking face made strange by asymmetric crystal adaptation','sensory tendrils and living structures arranged around a half-buried relic component'],
    signatures: ['a root-wrapped crystal growth behaving like a new organ','a Lost Era object incorporated so completely it now reads as anatomy','a flowering or fungal growth emerging from an old machine aperture','an ancient ring, vane or lens around which the creature’s body has adapted'],
    relics: ['a relic core almost completely naturalised by roots, shell or scar tissue','green-teal crystal veins following the lines of buried circuitry','an old mechanism functioning imperfectly as part of the creature’s metabolism','a weathered Lost Era fragment whose original purpose is no longer obvious'],
    motifs: ['drifting spores, leaves and faint crystal motes','soft ruin-dust mixed with pollen and bioluminescent insects','roots shifting through cracked masonry under faint teal light','wind moving through old structures while tiny living lights gather nearby'],
  },
}

function pick<T>(values: readonly T[]): T { return values[Math.floor(Math.random()*values.length)] }

function wildEnvironmentAdjust(identity: MonsterVisualIdentity, environment?: AestraEnvironment): MonsterVisualIdentity {
  if (!environment) return identity
  if (environment === 'Green Reaches') return { ...identity, surface:'lush overgrowth, bark, moss and soft fungal layers reclaiming older surfaces', palette:'deep green, moss, bone and warm bioluminescent gold', environmentalMotif:'thick pollen, drifting spores, tiny insects and leaves moving around it' }
  if (environment === 'Scarlands') return { ...identity, surface:'war-scarred hide or plating split by mineralised wounds and ancient energy burns', palette:'charcoal, rust, bruised violet and unstable crystal light', environmentalMotif:'ash, glassy dust and flickers of unstable old-world energy' }
  if (environment === 'Ruin Belts') return { ...identity, relicFeature:'a large dormant ruin-component or old control mechanism integrated into its body', palette:'weathered stone, oxidised teal, bone and faded cyan relic light', environmentalMotif:'ruin dust, tiny floating glyph fragments and loose debris reacting to nearby power' }
  if (environment === 'Frontier') return { ...identity, surface:'weathered practical layers mixing natural material, scavenged cloth and repaired relic scrap', palette:'dusty earth tones, worn canvas, tarnished metal and small crystal accents', environmentalMotif:'road dust, cloth tags, camp smoke and bits of scavenged settlement debris' }
  return { ...identity, face:'an unfamiliar but expressive sensory arrangement that does not fit known regional taxonomy', signatureFeature:'one striking biological or relic adaptation unlike anything commonly catalogued', environmentalMotif:'strange bioluminescent particles, unfamiliar plant movement and deep-wild atmospheric haze' }
}

function influenceAdjust(identity: MonsterVisualIdentity, influence?: AestraInfluence): MonsterVisualIdentity {
  if (!influence || influence === 'Stable') return identity
  if (influence === 'Fading') return { ...identity, palette:`${identity.palette}, with dimmed and uneven relic light`, relicFeature:`${identity.relicFeature}; the glow is weak, intermittent and clearly failing` }
  if (influence === 'Crystal-Starved') return { ...identity, surface:`${identity.surface}, pulled tight or abraded around depleted crystal structures`, relicFeature:`${identity.relicFeature}; empty sockets, pale fractures or scavenged replacements show severe crystal scarcity` }
  if (influence === 'Overcharged') return { ...identity, palette:`${identity.palette}, cut by overbright cyan-white crystal flare`, environmentalMotif:`${identity.environmentalMotif}, plus sparks and floating particles drawn toward excess crystal power` }
  return { ...identity, palette:`${identity.palette}, corrupted by black-violet crystal veining`, face:`${identity.face}, with one visibly corrupted asymmetry`, relicFeature:`${identity.relicFeature}; dark growths or wrong-coloured light show corrupted crystal influence` }
}

function valdoriaDepthAdjust(identity: MonsterVisualIdentity, depth?: ValdoriaDepth): MonsterVisualIdentity {
  if (!depth) return identity
  if (depth === 'Market') return { ...identity, signatureFeature:'visible trade tags, charms, patched pockets or merchant salvage worked into its silhouette', environmentalMotif:'warm market haze, hanging signs, crowd dust and reflected lantern light' }
  if (depth === 'Lower City') return { ...identity, silhouette:'compressed, agile silhouette adapted to cramped bridges, ducts and narrow vertical routes', environmentalMotif:'dripping pipes, close walls, tangled cables and greenish condensation' }
  if (depth === 'Deep Below') return { ...identity, palette:'near-black metal, mineral green, bruised purple and faint deep-earth glow', relicFeature:'an unfamiliar subterranean relic component that interferes with nearby crystal light', environmentalMotif:'heavy damp air, stone dust and dim lights swallowed quickly by depth' }
  return { ...identity, surface:'ancient sealed materials, mineral crust and relic surfaces untouched by ordinary market repair', signatureFeature:'a severe Lost Era geometric feature whose purpose is not obvious', relicFeature:'a largely intact buried mechanism using construction techniques unlike modern Valdorian salvage', environmentalMotif:'fine ancient dust, mineral haze and slow pulses of unfamiliar light' }
}

export function applyAestraRegionalVisualIdentity(monster: Monster, region: AestraVisualRegion, options?: { environment?: AestraEnvironment; exposure?: AestraExposure; origin?: AestraWildOrigin; influence?: AestraInfluence; depth?: ValdoriaDepth }): Monster {
  if (!monster.visualIdentity) return monster
  const pool = regionPools[region]
  let identity: MonsterVisualIdentity = {
    ...monster.visualIdentity,
    silhouette: pick(pool.silhouettes),
    surface: pick(pool.surfaces),
    palette: pick(pool.palettes),
    face: pick(pool.faces),
    signatureFeature: pick(pool.signatures),
    relicFeature: pick(pool.relics),
    environmentalMotif: pick(pool.motifs),
  }
  if (region === 'Aestra') identity = wildEnvironmentAdjust(identity, options?.environment)
  if (region === 'Valdoria') identity = valdoriaDepthAdjust(identity, options?.depth)
  identity = influenceAdjust(identity, options?.influence)
  return { ...monster, visualIdentity: identity }
}
