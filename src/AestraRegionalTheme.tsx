import { useEffect } from 'react'

const regions = ['Garlond','Rübenberg','Palmeria','Valdoria','Aestra'] as const

type Region = typeof regions[number]

function findRegion(target: EventTarget | null): Region | null {
  const element = target instanceof Element ? target : null
  const select = element?.closest('select') as HTMLSelectElement | null
  if (select && regions.includes(select.value as Region)) return select.value as Region
  return null
}

export default function AestraRegionalTheme() {
  useEffect(() => {
    const root = document.documentElement
    const apply = (region: Region | null) => {
      if (region) root.dataset.aestraRegion = region
      else delete root.dataset.aestraRegion
    }
    const syncFromPage = () => {
      const candidates = Array.from(document.querySelectorAll('select')) as HTMLSelectElement[]
      const match = candidates.find(select => regions.includes(select.value as Region))
      apply(match ? match.value as Region : null)
    }
    const onChange = (event: Event) => {
      const region = findRegion(event.target)
      if (region) apply(region)
      else syncFromPage()
    }
    document.addEventListener('change', onChange)
    const observer = new MutationObserver(syncFromPage)
    observer.observe(document.body, { childList:true, subtree:true })
    syncFromPage()
    return () => { document.removeEventListener('change', onChange); observer.disconnect(); delete root.dataset.aestraRegion }
  }, [])
  return null
}
