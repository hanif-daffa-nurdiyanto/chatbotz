import { useState, useEffect } from 'react'

const TYPING_WORDS = ['Any Website', 'E-Commerce', 'SaaS Platform', 'Startup Product']

export function Hero() {
  const [wordIdx, setWordIdx] = useState(0)
  const [displayed, setDisplayed] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const target = TYPING_WORDS[wordIdx]
    let timeout: ReturnType<typeof setTimeout>

    if (!deleting && displayed.length < target.length) {
      timeout = setTimeout(() => setDisplayed(target.slice(0, displayed.length + 1)), 80)
    } else if (!deleting && displayed.length === target.length) {
      timeout = setTimeout(() => setDeleting(true), 2000)
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45)
    } else if (deleting && displayed.length === 0) {
      setDeleting(false)
      setWordIdx(i => (i + 1) % TYPING_WORDS.length)
    }
    return () => clearTimeout(timeout)
  }, [displayed, deleting, wordIdx])

  const scrollTo = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', overflow: 'hidden', paddingTop: '70px' }} className="bg-grid">
      {/* Orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', position: 'relative', zIndex: 1, width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }} className="hero-grid">
          {/* Left */}
          <div>
            <div className="badge" style={{ marginBottom: '24px' }}>
              <span>✨</span> AI-Powered Chatbot Service
            </div>

            <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(36px, 5vw, 62px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-2px', marginBottom: '24px' }}>
              Smart Chatbot for{' '}
              <span className="gradient-text typing-cursor" style={{
                display: 'inline-block',
                minWidth: '200px',
                textAlign: 'left'
              }}>{displayed || '\u00A0'}</span>
            </h1>

            <p style={{ color: '#8892b0', fontSize: '18px', lineHeight: 1.7, marginBottom: '40px', maxWidth: '480px' }}>
              Embed a fully customizable AI chatbot on your website in minutes. Train it with your own data, connect your API key, and start serving customers 24/7.
            </p>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '32px', marginBottom: '40px', flexWrap: 'wrap' }}>
              {[['500+', 'Websites'], ['99.9%', 'Uptime'], ['< 2min', 'Setup Time']].map(([val, label]) => (
                <div key={label}>
                  <div className="gradient-text" style={{ fontSize: '28px', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif' }}>{val}</div>
                  <div style={{ color: '#8892b0', fontSize: '13px' }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }} onClick={() => scrollTo('#demo')} id="hero-try-demo">
                🚀 Try Live Demo
              </button>
              <button className="btn-outline" style={{ padding: '14px 32px', fontSize: '16px' }} onClick={() => scrollTo('#how-it-works')} id="hero-how-it-works">
                How It Works
              </button>
            </div>
          </div>

          {/* Right — Mini Chat Preview */}
          <div style={{ position: 'relative' }}>
            <MiniChatPreview />
          </div>
        </div>
      </div>
    </section>
  )
}

function MiniChatPreview() {
  const messages = [
    { role: 'bot', text: 'Hi! 👋 How can I help you today?' },
    { role: 'user', text: 'What are your business hours?' },
    { role: 'bot', text: 'We\'re open Mon–Fri, 9 AM–6 PM. Is there anything else I can help you with? 😊' },
  ]

  return (
    <div style={{ position: 'relative' }}>
      {/* Glow behind card */}
      <div style={{ position: 'absolute', inset: '-20px', background: 'radial-gradient(circle at center, rgba(108,99,255,0.15), transparent 70%)', borderRadius: '30px' }} />

      <div className="chat-widget" style={{ position: 'relative', maxWidth: '380px', margin: '0 auto' }}>
        {/* Header */}
        <div className="chat-header" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Chatbotz Assistant</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#00ff88' }}>
              <div className="pulse-dot" style={{ width: '7px', height: '7px' }} /> Online
            </div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ padding: '16px', minHeight: '200px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', animationDelay: `${i * 0.3}s` }} className="chat-bubble">
              <div style={{
                maxWidth: '80%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: msg.role === 'user' ? 'linear-gradient(135deg, #6c63ff, #00d4ff)' : 'rgba(255,255,255,0.07)',
                border: msg.role === 'bot' ? '1px solid rgba(108,99,255,0.2)' : 'none',
                fontSize: '13px', lineHeight: 1.5,
              }}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(108,99,255,0.15)', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input className="chat-input" placeholder="Type a message..." style={{ flex: 1, padding: '10px 14px', fontSize: '13px' }} readOnly />
          <button className="btn-primary" style={{ padding: '10px 16px', fontSize: '13px', borderRadius: '10px' }}>→</button>
        </div>
      </div>

      {/* Floating badges */}
      <div style={{ position: 'absolute', top: '-20px', right: '-20px', background: 'rgba(0,255,136,0.15)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: '12px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, color: '#00ff88' }}>
        ✓ Live & Active
      </div>
      <div style={{ position: 'absolute', bottom: '20px', left: '-30px', background: 'rgba(108,99,255,0.2)', border: '1px solid rgba(108,99,255,0.3)', borderRadius: '12px', padding: '8px 14px', fontSize: '12px', fontWeight: 600, color: '#a29bfe' }}>
        🔌 1-Line Embed
      </div>
    </div>
  )
}
