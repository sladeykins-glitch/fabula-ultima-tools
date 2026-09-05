from pathlib import Path

path = Path('src/App.tsx')
text = path.read_text()

old = "type ArtPromptPreset = 'Aestra Bestiary' | 'JRPG Concept Art' | 'Dark Fantasy' | 'Painterly Bestiary' | 'Grotesque Horror' | 'Retro-Fantasy Sci-Fi'\ntype ArtPromptMode = 'Short' | 'Full' | 'Variant' | 'Permutation'\ntype ArtPromptFraming = 'Portrait' | 'Full Body' | 'Battle Scene'\n\nconst artPromptPresets: ArtPromptPreset[] = ['Aestra Bestiary','JRPG Concept Art','Dark Fantasy','Painterly Bestiary','Grotesque Horror','Retro-Fantasy Sci-Fi']"
new = "type ArtPromptPreset = 'Aestra Ghibli Abyss'\ntype ArtPromptMode = 'Short' | 'Full' | 'Variant' | 'Permutation'\ntype ArtPromptFraming = 'Portrait' | 'Full Body' | 'Battle Scene'\n\nconst artPromptPresets: ArtPromptPreset[] = ['Aestra Ghibli Abyss']"
if old not in text:
    raise SystemExit('Art prompt type block not found')
text = text.replace(old, new, 1)

start = text.index('function artPresetText(preset: ArtPromptPreset) {')
end = text.index('\n}\n\nfunction artFramingText', start) + 2
replacement = '''function artPresetText(_preset: ArtPromptPreset) {
  return 'Studio Ghibli-inspired and Made in Abyss-inspired fantasy creature concept art, hand-painted anime aesthetic, whimsical yet eerie, beautiful but dangerous natural world, lush environmental storytelling, soft painterly backgrounds, expressive silhouette, rounded organic shapes contrasted with strange relic technology, delicate linework, atmospheric depth, adventurous melancholy, mysterious ancient ecology, charming at first glance but unsettling in the details'
}'''
text = text[:start] + replacement + text[end:]

text = text.replace("const [artPreset,setArtPreset] = useState<ArtPromptPreset>('Aestra Bestiary')", "const [artPreset,setArtPreset] = useState<ArtPromptPreset>('Aestra Ghibli Abyss')", 1)

old_finish = "const finish = `highly detailed, strong silhouette, coherent anatomy, polished concept art, no text, no labels --ar ${ratio}`"
new_finish = "const finish = `cinematic hand-painted anime illustration, tactile natural textures, restrained detail, expressive creature acting, storybook beauty mixed with abyssal unease, strong readable silhouette, coherent anatomy, no text, no labels --ar ${ratio}`"
if old_finish not in text:
    raise SystemExit('Finish block not found')
text = text.replace(old_finish, new_finish, 1)

old_ui = '''<div className=\"monsterArtPromptControls\"><label><span>Style</span><select className=\"compactSelect\" value={artPreset} onChange={e=>setArtPreset(e.target.value as ArtPromptPreset)}>{artPromptPresets.map(option=><option key={option}>{option}</option>)}</select></label><label><span>Mode</span><select className=\"compactSelect\" value={artMode} onChange={e=>setArtMode(e.target.value as ArtPromptMode)}>{artPromptModes.map(option=><option key={option}>{option}</option>)}</select></label><label><span>Framing</span><select className=\"compactSelect\" value={artFraming} onChange={e=>setArtFraming(e.target.value as ArtPromptFraming)}>{artPromptFramings.map(option=><option key={option}>{option}</option>)}</select></label></div>'''
new_ui = '''<div className=\"monsterArtPromptControls\"><label><span>Global art style</span><select className=\"compactSelect\" value={artPreset} onChange={e=>setArtPreset(e.target.value as ArtPromptPreset)} disabled>{artPromptPresets.map(option=><option key={option}>{option}</option>)}</select></label><label><span>Mode</span><select className=\"compactSelect\" value={artMode} onChange={e=>setArtMode(e.target.value as ArtPromptMode)}>{artPromptModes.map(option=><option key={option}>{option}</option>)}</select></label><label><span>Framing</span><select className=\"compactSelect\" value={artFraming} onChange={e=>setArtFraming(e.target.value as ArtPromptFraming)}>{artPromptFramings.map(option=><option key={option}>{option}</option>)}</select></label></div>'''
if old_ui not in text:
    raise SystemExit('Artwork prompt controls not found')
text = text.replace(old_ui, new_ui, 1)

old_hint = "Built from this monster’s appearance, behaviour, ecology, habitat, traits and Aestra regional identity. Paste it into Midjourney and add your own <code>--sref</code> or reference image when desired."
new_hint = "Every monster uses the same Studio Ghibli-inspired / Made in Abyss-inspired Aestra art direction for visual consistency. The prompt then layers this creature’s appearance, behaviour, ecology, habitat, traits and regional identity on top."
if old_hint not in text:
    raise SystemExit('Artwork prompt hint not found')
text = text.replace(old_hint, new_hint, 1)

path.write_text(text)
print('Applied global Ghibli / Made in Abyss art direction')
