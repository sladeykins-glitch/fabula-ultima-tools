import { useEffect } from 'react'

type Kind = 'monster' | 'item'

export default function DatabaseOpenEventBridge() {
  useEffect(() => {
    const onOpen = (event: Event) => {
      const detail = (event as CustomEvent<{ kind?: Kind; id?: string }>).detail
      if (!detail || (detail.kind !== 'monster' && detail.kind !== 'item') || !detail.id) return
      const button = document.createElement('button')
      button.type = 'button'
      button.hidden = true
      button.dataset.dbOpen = detail.kind
      button.dataset.dbRecordId = detail.id
      document.body.appendChild(button)
      button.click()
      button.remove()
    }

    window.addEventListener('fu-open-record', onOpen)
    return () => window.removeEventListener('fu-open-record', onOpen)
  }, [])

  return null
}
