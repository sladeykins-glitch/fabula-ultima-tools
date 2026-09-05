from pathlib import Path

p = Path('src/monsterThemeEngine.ts')
text = p.read_text()

old = """  const baseNotes=cleanThemeNotes(monster.notes||[])\n  const gimmick=`Core gimmick: ${capital(primary)} damage sets up ${status}; ${style.toLowerCase()} abilities exploit that setup.`\n"""
new = """  const baseNotes=cleanThemeNotes(monster.notes||[])\n  const themedTraits=opts.traits ? unique([...shuffled(p.traits).slice(0,3), ...(monster.traits||[]).slice(0,1)]).slice(0,4) : monster.traits\n  const gimmick=`Core gimmick: ${capital(primary)} damage sets up ${status}; ${style.toLowerCase()} abilities exploit that setup.`\n"""
text = text.replace(old,new)

text = text.replace("traits:opts.traits ? unique([...shuffled(p.traits).slice(0,3), ...(monster.traits||[]).slice(0,1)]).slice(0,4) : monster.traits,","traits:themedTraits,")
text = text.replace("notes:[...detailedMonsterNotes({...monster,traits:opts.traits ? unique([...shuffled(p.traits).slice(0,3), ...(monster.traits||[]).slice(0,1)]).slice(0,4) : monster.traits},theme,p,primary,status),","notes:[...detailedMonsterNotes({...monster,traits:themedTraits},theme,p,primary,status),")

old_trait = """  if(part==='traits') return {...monster,traits:unique(shuffled(profiles[currentTheme].traits).slice(0,2))}\n"""
new_trait = """  if(part==='traits') {\n    const {primary,status}=gimmickFromMonster(monster,currentTheme)\n    const nextTraits=unique(shuffled(profiles[currentTheme].traits).slice(0,2))\n    return finishTheme({...monster,traits:nextTraits},currentTheme,primary,status,{name:false,attacks:false,skills:false,spells:false,traits:false,affinities:false})\n  }\n"""
text = text.replace(old_trait,new_trait)
p.write_text(text)
