'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

interface SearchMenuProps {
  isOpen: boolean
  onClose: () => void
}

interface ChatMessage {
  role: 'user' | 'ai'
  text: string
}

export function SearchMenu({ isOpen, onClose }: SearchMenuProps) {
  const [input, setInput] = useState('')
  const [chat, setChat] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const sendMessage = async () => {
    if (!input.trim()) return
    const userMessage: ChatMessage = { role: 'user', text: input }
    setChat((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/research/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage.text })
      })
      const data = await res.json()
      setChat((prev) => [...prev, { role: 'ai', text: data.answer || 'Sorry, I could not answer that.' }])
    } catch (err) {
      setChat((prev) => [...prev, { role: 'ai', text: 'Error contacting AI research assistant.' }])
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      sendMessage()
    }
  }

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full h-[95vh] sm:h-auto max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-3 md:gap-4 border bg-background p-3 sm:p-6 shadow-lg duration-200 sm:rounded-lg md:w-[95%] mx-auto safe-area-inset">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold">Research</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9 sm:h-10 sm:w-10 tap-target">
            <X className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Ask about stocks, markets, or investing..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 investor-input h-9 sm:h-10 text-sm sm:text-base"
            inputMode="search"
            autoComplete="off"
            disabled={loading}
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? '...' : 'Send'}
          </Button>
        </div>
        <ScrollArea className="h-[70vh] sm:h-[450px] md:h-[500px] overflow-y-auto -webkit-overflow-scrolling-touch bg-muted rounded p-2">
          {chat.length === 0 && (
            <div className="text-muted-foreground text-center mt-8">
              let me assistant.
            </div>
          )}
          {chat.map((msg, idx) => (
            <div key={idx} className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-white border text-black'}`}>
                {msg.text}
              </div>
                      </div>
                  ))}
        </ScrollArea>
      </div>
    </div>
  )
} 