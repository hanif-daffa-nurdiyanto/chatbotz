import { useEffect, useRef } from 'react'

const STEPS = [
  {
    num: '01',
    icon: '📝',
    title: 'Set Up Your System Prompt',
    desc: 'Provide your business info, FAQs, and tone in the dashboard. This becomes your bot\'s knowledge base and personality.',
    color: '#6c63ff',
  },
  {
    num: '02',
    icon: '🔑',
    title: 'Add Your API Key (Free Tier)',
    desc: 'Paste your OpenAI API key — we never store it permanently. Pro users get a shared key with no limits.',
    color: '#00d4ff',
  },
  {
    num: '03',
    icon: '🎨',
    title: 'Customize the Widget',
    desc: 'Set your brand colors, bot avatar, name, and welcome message. Preview live before publishing.',
    color: '#00ff88',
  },
  {
    num: '04',
    icon: '🚀',
    title: 'Embed & Go Live',
    desc: 'Copy one line of code and paste it into your website. Your chatbot is live and serving customers instantly.',
    color: '#ff3d9a',
  },
]

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    ref.current?.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="how-it-works" ref={ref} style={{ padding: '100px 24px', background: 'rgba(8,13,31,0.5)', position: 'relative', overflow: 'hidden' }}>
      {/* Background accent */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(108,99,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '72px' }}>
          <div className="badge" style={{ margin: '0 auto 20px' }}>⚡ Quick Setup</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '16px' }}>
            Live in <span className="gradient-text-green">4 Simple Steps</span>
          </h2>
          <p style={{ color: '#8892b0', fontSize: '18px', maxWidth: '500px', margin: '0 auto' }}>
            No complex setup, no devops knowledge required.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', position: 'relative' }}>
          {STEPS.map((step, i) => (
            <div key={step.num} className="fade-in" style={{ transitionDelay: `${i * 0.15}s`, position: 'relative' }}>
              <div className="glass-card" style={{ padding: '32px', height: '100%', transition: 'all 0.3s ease' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${step.color}60`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(108,99,255,0.2)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}>
                {/* Step number */}
                <div style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: '48px', fontWeight: 900,
                  background: `linear-gradient(135deg, ${step.color}40, ${step.color}10)`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  lineHeight: 1, marginBottom: '16px',
                }}>
                  {step.num}
                </div>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: `${step.color}20`, border: `1px solid ${step.color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', marginBottom: '16px',
                }}>
                  {step.icon}
                </div>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '17px', marginBottom: '10px' }}>
                  {step.title}
                </h3>
                <p style={{ color: '#8892b0', fontSize: '14px', lineHeight: 1.7 }}>{step.desc}</p>

                {/* Connector arrow (not last) */}
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', top: '50%', right: '-14px',
                    transform: 'translateY(-50%)',
                    color: step.color, fontSize: '24px', fontWeight: 700,
                    display: 'none', // hidden on mobile, shown via CSS in __root media queries
                  }} className="step-arrow">→</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
