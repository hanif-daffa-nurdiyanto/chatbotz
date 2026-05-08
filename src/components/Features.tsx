import { useEffect, useRef } from 'react'

const FEATURES = [
  {
    icon: '🧠',
    title: 'Train with Your Data',
    desc: 'Upload FAQs, product docs, or any text. The bot learns your business context and answers accurately.',
    color: '#6c63ff',
  },
  {
    icon: '🔌',
    title: 'One-Line Embed',
    desc: 'Add a single <script> tag to any website. Works with WordPress, Webflow, Shopify, or plain HTML.',
    color: '#00d4ff',
  },
  {
    icon: '⚡',
    title: 'Blazing Fast Response',
    desc: 'Powered by GPT-4 with optimized prompts. Responses in under 2 seconds, every time.',
    color: '#00ff88',
  },
  {
    icon: '🔑',
    title: 'Bring Your API Key',
    desc: 'Free tier lets you use your own OpenAI key. Full control, no vendor lock-in, zero markup.',
    color: '#ff3d9a',
  },
  {
    icon: '🎨',
    title: 'Full Customization',
    desc: 'Match your brand colors, logo, bot name, and persona. Make it truly yours.',
    color: '#ffd93d',
  },
  {
    icon: '📊',
    title: 'Analytics Dashboard',
    desc: 'Track conversations, common questions, and engagement metrics in real time.',
    color: '#6c63ff',
  },
]

export function Features() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.15 }
    )
    sectionRef.current?.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" ref={sectionRef} style={{ padding: '100px 24px', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Heading */}
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="badge" style={{ margin: '0 auto 20px' }}>✦ Features</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '16px' }}>
            Everything You Need to{' '}
            <span className="gradient-text">Deploy Smarter</span>
          </h2>
          <p style={{ color: '#8892b0', fontSize: '18px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.7 }}>
            A complete chatbot infrastructure — from training to deployment — in one simple platform.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="glass-card feature-card fade-in" style={{ padding: '32px', animationDelay: `${i * 0.1}s` }}>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: `${f.color}20`, border: `1px solid ${f.color}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '24px', marginBottom: '20px',
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px', marginBottom: '10px' }}>
                {f.title}
              </h3>
              <p style={{ color: '#8892b0', fontSize: '14px', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
