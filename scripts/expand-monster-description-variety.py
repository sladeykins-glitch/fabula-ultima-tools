from pathlib import Path

p = Path('src/monsterThemeEngine.ts')
text = p.read_text()
start = text.index('function detailedMonsterNotes(')
end = text.index('\nfunction cleanThemeNotes', start)

replacement = r'''function detailedMonsterNotes(monster:Monster, theme:MonsterTheme, profile:ThemeProfile, primary:DamageType, status:string) {
  const style=monster.combatStyle||'Mixed'
  const rankTone=monster.rank==='Champion'?'an apex specimen whose presence dominates the scene':monster.rank==='Elite'?'a dangerous veteran specimen with obvious adaptations':'a representative specimen of its kind'

  const bodyPlans:Record<Species,string[]>={
    Beast:['low-slung quadruped with a deep chest','rangy predator with long limbs and a narrow skull','thick-bodied hunter with oversized forelimbs','compact ambush beast built close to the ground','lean runner with a counterbalancing tail','broad-backed brute with horn, tusk, or crest-like growths'],
    Construct:['riveted humanoid frame with exposed joints','low armoured chassis carried on multiple articulated limbs','tall sentinel body wrapped around a glowing core','asymmetrical war-machine assembled from mismatched plates','compact pursuit frame with piston-driven legs','heavy industrial shell repurposed into a combat body'],
    Demon:['distorted humanoid silhouette with exaggerated limbs','predatory body that only loosely resembles an animal','gaunt figure whose proportions seem subtly wrong','massive horned form with too many joints','elegant but unsettling shape that moves without natural weight','charred, cracked body held together by inner light'],
    Elemental:['rough humanoid mass constantly shedding fragments','serpentine body formed from a continuous elemental flow','floating core surrounded by orbiting debris','animal-like outline made from unstable matter','towering column that briefly forms limbs as needed','shifting knot of elemental material with no fixed anatomy'],
    Humanoid:['scarred veteran with practical layered gear','lightly equipped hunter built for mobility','heavily protected enforcer carrying visible field equipment','ritual-marked combatant with carefully maintained tools','weathered survivor with improvised armour and trophies','disciplined specialist whose equipment reflects a clear battlefield role'],
    Monster:['six-limbed predator with an unfamiliar gait','hulking body combining reptilian and mammalian features','long-bodied crawler with layered plates along its spine','top-heavy creature with grasping forelimbs and a smaller rear body','bizarrely symmetrical organism with mirrored appendages','massive shell-backed creature with a vulnerable-looking underside'],
    Plant:['rooted central trunk supported by walking tendrils','flowering predator with layered petal-like armour','low mat of roots surrounding a raised feeding body','vine-bound humanoid shape grown around a hard wooden core','bulbous spore body carried on rootlike legs','thorned mass whose limbs continually regrow into new shapes'],
    Undead:['desiccated humanoid held together by old bindings','armoured corpse whose posture still recalls military training','skeletal figure wrapped in drifting fragments of clothing','partially incorporeal body fading away below the torso','swollen corpse marked by the manner of its death','preserved revenant whose damaged body moves with impossible precision'],
  }

  const surfaces:Record<MonsterTheme,string[]>={
    Wild:['scarred hide','matted fur broken by old wounds','thick overlapping scales','coarse bristles along the spine','dust-caked skin patterned by natural camouflage'],
    Infernal:['charred skin split by ember-red cracks','blackened horn and vitrified flesh','ash-grey hide that smokes at the edges','obsidian plates with heat glowing beneath','burned flesh continually renewing under a crust of soot'],
    Arcane:['translucent tissue threaded with luminous sigils','smooth surfaces interrupted by floating glyphs','crystal growths following geometric lines','skin or plating patterned by moving runes','a faint afterimage that never perfectly matches its body'],
    Industrial:['riveted steel plates','oil-streaked brass and iron','painted armour worn down to bare metal','ceramic panels around exposed mechanisms','patchwork plating repaired across several eras'],
    Floral:['bark plated with thorn ridges','waxy leaves layered like scales','pale fungal growth among dark roots','thick petals hiding fibrous muscle','green-black vines wrapped around a woody skeleton'],
    Spectral:['translucent flesh mottled by corpse-light','frosted armour fading into mist','ragged shadow where solid matter should be','pale skin stretched over a cold inner glow','surfaces that lose detail whenever viewed directly'],
    Draconic:['dense scales scarred by age','interlocking plates with brighter colour at the joints','ridged hide crowned by horn growth','mineral-hard scales dusted with elemental residue','old scale layers broken by newer, sharper growth'],
    Aquatic:['slick skin filmed with brine','armoured shell crusted with mineral deposits','rubbery hide marked by pressure scars','iridescent scales under a layer of cold water','pale deep-water flesh around darker sensory organs'],
  }

  const locomotion:Record<CombatStyle,string[]>={
    Mixed:['It changes pace constantly, testing distance before committing.','It alternates between measured movement and sudden bursts that make its intentions hard to read.','It advances only when a clear advantage appears, then withdraws before the exchange turns against it.'],
    Brute:['It moves with direct, committed force and rarely gives ground once engaged.','Every step loads its body for another impact, making even simple movement feel like a charge.','It closes distance aggressively, trusting mass and momentum over caution.'],
    Defender:['It keeps its strongest side toward danger and uses its body to occupy important space.','Its movements are short and economical, always preserving a position from which it can protect something.','It constantly repositions just enough to stay between threats and whatever it has chosen to guard.'],
    Controller:['It circles and probes, shaping distance before choosing where violence happens.','It prefers diagonal movement and awkward angles, herding opponents rather than pursuing them directly.','It gives ground deliberately, drawing enemies into positions where its control effects become harder to avoid.'],
    Spellcaster:['It maintains deliberate distance and pauses in brief, ritualised beats before releasing power.','Its movement follows the rhythm of its magic: reposition, gather power, release, repeat.','It avoids being pinned down, drifting toward clear sight lines from which its strongest effects can be used.'],
    Assassin:['It spends long moments unnaturally still, then crosses distance in one precise burst.','It avoids the centre of attention, moving along edges, cover, and blind spots.','Its body stays relaxed until a vulnerable target appears, at which point every motion becomes sudden and exact.'],
    Support:['It rarely moves for its own safety alone, instead shifting wherever an ally needs protection or reinforcement.','Its path constantly crosses those of its allies, suggesting practiced coordination.','It keeps enough distance to see the whole fight and repeatedly moves to stabilise whichever part of the formation is failing.'],
  }

  const minds:Record<Species,string[]>={
    Beast:['animal-cunning and highly observant','driven by instinct but capable of learning from pain','territorial rather than malicious','patient enough to stalk before committing','quick to distinguish prey, threat, and rival'],
    Construct:['literal-minded and objective-driven','methodical, repeating proven responses until they fail','capable of tactical adjustment inside a narrow directive','eerily patient, with no fatigue or panic','reactive to commands, insignia, or encoded authority'],
    Demon:['socially perceptive and cruelly curious','predatory, theatrical, and fond of testing fear','clever enough to lie, bargain, and feign weakness','obsessed with provoking emotional mistakes','more interested in corruption or humiliation than a clean kill'],
    Elemental:['alien but internally consistent','responsive to disturbance rather than morality','drawn toward concentrations of its native energy','simple in motive but difficult to communicate with','possessed of an instinctive awareness of changes in its environment'],
    Humanoid:['fully sapient and capable of negotiation','disciplined but still subject to fear, pride, and doubt','willing to retreat if the objective becomes impossible','observant enough to exploit social as well as tactical weaknesses','capable of planning beyond the immediate conflict'],
    Monster:['intelligent in an unfamiliar, non-humanoid way','guided by strong instincts that can still be studied','capable of recognising patterns and repeated tactics','protective of specific resources, places, or offspring','curious until threatened, then frighteningly decisive'],
    Plant:['slow-thinking but intensely sensitive to its surroundings','reactive to vibration, heat, magic, and chemical signals','patient enough to remain inert for days','guided by growth, feeding, and territorial competition','linked to nearby growths through scent, root, or spore signals'],
    Undead:['bound to repeating memories and unfinished impulses','capable of recognising fragments from life','coldly purposeful until confronted with a personal trigger','erratic around symbols tied to its death','less concerned with survival than completing whatever keeps it moving'],
  }

  const motives:Record<Species,string[]>={
    Beast:['defending territory','protecting young','hunting because normal prey has disappeared','competing with a larger predator','guarding a den or seasonal feeding ground'],
    Construct:['continuing an obsolete patrol','guarding a sealed facility','retrieving a lost object','enforcing credentials nobody remembers','destroying anything matching an ancient threat profile'],
    Demon:['collecting fear or suffering','fulfilling the wording of an old bargain','tempting mortals into a repeated mistake','feeding on conflict around a cursed site','seeking release from a binding it cannot break directly'],
    Elemental:['restoring an environmental imbalance','moving toward a source of elemental energy','reacting to contamination in its territory','defending the place where it formed','following a natural cycle that settlements have interrupted'],
    Humanoid:['protecting an employer or faction','holding territory for strategic reasons','recovering valuable relics','surviving under desperate conditions','carrying out orders it may not fully believe in'],
    Monster:['protecting a nesting ground','following a migration route','hoarding an unusual resource','responding to an injury or environmental disruption','competing for territory after being displaced'],
    Plant:['spreading into nutrient-rich ground','defending a root network','feeding on magic or mineral deposits','responding to seasonal bloom behaviour','overgrowing an artificial structure that altered the local soil'],
    Undead:['repeating the duty it held in life','seeking a person or object it can no longer properly identify','defending the site of its death','trying to complete a broken oath','acting out the final hours before it died'],
  }

  const social:Record<Species,string[]>={
    Beast:['usually solitary except during breeding or migration','travels in a loose pair or family group','may tolerate smaller scavengers that benefit from its kills','dominates a small hierarchy of lesser predators','signals others of its kind through scent and territorial marks'],
    Construct:['often operates as one node in a larger dormant system','may coordinate silently with identical units','treats nearby maintenance drones as extensions of itself','functions alone but expects support that no longer exists','shares target data with any compatible machine it encounters'],
    Demon:['rarely trusts its own kind for long','may command weaker entities through fear','prefers temporary alliances built on leverage','often keeps mortal servants who do not understand the full bargain','competes constantly for status even while cooperating'],
    Elemental:['gathers loosely with others where conditions are favourable','shows little social hierarchy but strong environmental synchrony','may merge or divide when energy conditions change','tolerates beings that do not disturb its territory','responds collectively when one of its kind is harmed'],
    Humanoid:['works within recognisable chains of loyalty and authority','likely belongs to a squad, crew, clan, or faction','uses signals, passwords, and practiced teamwork','may have personal bonds that override formal orders','understands surrender, negotiation, and hostage value'],
    Monster:['may live alone but recognise neighbouring territories','forms temporary hunting groups around abundant prey','protects offspring fiercely','uses calls, posture, scent, or vibration to communicate','may tolerate symbiotic creatures around its lair'],
    Plant:['connected to nearby growths by root or spore networks','forms colonies that behave like one distributed organism','competes aggressively with unrelated plant life','may shelter insects or animals that spread its seeds','responds to damage in one area by thickening growth elsewhere'],
    Undead:['may gather around a shared memory or death-site','ignores other undead unless their purposes conflict','can fall into old military or ritual formations without conscious thought','may follow the strongest surviving personality among them','often reacts more strongly to the living than to its own kind'],
  }

  const feeding:Record<Species,string[]>={
    Beast:['feeds on fresh meat and marrow','is opportunistic and will eat carrion','prefers mineral-rich organs or bones','feeds infrequently after large kills','supplements hunting with roots, fungi, or hard seeds'],
    Construct:['requires no food but periodically seeks fuel, charge, coolant, or replacement parts','draws power from an internal relic cell','scavenges compatible machinery to repair itself','returns to fixed recharge points between patrols','can remain active for years on a slowly decaying power source'],
    Demon:['feeds metaphorically as much as physically, drawing strength from fear, rage, pain, or broken promises','can consume ordinary matter but gains little from it','feeds on magical residue left by conflict','grows stronger when mortals act according to its temptation','survives through the terms of a binding rather than normal sustenance'],
    Elemental:['absorbs ambient elemental energy','feeds on heat, pressure, current, mineral content, or magical saturation','weakens if kept away from its native environment too long','replenishes itself by incorporating local matter','does not eat in any biological sense'],
    Humanoid:['uses ordinary rations appropriate to its culture and situation','forages or scavenges when supply lines fail','carries compact field provisions','may rely on contraband, ration tokens, or faction stores','eats normally, though scarcity may strongly shape its decisions'],
    Monster:['feeds on whatever its anatomy is adapted to process','may prey on magical creatures rather than mundane animals','can digest material most species cannot','stores food near its lair','feeds rarely but causes dramatic ecological damage when it does'],
    Plant:['absorbs nutrients through roots and specialised feeding tendrils','supplements sunlight by trapping animals','draws minerals from stone or ruins','feeds on magical residue in soil and water','stores nutrients in swollen bulbs or root masses'],
    Undead:['does not need ordinary food','may ritualistically mimic eating from life','draws strength from places, memories, or emotions associated with death','can remain dormant for long periods without sustenance','is sustained by the force or vow binding it to the world'],
  }

  const signs:Record<MonsterTheme,string[]>={
    Wild:['deep tracks crossing the same route repeatedly','trees or stone scraped by territorial marking','half-eaten prey dragged into cover','smaller animals going abruptly silent','tufts of fur, shed scales, or broken horn caught on brush'],
    Infernal:['fine ash collecting where nothing has burned','metal or stone warped by unexplained heat','a persistent smell of smoke or sulphur','small flames leaning toward the same direction without wind','burn marks forming repeated symbols or footprints'],
    Arcane:['dust suspended in geometric patterns','brief flashes of light behind closed doors','compasses or simple mechanisms behaving incorrectly','repeating glyphs scorched onto nearby surfaces','small objects drifting a finger-width above the ground'],
    Industrial:['oil droplets forming a patrol trail','regular impact marks spaced like mechanical footsteps','discarded bolts, shavings, or snapped cable','faint vibration through floors before the machine is audible','old doors forced open with identical tool marks'],
    Floral:['unseasonal blossoms along its route','root cracks spreading through worked stone','pollen collecting in sheltered indoor spaces','small animals found entangled rather than eaten','plant growth turning toward a common hidden point'],
    Spectral:['frost forming on the inside of objects','sound becoming strangely muffled','old lamps dimming without going out','footprints appearing without visible feet','objects associated with the dead shifting position overnight'],
    Draconic:['scored stone where claws sharpened','shed scales lodged in crevices','bones broken open for marrow','mineral or coin-like objects gathered into small caches','high vantage points repeatedly disturbed or cleared'],
    Aquatic:['brackish water appearing above the normal tide line','pressure cracks in containers and masonry','fish or small animals abandoning otherwise healthy water','slick trails that dry unusually slowly','distant knocking or whale-like sound through solid structures'],
  }

  const quirks:Record<MonsterTheme,string[]>={
    Wild:['collects one oddly specific kind of object','always approaches water before sleeping','refuses to cross a particular scent or material','mimics the alarm call of local prey','has learned to associate a common tool or uniform with danger'],
    Infernal:['speaks politely even while threatening violence','cannot resist correcting broken promises','leaves one survivor to spread fear','becomes visibly agitated by sincere acts of mercy','keeps trophies that symbolise emotional rather than material victories'],
    Arcane:['repeats short sequences of movement like a ritual','casts a second shadow at the wrong angle','reacts strongly to spoken mathematical patterns','briefly mirrors the posture of nearby spellcasters','causes written text nearby to rearrange for a heartbeat'],
    Industrial:['announces actions with obsolete system phrases','still waits for clearance at doors it could easily break','salutes an insignia from a dead regime','performs maintenance rituals during moments of safety','keeps trying to contact a command network that no longer exists'],
    Floral:['blooms more brightly around fresh blood','closes its flowers when someone lies nearby','grows small copies of objects left near its roots','turns all leaves toward active magic rather than sunlight','releases a harmless scent shortly before becoming aggressive'],
    Spectral:['repeats a single mundane gesture from life','cannot cross a threshold until invited or provoked','mistakes one party member for someone long dead','leaves wet or dusty footprints despite being incorporeal','quietly hums a tune associated with its death'],
    Draconic:['is vain about one scar, horn, or scale pattern','counts valuables by touching them rather than looking','remembers insults more clearly than injuries','tests intruders before deciding whether to kill them','has an unexpected fondness for a mundane smell, sound, or food'],
    Aquatic:['taps surfaces to sense hollow spaces','collects polished glass and metal from wreckage','reacts aggressively to sudden bright light','circles a target several times before attacking','produces a low vibration that nearby water visibly ripples to'],
  }

  const sensePools:Record<MonsterTheme,string[]>={
    Wild:['musky fur and churned soil','dry hide, old blood, and crushed brush','a sudden silence among nearby animals','warm breath and the mineral smell of fresh tracks'],
    Infernal:['heat haze and sulphurous smoke','hot iron and bitter ash','dry air that stings the throat','the faint crackle of embers under every movement'],
    Arcane:['pressure behind the eyes and crawling light','ozone and the faint taste of metal','tiny motes of displaced aether','a hum felt through teeth more than heard'],
    Industrial:['oil, hot metal, and ticking relays','coolant vapour and electrical ozone','piston vibration through the floor','grinding bearings under otherwise precise movement'],
    Floral:['wet soil, pollen, and sweet sap','crushed leaves and fungal damp','green resin and the sharp smell of thorns','heavy floral perfume over decomposing vegetation'],
    Spectral:['a sudden drop in temperature','muffled sound and pale condensation','old dust stirred without wind','the sensation of being watched from just behind'],
    Draconic:['hot breath and mineral dust','old scales and scorched stone','a deep vibration in the chest','ozone, smoke, or frost depending on its elemental nature'],
    Aquatic:['brine and cold spray','deep pressure and the smell of wet stone','slick surfaces beaded with condensation','a low resonance like distant sound underwater'],
  }

  const tells:Record<CombatStyle,string[]>={
    Mixed:[`It probes for a weakness first, then leans into ${primary} damage and ${status} once one appears.`,`Its opening actions are diagnostic; after seeing what the party resists, it changes approach quickly.`,`It rarely repeats a failed tactic twice in a row, making observation more useful than simply enduring it.`],
    Brute:[`Before its heaviest attacks, its frame visibly loads with force and its stance narrows toward the intended line of impact.`,`Its strongest blows require full commitment; once it starts the motion, changing direction is difficult.`,`It telegraphs danger through posture rather than magic: lowered centre of gravity, tightened limbs, then explosive release.`],
    Defender:[`It repeatedly turns its strongest side toward attacks and guards specific lanes of approach.`,`Forcing it to choose between two threatened allies disrupts its ideal battle plan.`,`Its attention constantly returns to whatever it is protecting; threats elsewhere can pull it out of position.`],
    Controller:[`Its most dangerous effects begin with positioning and ${status}; breaking that setup weakens everything that follows.`,`It repeatedly steers targets toward the same zones, revealing where its control is strongest.`,`It values arrangement over damage; unpredictable movement can make it waste actions rebuilding the battlefield.`],
    Spellcaster:[`Concentrated ${primary} energy gathers before its strongest effects, giving attentive heroes a clear warning.`,`Its casting rhythm is visible: acquire sight line, gather power, release. Pressure between those steps is especially disruptive.`,`It prefers stable distance and clean vision; smoke, cover, forced movement, or close pressure spoil its ideal sequence.`],
    Assassin:[`It becomes most dangerous once a target is isolated or suffering ${status}; before then it watches more than it attacks.`,`Its attention fixes on one vulnerable target at a time, making its intended victim readable to anyone watching carefully.`,`It avoids fair exchanges. Denying isolation or forcing it into sustained contact removes much of its advantage.`],
    Support:[`Its real threat is the efficiency it gives nearby allies; separation sharply lowers its impact.`,`It keeps scanning the entire conflict instead of focusing on one opponent, revealing that its priorities are coordination and rescue.`,`When forced to defend itself repeatedly, its allies immediately become less effective.`],
  }

  const hooks:Record<MonsterTheme,string[]>={
    Wild:['Its altered territory suggests something larger has displaced it from its normal range.','A distinctive scar or embedded relic fragment hints that someone has hunted, trained, or experimented on it before.','Its prey remains contain something that should not exist in this region, pointing toward a wider ecological problem.'],
    Infernal:['Its presence may be the symptom of a bargain, atrocity, or sealed breach rather than an isolated attack.','The demon seems bound by a rule it hates, and learning that rule could matter more than defeating it.','Its trophies correspond to local disappearances in a pattern that reveals what emotion or promise it is collecting.'],
    Arcane:['The same magical pattern across its body appears on nearby ruins, turning the creature into a clue as well as a threat.','Its unstable form may be a living side effect of a relic experiment whose source still operates nearby.','A repeating glyph in its aura matches a forgotten map, laboratory mark, or crystal inscription.'],
    Industrial:['A damaged identification plate or repeating transmission can reveal who built it and what objective it still follows.','Its route forms part of an old logistical network that may lead to a sealed facility.','One component has been replaced with technology from a different nation or era, implying recent interference.'],
    Floral:['Its growth may be feeding on a buried relic, corpse, crystal vein, or contaminated water source.','Cuttings from it react to a nearby location, suggesting the whole colony shares one hidden root-heart.','The plant is not invading randomly; its spread traces the outline of something buried beneath the area.'],
    Spectral:['Objects nearby replay fragments of its final memories, offering another way to understand what keeps it from resting.','The haunting becomes calmer around one seemingly mundane item the dead clearly recognised in life.','Several ghosts in the region repeat different parts of the same event, allowing the truth to be reconstructed.'],
    Draconic:['Its territory contains something it values: a nesting site, relic cache, mineral seam, oath-bound ruin, or object it considers part of its hoard.','Its hoard contains items chosen for personal meaning rather than price, hinting at an unexpected history.','Old territorial marks show another draconic creature once claimed the same place and may return.'],
    Aquatic:['Unusual tides, missing animals, flooded passages, or pressure damage foreshadow it long before the encounter.','Debris lodged in its territory comes from a wreck or structure no local map records.','Its migration follows an underground water route that may provide access to otherwise unreachable ruins.'],
  }

  const sizeTone=monster.attributes.mig>=12?'massive and powerfully built':monster.attributes.mig>=10?'broad, heavy, or visibly strong':monster.attributes.dex>=10?'lean, quick, and tightly coiled':'compact and deceptively ordinary at first glance'
  const body=pick(bodyPlans[monster.species])
  const surface=pick(surfaces[theme])
  const movement=pick(locomotion[style])
  const mind=pick(minds[monster.species])
  const motive=pick(motives[monster.species])
  const sociality=pick(social[monster.species])
  const sustenance=pick(feeding[monster.species])
  const sensory=pick(sensePools[theme])
  const territorySigns=shuffled(signs[theme]).slice(0,2).join(' and ')
  const quirk=pick(quirks[theme])
  const tell=pick(tells[style])
  const hook=pick(hooks[theme])
  const habitat=theme==='Infernal'?'ruined furnaces, volcanic scars, cursed battlefields, and places saturated by destructive magic':theme==='Arcane'?'relic vaults, abandoned observatories, crystal ruins, and regions distorted by unstable magic':theme==='Industrial'?'foundries, military facilities, buried machine halls, rail works, and relic-industrial sites':theme==='Floral'?'overgrown ruins, deep gardens, humid forests, sinkholes, and places reclaimed by aggressive vegetation':theme==='Spectral'?'crypts, memorial grounds, abandoned settlements, old battlefields, and locations burdened by unresolved death':theme==='Draconic'?'high ridges, cavern systems, ruined keeps, mineral-rich badlands, and commanding territory':theme==='Aquatic'?'flooded ruins, black reefs, rivers, cisterns, sea caves, and low places where water gathers':'forests, scrub, mountain paths, old hunting grounds, and the wild margins beyond settled roads'

  return [
    `Description: ${capital(theme)} ${monster.species.toLowerCase()}, ${rankTone}. ${profile.flavour}`,
    `Appearance: ${capital(sizeTone)}, built as a ${body}, with ${surface}. Its defining traits are ${(monster.traits||[]).slice(0,3).join(', ') || 'unusual and immediately noticeable'}. Signs of ${primary} power show through its body, equipment, or aura, while the strongest nearby sensory impression is ${sensory}.`,
    `Behaviour: It is ${mind} and is currently motivated by ${motive}. ${movement}`,
    `Ecology: It ${sustenance}. Socially, it ${sociality}. This means an encounter with one may imply others, dependants, prey, servants, or infrastructure nearby rather than existing in isolation.`,
    `Habitat & signs: Most often found around ${habitat}. Reliable signs include ${territorySigns}.`,
    `Quirk: It ${quirk}. This detail has no required combat effect, but gives the GM a memorable behavioural tell to repeat before and during the encounter.`,
    `Combat read: ${tell}`,
    `GM hook: ${hook}`,
  ]
}
'''

text = text[:start] + replacement + text[end:]

text = text.replace("'Description: ','Appearance: ','Behaviour: ','Habitat & signs: ','Combat read: ','GM hook: '", "'Description: ','Appearance: ','Behaviour: ','Ecology: ','Habitat & signs: ','Quirk: ','Combat read: ','GM hook: '")
p.write_text(text)
