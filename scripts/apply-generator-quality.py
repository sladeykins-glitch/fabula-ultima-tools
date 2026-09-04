from pathlib import Path
p=Path('src/App.tsx')
s=p.read_text()
anchor="import { applyAestraNationItemIdentity, applyAestraWildItemIdentity } from './aestraItems'"
if "from './generatorQuality'" not in s:
    if anchor not in s: raise SystemExit('quality import anchor missing')
    s=s.replace(anchor,anchor+"\nimport { itemQualitySummary, monsterQualitySummary } from './generatorQuality'")
monster_old='<div className="subpanel"><span className="source">Coherence summary</span><p className="note">{monsterCoherenceSummary(result)}</p></div>'
monster_new=monster_old+'<div className="subpanel"><span className="source">Quality check</span><p className="note">{monsterQualitySummary(result)}</p></div>'
if monster_old not in s: raise SystemExit('monster quality needle missing')
s=s.replace(monster_old,monster_new,1)
item_old='<div className="subpanel"><span className="source">Coherence summary</span><p className="note">{itemCoherenceSummary(result)}</p></div>'
item_new=item_old+'<div className="subpanel"><span className="source">Quality check</span><p className="note">{itemQualitySummary(result)}</p></div>'
if item_old not in s: raise SystemExit('item quality needle missing')
s=s.replace(item_old,item_new,1)
p.write_text(s)
