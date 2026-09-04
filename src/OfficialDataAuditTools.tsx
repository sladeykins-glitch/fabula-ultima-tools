import { useEffect } from 'react'
import './officialDataAuditTools.css'

const affinityValues = new Set(['Normal','Vulnerable','Resistant','Immune','Absorb'])
const dice = new Set([6,8,10,12])
const ranks = new Set(['Soldier','Elite','Champion'])
const species = new Set(['Beast','Construct','Demon','Elemental','Humanoid','Monster','Plant','Undead'])

type Audit = { monsterCount:number; itemCount:number; high:number; natural:number; techno:number; warnings:string[] }

function read(key:string) {
  try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : [] } catch { return [] }
}

function audit(): Audit {
  const monsters = read('fu-monsters').filter(record => record?.source === 'Official')
  const items = read('fu-items').filter(record => record?.source === 'Official')
  const warnings:string[] = []
  const ids = new Set<string>()

  for (const monster of monsters) {
    if (!monster?.id || ids.has(monster.id)) warnings.push(`Duplicate or missing monster id: ${monster?.name || '(unnamed)'}`)
    if (monster?.id) ids.add(monster.id)
    if (!monster?.name) warnings.push(`Monster ${monster?.id || '(unknown)'} has no name.`)
    if (!(Number(monster?.level) >= 1 && Number(monster?.level) <= 99)) warnings.push(`${monster?.name}: invalid level.`)
    if (!ranks.has(monster?.rank)) warnings.push(`${monster?.name}: invalid rank.`)
    if (!species.has(monster?.species)) warnings.push(`${monster?.name}: invalid species.`)
    for (const key of ['dex','ins','mig','wlp']) if (!dice.has(Number(monster?.attributes?.[key]))) warnings.push(`${monster?.name}: invalid ${key.toUpperCase()} die.`)
    for (const [type,value] of Object.entries(monster?.affinities || {})) if (!affinityValues.has(String(value))) warnings.push(`${monster?.name}: invalid ${type} Affinity “${String(value)}”.`)
    if (!Array.isArray(monster?.attacks)) warnings.push(`${monster?.name}: attacks are not structured.`)
    if (String(monster?.id).startsWith('official-natural-') || String(monster?.id).startsWith('official-techno-')) {
      const notes = (monster?.notes || []).join(' ')
      if (!/Printed page \d+/i.test(notes)) warnings.push(`${monster?.name}: imported Atlas profile has no printed-page reference.`)
    }
  }

  for (const item of items) {
    if (!item?.id || ids.has(item.id)) warnings.push(`Duplicate or missing item id: ${item?.name || '(unnamed)'}`)
    if (item?.id) ids.add(item.id)
    if (!item?.name) warnings.push(`Item ${item?.id || '(unknown)'} has no name.`)
    if (!['Weapon','Armor','Shield','Accessory'].includes(item?.type)) warnings.push(`${item?.name}: unsupported core equipment type “${item?.type}”.`)
    if (Number(item?.cost) < 0) warnings.push(`${item?.name}: negative cost.`)
  }

  const high = monsters.filter(m => String(m.id).startsWith('official-high-')).length
  const natural = monsters.filter(m => String(m.id).startsWith('official-natural-')).length
  const techno = monsters.filter(m => String(m.id).startsWith('official-techno-')).length
  if (high < 16) warnings.push(`High Fantasy antagonist set looks incomplete (${high}/16 expected profiles).`)
  if (natural < 16) warnings.push(`Natural Fantasy antagonist set looks incomplete (${natural}/16 expected profiles).`)
  if (techno < 17) warnings.push(`Techno Fantasy antagonist set looks incomplete (${techno}/17 expected profiles).`)
  return { monsterCount:monsters.length, itemCount:items.length, high, natural, techno, warnings }
}

export default function OfficialDataAuditTools() {
  useEffect(() => {
    const result = audit()
    const apply = () => {
      document.querySelectorAll<HTMLElement>('main > section').forEach(section => {
        if (!section.querySelector('.databaseSummary')) return
        let bar = section.querySelector<HTMLElement>('.dbAuditBar')
        if (!bar) {
          bar = document.createElement('div')
          bar.className = 'dbAuditBar'
          const panelBody = section.querySelector('.dbToolPanelBody')
          const quality = section.querySelector('.dbQualityBar')
          ;(panelBody || quality || section.querySelector('.databaseSummary'))?.appendChild(bar)
        }
        if (!bar) return
        const ok = result.warnings.length === 0
        bar.classList.toggle('hasWarnings', !ok)
        bar.innerHTML = `<span><strong>${ok ? 'Official data audit passed' : `${result.warnings.length} audit warning${result.warnings.length === 1 ? '' : 's'}`}</strong> · ${result.monsterCount} monsters · ${result.itemCount} items · High ${result.high} · Natural ${result.natural} · Techno ${result.techno}</span><button type="button" data-db-audit-details>${ok ? 'Audit details' : 'View warnings'}</button>`
      })
    }

    const onClick = (event:MouseEvent) => {
      if (!(event.target as HTMLElement).closest('[data-db-audit-details]')) return
      const body = result.warnings.length
        ? `Structural audit warnings:\n\n${result.warnings.map((warning,index)=>`${index+1}. ${warning}`).join('\n')}`
        : `All structural checks passed.\n\nOfficial monsters: ${result.monsterCount}\nOfficial items: ${result.itemCount}\nHigh Fantasy antagonist profiles: ${result.high}\nNatural Fantasy antagonist profiles: ${result.natural}\nTechno Fantasy antagonist profiles: ${result.techno}\n\nNatural and Techno antagonist profiles include printed-page source references from the supplied Atlas PDFs.`
      window.alert(body)
    }

    apply()
    const observer = new MutationObserver(() => requestAnimationFrame(apply))
    observer.observe(document.body,{childList:true,subtree:true})
    document.addEventListener('click',onClick)
    return () => { observer.disconnect(); document.removeEventListener('click',onClick) }
  },[])
  return null
}
