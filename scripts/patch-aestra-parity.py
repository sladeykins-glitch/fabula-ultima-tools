from pathlib import Path

# 1) Export crystal influence so wild Aestra monsters can use the same bounded layer.
p=Path('src/aestra.ts')
s=p.read_text()
s=s.replace('function applyCrystalMechanics(monster:Monster,influence:AestraInfluence):Monster {','export function applyAestraCrystalInfluence(monster:Monster,influence:AestraInfluence):Monster {')
s=s.replace('applyCrystalMechanics(transformed,influence)','applyAestraCrystalInfluence(transformed,influence)')
p.write_text(s)

# 2) Preserve the regional item effect when crystal influence is appended, and allow wild items to use crystal influence too.
p=Path('src/aestraItems.ts')
s=p.read_text()
s=s.replace("  const clean=baseEffect(item)\n  return {...item,effect:`${clean} ${extra[influence]}`.trim(),breakdown:[...(item.breakdown||[]).filter(x=>!x.startsWith('Crystal influence: ')),`Crystal influence: ${influence}.`]}\n", "  const clean=(item.effect||'').trim()\n  return {...item,effect:`${clean} ${extra[influence]}`.trim(),breakdown:[...(item.breakdown||[]).filter(x=>!x.startsWith('Crystal influence: ')),`Crystal influence: ${influence}.`]}\n")
s=s.replace('export function applyAestraWildItemIdentity(item:AestraItem,environment:AestraEnvironment,exposure:AestraExposure,origin:AestraWildOrigin):AestraItem {','export function applyAestraWildItemIdentity(item:AestraItem,environment:AestraEnvironment,exposure:AestraExposure,origin:AestraWildOrigin,influence:AestraInfluence=\'Stable\'):AestraItem {')
s=s.replace("  return {...transformed,breakdown:[...(transformed.breakdown||[]),`Exposure: ${exposure} — ${exposureText[exposure]}`,`Wild origin: ${origin} — ${originText[origin]}`]}\n}\n", "  transformed={...transformed,breakdown:[...(transformed.breakdown||[]),`Exposure: ${exposure} — ${exposureText[exposure]}`,`Wild origin: ${origin} — ${originText[origin]}`]}\n  return influenceEffect(transformed,influence)\n}\n")
p.write_text(s)

# 3) Wire the shared crystal layer into wild monster/item generation and expose the selector in wild monster UI.
p=Path('src/App.tsx')
s=p.read_text()
s=s.replace("import { aestraNations, aestraOrigins, applyAestraMonsterIdentity, aestraGenerationHint, refreshAestraAffinities, refreshAestraMonsterLabel, AestraInfluence, AestraNation, AestraOrigin, valdoriaDepths, ValdoriaDepth } from './aestra'", "import { aestraNations, aestraOrigins, applyAestraMonsterIdentity, applyAestraCrystalInfluence, aestraGenerationHint, refreshAestraAffinities, refreshAestraMonsterLabel, AestraInfluence, AestraNation, AestraOrigin, valdoriaDepths, ValdoriaDepth } from './aestra'")
s=s.replace("nation==='Aestra'?applyAestraWildIdentity(monster,environment,exposure,wildOrigin):applyAestraMonsterIdentity(monster,nation,origin,influence,depth)", "nation==='Aestra'?applyAestraCrystalInfluence(applyAestraWildIdentity(monster,environment,exposure,wildOrigin),influence):applyAestraMonsterIdentity(monster,nation,origin,influence,depth)")
s=s.replace("applyAestraWildItemIdentity(item,environment,exposure,wildOrigin):applyAestraNationItemIdentity(item,nation,origin,influence,depth)", "applyAestraWildItemIdentity(item,environment,exposure,wildOrigin,influence):applyAestraNationItemIdentity(item,nation,origin,influence,depth)")
needle='<p className="muted smallText">Exposure controls how poorly understood and unusual the threat is, independently of its level.</p></>'
replacement='<p className="muted smallText">Exposure controls how poorly understood and unusual the threat is, independently of its level.</p><label>Crystal influence<select value={influence} onChange={e=>setInfluence(e.target.value as AestraInfluence)}><option>Stable</option><option>Fading</option><option>Crystal-Starved</option><option>Overcharged</option><option>Corrupted</option></select></label></>'
if needle not in s:
    raise SystemExit('wild monster UI insertion point not found')
s=s.replace(needle,replacement,1)
needle='<p className="muted smallText">Environment controls the item’s local design/ecology. Exposure controls how familiar or poorly understood it is, not its raw price or power.</p></>'
replacement='<p className="muted smallText">Environment controls the item’s local design/ecology. Exposure controls how familiar or poorly understood it is, not its raw price or power.</p><label>Crystal influence<select value={influence} onChange={e=>setInfluence(e.target.value as AestraInfluence)}><option>Stable</option><option>Fading</option><option>Crystal-Starved</option><option>Overcharged</option><option>Corrupted</option></select></label></>'
if needle not in s:
    raise SystemExit('wild item UI insertion point not found')
s=s.replace(needle,replacement,1)
p.write_text(s)
