from pathlib import Path

engine = Path('src/monsterThemeEngine.ts')
app = Path('src/App.tsx')
styles = Path('src/styles.css')

text = engine.read_text()

marker = "function cleanThemeNotes(notes:string[]) {\n"
insert = r'''function detailedMonsterNotes(monster:Monster, theme:MonsterTheme, profile:ThemeProfile, primary:DamageType, status:string) {
  const style=monster.combatStyle||'Mixed'
  const rankTone=monster.rank==='Champion'?'an apex specimen whose presence dominates the scene':monster.rank==='Elite'?'a dangerous veteran specimen with obvious adaptations':'a representative specimen of its kind'
  const sizeTone=monster.attributes.mig>=12?'massive and powerfully built':monster.attributes.mig>=10?'broad, heavy, or visibly strong':monster.attributes.dex>=10?'lean, quick, and tightly coiled':'compact and deceptively ordinary at first glance'
  const sense=theme==='Infernal'?'heat haze, scorched air, and a faint sulphurous tang':theme==='Arcane'?'a pressure in the air, crawling light, and tiny motes of displaced aether':theme==='Industrial'?'oil, hot metal, ticking relays, and the vibration of an idling engine':theme==='Floral'?'wet soil, crushed leaves, pollen, and the sweet smell of sap':theme==='Spectral'?'a sudden drop in temperature, muffled sound, and the sensation of being watched':theme==='Draconic'?'hot breath, mineral dust, old scales, and the weight of an apex predator':theme==='Aquatic'?'brine, cold spray, slick surfaces, and a deep pressure felt more than heard':'musky fur, churned earth, snapped brush, and the quiet of nearby prey animals'
  const movement=style==='Brute'?'It moves directly and violently, committing its whole weight once it chooses a target.':style==='Defender'?'It constantly places its toughest side toward danger and instinctively interposes itself between threats and whatever it protects.':style==='Controller'?'It circles, probes, and manipulates distance, preferring to make opponents move where it wants before committing.':style==='Spellcaster'?'It keeps deliberate distance, gathering power in visible pulses before releasing it through practiced patterns.':style==='Assassin'?'It rarely stays in the centre of attention; its posture is still until the instant it commits to a precise burst of violence.':style==='Support'?'Its attention is divided across the whole battlefield, repeatedly repositioning to protect, empower, or coordinate nearby allies.':'Its behaviour shifts with the situation, alternating between cautious observation and sudden aggression.'
  const habitat=theme==='Infernal'?'ruined furnaces, volcanic scars, cursed battlefields, and places where destructive magic has soaked into the land':theme==='Arcane'?'relic vaults, abandoned observatories, crystal ruins, and regions distorted by unstable magic':theme==='Industrial'?'foundries, military facilities, buried machine halls, rail works, and other relic-industrial sites':theme==='Floral'?'overgrown ruins, deep gardens, humid forests, sinkholes, and places reclaimed by aggressive vegetation':theme==='Spectral'?'crypts, memorial grounds, abandoned settlements, old battlefields, and locations burdened by unresolved death':theme==='Draconic'?'high ridges, cavern systems, ruined keeps, mineral-rich badlands, and territories that offer commanding sight lines':theme==='Aquatic'?'flooded ruins, black reefs, rivers, cisterns, sea caves, and low places where water gathers':'forests, scrub, mountain paths, old hunting grounds, and the wild margins beyond settled roads'
  const behaviour=monster.species==='Construct'?'It behaves according to an embedded purpose rather than hunger: patrol, guard, pursue, retrieve, or destroy. Damage may make that purpose more rigid rather than less.':monster.species==='Undead'?'It repeats habits from life in distorted form, reacting strongly to symbols, places, or people that touch the memory binding it to the world.':monster.species==='Plant'?'It is patient enough to remain motionless for hours or days, reacting to vibration, heat, magic, or trespass more readily than to sight.':monster.species==='Humanoid'?'It shows planning, fear, pride, and self-preservation. Even when hostile, it can read a room, bargain, retreat, or exploit a social weakness.':monster.species==='Demon'?'It is intelligent in a predatory way and enjoys testing emotional weaknesses before escalating to open violence.':monster.species==='Beast'?'Its aggression is purposeful rather than random: territory, hunger, offspring, injury, or competition usually explains why it attacks.':'Its instincts are coherent even when alien; observation can reveal what it wants, what it fears, and what makes it abandon a fight.'
  const tell=style==='Brute'?`Before its heaviest attacks, its body visibly loads with force; heroes who notice the tell can anticipate where the impact will land.`:style==='Defender'?`It repeatedly turns attacks aside and guards space. Pulling it away from allies or forcing it to choose between two threats weakens its ideal battle plan.`:style==='Controller'?`Its most dangerous effects begin with positioning and ${status}; once that setup is established, it tries to chain control rather than simply trade damage.`:style==='Spellcaster'?`Its strongest effects are telegraphed by concentrated ${primary} energy. Pressure, interruption, or forcing movement can disrupt its preferred rhythm.`:style==='Assassin'?`It becomes most dangerous once a target is isolated or suffering ${status}; it watches for that moment instead of attacking indiscriminately.`:style==='Support'?`Its power is multiplied by allies. Separating it from the group or forcing it to spend turns protecting itself sharply reduces its impact.`:`It tests the party first, then leans into ${primary} damage and ${status} once it finds a weakness.`
  const hook=theme==='Industrial'?'A damaged identification plate, command seal, or repeating transmission may reveal who built it and what objective it is still trying to complete.':theme==='Spectral'?'Objects nearby may replay fragments of its final memories, giving the party a way to learn what keeps it from resting.':theme==='Floral'?'Its growth may be feeding on a buried relic, corpse, crystal vein, or contaminated water source that explains why the local ecosystem has changed.':theme==='Arcane'?'The same magical pattern visible across its body may also appear on nearby ruins, doors, or relics, turning the creature into a clue as well as a threat.':theme==='Infernal'?'Its presence may be the symptom of a bargain, ritual, battlefield atrocity, or sealed breach rather than an isolated monster attack.':theme==='Draconic'?'Its territory likely contains something it values: a nesting site, relic cache, mineral seam, oath-bound ruin, or object it considers part of its hoard.':theme==='Aquatic'?'Unusual tides, missing animals, flooded passages, or pressure-damaged structures can foreshadow it well before the party sees the creature itself.':'Tracks, half-eaten prey, damaged vegetation, territorial markings, and the behaviour of smaller animals can reveal its presence before combat.'
  return [
    `Description: ${capital(theme)} ${monster.species.toLowerCase()}, ${rankTone}. ${profile.flavour}`,
    `Appearance: ${capital(sizeTone)}. Its defining traits are ${(monster.traits||[]).slice(0,3).join(', ') || 'unusual and immediately noticeable'}, with visual signs of ${primary} power worked into its body, equipment, or surrounding aura. Up close, the strongest impression is ${sense}.`,
    `Behaviour: ${behaviour} ${movement}`,
    `Habitat & signs: Most often found around ${habitat}. Signs of its territory include ${sense}.`,
    `Combat read: ${tell}`,
    `GM hook: ${hook}`,
  ]
}

'''
if 'function detailedMonsterNotes(' not in text:
    text = text.replace(marker, insert + marker)

old_clean = "  return notes.filter(note=>!note.startsWith('Theme: ')&&!note.startsWith('Core gimmick: ')&&!note.startsWith('Combat loop: ')&&!note.startsWith('Champion phase: '))"
new_clean = "  return notes.filter(note=>!['Theme: ','Core gimmick: ','Combat loop: ','Champion phase: ','Description: ','Appearance: ','Behaviour: ','Habitat & signs: ','Combat read: ','GM hook: '].some(prefix=>note.startsWith(prefix)))"
text = text.replace(old_clean, new_clean)

old_notes = "    notes:[`Theme: ${theme}. ${p.flavour}`,gimmick,combatLoop,...(phaseNote?[phaseNote]:[]),...baseNotes],"
new_notes = "    notes:[...detailedMonsterNotes({...monster,traits:opts.traits ? unique([...shuffled(p.traits).slice(0,3), ...(monster.traits||[]).slice(0,1)]).slice(0,4) : monster.traits},theme,p,primary,status),`Theme: ${theme}. ${p.flavour}`,gimmick,combatLoop,...(phaseNote?[phaseNote]:[]),...baseNotes],"
text = text.replace(old_notes, new_notes)
engine.write_text(text)

app_text = app.read_text()
old_vars = "  const skills = monster.skills || [], spells = monster.spells || [], notes = monster.notes || [], attacks = monster.attacks || []\n"
new_vars = old_vars + "  const descriptionNotes = notes.filter(note => /^(Description:|Appearance:|Behaviour:|Habitat & signs:|Combat read:|GM hook:)/.test(note))\n"
if 'const descriptionNotes = notes.filter' not in app_text:
    app_text = app_text.replace(old_vars, new_vars)

old_render = "    <div className=\"monsterTraits\"><strong>Traits</strong><span>{(monster.traits || []).join(' · ')}</span></div>\n    <div className=\"affinityBlock\">"
new_render = "    <div className=\"monsterTraits\"><strong>Traits</strong><span>{(monster.traits || []).join(' · ')}</span></div>\n    {descriptionNotes.length > 0 && <details className=\"monsterDescription\" open={!database}><summary>Field description</summary><div className=\"monsterDescriptionBody\">{descriptionNotes.map((note,i)=>{const split=note.indexOf(':');return <p key={i}><strong>{note.slice(0,split)}</strong><span>{note.slice(split+1).trim()}</span></p>})}</div></details>}\n    <div className=\"affinityBlock\">"
if 'className=\"monsterDescription\"' not in app_text:
    app_text = app_text.replace(old_render, new_render)
app.write_text(app_text)

css = styles.read_text()
css_block = r'''

/* Detailed generated monster field descriptions */
.monsterDescription{margin:10px 0 12px;border:1px solid rgba(139,198,190,.24);border-radius:10px;background:rgba(9,20,24,.46);overflow:hidden}
.monsterDescription>summary{cursor:pointer;padding:9px 11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;font-size:.76rem;color:var(--accent,#9fd7cf)}
.monsterDescriptionBody{padding:0 11px 8px;display:grid;gap:7px}
.monsterDescriptionBody p{margin:0;display:grid;grid-template-columns:minmax(92px,auto) 1fr;gap:8px;line-height:1.42}
.monsterDescriptionBody strong{font-size:.76rem;text-transform:uppercase;letter-spacing:.03em;opacity:.82}
.monsterDescriptionBody span{opacity:.94}
@media(max-width:640px){.monsterDescriptionBody p{grid-template-columns:1fr;gap:2px}}
'''
if 'Detailed generated monster field descriptions' not in css:
    styles.write_text(css + css_block)
