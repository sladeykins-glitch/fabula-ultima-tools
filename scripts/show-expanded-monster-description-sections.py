from pathlib import Path

p = Path('src/App.tsx')
text = p.read_text()
text = text.replace("/^(Description:|Appearance:|Behaviour:|Habitat & signs:|Combat read:|GM hook:)/", "/^(Description:|Appearance:|Behaviour:|Ecology:|Habitat & signs:|Quirk:|Combat read:|GM hook:)/")
p.write_text(text)
