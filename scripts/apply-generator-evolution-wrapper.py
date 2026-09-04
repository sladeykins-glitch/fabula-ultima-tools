from pathlib import Path
scope={'__name__':'__main__'}
exec(Path('scripts/apply-generator-evolution.py').read_text(),scope)
p=Path('src/App.tsx')
s=p.read_text().replace("\\'", "'")
s=s.replace("by itself).`]}}})", "by itself).`]}})")
p.write_text(s)
print('Normalized generator migration output')