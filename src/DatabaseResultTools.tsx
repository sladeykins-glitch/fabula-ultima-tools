import { useEffect } from 'react'

type Kind = 'monster' | 'item'

function kindForSection(section: HTMLElement): Kind | null {
  if (section.querySelector('.monsterCard')) return 'monster'
  if (section.querySelector('.itemCard')) return 'item'
  return null
}

function visibleResultCards(section: HTMLElement) {
  return Array.from(section.querySelectorAll<HTMLElement>('.monsterCard, .itemCard'))
    .filter(card => !card.classList.contains('dbHiddenByFavorite'))
}

function recordsForSection(section: HTMLElement) {
  const kind = kindForSection(section)
  if (!kind) return { kind: null, records: [] as any[] }
  const key = kind === 'monster' ? 'fu-monsters' : 'fu-items'
  try {
    const all = JSON.parse(localStorage.getItem(key) || '[]')
    const byId = new Map((Array.isArray(all) ? all : []).map((record: any) => [record.id, record]))
    const records = visibleResultCards(section)
      .map(card => byId.get(card.dataset.dbRecordId || ''))
      .filter(Boolean)
    return { kind, records }
  } catch {
    return { kind, records: [] as any[] }
  }
}

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export default function DatabaseResultTools() {
  useEffect(() => {
    const apply = () => {
      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        const quick = section.querySelector<HTMLElement>('.dbQuickActions')
        if (!quick || quick.querySelector('[data-db-export-results]')) return

        const exportButton = document.createElement('button')
        exportButton.type = 'button'
        exportButton.dataset.dbExportResults = 'true'
        exportButton.textContent = 'Export results'
        exportButton.title = 'Export all entries matching the current search and filters'

        const copyButton = document.createElement('button')
        copyButton.type = 'button'
        copyButton.dataset.dbCopyResultNames = 'true'
        copyButton.textContent = 'Copy names'
        copyButton.title = 'Copy the names of all entries matching the current search and filters'

        const hint = quick.querySelector('.dbQuickHint')
        quick.insertBefore(exportButton, hint)
        quick.insertBefore(copyButton, hint)
      })
    }

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const exportButton = target.closest<HTMLButtonElement>('[data-db-export-results]')
      const copyButton = target.closest<HTMLButtonElement>('[data-db-copy-result-names]')
      if (!exportButton && !copyButton) return
      const section = target.closest<HTMLElement>('section')
      if (!section) return
      const { kind, records } = recordsForSection(section)
      if (!kind) return

      if (exportButton) {
        const stamp = new Date().toISOString().slice(0, 10)
        downloadJson(`fabula-ultima-${kind}-results-${stamp}.json`, {
          format: 'fabula-ultima-tools-filtered-results',
          version: 1,
          kind,
          exportedAt: new Date().toISOString(),
          count: records.length,
          records,
        })
        const original = exportButton.textContent
        exportButton.textContent = `Exported ${records.length}`
        window.setTimeout(() => { exportButton.textContent = original }, 1200)
        return
      }

      const names = records.map(record => record.name).filter(Boolean).join('\n')
      navigator.clipboard?.writeText(names).then(() => {
        const original = copyButton!.textContent
        copyButton!.textContent = `Copied ${records.length}`
        window.setTimeout(() => { copyButton!.textContent = original }, 1200)
      }).catch(() => undefined)
    }

    apply()
    const observer = new MutationObserver(() => requestAnimationFrame(apply))
    observer.observe(document.body, { childList: true, subtree: true })
    document.addEventListener('click', onClick)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', onClick)
    }
  }, [])

  return null
}
