from pathlib import Path

rules = Path('src/rules.ts')
theme = Path('src/monsterThemeEngine.ts')
app = Path('src/App.tsx')
styles = Path('src/styles.css')

# rules.ts
text = rules.read_text()
marker = "export interface Monster {\n"
visual_type = """export interface MonsterVisualIdentity {\n  silhouette: string\n  bodyPlan: string\n  surface: string\n  palette: string\n  face: string\n  signatureFeature: string\n  relicFeature: string\n  scale: string\n  environmentalMotif: string\n}\n\n"""
if 'export interface MonsterVisualIdentity' not in text:
    if marker not in text:
        raise SystemExit('Monster interface marker missing')
    text = text.replace(marker, visual_type + marker, 1)
monster_tail = "  notes: string[]\n  combatStyle?: CombatStyle\n"
if 'visualIdentity?: MonsterVisualIdentity' not in text:
    if monster_tail not in text:
        raise SystemExit('Monster interface tail missing')
    text = text.replace(monster_tail, "  notes: string[]\n  visualIdentity?: MonsterVisualIdentity\n  combatStyle?: CombatStyle\n", 1)
rules.write_text(text)

# monsterThemeEngine.ts
text = theme.read_text()
text = text.replace(
    "import type { Affinity, CombatStyle, DamageType, Monster, MonsterAttack, MonsterSkill, MonsterSpell, Rank, Species } from './rules'",
    "import type { Affinity, CombatStyle, DamageType, Monster, MonsterAttack, MonsterSkill, MonsterSpell, MonsterVisualIdentity, Rank, Species } from './rules'",
    1,
)
text = text.replace(
    "export type MonsterRerollPart = 'name' | 'traits' | 'attacks' | 'skills' | 'spells' | 'affinities' | 'theme'",
    "export type MonsterRerollPart = 'name' | 'traits' | 'attacks' | 'skills' | 'spells' | 'affinities' | 'theme' | 'visualIdentity'",
    1,
)

insert_before = "function detailedMonsterNotes(monster:Monster, theme:MonsterTheme, profile:ThemeProfile, primary:DamageType, status:string) {"
visual_engine = r'''const visualSilhouettes:Record<Species,string[]>={
  Beast:['low stalking silhouette','rangy long-limbed silhouette','broad-backed horned silhouette','compact ambush silhouette','lean runner silhouette'],
  Construct:['upright sentinel silhouette','low multi-legged machine silhouette','top-heavy industrial silhouette','narrow pursuit-frame silhouette','asymmetrical relic-machine silhouette'],
  Demon:['gaunt humanoid silhouette','horned predatory silhouette','elegant weightless silhouette','distorted long-limbed silhouette','charred hulking silhouette'],
  Elemental:['floating core silhouette','serpentine flowing silhouette','towering column silhouette','animal-like unstable silhouette','orbiting debris silhouette'],
  Humanoid:['disciplined traveller silhouette','armoured enforcer silhouette','light hunter silhouette','ritual specialist silhouette','weathered survivor silhouette'],
  Monster:['six-limbed predator silhouette','long-bodied crawler silhouette','shell-backed silhouette','top-heavy grasping silhouette','strangely symmetrical silhouette'],
  Plant:['root-draped stalker silhouette','flowering armoured silhouette','walking trunk silhouette','bulbous spore silhouette','vine-bound humanoid silhouette'],
  Undead:['gaunt revenant silhouette','armoured corpse silhouette','skeletal draped silhouette','partly incorporeal silhouette','rigid preserved silhouette'],
}

const visualBodyPlans:Record<Species,string[]>={
  Beast:['quadruped with a deep chest','long-limbed predator with a balancing tail','thick-bodied hunter with oversized forelimbs','compact animal body carried close to the ground','horned beast with a reinforced shoulder line'],
  Construct:['riveted humanoid frame','multi-legged armoured chassis','sentinel body built around a central core','asymmetrical war-machine frame','compact piston-driven pursuit chassis'],
  Demon:['distorted humanoid body','predatory animal-like body with wrong proportions','multi-jointed horned frame','thin body with unnaturally long limbs','charred form held together by inner force'],
  Elemental:['rough humanoid elemental mass','serpentine continuous flow','floating core surrounded by orbiting matter','animal-like form made of unstable material','shifting elemental knot that forms limbs as needed'],
  Humanoid:['upright humanoid frame with layered field gear','mobile humanoid hunter frame','armoured humanoid specialist frame','ritual-marked humanoid form','improvised survivor build'],
  Monster:['six-limbed unfamiliar body plan','long crawler with layered spinal plates','top-heavy body with grasping forelimbs','shell-backed organism with a softer underside','mirrored body plan with paired appendages'],
  Plant:['walking root-trunk body','flowering predator body with petal armour','vine humanoid around a woody core','bulbous spore body on root legs','thorn mass with regrowing limb structures'],
  Undead:['desiccated humanoid body held by old bindings','armoured corpse body','skeletal frame wrapped in loose remnants','partly incorporeal torso','preserved revenant body moving with impossible precision'],
}

const visualSurfaces:Record<MonsterTheme,string[]>={
  Wild:['scarred hide and matted fur','thick overlapping scales','coarse bristles and weathered skin','dust-caked natural camouflage','hard horn and old scar tissue'],
  Infernal:['charred skin split by ember-red cracks','blackened horn and vitrified flesh','ash-grey hide smoking at the edges','obsidian plates glowing from beneath','soot-crusted burned flesh'],
  Arcane:['translucent tissue threaded with luminous sigils','smooth surfaces interrupted by floating glyphs','crystal growths arranged in geometric lines','skin patterned by moving runes','faint afterimages trailing the body'],
  Industrial:['riveted steel plates','oil-streaked brass and iron','worn painted armour over bare metal','ceramic panels around exposed mechanisms','patchwork plating repaired across several eras'],
  Floral:['bark plated with thorn ridges','waxy leaves layered like scales','pale fungal growth among dark roots','thick petals over fibrous muscle','green-black vines around a woody skeleton'],
  Spectral:['translucent flesh mottled by corpse-light','frosted armour fading into mist','ragged shadow where matter should be','pale skin stretched over a cold inner glow','surfaces that blur when viewed directly'],
  Draconic:['dense age-scarred scales','interlocking plates bright at the joints','ridged hide crowned by horn growth','mineral-hard scales dusted with elemental residue','old scale layers broken by sharper new growth'],
  Aquatic:['slick skin filmed with brine','mineral-crusted armoured shell','rubbery hide marked by pressure scars','iridescent scales under a cold water sheen','pale deep-water flesh around dark sensory organs'],
}

const visualPalettes:Record<MonsterTheme,string[]>={
  Wild:['moss green, umber and bone','lichen grey, dark brown and muted amber','deep forest green with pale horn','dusty ochre, bark brown and faded black'],
  Infernal:['soot black, ember red and burnt orange','ash grey with molten crimson seams','obsidian black and sulphur yellow','charcoal, bruised purple and furnace orange'],
  Arcane:['ivory, aether blue and luminous violet','pale cyan with deep indigo shadows','crystal white, teal and soft magenta','midnight blue with thin gold-white runes'],
  Industrial:['tarnished brass, oxidised teal and iron black','gunmetal grey, faded cream and warning red','rust brown, cold steel and coolant blue','soot black with old enamel markings'],
  Floral:['moss green, bone white and pollen gold','deep leaf green, muted rose and bark brown','fungal ivory, plum and dark root-black','sage green, faded coral and earthy umber'],
  Spectral:['corpse pale, moon blue and charcoal','frost white, faded violet and smoke grey','desaturated teal, bone and shadow black','cold silver with a dim blue inner glow'],
  Draconic:['mineral red, old gold and charcoal','storm blue, bone horn and slate','frost white, cobalt and grey stone','deep green, bronze and ember orange'],
  Aquatic:['deep teal, pearl white and abyss blue','brine green, slate grey and bioluminescent cyan','oil-slick violet, black and cold blue','pale flesh, dark navy and shell ivory'],
}

const visualFaces:Record<Species,string[]>={
  Beast:['a narrow animal muzzle with alert eyes','a blunt horned face with small watchful eyes','a mask-like arrangement of natural markings','a broad jaw and deep-set reflective eyes','an almost gentle animal face made unsettling by its gaze'],
  Construct:['a single lens set into a blank faceplate','a narrow visor of cold light','a porcelain-like mask over mechanisms','multiple small optical lenses','an old heraldic faceplate with no visible mouth'],
  Demon:['a too-symmetrical face with bright eyes','a horn-framed mask-like face','a smiling mouth that does not match the eyes','a skull-like muzzle over ember light','a beautiful humanoid face with one subtly impossible feature'],
  Elemental:['a suggestion of a face inside moving matter','two lights suspended where eyes should be','a smooth mask formed from the dominant element','a single bright core serving as an eye','no fixed face, only features forming when it focuses'],
  Humanoid:['a weathered expressive face','a partially masked face','a stern practical expression','ritual markings framing the eyes','a tired face made alert by constant scanning'],
  Monster:['a skull-like animal face','a petal-ringed or tendril-framed mouth','multiple asymmetrical sensory eyes','a blunt alien face with small manipulators around the jaw','a strangely childlike face on an inhuman body'],
  Plant:['a petal-ringed feeding mouth','a bark mask with sap-bright eyes','a flower head concealing sensory organs','a knot-like face formed in the trunk','no face, only tendrils turning toward movement'],
  Undead:['a skull-like face with one remaining expression','a death mask fused to the skull','a hollow face lit from within','a preserved face damaged by the manner of death','a hooded skull with pinpoints of cold light'],
}

const visualSignatures:Record<MonsterTheme,string[]>={
  Wild:['an oversized horn or antler growing asymmetrically','a banner-like mane used for threat displays','a split tail that moves independently','a necklace-like line of naturally shed teeth or scales','a distinctive scar pattern repeated across the body'],
  Infernal:['a crown of cooling black horns','a furnace-bright rib cage visible through cracks','a tail ending in a smoking ember tuft','chains fused directly into the body','a halo of drifting cinders'],
  Arcane:['a floating ring of glyph fragments','a crystal horn refracting nearby light','a second shadow moving half a beat late','an orbiting set of geometric shards','a luminous seam tracing a perfect spiral across the body'],
  Industrial:['a rotating relic aperture in the chest','an obsolete faction banner bolted to the chassis','one oversized mechanical arm from a different era','a row of exhaust vanes along the spine','a large cracked lens used as a sensor array'],
  Floral:['a lantern-like bloom hanging from the tail or neck','a crown of oversized petals','a pollen plume that changes with mood','a hollow seedpod chest that resonates when it moves','a long train of root-fibres trailing behind'],
  Spectral:['a broken halo of grave-light','a trailing veil that moves without wind','a visible wound that never closes','a cluster of old funeral charms caught in its form','a pale lantern-like glow where the heart once was'],
  Draconic:['an asymmetrical crown of horns','a single enormous scale like a shield plate','wing membranes marked by old scars','a mineral growth running down the spine','a tail club or blade with a distinctive silhouette'],
  Aquatic:['a bell-shaped lure glowing above the head','a sail-like fin running the full spine','long translucent whiskers sensing vibration','a shell crown crusted with old debris','a fan of bioluminescent frills'],
}

const visualRelics:Record<MonsterTheme,string[]>={
  Wild:['a scavenged relic shard lodged harmlessly in old scar tissue','a cracked tracking tag from a forgotten expedition','a small brass ring woven into hide or horn','an old crystal splinter fused into a callus','no obvious machine part, only faint relic contamination beneath the skin'],
  Infernal:['blackened brass shackles carrying dead runes','a cracked relic seal embedded in the sternum','thin chains feeding into a glowing inner core','a broken sanctification device fused to one limb','an ancient key-like mechanism half-melted into the body'],
  Arcane:['fine runic seams that pulse when power gathers','a hovering relic ring behind the shoulders','a crystal core mounted in a geometric cradle','small brass conduits carrying light rather than fluid','an old observatory lens embedded over one eye'],
  Industrial:['exposed pipes venting mist','a chest-mounted crystal power core','brass joints under ceramic armour','old cable bundles bound like tendons','a maintenance panel stamped with an obsolete serial mark'],
  Floral:['a relic core slowly swallowed by roots','brass irrigation tubes fused into living tissue','a crystal shard functioning like a seed heart','old machine plates used as accidental bark armour','thin wires grown through with living vine'],
  Spectral:['a physical relic anchor suspended inside the incorporeal body','old runic shackles still holding part of the spirit together','a cracked crystal memorial token glowing faintly','a key-shaped relic repeating as a ghostly afterimage','a small brass device that remains solid when the rest phases'],
  Draconic:['a crystal shard grown between major scales','old armour plates melted into the hide','a relic collar broken but never removed','a brass focusing ring around one horn','ancient wiring visible beneath a damaged scale seam'],
  Aquatic:['a barnacle-covered relic core beneath translucent skin','corroded brass pipes repurposed as sensory structures','a drowned machine lens embedded in the skull','crystal filaments glowing through a fin','a broken pressure gauge fused into shell or armour'],
}

const visualMotifs:Record<MonsterTheme,string[]>={
  Wild:['crushed leaves and drifting seed fluff','dust kicked up around its feet','small animals falling silent nearby','loose fur or scales caught on brush'],
  Infernal:['slow cinders and wavering heat haze','thin smoke curling from footprints','ash falling upward for a moment','small sparks drifting from the body'],
  Arcane:['floating dust caught in geometric paths','faint motes of aether-light','small stones hovering briefly nearby','thin luminous symbols appearing and fading in the air'],
  Industrial:['coolant vapour and oily mist','tiny sparks from overworked joints','soot drifting from exhaust vents','loose bolts or metal filings vibrating nearby'],
  Floral:['bioluminescent pollen and drifting spores','falling petals that move against the wind','thin roots testing cracks in the ground','small leaves turning toward the creature'],
  Spectral:['cold mist and pale condensation','dust lifting without wind','faint scraps of memory-like light','soft frost spreading over nearby surfaces'],
  Draconic:['mineral dust and elemental vapour','tiny scale fragments catching the light','smoke, frost or ozone around the mouth','loose grit trembling under its weight'],
  Aquatic:['cold spray and suspended droplets','thin brine mist','bioluminescent motes like plankton','water beading on nearby surfaces'],
}

export function generateMonsterVisualIdentity(monster:Monster, theme:MonsterTheme):MonsterVisualIdentity {
  const mig=monster.attributes.mig, dex=monster.attributes.dex
  const scale=mig>=12?'wagon-sized or larger':mig>=10?'horse-sized':dex>=10?'dog-sized to person-sized':'person-sized or compact'
  return {
    silhouette:pick(visualSilhouettes[monster.species]),
    bodyPlan:pick(visualBodyPlans[monster.species]),
    surface:pick(visualSurfaces[theme]),
    palette:pick(visualPalettes[theme]),
    face:pick(visualFaces[monster.species]),
    signatureFeature:pick(visualSignatures[theme]),
    relicFeature:pick(visualRelics[theme]),
    scale,
    environmentalMotif:pick(visualMotifs[theme]),
  }
}

function visualIdentitySentence(identity:MonsterVisualIdentity) {
  return `Its silhouette is ${identity.silhouette}; the body is a ${identity.bodyPlan}, surfaced with ${identity.surface}. Its palette is ${identity.palette}, its face is ${identity.face}, and its signature feature is ${identity.signatureFeature}. Relic influence appears as ${identity.relicFeature}. It reads as ${identity.scale}, usually framed by ${identity.environmentalMotif}.`
}

'''
if 'export function generateMonsterVisualIdentity' not in text:
    if insert_before not in text:
        raise SystemExit('detailedMonsterNotes marker missing')
    text = text.replace(insert_before, visual_engine + insert_before, 1)

# Keep old local pools as legacy fallback, but prefer persistent identity.
text = text.replace("  const body=pick(bodyPlans[monster.species])\n  const surface=pick(surfaces[theme])", "  const identity=monster.visualIdentity\n  const body=identity?.bodyPlan || pick(bodyPlans[monster.species])\n  const surface=identity?.surface || pick(surfaces[theme])", 1)
old_appearance = "    `Appearance: ${capital(sizeTone)}, built as a ${body}, with ${surface}. Its defining traits are ${(monster.traits||[]).slice(0,3).join(', ') || 'unusual and immediately noticeable'}. Signs of ${primary} power show through its body, equipment, or aura, while the strongest nearby sensory impression is ${sensory}.`,"
new_appearance = "    `Appearance: ${identity ? visualIdentitySentence(identity) : `${capital(sizeTone)}, built as a ${body}, with ${surface}.`} Its defining traits are ${(monster.traits||[]).slice(0,3).join(', ') || 'unusual and immediately noticeable'}. Signs of ${primary} power show through its body, equipment, or aura, while the strongest nearby sensory impression is ${sensory}.`,"
if old_appearance not in text:
    raise SystemExit('Appearance note line missing')
text = text.replace(old_appearance, new_appearance, 1)

old_finish_intro = "  const baseNotes=cleanThemeNotes(monster.notes||[])\n  const themedTraits=opts.traits ? unique([...shuffled(p.traits).slice(0,3), ...(monster.traits||[]).slice(0,1)]).slice(0,4) : monster.traits"
new_finish_intro = "  const baseNotes=cleanThemeNotes(monster.notes||[])\n  const visualIdentity=monster.visualIdentity || generateMonsterVisualIdentity(monster,theme)\n  const themedTraits=opts.traits ? unique([...shuffled(p.traits).slice(0,3), ...(monster.traits||[]).slice(0,1)]).slice(0,4) : monster.traits"
if old_finish_intro not in text:
    raise SystemExit('finishTheme intro missing')
text = text.replace(old_finish_intro, new_finish_intro, 1)

old_return_fragment = "    affinities:opts.affinities ? thematicAffinities(monster,theme,primary) : monster.affinities,\n    notes:[...detailedMonsterNotes({...monster,traits:themedTraits},theme,p,primary,status),`Theme: ${theme}. ${p.flavour}`,gimmick,combatLoop,...(phaseNote?[phaseNote]:[]),...baseNotes],"
new_return_fragment = "    affinities:opts.affinities ? thematicAffinities(monster,theme,primary) : monster.affinities,\n    visualIdentity,\n    notes:[...detailedMonsterNotes({...monster,traits:themedTraits,visualIdentity},theme,p,primary,status),`Theme: ${theme}. ${p.flavour}`,gimmick,combatLoop,...(phaseNote?[phaseNote]:[]),...baseNotes],"
if old_return_fragment not in text:
    raise SystemExit('finishTheme return fragment missing')
text = text.replace(old_return_fragment, new_return_fragment, 1)

old_theme_reroll = "    return finishTheme(monster,nextTheme,primary,status,{name:true,attacks:true,skills:true,spells:true,traits:true,affinities:false})"
new_theme_reroll = "    return finishTheme({...monster,visualIdentity:undefined},nextTheme,primary,status,{name:true,attacks:true,skills:true,spells:true,traits:true,affinities:false})"
if old_theme_reroll not in text:
    raise SystemExit('theme reroll missing')
text = text.replace(old_theme_reroll, new_theme_reroll, 1)

reroll_marker = "  const {primary,status}=gimmickFromMonster(monster,currentTheme)\n  if(part==='name')"
reroll_insert = "  const {primary,status}=gimmickFromMonster(monster,currentTheme)\n  if(part==='visualIdentity') return finishTheme({...monster,visualIdentity:generateMonsterVisualIdentity(monster,currentTheme)},currentTheme,primary,status,{name:false,attacks:false,skills:false,spells:false,traits:false,affinities:false})\n  if(part==='name')"
if "if(part==='visualIdentity')" not in text:
    if reroll_marker not in text:
        raise SystemExit('reroll marker missing')
    text = text.replace(reroll_marker, reroll_insert, 1)

theme.write_text(text)

# App.tsx
text = app.read_text()
old_prompt_vars = "  const traits = (monster.traits || []).slice(0,4).join(', ') || 'distinctive monstrous features'\n  const style = artPresetText(preset)"
new_prompt_vars = "  const traits = (monster.traits || []).slice(0,4).join(', ') || 'distinctive monstrous features'\n  const visual = monster.visualIdentity\n  const visualBlock = visual ? `persistent visual identity: ${visual.silhouette}; ${visual.bodyPlan}; surface ${visual.surface}; palette ${visual.palette}; face ${visual.face}; signature feature ${visual.signatureFeature}; relic detail ${visual.relicFeature}; scale ${visual.scale}; environmental motif ${visual.environmentalMotif}` : ''\n  const style = artPresetText(preset)"
if old_prompt_vars not in text:
    raise SystemExit('art prompt variable marker missing')
text = text.replace(old_prompt_vars, new_prompt_vars, 1)
text = text.replace("[style,regional,frame,monster.name,identity,`traits: ${traits}`", "[style,regional,frame,monster.name,identity,visualBlock,`traits: ${traits}`", 1)
text = text.replace("[style,regional,frame,`monster concept art of ${monster.name}`,identity,description,appearance", "[style,regional,frame,`monster concept art of ${monster.name}`,identity,visualBlock,description,appearance", 1)
text = text.replace("[style,regional,`${monster.name}, ${identity}`,'{full-body bestiary portrait", "[style,regional,`${monster.name}, ${identity}`,visualBlock,'{full-body bestiary portrait", 1)
text = text.replace("[style,regional,frame,`bestiary illustration of ${monster.name}`,`${identity}, level ${monster.level}`,description,appearance", "[style,regional,frame,`bestiary illustration of ${monster.name}`,`${identity}, level ${monster.level}`,visualBlock,description,appearance", 1)

traits_block = "    <div className=\"monsterTraits\"><strong>Traits</strong><span>{(monster.traits || []).join(' · ')}</span></div>\n"
visual_panel = """    <div className=\"monsterTraits\"><strong>Traits</strong><span>{(monster.traits || []).join(' · ')}</span></div>\n    {monster.visualIdentity && <details className=\"monsterVisualIdentity\" open={!database}><summary>Visual identity <small>persistent</small></summary><div className=\"monsterVisualIdentityGrid\"><p><strong>Silhouette</strong><span>{monster.visualIdentity.silhouette}</span></p><p><strong>Body plan</strong><span>{monster.visualIdentity.bodyPlan}</span></p><p><strong>Surface</strong><span>{monster.visualIdentity.surface}</span></p><p><strong>Palette</strong><span>{monster.visualIdentity.palette}</span></p><p><strong>Face</strong><span>{monster.visualIdentity.face}</span></p><p><strong>Signature</strong><span>{monster.visualIdentity.signatureFeature}</span></p><p><strong>Relic detail</strong><span>{monster.visualIdentity.relicFeature}</span></p><p><strong>Scale</strong><span>{monster.visualIdentity.scale}</span></p><p><strong>Motif</strong><span>{monster.visualIdentity.environmentalMotif}</span></p></div></details>}\n"""
if 'monsterVisualIdentityGrid' not in text:
    if traits_block not in text:
        raise SystemExit('monster traits render block missing')
    text = text.replace(traits_block, visual_panel, 1)

old_buttons = "<button onClick={()=>reroll('affinities')}>Affinities</button><button onClick={()=>reroll('theme')}>Theme</button>"
new_buttons = "<button onClick={()=>reroll('affinities')}>Affinities</button><button onClick={()=>reroll('visualIdentity')}>Visual Identity</button><button onClick={()=>reroll('theme')}>Theme</button>"
if old_buttons not in text:
    raise SystemExit('reroll buttons marker missing')
text = text.replace(old_buttons, new_buttons, 1)
old_hint = "Targeted rerolls preserve level, rank, attributes, HP, MP and Aestra regional identity; name, traits, theme and affinity rerolls refresh the relevant regional layer without stacking duplicate mechanics."
new_hint = "Targeted rerolls preserve level, rank, attributes, HP, MP and Aestra regional identity. Visual Identity is persistent across mechanical rerolls and only changes when you reroll Visual Identity, Theme, or the entire monster."
if old_hint not in text:
    raise SystemExit('reroll hint missing')
text = text.replace(old_hint, new_hint, 1)
app.write_text(text)

# styles.css
text = styles.read_text()
css = r'''

.monsterVisualIdentity { margin:10px 0 12px; border:1px solid rgba(195,167,108,.28); border-radius:4px; background:rgba(195,167,108,.045); overflow:hidden; }
.monsterVisualIdentity > summary { padding:9px 10px; color:var(--brass-bright); text-transform:uppercase; letter-spacing:.08em; font-size:.76rem; }
.monsterVisualIdentity > summary small { margin-left:6px; color:var(--muted); text-transform:none; letter-spacing:.02em; font-weight:400; }
.monsterVisualIdentityGrid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:7px; padding:0 10px 10px; }
.monsterVisualIdentityGrid p { margin:0; padding:8px; display:grid; gap:3px; border:1px solid #344742; background:rgba(8,18,19,.72); min-width:0; }
.monsterVisualIdentityGrid strong { color:var(--crystal); font-size:.66rem; text-transform:uppercase; letter-spacing:.08em; }
.monsterVisualIdentityGrid span { color:#d9d2c2; font-size:.82rem; line-height:1.35; }
.monsterCard[data-db-record-kind="monster"] .monsterVisualIdentity { display:none; }
@media (max-width:760px) { .monsterVisualIdentityGrid { grid-template-columns:1fr 1fr; } }
@media (max-width:480px) { .monsterVisualIdentityGrid { grid-template-columns:1fr; } }
'''
if '.monsterVisualIdentityGrid' not in text:
    text += css
styles.write_text(text)

print('Persistent monster visual identity patch applied')