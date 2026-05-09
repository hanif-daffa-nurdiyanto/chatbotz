import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useMutation } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { useState } from 'react'
import { Bot, Plus, Trash2, Edit2, X, Settings2, Key, Eye, EyeOff, Paintbrush, Code, Copy, Check } from 'lucide-react'

type Provider = 'openai' | 'groq'

const MODEL_OPTIONS = [
  {
    provider: 'openai' as const,
    id: 'gpt-4o-mini',
    label: 'GPT-4o Mini (fast & cheap)',
  },
  { provider: 'openai' as const, id: 'gpt-4o', label: 'GPT-4o (powerful)' },
  { provider: 'openai' as const, id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (legacy)' },

  {
    provider: 'groq' as const,
    id: 'llama-3.3-70b-versatile',
    label: 'Llama 3.3 70B (versatile)',
  },
  {
    provider: 'groq' as const,
    id: 'llama-3.1-8b-instant',
    label: 'Llama 3.1 8B (instant ⚡)',
  },
  { provider: 'groq' as const, id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (32k ctx)' },
  { provider: 'groq' as const, id: 'gemma2-9b-it', label: 'Gemma 2 9B' },
] as const satisfies { provider: Provider; id: string; label: string }[]

const PROVIDERS: Record<
  Provider,
  {
    label: string
    keyPrefix: string
    keyPlaceholder: string
    docsUrl: string
    defaultModel: string
  }
> = {
  openai: {
    label: 'OpenAI',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-4o-mini',
  },
  groq: {
    label: 'Groq',
    keyPrefix: 'gsk_',
    keyPlaceholder: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
    defaultModel: 'llama-3.1-8b-instant',
  },
}

type BotModalTab = 'config' | 'prompt' | 'key'

const DEFAULT_TEMPERATURE = 0.7

export const Route = createFileRoute('/admin/bots')({
  component: BotsPage,
})

function BotsPage() {
  const bots = useQuery(api.bots.getBots)
  const createBot = useMutation(api.bots.createBot)
  const updateBot = useMutation(api.bots.updateBot)
  const deleteBot = useMutation(api.bots.deleteBot)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBot, setEditingBot] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<BotModalTab>('config')
  const [showKey, setShowKey] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    systemPrompt: 'You are a helpful AI assistant.',
    apiKey: '',
    provider: 'openai' as Provider,
    model: 'gpt-4o-mini',
    temperature: DEFAULT_TEMPERATURE,
    primaryColor: '#6c63ff',
    welcomeMessage: "Hi! 👋 I'm your AI assistant. How can I help you today?",
  })
  
  const [error, setError] = useState('')
  const previewPrimary = formData.primaryColor || '#6c63ff'
  const [copiedBotId, setCopiedBotId] = useState<string | null>(null)

  const getEmbedSnippet = (id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return `<script async src="${origin}/widget.js" data-chatbotz-bot="${id}"></script>`
  }

  const copyEmbedSnippet = async (id: string) => {
    const text = getEmbedSnippet(id)
    try {
      await navigator.clipboard.writeText(text)
      setCopiedBotId(id)
      window.setTimeout(() => setCopiedBotId((prev) => (prev === id ? null : prev)), 1500)
    } catch {
      // Fallback
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.focus()
      ta.select()
      try {
        document.execCommand('copy')
        setCopiedBotId(id)
        window.setTimeout(() => setCopiedBotId((prev) => (prev === id ? null : prev)), 1500)
      } finally {
        document.body.removeChild(ta)
      }
    }
  }

  const toggleBotEnabled = async (bot: any) => {
    const current = bot.enabled ?? true
    try {
      await updateBot({ id: bot._id, enabled: !current })
    } catch (err: any) {
      alert(err?.message || 'Failed to update bot status')
    }
  }

  const handleOpenCreate = () => {
    setEditingBot(null)
    setActiveTab('config')
    setShowKey(false)
    setFormData({
      name: '',
      systemPrompt: 'You are a helpful AI assistant.',
      apiKey: '',
      provider: 'openai',
      model: PROVIDERS.openai.defaultModel,
      temperature: DEFAULT_TEMPERATURE,
      primaryColor: '#6c63ff',
      welcomeMessage: "Hi! 👋 I'm your AI assistant. How can I help you today?",
    })
    setError('')
    setIsModalOpen(true)
  }

  const handleOpenEdit = (bot: any) => {
    setEditingBot(bot)
    setActiveTab('config')
    setShowKey(false)
    setFormData({
      name: bot.name,
      systemPrompt: bot.systemPrompt,
      apiKey: bot.apiKey || '',
      provider: (bot.config?.provider as Provider) || 'openai',
      model: bot.config.model,
      temperature: bot.config.temperature ?? DEFAULT_TEMPERATURE,
      primaryColor: bot.config.primaryColor || '#6c63ff',
      welcomeMessage: bot.config.welcomeMessage || "Hi! 👋 I'm your AI assistant. How can I help you today?",
    })
    setError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (editingBot) {
        await updateBot({
          id: editingBot._id,
          name: formData.name,
          systemPrompt: formData.systemPrompt + "Don't answer if out of context system prompt and if user input is not related to system prompt and if you not sure answer with 'I don't know",
          apiKey: formData.apiKey || undefined,
          config: {
            provider: formData.provider || undefined,
            model: formData.model,
            temperature: DEFAULT_TEMPERATURE,
            primaryColor: formData.primaryColor || undefined,
            welcomeMessage: formData.welcomeMessage || undefined,
          },
        })
      } else {
        await createBot({
          name: formData.name,
          systemPrompt: formData.systemPrompt,
          apiKey: formData.apiKey || undefined,
          config: {
            provider: formData.provider || undefined,
            model: formData.model,
            temperature: DEFAULT_TEMPERATURE,
            primaryColor: formData.primaryColor || undefined,
            welcomeMessage: formData.welcomeMessage || undefined,
          },
        })
      }
      setIsModalOpen(false)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    }
  }

  const handleDelete = async (bot: any) => {
    if (confirm(`Are you sure you want to delete "${bot.name}"?`)) {
      try {
        await deleteBot({ id: bot._id })
      } catch (err: any) {
        alert(err.message)
      }
    }
  }

  return (
    <div className="space-y-8 animate-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">Bot Management</h1>
          <p className="text-gray-400 text-sm sm:text-base">Create and configure your AI assistants.</p>
        </div>
        <button onClick={handleOpenCreate} className="w-full sm:w-auto justify-center flex items-center gap-2 bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] text-white px-5 py-2.5 rounded-xl font-medium hover:scale-[1.02] sm:hover:scale-105 transition-all shadow-lg shadow-[#6c63ff]/20">
          <Plus className="w-5 h-5" />
          Create Bot
        </button>
      </div>

      {bots === undefined ? (
        <div className="text-gray-400 animate-pulse">Loading bots...</div>
      ) : bots.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-4">
            <Bot className="w-10 h-10 text-gray-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No bots yet</h3>
          <p className="text-gray-400 max-w-md">You haven't created any chatbots. Create your first one to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <div key={bot._id} className="group bg-white/5 border border-white/10 rounded-2xl p-5 sm:p-6 hover:bg-white/10 transition-all duration-300 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#6c63ff] to-[#00d4ff] opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-[#6c63ff]/20 to-[#00d4ff]/20 rounded-xl">
                      <Bot className="w-6 h-6 text-[#00d4ff]" />
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/15 shrink-0"
                        style={{ backgroundColor: bot.config?.primaryColor || '#6c63ff' }}
                        aria-hidden="true"
                      />
                      <h3 className="text-lg font-bold truncate max-w-[180px] sm:max-w-[220px]" title={bot.name}>{bot.name}</h3>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => toggleBotEnabled(bot)}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                      aria-label={(bot.enabled ?? true) ? 'Turn bot off' : 'Turn bot on'}
                      title={(bot.enabled ?? true) ? 'Turn off (Offline)' : 'Turn on (Online)'}
                    >
                      <span
                        className={[
                          'relative inline-flex h-5 w-9 items-center rounded-full border transition-colors',
                          (bot.enabled ?? true)
                            ? 'bg-green-500/20 border-green-500/30'
                            : 'bg-white/5 border-white/10',
                        ].join(' ')}
                      >
                        <span
                          className={[
                            'inline-block h-4 w-4 transform rounded-full transition-transform',
                            (bot.enabled ?? true) ? 'translate-x-4 bg-green-400' : 'translate-x-1 bg-gray-400',
                          ].join(' ')}
                        />
                      </span>
                    </button>
                    <button onClick={() => handleOpenEdit(bot)} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(bot)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-400 mb-6 line-clamp-3" title={bot.systemPrompt}>
                  {bot.systemPrompt}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mt-auto">
             
                {bot.apiKey && (
                  <div className="flex items-center gap-1.5 bg-[#00d4ff]/10 text-[#00d4ff] px-2.5 py-1.5 rounded-lg border border-[#00d4ff]/20">
                    <Key className="w-3.5 h-3.5" />
                    Custom Key
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => copyEmbedSnippet(String(bot._id))}
                  className="cursor-pointer ml-auto inline-flex items-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-200 px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors"
                  title="Copy embed script"
                >
                  {copiedBotId === String(bot._id) ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedBotId === String(bot._id) ? 'Copied' : 'Copy Script'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in">
          <div className="bg-[#0c1228] border border-white/10 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 sm:p-6 border-b border-white/10 flex justify-between items-center bg-[#080d1f]">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-bold truncate">{editingBot ? 'Edit Bot' : 'Create New Bot'}</h2>
                <p className="text-xs sm:text-sm text-gray-400 mt-1">Set prompt, appearance, and model settings—just like the live demo.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-1.5 rounded-md">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-[#0b1126]">
              {(['config', 'prompt', 'key'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={[
                    'flex-1 px-3 py-3 text-xs sm:text-sm font-semibold transition-colors',
                    activeTab === tab ? 'text-white' : 'text-gray-400 hover:text-gray-200',
                  ].join(' ')}
                  style={{
                    borderBottom: activeTab === tab ? `2px solid ${formData.primaryColor || '#6c63ff'}` : '2px solid transparent',
                  }}
                >
                  {tab === 'config' ? '⚙️ Config' : tab === 'prompt' ? '📝 Prompt' : '🔑 API Key'}
                </button>
              ))}
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto">
              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-start gap-2">
                  <span className="mt-0.5">⚠️</span>
                  <span className="flex-1">{error}</span>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <form id="bot-form" onSubmit={handleSubmit} className="space-y-5">
                  {activeTab === 'config' && (
                    <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Bot Name</label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none transition-colors"
                          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
                          placeholder="e.g. Customer Support"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Theme Color</label>
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5">
                          <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                            <Paintbrush className="w-4 h-4 text-gray-300" />
                          </div>
                          <input
                            type="color"
                            value={formData.primaryColor}
                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                            className="h-9 w-12 rounded-md bg-transparent border-none p-0"
                            aria-label="Primary color"
                          />
                          <span className="text-sm text-gray-400 font-mono">{formData.primaryColor}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Welcome Message</label>
                      <textarea
                        value={formData.welcomeMessage}
                        onChange={(e) => setFormData({ ...formData, welcomeMessage: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none transition-colors min-h-[96px] resize-y"
                        placeholder="Shown as the first bot message when a user opens the chat."
                      />
                      <p className="text-xs text-gray-500 mt-2">Tip: keep it short so it fits nicely on mobile.</p>
                    </div>
                  </>
                )}

                {activeTab === 'prompt' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">System Prompt</label>
                    <textarea
                      required
                      value={formData.systemPrompt}
                      onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none transition-colors min-h-[220px] resize-y"
                      placeholder="Instructions for your AI..."
                    />
                    <p className="text-xs text-gray-500 mt-2">Write in the same language you expect users to use.</p>
                  </div>
                )}

                {activeTab === 'key' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Provider</label>
                        <select
                          value={formData.provider}
                          onChange={(e) => {
                            const nextProvider = e.target.value as Provider
                            const nextDefaultModel = PROVIDERS[nextProvider].defaultModel
                            setFormData((prev) => ({
                              ...prev,
                              provider: nextProvider,
                              model: MODEL_OPTIONS.some((m) => m.provider === nextProvider && m.id === prev.model)
                                ? prev.model
                                : nextDefaultModel,
                            }))
                          }}
                          className="w-full bg-[#151b33] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
                        >
                          <option value="openai">OpenAI</option>
                          <option value="groq">Groq</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Model</label>
                        <select
                          value={formData.model}
                          onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                          className="w-full bg-[#151b33] border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
                        >
                          {MODEL_OPTIONS.filter((m) => m.provider === formData.provider).map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-2">Same setup flow as the demo.</p>
                      </div>
                    </div>

                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          {PROVIDERS[formData.provider].label} API Key (Optional)
                        </label>
                        <p className="text-xs text-gray-500 -mt-1">If set, this key is used for this bot only.</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowKey((v) => !v)}
                        className="shrink-0 inline-flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 transition-colors"
                      >
                        {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        {showKey ? 'Hide' : 'Show'}
                      </button>
                    </div>

                    <div className="relative">
                      <Key className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showKey ? 'text' : 'password'}
                        value={formData.apiKey}
                        onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none transition-colors"
                        placeholder={PROVIDERS[formData.provider].keyPlaceholder}
                      />
                    </div>

                    <div className="text-xs text-gray-500 leading-relaxed">
                      <p className="mb-2">
                        Expected prefix: <span className="font-mono">{PROVIDERS[formData.provider].keyPrefix}</span>. Get a key at{' '}
                        <a className="text-[#00d4ff] hover:underline" href={PROVIDERS[formData.provider].docsUrl} target="_blank" rel="noreferrer">
                          {PROVIDERS[formData.provider].docsUrl}
                        </a>
                        .
                      </p>
                      <p className="mb-1">Security notes:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Prefer server-side keys; avoid shipping keys in public client apps.</li>
                        <li>Use a restricted key with minimal permissions.</li>
                      </ul>
                    </div>
                  </div>
                )}
                </form>

                {/* Preview */}
                <div className="lg:sticky lg:top-0">
                  <div className="glass-card p-4 sm:p-5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div className="text-sm font-semibold text-gray-200">Preview</div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: previewPrimary }} />
                        {formData.provider === 'groq' ? 'Groq' : 'OpenAI'}
                      </div>
                    </div>

                    <div className="chat-widget">
                      <div
                        className="chat-header px-4 py-3 flex items-center justify-between"
                        style={{
                          borderBottomColor: 'rgba(108,99,255,0.2)',
                          background: `linear-gradient(135deg, ${previewPrimary}33, rgba(0,212,255,0.12))`,
                        }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/5 border border-white/10 shrink-0">
                            <Bot className="w-4 h-4 text-gray-200" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold truncate">{formData.name || 'Your Bot'}</div>
                            <div className="text-[11px] text-gray-300/80 truncate">Online</div>
                          </div>
                        </div>
                        {/* <span className="text-[11px] text-gray-300/70"></span> */}
                      </div>

                      <div className="px-4 py-4 space-y-3">
                        <div className="flex justify-start">
                          <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-200">
                            {formData.welcomeMessage || "Hi! 👋 I'm your AI assistant. How can I help you today?"}
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <div className="max-w-[90%] rounded-2xl rounded-tr-md px-3 py-2 text-sm text-white"
                            style={{ background: `linear-gradient(135deg, ${previewPrimary}, #00d4ff)` }}
                          >
                            What can you do?
                          </div>
                        </div>
                        <div className="flex justify-start">
                          <div className="max-w-[90%] rounded-2xl rounded-tl-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-200">
                            I can answer questions, help customers, and guide them based on your system prompt.
                          </div>
                        </div>
                      </div>

                      <div className="px-4 pb-4">
                        <div className="chat-input px-3 py-2 flex items-center gap-2">
                          <div className="text-sm text-gray-400 flex-1 truncate">Type a message…</div>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                            style={{ background: `linear-gradient(135deg, ${previewPrimary}, #00d4ff)` }}
                          >
                            <span className="text-xs font-bold">→</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 leading-relaxed">
                      Preview uses your current <span className="font-semibold">Config</span> values (name, color, welcome message).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-[#080d1f] flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors">
                Cancel
              </button>
              <button
                form="bot-form"
                type="submit"
                className="text-white px-6 py-2.5 rounded-xl font-medium hover:scale-105 transition-all shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${previewPrimary}, #00d4ff)`,
                  boxShadow: `0 12px 30px rgba(108, 99, 255, 0.18)`,
                }}
              >
                {editingBot ? 'Save Changes' : 'Create Bot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
