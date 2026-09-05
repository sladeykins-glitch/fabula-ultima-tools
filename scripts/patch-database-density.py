from pathlib import Path

p=Path('src/App.tsx'); s=p.read_text()
s=s.replace('Aestra region<select value={nation}', 'Aestra region<select data-aestra-region-select value={nation}', 1)
s=s.replace('<label>Region<select value={nation}', '<label>Region<select data-aestra-region-select value={nation}', 1)
p.write_text(s)

p=Path('src/AestraRegionalTheme.tsx'); s=p.read_text()
s=s.replace("const select = element?.closest('select') as HTMLSelectElement | null", "const select = element?.closest('select[data-aestra-region-select]') as HTMLSelectElement | null")
s=s.replace("const candidates = Array.from(document.querySelectorAll('select')) as HTMLSelectElement[]", "const candidates = Array.from(document.querySelectorAll('select[data-aestra-region-select]')) as HTMLSelectElement[]")
p.write_text(s)

p=Path('src/styles.css'); s=p.read_text()
anchor='main > section:has(.databaseSummary) .card { content-visibility: auto; contain-intrinsic-size: auto 560px; contain: layout paint style; }'
insert='''main > section:has(.databaseSummary) .card { content-visibility: auto; contain-intrinsic-size: auto 420px; contain: layout paint style; }\n/* Database browsing stays compact; opening a record or using the generator keeps the full archive/stat-block presentation. */\n.monsterCard[data-db-record-kind="monster"] .tacticsBox,\n.monsterCard[data-db-record-kind="monster"] .combatHeading,\n.monsterCard[data-db-record-kind="monster"] .attack,\n.monsterCard[data-db-record-kind="monster"] .skillList,\n.monsterCard[data-db-record-kind="monster"] .spellList,\n.monsterCard[data-db-record-kind="monster"] .monsterLore { display:none; }\n.monsterCard[data-db-record-kind="monster"] h3 { display:none; }\n.monsterCard[data-db-record-kind="monster"] .monsterVitals { grid-template-columns:repeat(6,minmax(0,1fr)); margin-bottom:8px; }\n.monsterCard[data-db-record-kind="monster"] .vital { min-height:54px; }\n.monsterCard[data-db-record-kind="monster"] .vital strong { font-size:1.12rem; }\n.monsterCard[data-db-record-kind="monster"] .monsterAttributes { margin:6px 0 8px; }\n.monsterCard[data-db-record-kind="monster"] .monsterTraits { margin:7px 0 9px; padding:7px 9px; }\n.monsterCard[data-db-record-kind="monster"] .affinityGrid { margin-bottom:0; }\n.itemCard[data-db-record-kind="item"] .materialArchive,\n.itemCard[data-db-record-kind="item"] .itemProvenance,\n.itemCard[data-db-record-kind="item"] .itemRules { display:none; }\n.itemCard[data-db-record-kind="item"] .itemEffect { margin-bottom:0; }\n.itemCard[data-db-record-kind="item"] .itemVitals { margin:8px 0 9px; }\n.itemCard[data-db-record-kind="item"] .itemQuality { margin:8px 0; }'''
if anchor not in s: raise SystemExit('database card anchor missing')
s=s.replace(anchor,insert,1)
mobile='''  .cardTitle { flex-wrap: wrap; }'''
replacement='''  .cardTitle { flex-wrap: wrap; }\n  .monsterCard[data-db-record-kind="monster"] .monsterVitals { grid-template-columns:repeat(3,minmax(0,1fr)); }'''
if mobile not in s: raise SystemExit('mobile anchor missing')
s=s.replace(mobile,replacement,1)
p.write_text(s)
