from pathlib import Path

app_path = Path('src/App.tsx')
css_path = Path('src/styles.css')
app = app_path.read_text()
css = css_path.read_text()

if 'type ArtPromptPreset =' not in app:
    helper = r'''
type ArtPromptPreset = 'Aestra Bestiary' | 'JRPG Concept Art' | 'Dark Fantasy' | 'Painterly Bestiary' | 'Grotesque Horror' | 'Retro-Fantasy Sci-Fi'
type ArtPromptMode = 'Short' | 'Full' | 'Variant' | 'Permutation'
type ArtPromptFraming = 'Portrait' | 'Full Body' | 'Battle Scene'

const artPromptPresets: ArtPromptPreset[] = ['Aestra Bestiary','JRPG Concept Art','Dark Fantasy','Painterly Bestiary','Grotesque Horror','Retro-Fantasy Sci-Fi']
const artPromptModes: ArtPromptMode[] = ['Short','Full','Variant','Permutation']
const artPromptFramings: ArtPromptFraming[] = ['Portrait','Full Body','Battle Scene']

function monsterPromptNote(monster: Monster, prefix: string) {
  const note = (monster.notes || []).find(value => value.startsWith(prefix))
  return note ? note.slice(prefix.length).trim() : ''
}

function monsterPromptTheme(monster: Monster) {
  const note = (monster.notes || []).find(value => value.startsWith('Theme: '))
  return note?.match(/^Theme:\s*([^.]+)/)?.[1] || 'Wild'
}

function promptSentence(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''
  return trimmed.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() || trimmed
}

function monsterPromptDamage(monster: Monster) {
  const gimmick = (monster.notes || []).find(value => value.startsWith('Core gimmick: ')) || ''
  const match = gimmick.match(/^Core gimmick:\s*([A-Za-z]+)\s+damage/i)
  return match?.[1]?.toLowerCase() || monster.attacks?.[0]?.damageType || 'elemental'
}

function monsterAestraArtDirection(monster: Monster) {
  const text = (monster.notes || []).join(' ').toLowerCase()
  if (text.includes('garlond')) return 'Aestra setting, Garlond Empire visual language, cold steel, frost-blue relic light, brutalist magitek, soot, smokestacks and severe military engineering'
  if (text.includes('rübenberg') || text.includes('rubenberg')) return 'Aestra setting, Rübenberg visual language, weathered brass, turquoise wind-energy, Nordic craft, turbines and old royal engineering'
  if (text.includes('palmeria')) return 'Aestra setting, Palmerian visual language, warm imperial gold, aether-blue scholarly details, tropical light, classical forms fused with relic science'
  if (text.includes('valdoria') || text.includes('valdora')) return 'Aestra setting, Valdorian visual language, rusted copper, subterranean greens, layered salvage, dense sinkhole-city relic culture'
  if (text.includes('aestra') || text.includes('environment:') || text.includes('exposure:')) return 'Aestra setting, reclaimed eco-apocalyptic fantasy, ancient relic technology swallowed by aggressive nature, green-teal crystal traces and ruined-world atmosphere'
  return ''
}

function artPresetText(preset: ArtPromptPreset) {
  switch (preset) {
    case 'Aestra Bestiary': return 'Aestra bestiary concept art, grim eco-apocalyptic JRPG fantasy, ancient relic technology, weathered materials, painterly creature design, atmospheric worldbuilding'
    case 'JRPG Concept Art': return 'dark fantasy JRPG concept art, polished creature design, detailed fantasy illustration'
    case 'Dark Fantasy': return 'dark fantasy creature concept art, grim atmosphere, moody lighting, detailed materials'
    case 'Painterly Bestiary': return 'painterly fantasy bestiary illustration, refined brushwork, highly detailed creature painting'
    case 'Grotesque Horror': return 'grotesque horror creature concept art, unsettling anatomy, ominous atmosphere, intricate organic textures'
    case 'Retro-Fantasy Sci-Fi': return 'retro-fantasy science-fiction creature concept art, relic-tech mood, weathered machinery, stylized but detailed design'
  }
}

function artFramingText(framing: ArtPromptFraming) {
  if (framing === 'Portrait') return 'creature portrait, upper-body or bust composition'
  if (framing === 'Battle Scene') return 'dynamic battle scene, cinematic action composition, creature remains visually readable'
  return 'full-body creature design, clean readable silhouette, entire creature visible'
}

function artFramingRatio(framing: ArtPromptFraming) {
  return framing === 'Battle Scene' ? '16:9' : framing === 'Portrait' ? '3:4' : '2:3'
}

function buildMonsterArtPrompt(monster: Monster, preset: ArtPromptPreset, mode: ArtPromptMode, framing: ArtPromptFraming) {
  const theme = monsterPromptTheme(monster)
  const description = monsterPromptNote(monster,'Description: ')
  const appearance = monsterPromptNote(monster,'Appearance: ')
  const behaviour = monsterPromptNote(monster,'Behaviour: ')
  const ecology = monsterPromptNote(monster,'Ecology: ')
  const habitat = monsterPromptNote(monster,'Habitat & signs: ')
  const quirk = monsterPromptNote(monster,'Quirk: ')
  const hook = monsterPromptNote(monster,'GM hook: ')
  const damage = monsterPromptDamage(monster)
  const traits = (monster.traits || []).slice(0,4).join(', ') || 'distinctive monstrous features'
  const style = artPresetText(preset)
  const frame = artFramingText(framing)
  const ratio = artFramingRatio(framing)
  const regional = monsterAestraArtDirection(monster)
  const identity = `${monster.rank.toLowerCase()} ${theme.toLowerCase()} ${monster.species.toLowerCase()}`
  const finish = `highly detailed, strong silhouette, coherent anatomy, polished concept art, no text, no labels --ar ${ratio}`

  if (mode === 'Short') return [style,regional,frame,monster.name,identity,`traits: ${traits}`,promptSentence(appearance),`visible ${damage} power`,promptSentence(habitat),finish].filter(Boolean).join(', ')
  if (mode === 'Variant') return [style,regional,frame,`monster concept art of ${monster.name}`,identity,description,appearance,`behaviour: ${promptSentence(behaviour)}`,`ecology: ${promptSentence(ecology)}`,`memorable detail: ${promptSentence(quirk || hook)}`,`visible ${damage} energy`,finish].filter(Boolean).join(', ')
  if (mode === 'Permutation') return [style,regional,`${monster.name}, ${identity}`,'{full-body bestiary portrait, dramatic three-quarter pose, atmospheric environment portrait, dynamic battle-ready stance}',`traits: ${traits}`,promptSentence(appearance),`visible ${damage} power`,promptSentence(habitat),finish].filter(Boolean).join(', ')
  return [style,regional,frame,`bestiary illustration of ${monster.name}`,`${identity}, level ${monster.level}`,description,appearance,`behaviour: ${behaviour}`,`habitat: ${habitat}`,ecology?`ecology: ${ecology}`:'',quirk?`quirk: ${quirk}`:'',hook?`storytelling clue: ${hook}`:'',`show defining traits: ${traits}`,`clear visual manifestation of ${damage} power`,finish].filter(Boolean).join(', ')
}

'''
    marker = '\nfunction MonsterCard('
    if marker not in app:
        raise SystemExit('MonsterCard marker not found')
    app = app.replace(marker, '\n' + helper + 'function MonsterCard(', 1)

state_anchor = "  const isAestraRecord = notes.some(note => /^(Aestra|Crystal influence:|Regional design:|Origin mechanics:|Valdoria depth:|Environment:|Exposure:)/.test(note))\n"
if 'const [artPreset,setArtPreset]' not in app:
    state_block = state_anchor + "  const [artPreset,setArtPreset] = useState<ArtPromptPreset>('Aestra Bestiary'), [artMode,setArtMode] = useState<ArtPromptMode>('Full'), [artFraming,setArtFraming] = useState<ArtPromptFraming>('Full Body'), [artCopied,setArtCopied] = useState('')\n  const artPrompt = buildMonsterArtPrompt(monster,artPreset,artMode,artFraming)\n  const copyArtPrompt = async (mode:ArtPromptMode=artMode) => {\n    const text=buildMonsterArtPrompt(monster,artPreset,mode,artFraming)\n    try { await navigator.clipboard?.writeText(text); setArtCopied(`Copied ${mode.toLowerCase()} prompt`); window.setTimeout(()=>setArtCopied(''),1400) } catch { setArtCopied('Copy failed — select the prompt text manually'); window.setTimeout(()=>setArtCopied(''),2200) }\n  }\n"
    if state_anchor not in app:
        raise SystemExit('MonsterCard state anchor not found')
    app = app.replace(state_anchor,state_block,1)

panel_anchor = '    {descriptionNotes.length > 0 && <details className="monsterDescription" open={!database}><summary>Field description</summary><div className="monsterDescriptionBody">{descriptionNotes.map((note,i)=>{const split=note.indexOf(\':\');return <p key={i}><strong>{note.slice(0,split)}</strong><span>{note.slice(split+1).trim()}</span></p>})}</div></details>}\n'
if 'className="monsterArtPrompt"' not in app:
    panel = panel_anchor + r'''    {!database && <details className="monsterArtPrompt" open><summary>Artwork prompt <small>Midjourney-ready</small></summary><div className="monsterArtPromptBody">
      <div className="monsterArtPromptControls"><label><span>Style</span><select className="compactSelect" value={artPreset} onChange={e=>setArtPreset(e.target.value as ArtPromptPreset)}>{artPromptPresets.map(option=><option key={option}>{option}</option>)}</select></label><label><span>Mode</span><select className="compactSelect" value={artMode} onChange={e=>setArtMode(e.target.value as ArtPromptMode)}>{artPromptModes.map(option=><option key={option}>{option}</option>)}</select></label><label><span>Framing</span><select className="compactSelect" value={artFraming} onChange={e=>setArtFraming(e.target.value as ArtPromptFraming)}>{artPromptFramings.map(option=><option key={option}>{option}</option>)}</select></label></div>
      <textarea className="monsterArtPromptPreview" readOnly value={artPrompt} rows={8} onFocus={e=>e.currentTarget.select()} aria-label="Generated artwork prompt" />
      <div className="monsterArtPromptActions"><button type="button" className="primary" onClick={()=>void copyArtPrompt()}>Copy current prompt</button><button type="button" onClick={()=>void copyArtPrompt('Short')}>Short</button><button type="button" onClick={()=>void copyArtPrompt('Full')}>Full</button><button type="button" onClick={()=>void copyArtPrompt('Variant')}>Variant</button><button type="button" onClick={()=>void copyArtPrompt('Permutation')}>Permutation</button>{artCopied && <span className="artPromptStatus" role="status">{artCopied}</span>}</div>
      <p className="monsterArtPromptHint">Built from this monster’s appearance, behaviour, ecology, habitat, traits and Aestra regional identity. Paste it into Midjourney and add your own <code>--sref</code> or reference image when desired.</p>
    </div></details>}
'''
    if panel_anchor not in app:
        raise SystemExit('Monster description panel anchor not found')
    app = app.replace(panel_anchor,panel,1)

if '.monsterArtPrompt{' not in css:
    css += r'''

/* Monster artwork prompt */
.monsterArtPrompt{margin:10px 0 12px;border:1px solid rgba(109,203,193,.3);border-radius:10px;background:linear-gradient(180deg,rgba(24,48,49,.55),rgba(9,20,24,.45));overflow:hidden}
.monsterArtPrompt>summary{cursor:pointer;padding:10px 12px;font-weight:800;letter-spacing:.045em;text-transform:uppercase;font-size:.77rem;color:#b7e1da;display:flex;align-items:center;gap:8px}
.monsterArtPrompt>summary small{font-size:.62rem;letter-spacing:.06em;font-weight:700;opacity:.65;text-transform:uppercase}
.monsterArtPromptBody{padding:0 11px 11px}
.monsterArtPromptControls{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-bottom:9px}
.monsterArtPromptControls label{display:grid;gap:4px;min-width:0}
.monsterArtPromptControls label>span{font-size:.67rem;text-transform:uppercase;letter-spacing:.06em;opacity:.72;font-weight:700}
.monsterArtPromptControls select{width:100%;min-width:0}
.monsterArtPromptPreview{box-sizing:border-box;width:100%;min-height:142px;border:1px solid rgba(159,215,207,.22);border-radius:8px;background:rgba(3,10,12,.55);color:inherit;padding:10px 11px;resize:vertical;line-height:1.48;font:inherit;font-size:.82rem}
.monsterArtPromptPreview:focus{outline:1px solid rgba(159,215,207,.7);border-color:rgba(159,215,207,.65)}
.monsterArtPromptActions{display:flex;align-items:center;flex-wrap:wrap;gap:7px;margin-top:9px}
.monsterArtPromptActions button{font-size:.75rem;padding:6px 9px}
.monsterArtPromptActions .primary{border-color:rgba(159,215,207,.5);background:rgba(57,116,111,.26)}
.artPromptStatus{font-size:.75rem;color:#b9e5d9;font-weight:700}
.monsterArtPromptHint{margin:9px 1px 0;font-size:.73rem;line-height:1.45;opacity:.68}
.monsterArtPromptHint code{font-size:.72rem}
@media(max-width:760px){.monsterArtPromptControls{grid-template-columns:1fr}.monsterArtPromptActions button{flex:1 1 auto}.monsterArtPromptPreview{min-height:185px}}
'''

app_path.write_text(app)
css_path.write_text(css)
print('Patched monster artwork prompt generator')
