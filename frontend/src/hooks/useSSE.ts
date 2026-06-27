import { useState, useEffect } from 'react'

export function useSSE(url: string | null) {
  const [messages, setMessages] = useState<any[]>([])

  useEffect(() => {
    if (!url) return

    const source = new EventSource(url)

    source.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setMessages(prev => [...prev, data])
      } catch {
        // message non-JSON ignoré
      }
    }

    source.onerror = () => {
      source.close()
    }

    return () => source.close()
  }, [url])

  return messages
}
