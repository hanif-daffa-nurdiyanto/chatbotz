import { useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'

const PLANS = [
  {
    name: 'Free',
    price: 'Rp 0',
    period: '/month',
    desc: 'Perfect for testing and small websites',
    color: '#8892b0',
    features: [
      '✓ Use your own OpenAI API key',
      '✓ 1 chatbot widget',
      '✓ Up to 100 messages/day',
      '✓ Basic customization',
      '✓ System prompt editor',
      '✗ Analytics dashboard',
      '✗ Remove Chatbotz branding',
      '✗ Priority support',
    ],
    cta: 'Start Free',
    popular: false,
  },
  {
    name: 'Pro',
    price: 'Rp 199K',
    period: '/month',
    desc: 'For growing businesses that need more',
    color: '#6c63ff',
    features: [
      '✓ Shared API key included',
      '✓ Up to 5 chatbot widgets',
      '✓ Unlimited messages',
      '✓ Full customization',
      '✓ System prompt editor',
      '✓ Analytics dashboard',
      '✓ Remove Chatbotz branding',
      '✓ Email support',
    ],
    cta: 'Get Pro',
    popular: true,
  },
  {
    name: 'Agency',
    price: 'Rp 499K',
    period: '/month',
    desc: 'For agencies managing multiple clients',
    color: '#00d4ff',
    features: [
      '✓ Shared API key included',
      '✓ Unlimited chatbot widgets',
      '✓ Unlimited messages',
      '✓ White-label solution',
      '✓ Multi-client dashboard',
      '✓ Advanced analytics',
      '✓ Custom domain embed',
      '✓ Priority 24/7 support',
    ],
    cta: 'Contact Us',
    popular: false,
  },
]

export function Pricing() {
  const ref = useRef<HTMLElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    ref.current?.querySelectorAll('.fade-in').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const startHandler = () => {
    navigate({ to: '/login' })
  }

  return (
    <section id="pricing" ref={ref} style={{ padding: '100px 24px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '700px', height: '400px', background: 'radial-gradient(ellipse at center, rgba(108,99,255,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        <div className="fade-in" style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div className="badge" style={{ margin: '0 auto 20px' }}>💎 Pricing</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '16px' }}>
            Simple, <span className="gradient-text">Transparent Pricing</span>
          </h2>
          <p style={{ color: '#8892b0', fontSize: '18px', maxWidth: '500px', margin: '0 auto' }}>
            Start free with your own API key. Upgrade when you're ready for more power.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', alignItems: 'center' }}>
          {PLANS.map((plan, i) => (
            <div key={plan.name} className={`glass-card pricing-card fade-in ${plan.popular ? 'popular' : ''}`}
              style={{
                padding: '36px 32px', transitionDelay: `${i * 0.1}s`,
                transform: plan.popular ? 'scale(1.04)' : 'scale(1)',
                position: 'relative', overflow: 'hidden',
              }}>
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '16px', right: '16px',
                  background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
                  color: 'white', fontSize: '11px', fontWeight: 700,
                  padding: '4px 12px', borderRadius: '20px', letterSpacing: '0.05em',
                }}>
                  MOST POPULAR
                </div>
              )}
              {plan.popular && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #6c63ff, #00d4ff)' }} />
              )}

              <div style={{ color: plan.color, fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '12px', textTransform: 'uppercase' }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '40px', fontWeight: 800 }}>{plan.price}</span>
                <span style={{ color: '#8892b0', fontSize: '14px', marginBottom: '8px' }}>{plan.period}</span>
              </div>
              <p style={{ color: '#8892b0', fontSize: '14px', marginBottom: '28px' }}>{plan.desc}</p>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plan.features.map(f => (
                  <div key={f} style={{ fontSize: '13px', color: f.startsWith('✓') ? '#f0f4ff' : '#4a5568', display: 'flex', gap: '4px' }}>
                    {f}
                  </div>
                ))}
              </div>

              <button
                className={plan.popular ? 'btn-primary' : 'btn-outline'}
                style={{ width: '100%', padding: '13px', fontSize: '15px', borderColor: plan.color, color: plan.popular ? 'white' : plan.color }}
                id={`pricing-cta-${plan.name.toLowerCase()}`}
                onClick={startHandler}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="fade-in" style={{ textAlign: 'center', color: '#8892b0', fontSize: '14px', marginTop: '40px' }}>
          💳 All plans include a 14-day money-back guarantee. No credit card required for Free plan.
        </p>
      </div>
    </section>
  )
}
