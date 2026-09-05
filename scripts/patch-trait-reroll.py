from pathlib import Path

# Add a trait-only Aestra refresh helper so rerolling traits never renames the monster.
p = Path('src/aestra.ts')
s = p.read_text()
anchor = "export function refreshAestraAffinities(monster:Monster,nation:AestraNation,influence:AestraInfluence='Stable',depth:ValdoriaDepth='Market'):Monster {"
helper = """export function refreshAestraMonsterTraits(monster:Monster,nation:AestraNation):Monster {\n  const p=aestraNations[nation], motif=pick(p.motifs)\n  const nationalMotifs=new Set(Object.values(aestraNations).flatMap(profile=>profile.motifs))\n  return {...monster,traits:[motif,...(monster.traits||[]).filter(t=>!nationalMotifs.has(t))].slice(0,4)}\n}\n\n"""
if 'export function refreshAestraMonsterTraits' not in s:
    if anchor not in s:
        raise SystemExit('aestra affinity helper anchor missing')
    s = s.replace(anchor, helper + anchor, 1)
p.write_text(s)

# Wire the helper into targeted rerolls and expose Traits in the UI.
p = Path('src/App.tsx')
s = p.read_text()
old_import = 'refreshAestraAffinities, refreshAestraMonsterLabel, AestraInfluence'
new_import = 'refreshAestraAffinities, refreshAestraMonsterLabel, refreshAestraMonsterTraits, AestraInfluence'
if old_import not in s and new_import not in s:
    raise SystemExit('Aestra import anchor missing')
s = s.replace(old_import, new_import, 1)
old_logic = "if(setting==='Aestra'&&(part==='name'||part==='theme'||part==='traits')&&nation!=='Aestra')next=refreshAestraMonsterLabel(next,nation);if(setting==='Aestra'&&part==='traits'&&nation==='Aestra')next=refreshAestraWildTraits(next,environment);"
new_logic = "if(setting==='Aestra'&&(part==='name'||part==='theme')&&nation!=='Aestra')next=refreshAestraMonsterLabel(next,nation);if(setting==='Aestra'&&part==='traits')next=nation==='Aestra'?refreshAestraWildTraits(next,environment):refreshAestraMonsterTraits(next,nation);"
if old_logic not in s and new_logic not in s:
    raise SystemExit('monster reroll logic anchor missing')
s = s.replace(old_logic, new_logic, 1)

name_button = "<button onClick={()=>reroll('name')}>Name</button>"
traits_button = "<button onClick={()=>reroll('traits')}>Traits</button>"
if traits_button not in s:
    if name_button not in s:
        raise SystemExit('monster reroll button anchor missing')
    s = s.replace(name_button, name_button + traits_button, 1)
p.write_text(s)
