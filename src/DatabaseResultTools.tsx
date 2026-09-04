import { useEffect } from 'react'

type Kind = 'monster' | 'item'

function kindForSection(section: HTMLElement): Kind | null {
  if (section.querySelector('input[placeholder^="Search monsters"]') || section.querySelector('.monsterCard')) return 'monster'
  if (section.querySelector('input[placeholder^="Search items"]') || section.querySelector('.itemCard')) return 'item'
  return null
}

function visibleResultCards(section: HTMLElement) {
  return Array.from(section.querySelectorAll<HTMLElement>('.monsterCard, .itemCard')).filter(card =>
    !card.classList.contains('dbHiddenByFavorite')
    && !card.classList.contains('dbHiddenByAdvanced')
    && !card.classList.contains('dbHiddenByTaxonomy'))
}

function recordsForSection(section: HTMLElement) {
  const kind = kindForSection(section)
  if (!kind) return { kind: null, records: [] as any[] }
  const key = kind === 'monster' ? 'fu-monsters' : 'fu-items'
  try {
    const all = JSON.parse(localStorage.getItem(key) || '[]')
    const byId = new Map((Array.isArray(all) ? all : []).map((record: any) => [record.id, record]))
    const records = visibleResultCards(section).map(card => byId.get(card.dataset.dbRecordId || '')).filter(Boolean)
    return { kind, records }
  } catch {
    return { kind, records: [] as any[] }
  }
}

function download(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function csvCell(value: unknown) {
  const text = value == null ? '' : String(value)
  return `"${text.replace(/"/g, '""')}"`
}

function toCsv(kind: Kind, records: any[]) {
  if (kind === 'monster') {
    const rows = [['Name','Source','Level','Rank','Species','Style','HP','MP','Initiative','Defense','Magic Defense','Traits','Attacks','Skills','Spells']]
    for (const record of records) rows.push([
      record.name, record.source, record.level, record.rank, record.species, record.combatStyle || 'Mixed', record.hp, record.mp, record.initiative, record.defense, record.magicDefense,
      (record.traits || []).join('; '), (record.attacks || []).map((a:any)=>a.name).join('; '), (record.skills || []).map((s:any)=>s.name).join('; '), (record.spells || []).map((s:any)=>s.name).join('; ')
    ])
    return rows.map(row => row.map(csvCell).join(',')).join('\n')
  }
  const rows = [['Name','Source','Type','Category','Cost','Martial','Range','Handedness','Accuracy','Damage','Damage Type','Defense','Magic Defense','Initiative','Quality','Effect']]
  for (const record of records) rows.push([
    record.name, record.source, record.type, record.category || '', record.cost, record.martial ? 'Yes' : 'No', record.range || '', record.handedness || '', record.accuracy || '', record.damage ?? '', record.damageType || '', record.defense || '', record.magicDefense || '', record.initiative ?? '', record.quality || '', record.effect || ''
  ])
  return rows.map(row => row.map(csvCell).join(',')).join('\n')
}

function toMarkdown(kind: Kind, records: any[]) {
  return records.map(record => {
    if (kind === 'monster') {
      const attacks = (record.attacks || []).map((attack:any) => `- **${attack.name}** - ${attack.formula}; ${attack.damageType}${attack.effect ? `; ${attack.effect}` : ''}`).join('\n')
      const skills = (record.skills || []).map((skill:any) => `- **${skill.name}:** ${skill.summary}`).join('\n')
      const spells = (record.spells || []).map((spell:any) => `- **${spell.name}** (${spell.mp} MP) - ${spell.effect}`).join('\n')
      return `## ${record.name}\n\n${record.source} | Lv ${record.level} ${record.rank} ${record.species}${record.combatStyle ? ` | ${record.combatStyle}` : ''}\n\n**HP** ${record.hp} | **MP** ${record.mp} | **Init** ${record.initiative} | **DEF** ${record.defense} | **M.DEF** ${record.magicDefense}\n\n**Traits:** ${(record.traits || []).join(', ')}${attacks ? `\n\n### Attacks\n${attacks}` : ''}${skills ? `\n\n### Skills\n${skills}` : ''}${spells ? `\n\n### Spells\n${spells}` : ''}`
    }
    return `## ${record.name}\n\n${record.source} | ${record.type}${record.category ? ` | ${record.category}` : ''} | ${record.cost || 0}z${record.martial ? ' | Martial' : ''}\n\n${record.quality ? `**Quality:** ${record.quality}\n\n` : ''}${record.effect || ''}`
  }).join('\n\n---\n\n')
}

export default function DatabaseResultTools() {
  useEffect(() => {
    const apply = () => {
      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        const quick = section.querySelector<HTMLElement>('.dbQuickActions')
        if (!quick || quick.querySelector('[data-db-export-results]')) return
        const controls = [
          ['data-db-export-results','Export JSON','Export all entries matching current search and filters as JSON'],
          ['data-db-export-csv','Export CSV','Export all filtered entries as a spreadsheet-friendly CSV'],
          ['data-db-copy-result-names','Copy names','Copy names of all filtered entries'],
          ['data-db-copy-markdown','Copy Markdown','Copy compact Markdown stat/item references'],
        ] as const
        const hint = quick.querySelector('.dbQuickHint')
        for (const [attr,label,title] of controls) {
          const button = document.createElement('button')
          button.type = 'button'
          button.setAttribute(attr, 'true')
          button.textContent = label
          button.title = title
          quick.insertBefore(button, hint)
        }
      })
    }

    const flash = (button: HTMLButtonElement, text: string) => {
      const original = button.textContent
      button.textContent = text
      window.setTimeout(() => { button.textContent = original }, 1200)
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const button = target.closest<HTMLButtonElement>('[data-db-export-results], [data-db-export-csv], [data-db-copy-result-names], [data-db-copy-markdown]')
      if (!button) return
      const section = button.closest<HTMLElement>('section')
      if (!section) return
      const { kind, records } = recordsForSection(section)
      if (!kind) return
      const stamp = new Date().toISOString().slice(0, 10)

      if (button.hasAttribute('data-db-export-results')) {
        download(`fabula-ultima-${kind}-results-${stamp}.json`, JSON.stringify({ format:'fabula-ultima-tools-filtered-results', version:1, kind, exportedAt:new Date().toISOString(), count:records.length, records }, null, 2), 'application/json')
        flash(button, `Exported ${records.length}`)
        return
      }
      if (button.hasAttribute('data-db-export-csv')) {
        download(`fabula-ultima-${kind}-results-${stamp}.csv`, toCsv(kind, records), 'text/csv;charset=utf-8')
        flash(button, `CSV ${records.length}`)
        return
      }
      const text = button.hasAttribute('data-db-copy-markdown') ? toMarkdown(kind, records) : records.map(record => record.name).filter(Boolean).join('\n')
      navigator.clipboard?.writeText(text).then(() => flash(button, `Copied ${records.length}`)).catch(() => undefined)
    }

    apply()
    const observer = new MutationObserver(() => requestAnimationFrame(apply))
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('click', onClick)
    return () => { observer.disconnect(); document.removeEventListener('click', onClick) }
  }, [])
  return null
}
