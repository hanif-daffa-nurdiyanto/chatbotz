import { useState, useEffect, useRef } from 'react'

const LS_KEY_APIKEY = 'chatbotz_demo_apikey'
const LS_KEY_MESSAGES = 'chatbotz_demo_messages'
const LS_KEY_CONFIG = 'chatbotz_demo_config'
const LS_KEY_PROVIDER = 'chatbotz_demo_provider'
const LS_KEY_MODEL = 'chatbotz_demo_model'
const LS_KEY_KEYMODE = 'chatbotz_demo_keymode'

// Env key injected at build time — only exposed if VITE_GROQ_API_KEY is set
const SHARED_GROQ_KEY: string = import.meta.env.VITE_GROQ_API_KEY || ''
const HAS_SHARED_KEY = SHARED_GROQ_KEY.length > 0

type KeyMode = 'shared' | 'own'

type Provider = 'openai' | 'groq' | 'openrouter' | 'anthropic' | 'gemini'

const PROVIDERS: Record<Provider, { label: string; color: string; keyPrefix: string; keyPlaceholder: string; docsUrl: string; models: { id: string; label: string }[] }> = {
  openai: {
    label: 'OpenAI',
    color: '#10a37f',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini (fast & cheap)' },
      { id: 'gpt-4o', label: 'GPT-4o (powerful)' },
      { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (legacy)' },
    ],
  },
  groq: {
    label: 'Groq',
    color: '#f55036',
    keyPrefix: 'gsk_',
    keyPlaceholder: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
    models: [
      { id: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (versatile)' },
      { id: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (instant ⚡)' },
      { id: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (32k ctx)' },
      { id: 'gemma2-9b-it', label: 'Gemma 2 9B' },
    ],
  },
  openrouter: {
    label: 'OpenRouter',
    color: '#a29bfe',
    keyPrefix: 'sk-or-',
    keyPlaceholder: 'sk-or-...',
    docsUrl: 'https://openrouter.ai/keys',
    models: [
      { id: 'openai/gpt-4o-mini', label: 'OpenAI GPT-4o Mini (via OpenRouter)' },
      { id: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (via OpenRouter)' },
      { id: 'google/gemini-1.5-flash', label: 'Gemini 1.5 Flash (via OpenRouter)' },
    ],
  },
  anthropic: {
    label: 'Anthropic',
    color: '#d97706',
    keyPrefix: 'sk-ant-',
    keyPlaceholder: 'sk-ant-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    models: [
      { id: 'claude-3-5-sonnet-latest', label: 'Claude 3.5 Sonnet (latest)' },
      { id: 'claude-3-5-haiku-latest', label: 'Claude 3.5 Haiku (latest)' },
    ],
  },
  gemini: {
    label: 'Google Gemini',
    color: '#00d4ff',
    keyPrefix: '',
    keyPlaceholder: 'AIza... (Google AI Studio key)',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    models: [
      { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
      { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    ],
  },
}

function getApiEndpoint(provider: Provider): string {
  if (provider === 'groq') return 'https://api.groq.com/openai/v1/chat/completions'
  if (provider === 'openrouter') return 'https://openrouter.ai/api/v1/chat/completions'
  if (provider === 'anthropic') return 'https://api.anthropic.com/v1/messages'
  return 'https://api.openai.com/v1/chat/completions'
}

const DEFAULT_SYSTEM_PROMPT = `You are a helpful customer support assistant for "TechGear Store", an online electronics retailer.

Business Information:
- Name: TechGear Store
- Website: www.techgearstore.com
- Hours: Monday-Friday, 9AM-6PM WIB
- Phone: +62 812-3456-7890
- Email: support@techgearstore.com

Products & Services:
- Laptops, smartphones, tablets, accessories
- Warranty: 1 year official warranty on all products
- Shipping: Free shipping for orders above Rp 500.000
- Delivery: 1-3 business days (Jakarta), 3-7 days (outside Jakarta)

Return Policy:
- 7-day return window for defective items
- Items must be in original packaging
- Contact support@techgearstore.com to initiate a return

Payment Methods:
- Bank Transfer (BCA, Mandiri, BNI, BRI)
- QRIS
- Credit/Debit Card
- COD (Cash on Delivery) available in Jakarta only

Promotions:
- 10% off for first-time buyers (code: FIRSTORDER)
- Free shipping on all orders this month with code: FREESHIP

Your tone: Friendly, helpful, professional. Always respond in the same language the user writes in.`

const DEFAULT_CONFIG = {
  botName: 'TechGear Bot',
  primaryColor: '#6c63ff',
  welcomeMessage: 'Hi! 👋 I\'m TechGear\'s AI assistant. How can I help you today?',
}

type Message = { role: 'user' | 'bot'; text: string; ts: number }

export function DemoSection() {
  const [provider, setProvider] = useState<Provider>('groq')
  const [model, setModel] = useState(PROVIDERS.groq.models[0].id)
  const [keyMode, setKeyMode] = useState<KeyMode>(HAS_SHARED_KEY ? 'shared' : 'own')
  const [apiKey, setApiKey] = useState('')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [systemPrompt, setSystemPrompt] = useState(DEFAULT_SYSTEM_PROMPT)
  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [activeTab, setActiveTab] = useState<'prompt' | 'config' | 'key'>('config')
  const [showKey, setShowKey] = useState(false)
  const [apiError, setApiError] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Load from localStorage
  useEffect(() => {
    const storedProvider = (localStorage.getItem(LS_KEY_PROVIDER) as Provider) || 'groq'
    const storedModel = localStorage.getItem(LS_KEY_MODEL) || PROVIDERS[storedProvider].models[0].id
    const storedKey = localStorage.getItem(`${LS_KEY_APIKEY}_${storedProvider}`) || ''
    const storedMode = (localStorage.getItem(LS_KEY_KEYMODE) as KeyMode) || (HAS_SHARED_KEY ? 'shared' : 'own')
    const storedMsgs = localStorage.getItem(LS_KEY_MESSAGES)
    const storedConfig = localStorage.getItem(LS_KEY_CONFIG)
    setProvider(storedProvider)
    setModel(storedModel)
    setKeyMode(storedMode)
    setApiKey(storedKey)
    setApiKeyInput(storedKey)

    if (storedMsgs) {
      try { setMessages(JSON.parse(storedMsgs)) } catch { /* ignore */ }
    } else {
      setMessages([{ role: 'bot', text: DEFAULT_CONFIG.welcomeMessage, ts: Date.now() }])
    }
    if (storedConfig) {
      try { setConfig(JSON.parse(storedConfig)) } catch { /* ignore */ }
    }
  }, [])

  useEffect(() => {
    const el = messagesContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading])

  const switchProvider = (p: Provider) => {
    setProvider(p)
    setModel(PROVIDERS[p].models[0].id)
    localStorage.setItem(LS_KEY_PROVIDER, p)
    localStorage.setItem(LS_KEY_MODEL, PROVIDERS[p].models[0].id)
    const storedKey = localStorage.getItem(`${LS_KEY_APIKEY}_${p}`) || ''
    setApiKey(storedKey)
    setApiKeyInput(storedKey)
    setApiError('')
  }

  const saveApiKey = () => {
    setApiKey(apiKeyInput)
    localStorage.setItem(`${LS_KEY_APIKEY}_${provider}`, apiKeyInput)
    setApiError('')
  }

  const clearApiKey = () => {
    setApiKey('')
    setApiKeyInput('')
    localStorage.removeItem(`${LS_KEY_APIKEY}_${provider}`)
  }

  const clearChat = () => {
    const welcome: Message[] = [{ role: 'bot', text: config.welcomeMessage, ts: Date.now() }]
    setMessages(welcome)
    localStorage.setItem(LS_KEY_MESSAGES, JSON.stringify(welcome))
  }

  const saveConfig = () => {
    localStorage.setItem(LS_KEY_CONFIG, JSON.stringify(config))
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    // Resolve the key and endpoint based on mode
    const activeKey = keyMode === 'shared' ? SHARED_GROQ_KEY : apiKey
    const activeProvider: Provider = keyMode === 'shared' ? 'groq' : provider
    const activeModel = keyMode === 'shared' ? PROVIDERS.groq.models[0].id : model
    if (!activeKey) { setApiError(`Please enter your ${PROVIDERS[provider].label} API key, or switch to Shared Key mode.`); setActiveTab('key'); return }

    const userMsg: Message = { role: 'user', text: input.trim(), ts: Date.now() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)
    setApiError('')

    try {
      const history = newMessages.slice(-12).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text,
      }))

      let res: Response

      if (activeProvider === 'anthropic') {
        const anthropicMessages = history.map(m => ({
          role: m.role,
          content: [{ type: 'text', text: m.content }],
        }))
        res = await fetch(getApiEndpoint(activeProvider), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': activeKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: activeModel,
            system: systemPrompt,
            max_tokens: 400,
            messages: anthropicMessages,
          }),
        })
      } else if (activeProvider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(activeModel)}:generateContent?key=${encodeURIComponent(activeKey)}`
        const contents = history.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }))
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { maxOutputTokens: 400 },
          }),
        })
      } else {
        // OpenAI-compatible: openai, groq, openrouter
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${activeKey}`,
        }
        res = await fetch(getApiEndpoint(activeProvider), {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: activeModel,
            messages: [{ role: 'system', content: systemPrompt + "Don't answer if out of context system prompt and if user input is not related to system prompt and if you not sure answer with 'I don't know'" }, ...history],
            max_tokens: 400,
            temperature: 0.7,
          }),
        })
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error?.message || `API error ${res.status}`)
      }

      const data = await res.json()
      const botText =
        activeProvider === 'anthropic'
          ? (Array.isArray(data?.content) ? data.content.find((p: any) => p?.type === 'text')?.text : undefined) || 'Sorry, I could not generate a response.'
          : activeProvider === 'gemini'
            ? (data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join('') || data?.candidates?.[0]?.content?.parts?.[0]?.text) || 'Sorry, I could not generate a response.'
            : data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'
      const botMsg: Message = { role: 'bot', text: botText, ts: Date.now() }
      const final = [...newMessages, botMsg]
      setMessages(final)
      localStorage.setItem(LS_KEY_MESSAGES, JSON.stringify(final))
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Something went wrong'
      setApiError(errMsg)
      const errBotMsg: Message = { role: 'bot', text: `⚠️ Error: ${errMsg}`, ts: Date.now() }
      const final = [...newMessages, errBotMsg]
      setMessages(final)
      localStorage.setItem(LS_KEY_MESSAGES, JSON.stringify(final))
    } finally {
      setLoading(false)
    }
  }

  const primary = config.primaryColor

  return (
    <section id="demo" style={{ padding: '100px 24px', background: 'rgba(8,13,31,0.4)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Heading */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="badge" style={{ margin: '0 auto 20px' }}>🎮 Live Demo</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '16px' }}>
            Try It <span className="gradient-text">Right Now</span>
          </h2>
          <p style={{ color: '#8892b0', fontSize: '18px', maxWidth: '560px', margin: '0 auto' }}>
            A real chatbot running with real AI. Edit the system prompt, change the config, and chat live.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', alignItems: 'start' }} className="demo-grid">
          {/* Left Panel — Config */}
          <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(108,99,255,0.15)' }}>
              {(['prompt', 'config', 'key'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  style={{
                    flex: 1, padding: '12px 6px', background: 'none', border: 'none',
                    borderBottom: activeTab === tab ? `2px solid ${primary}` : '2px solid transparent',
                    color: activeTab === tab ? '#f0f4ff' : '#8892b0',
                    fontFamily: 'inherit', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                    transition: 'all 0.2s', whiteSpace: 'nowrap',
                  }}>
                  {tab === 'prompt' ? '📝 Prompt' : tab === 'config' ? '⚙️ Config' : tab === 'key' ? '🔑 API Key' : '💬 Chat'}
                </button>
              ))}
            </div>

            <div style={{ padding: '24px' }}>
              {/* System Prompt Tab */}
              {activeTab === 'prompt' && (
                <div>
                  <p style={{ color: '#8892b0', fontSize: '13px', marginBottom: '12px', lineHeight: 1.6 }}>
                    This is the placeholder data the bot uses as its knowledge base. In a real deployment, this would contain your actual business information.
                  </p>
                  <textarea
                    value={systemPrompt}
                    onChange={e => setSystemPrompt(e.target.value)}
                    style={{
                      width: '100%', minHeight: '320px', background: '#0a0e1a',
                      border: '1px solid rgba(108,99,255,0.2)', borderRadius: '10px',
                      color: '#f0f4ff', fontFamily: 'Fira Code, Courier New, monospace',
                      fontSize: '12px', lineHeight: 1.6, padding: '14px',
                      resize: 'vertical', outline: 'none',
                    }}
                    id="system-prompt-textarea"
                  />
                  <p style={{ color: '#6c63ff', fontSize: '12px', marginTop: '8px' }}>
                    ✨ Changes apply immediately to future messages
                  </p>
                </div>
              )}

              {/* Config Tab */}
              {activeTab === 'config' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '13px', color: '#8892b0', display: 'block', marginBottom: '8px', fontWeight: 600 }}>Bot Name</label>
                    <input value={config.botName} onChange={e => setConfig(c => ({ ...c, botName: e.target.value }))}
                      style={{ width: '100%', background: '#0a0e1a', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '8px', color: '#f0f4ff', padding: '10px 14px', outline: 'none', fontFamily: 'inherit', fontSize: '14px' }}
                      id="config-bot-name" />
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: '#8892b0', display: 'block', marginBottom: '8px', fontWeight: 600 }}>Primary Color</label>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <input type="color" value={config.primaryColor} onChange={e => setConfig(c => ({ ...c, primaryColor: e.target.value }))}
                        style={{ width: '44px', height: '44px', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '8px', padding: '2px', background: 'transparent', cursor: 'pointer' }}
                        id="config-color-picker" />
                      <span style={{ color: '#8892b0', fontSize: '13px' }}>{config.primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '13px', color: '#8892b0', display: 'block', marginBottom: '8px', fontWeight: 600 }}>Welcome Message</label>
                    <textarea value={config.welcomeMessage} onChange={e => setConfig(c => ({ ...c, welcomeMessage: e.target.value }))}
                      rows={3}
                      style={{ width: '100%', background: '#0a0e1a', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '8px', color: '#f0f4ff', padding: '10px 14px', outline: 'none', fontFamily: 'inherit', fontSize: '14px', resize: 'none' }}
                      id="config-welcome-message" />
                  </div>
                  <button className="btn-primary" style={{ padding: '12px', fontSize: '14px' }} onClick={saveConfig} id="save-config-btn">
                    💾 Save Config
                  </button>
                </div>
              )}

              {/* API Key Tab */}
              {activeTab === 'key' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Key Mode Toggle */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {(['shared', 'own'] as KeyMode[]).map(mode => (
                      <button
                        key={mode}
                        id={`keymode-btn-${mode}`}
                        onClick={() => { setKeyMode(mode); localStorage.setItem(LS_KEY_KEYMODE, mode); }}
                        style={{
                          flex: 1, padding: '10px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                          cursor: mode === 'shared' && !HAS_SHARED_KEY ? 'not-allowed' : 'pointer',
                          opacity: mode === 'shared' && !HAS_SHARED_KEY ? 0.4 : 1,
                          transition: 'all 0.2s', fontFamily: 'inherit',
                          border: keyMode === mode ? '2px solid #6c63ff' : '2px solid rgba(255,255,255,0.08)',
                          background: keyMode === mode ? 'rgba(108,99,255,0.15)' : 'rgba(255,255,255,0.03)',
                          color: keyMode === mode ? '#a29bfe' : '#8892b0',
                        }}
                        disabled={mode === 'shared' && !HAS_SHARED_KEY}
                      >
                        {mode === 'shared' ? '🌐 Shared Key' : '🔑 Your Key'}
                      </button>
                    ))}
                  </div>

                  {/* Shared Key Panel */}
                  {keyMode === 'shared' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {HAS_SHARED_KEY ? (
                        <>
                          <div style={{ background: 'rgba(0,255,136,0.07)', border: '1px solid rgba(0,255,136,0.25)', borderRadius: '10px', padding: '14px', fontSize: '13px', lineHeight: 1.6 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontWeight: 700, color: '#00ff88' }}>
                              <div className="pulse-dot" style={{ width: '8px', height: '8px' }} />
                              Shared Groq Key Active
                            </div>
                            <span style={{ color: '#8892b0' }}>Powered by </span>
                            <span style={{ color: '#f55036', fontWeight: 700 }}>Groq ⚡</span>
                            <span style={{ color: '#8892b0' }}> · Model: </span>
                            <span style={{ color: '#a29bfe' }}>{PROVIDERS.groq.models[0].label}</span>
                          </div>
                          <button className="btn-primary" style={{ padding: '12px', fontSize: '14px' }} id="start-chat-shared-btn">
                            💬 Start Chatting Now →
                          </button>
                        </>
                      ) : (
                        <div style={{ background: 'rgba(255,61,154,0.08)', border: '1px solid rgba(255,61,154,0.2)', borderRadius: '10px', padding: '14px', fontSize: '13px', color: '#ff3d9a', lineHeight: 1.6 }}>
                          ⚠️ No shared key configured. Set <code style={{ background: 'rgba(255,61,154,0.15)', padding: '1px 5px', borderRadius: '4px' }}>VITE_GROQ_API_KEY</code> in your <code>.env</code> file.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Own Key Panel */}
                  {keyMode === 'own' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Provider Selector */}
                      <div>
                        <label style={{ fontSize: '13px', color: '#8892b0', display: 'block', marginBottom: '8px', fontWeight: 600 }}>Provider</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {(Object.keys(PROVIDERS) as Provider[]).map(p => (
                            <button key={p} onClick={() => switchProvider(p)} id={`provider-btn-${p}`}
                              style={{
                                flex: 1, padding: '9px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 700,
                                cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit',
                                border: provider === p ? `2px solid ${PROVIDERS[p].color}` : '2px solid rgba(255,255,255,0.08)',
                                background: provider === p ? `${PROVIDERS[p].color}22` : 'rgba(255,255,255,0.03)',
                                color: provider === p ? PROVIDERS[p].color : '#8892b0',
                              }}>
                              {p === 'openai'
                                ? '🟢'
                                : p === 'groq'
                                  ? '⚡'
                                  : p === 'openrouter'
                                    ? '🧭'
                                    : p === 'anthropic'
                                      ? '🧠'
                                      : '✨'}{' '}
                              {PROVIDERS[p].label}
                            </button>
                          ))}
                        </div>
                      </div>
                      {/* Model */}
                      <div>
                        <label style={{ fontSize: '13px', color: '#8892b0', display: 'block', marginBottom: '8px', fontWeight: 600 }}>Model</label>
                        <select value={model} onChange={e => { setModel(e.target.value); localStorage.setItem(LS_KEY_MODEL, e.target.value) }}
                          id="model-select"
                          style={{ width: '100%', background: '#0a0e1a', border: '1px solid rgba(108,99,255,0.2)', borderRadius: '8px', color: '#f0f4ff', padding: '10px 14px', outline: 'none', fontFamily: 'inherit', fontSize: '13px', cursor: 'pointer' }}>
                          {PROVIDERS[provider].models.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                        </select>
                      </div>
                      {/* API Key Input */}
                      <div>
                        <label style={{ fontSize: '13px', color: '#8892b0', display: 'block', marginBottom: '8px', fontWeight: 600 }}>{PROVIDERS[provider].label} API Key</label>
                        <div style={{ position: 'relative' }}>
                          <input type={showKey ? 'text' : 'password'} value={apiKeyInput}
                            onChange={e => setApiKeyInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') saveApiKey() }}
                            placeholder={PROVIDERS[provider].keyPlaceholder}
                            style={{ width: '100%', background: '#0a0e1a', border: `1px solid ${apiKey ? PROVIDERS[provider].color + '66' : 'rgba(108,99,255,0.2)'}`, borderRadius: '8px', color: '#f0f4ff', padding: '10px 44px 10px 14px', outline: 'none', fontFamily: 'Fira Code, monospace', fontSize: '13px', transition: 'border-color 0.2s' }}
                            id="api-key-input" />
                          <button onClick={() => setShowKey(v => !v)}
                            style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#8892b0', cursor: 'pointer', fontSize: '16px' }}>
                            {showKey ? '🙈' : '👁️'}
                          </button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button className="btn-primary" style={{ flex: 1, padding: '11px', fontSize: '14px' }} onClick={saveApiKey} id="save-api-key-btn">✓ Save Key</button>
                        {apiKey && <button className="btn-outline" style={{ padding: '11px 16px', fontSize: '14px' }} onClick={clearApiKey} id="clear-api-key-btn">Clear</button>}
                      </div>
                      {apiKey ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                          <div className="pulse-dot" style={{ width: '8px', height: '8px' }} />
                          <span style={{ color: PROVIDERS[provider].color }}>{PROVIDERS[provider].label}</span>
                          <span style={{ color: '#00ff88' }}>Active — Ready to Chat</span>
                        </div>
                      ) : (
                        <div style={{ color: '#ffd93d', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'flex-start', lineHeight: 1.5 }}>
                          <span>⚠️</span> Get a free {PROVIDERS[provider].label} key at{' '}
                          <a href={PROVIDERS[provider].docsUrl} target="_blank" rel="noreferrer" style={{ color: '#6c63ff' }}>{PROVIDERS[provider].docsUrl.replace('https://', '')}</a>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>

          {/* Right Panel — Chat Widget */}
          <div>
            <div className="chat-widget" style={{ maxWidth: '420px', margin: '0 auto' }}>
              {/* Chat Header */}
              <div className="chat-header" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: `linear-gradient(135deg, ${primary}, #00d4ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{config.botName}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#00ff88' }}>
                      <div className="pulse-dot" style={{ width: '7px', height: '7px' }} /> Online
                    </div>
                  </div>
                </div>
                <button onClick={clearChat} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#8892b0', cursor: 'pointer', padding: '6px 12px', fontSize: '12px' }} id="clear-chat-btn">
                  Clear
                </button>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} style={{ height: '340px', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.map((msg, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    {msg.role === 'bot' && (
                      <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: `linear-gradient(135deg, ${primary}, #00d4ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', marginRight: '8px', flexShrink: 0, alignSelf: 'flex-end' }}>🤖</div>
                    )}
                    <div style={{
                      maxWidth: '78%', padding: '10px 14px',
                      borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background: msg.role === 'user' ? `linear-gradient(135deg, ${primary}, #00d4ff)` : 'rgba(255,255,255,0.06)',
                      border: msg.role === 'bot' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                      fontSize: '13px', lineHeight: 1.6, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: `linear-gradient(135deg, ${primary}, #00d4ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>🤖</div>
                    <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px 18px 18px 4px', padding: '12px 18px' }}>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[0, 1, 2].map(j => (
                          <div key={j} style={{ width: '7px', height: '7px', borderRadius: '50%', background: primary, animation: `pulse 1.2s ${j * 0.2}s infinite` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Error */}
              {apiError && (
                <div style={{ margin: '0 16px', padding: '10px 14px', background: 'rgba(255,61,154,0.1)', border: '1px solid rgba(255,61,154,0.3)', borderRadius: '8px', color: '#ff3d9a', fontSize: '12px', lineHeight: 1.5 }}>
                  ⚠️ {apiError}
                </div>
              )}

              {/* Input */}
              <div style={{ padding: '14px 16px', borderTop: '1px solid rgba(108,99,255,0.15)', display: 'flex', gap: '10px' }}>
                <input
                  className="chat-input"
                  placeholder={apiKey || keyMode === 'shared'  ? 'Type your message...' : `🔑 Enter ${PROVIDERS[provider].label} API key to chat`}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                  disabled={loading}
                  style={{ flex: 1, padding: '11px 14px', fontSize: '13px' }}
                  id="chat-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  style={{
                    padding: '11px 18px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                    background: loading || !input.trim() ? 'rgba(108,99,255,0.3)' : `linear-gradient(135deg, ${primary}, #00d4ff)`,
                    color: 'white', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s',
                  }}
                  id="send-message-btn"
                >
                  {loading ? '...' : '→'}
                </button>
              </div>
            </div>

            {/* Embed code hint */}
            <div className="code-block" style={{ marginTop: '20px', padding: '16px' }}>
              <div style={{ color: '#8892b0', fontSize: '11px', marginBottom: '8px', fontFamily: 'inherit' }}>// Embed code for YOUR website</div>
              <div style={{ color: '#a29bfe', fontSize: '12px' }}>
                <span style={{ color: '#6c63ff' }}>&lt;script</span>{' '}
                <span style={{ color: '#00d4ff' }}>src</span>=<span style={{ color: '#00ff88' }}>"https://chatbotz.io/widget.js"</span>
                <br />
                {'  '}<span style={{ color: '#00d4ff' }}>data-bot-id</span>=<span style={{ color: '#00ff88' }}>"your-bot-id"</span>
                <span style={{ color: '#6c63ff' }}>&gt;&lt;/script&gt;</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
