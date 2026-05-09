import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useAction } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import type { Id } from '../../../convex/_generated/dataModel'
import { useMemo, useRef, useState } from 'react'
import { Bot } from 'lucide-react'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export const Route = createFileRoute('/embed/$botId')({
  component: EmbedBotPage,
})

function EmbedBotPage() {
  const { botId } = Route.useParams()
  const id = botId as Id<'bots'>

  const bot = useQuery(api.bots.getBotPublic, { id })
  const chatWithBot = useAction(api.bots.chatWithBotPublic)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const scrollerRef = useRef<HTMLDivElement>(null)

  const primary = bot?.config?.primaryColor || '#6c63ff'
  const welcome = bot?.config?.welcomeMessage || "Hi! 👋 I'm your AI assistant. How can I help you today?"
  const isOnline = bot?.enabled ?? true

  const uiMessages = useMemo(() => {
    if (!bot) return []
    if (messages.length === 0) return [{ role: 'assistant' as const, content: welcome }, ...messages]
    return messages
  }, [bot, messages, welcome])

  const send = async () => {
    if (!input.trim() || loading || !bot || !isOnline) return
    setLoading(true)
    setError('')
    const userMsg: ChatMessage = { role: 'user', content: input.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')

    try {
      const res = await chatWithBot({ id, messages: next })
      const assistantMsg: ChatMessage = { role: 'assistant', content: res.content }
      setMessages([...next, assistantMsg])
      queueMicrotask(() => {
        scrollerRef.current?.scrollTo({ top: scrollerRef.current.scrollHeight, behavior: 'smooth' })
      })
    } catch (e: any) {
      setError(e?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-transparent text-white flex p-4 flex-col">
      <div className="w-95 max-w-[92vw] h-140 max-h-[86vh]">
        <div className="chat-widget h-full flex flex-col">
          <div
            className="chat-header px-4 py-3 flex items-center justify-between"
            style={{
              background: `linear-gradient(135deg, ${primary}33, rgba(0,212,255,0.12))`,
            }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
                <Bot className="w-4 h-4 text-gray-200" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold truncate">{bot?.name || 'Chatbotz'}</div>
                <div className={['text-[11px] truncate', isOnline ? 'text-green-300/90' : 'text-gray-300/80'].join(' ')}>
                  {isOnline ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>
            {/* <span className="text-[11px] text-gray-300/70">Online</span> */}
          </div>

          <div ref={scrollerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {!bot ? (
              <div className="text-sm text-gray-400">Loading...</div>
            ) : (
              uiMessages.map((m, i) => (
                <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  {m.role === 'user' ? (
                    <div
                      className="max-w-[90%] rounded-2xl rounded-tr-md px-3 py-2 text-sm text-white"
                      style={{ background: `linear-gradient(135deg, ${primary}, #00d4ff)` }}
                    >
                      {m.content}
                    </div>
                  ) : (
                    <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-200 whitespace-pre-wrap">
                      {m.content}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {!isOnline && bot && <div className="px-4 pb-2 text-xs text-gray-400">This bot is currently offline.</div>}
          {error && <div className="px-4 pb-2 text-xs text-red-400">{error}</div>}

          <div className="px-4 pb-4">
            <div className="chat-input px-3 py-2 flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') send()
                }}
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-gray-500"
                placeholder="Type a message…"
                disabled={!bot || loading || !isOnline}
              />
              <button
                type="button"
                onClick={send}
                disabled={!bot || loading || !isOnline}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${primary}, #00d4ff)` }}
                aria-label="Send"
              >
                <span className="text-xs font-bold">{loading ? '…' : '→'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <p className='className="text-sm text-gray-400 text-center mt-2'>Powerded by <a href="https://chatbotz.com" className='text-[#6c63ff]'>Chatbotz</a></p>
    </div>
  )
}
