from pathlib import Path
scope={'__name__':'__main__'}
exec(Path('scripts/apply-generator-evolution.py').read_text(),scope)
p=Path('src/App.tsx')
s=p.read_text().replace("\\'", "'")
p.write_text(s)
print('Normalized JSX quoting')