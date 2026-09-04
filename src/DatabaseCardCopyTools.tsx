import { useEffect } from 'react'

type Kind = 'monster' | 'item'

function readRecord(kind: Kind, id: string) {
  try {
    const records = JSON.parse(localStorage.getItem(kind === 'monster' ? 'fu-monsters' : 'fu-items') || '[]')
    return Array.isArray(records) ? records.find(record => record?.id === id) : null
  } catch {
    return null
  }
}

function monsterText(record: any) {
  const traits = Array.isArray(record.traits) && record.traits.length ? `Traits: ${record.traits.join(', ')}` : ''
  const attacks = (record.attacks || []).map((attack: any) => `• ${attack.name}: ${attack.formula} ${attack.damageType}${attack.effect ? ` — ${attack.effect}` : ''}`).join('\n')
  const spells = (record.spells || []).map((spell: any) => `• ${spell.name} (${spell.mp} MP): ${spell.effect}`).join('\n')
  return [
    `${record.name} — Lv ${record.level} ${record.rank} ${record.species}`,
    `HP ${record.hp} | Crisis ${record.crisis ?? Math.floor((Number(record.hp) || 0) / 2)} | MP ${record.mp} | Init ${record.initiative} | DEF ${record.defense} | M.DEF ${record.magicDefense}`,
    `DEX d${record.attributes?.dex} | INS d${record.attributes?.ins} | MIG d${record.attributes?.mig} | WLP d${record.attributes?.wlp}`,
    traits,
    attacks ? `Attacks\n${attacks}` : '',
    spells ? `Spells\n${spells}` : '',
  ].filter(Boolean).join('\n')
}

function itemText(record: any) {
  const profile = record.type === 'Weapon'
    ? `${record.handedness || ''} ${record.range || ''} | ${record.accuracy || ''}${record.accuracyBonus ? ` +${record.accuracyBonus}` : ''} | HR +${record.damage ?? 0} ${record.damageType || ''}`.trim()
    : (record.type === 'Armor' || record.type === 'Shield')
      ? `DEF ${record.defense ?? '—'} | M.DEF ${record.magicDefense ?? '—'} | Init ${record.initiative ?? 0}`
      : ''
  return [
    `${record.name} — ${record.type}${record.category ? ` · ${record.category}` : ''} · ${Number(record.cost) || 0}z`,
    profile,
    record.quality ? `Quality: ${record.quality}` : '',
    record.effect || '',
  ].filter(Boolean).join('\n')
}

export default function DatabaseCardCopyTools() {
  useEffect(() => {
    const apply = () => {
      document.querySelectorAll<HTMLElement>('[data-db-record-id][data-db-record-kind]').forEach(card => {
        const actions = card.querySelector<HTMLElement>('.cardActions')
        if (!actions || actions.querySelector('[data-db-copy-card]')) return
        const button = document.createElement('button')
        button.type = 'button'
        button.dataset.dbCopyCard = 'true'
        button.className = 'dbCopyCardButton'
        button.textContent = 'Copy'
        button.title = 'Copy a concise formatted summary'
        actions.insertBefore(button, actions.querySelector('.dbOpenButton'))
      })
    }

    const onClick = (event: MouseEvent) => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('[data-db-copy-card]')
      if (!button) return
      const card = button.closest<HTMLElement>('[data-db-record-id][data-db-record-kind]')
      const id = card?.dataset.dbRecordId
      const kind = card?.dataset.dbRecordKind as Kind | undefined
      if (!id || !kind) return
      const record = readRecord(kind, id)
      if (!record) return
      const text = kind === 'monster' ? monsterText(record) : itemText(record)
      void navigator.clipboard?.writeText(text).then(() => {
        const original = button.textContent
        button.textContent = 'Copied'
        window.setTimeout(() => { button.textContent = original }, 1200)
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
