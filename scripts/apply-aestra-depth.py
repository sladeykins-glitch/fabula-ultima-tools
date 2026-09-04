from pathlib import Path
p=Path('src/App.tsx')
s=p.read_text()
s=s.replace("import { aestraNations, aestraOrigins, applyAestraMonsterIdentity, AestraInfluence, AestraNation, AestraOrigin } from './aestra'", "import { aestraNations, aestraOrigins, applyAestraMonsterIdentity, AestraInfluence, AestraNation, AestraOrigin, valdoriaDepths, ValdoriaDepth } from './aestra'")
s=s.replace("influence:'Stable' as AestraInfluence}),[])", "influence:'Stable' as AestraInfluence,depth:'Market' as ValdoriaDepth}),[])")
s=s.replace("[influence,setInfluence]=useState<AestraInfluence>(initial.influence||'Stable'),[result,setResult]", "[influence,setInfluence]=useState<AestraInfluence>(initial.influence||'Stable'),[depth,setDepth]=useState<ValdoriaDepth>(initial.depth||'Market'),[result,setResult]")
s=s.replace("{level,rank,soldierEquivalent,sp,complexity,combatStyle,theme,powerIntent,inspiration,setting,nation,origin,influence})),[level,rank,soldierEquivalent,sp,complexity,combatStyle,theme,powerIntent,inspiration,setting,nation,origin,influence])", "{level,rank,soldierEquivalent,sp,complexity,combatStyle,theme,powerIntent,inspiration,setting,nation,origin,influence,depth})),[level,rank,soldierEquivalent,sp,complexity,combatStyle,theme,powerIntent,inspiration,setting,nation,origin,influence,depth])")
s=s.replace("applyAestraMonsterIdentity(monster,nation,origin,influence)", "applyAestraMonsterIdentity(monster,nation,origin,influence,depth)")
needle="<label>Crystal influence<select value={influence} onChange={e=>setInfluence(e.target.value as AestraInfluence)}><option>Stable</option><option>Fading</option><option>Crystal-Starved</option><option>Overcharged</option><option>Corrupted</option></select></label>"
insert=needle+"{nation==='Valdoria'&&<><label>Valdoria depth<select value={depth} onChange={e=>setDepth(e.target.value as ValdoriaDepth)}>{valdoriaDepths.map(d=><option key={d}>{d}</option>)}</select></label><p className=\"muted smallText\">Depth changes the actual combat design: Market threats are opportunistic, Lower City threats use cramped-terrain pressure, Deep Below interferes with crystal power, and Buried / Ancient threats use stranger Lost Era-style functions.</p></>}"
if needle not in s: raise SystemExit('crystal influence control not found')
s=s.replace(needle,insert,1)
p.write_text(s)
