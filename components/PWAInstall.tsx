import { useEffect, useState } from 'react'

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }> }

export default function PWAInstallButton() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      console.log('[PWA] beforeinstallprompt fired')
      setDeferred(e as BIPEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall as EventListener)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall as EventListener)
  }, [])

  if (!visible) return null

  const onClick = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setVisible(false)
    setDeferred(null)
  }

  return (
    <button
      onClick={onClick}
      className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
    >
      Установить приложение
    </button>
  )
}