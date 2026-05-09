import { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useUser } from '@clerk/clerk-react'

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Demo', href: '#demo' },
  { label: 'Pricing', href: '#pricing' },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { isSignedIn } = useUser()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollTo = (href: string) => {
    setMobileOpen(false)
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(5,8,20,0.9)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(108,99,255,0.15)' : 'none',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #6c63ff, #00d4ff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px',
            }}>🤖</div>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '20px', letterSpacing: '-0.5px' }}>
              chat<span className="gradient-text">botz</span>
            </span>
          </div>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }} className="hidden-mobile">
            {NAV_LINKS.map(link => (
              <button key={link.label} className="nav-link" style={{ background: 'none', border: 'none', fontFamily: 'inherit' }}
                onClick={() => scrollTo(link.href)}>
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }} className="hidden-mobile">
            <button className="btn-outline" style={{ padding: '8px 20px', fontSize: '14px' }}
              onClick={() => scrollTo('#demo')}>
              Try Demo
            </button>
            {isSignedIn ? (
              <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}
                onClick={() => navigate({ to: '/admin/dashboard' })}>
                Dashboard
              </button>
            ) : (
              <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}
                onClick={() => navigate({ to: '/login' })}>
                Get Started
              </button>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '24px', display: 'none' }}
            className="show-mobile"
            onClick={() => setMobileOpen(v => !v)}
            id="mobile-menu-btn"
          >
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{
            background: 'rgba(8,13,31,0.98)', borderRadius: '12px', padding: '16px',
            marginBottom: '12px', border: '1px solid rgba(108,99,255,0.2)',
          }}>
            {NAV_LINKS.map(link => (
              <button key={link.label} onClick={() => scrollTo(link.href)}
                style={{ display: 'block', width: '100%', background: 'none', border: 'none', color: '#8892b0', padding: '12px', textAlign: 'left', cursor: 'pointer', borderRadius: '8px', fontFamily: 'inherit', fontSize: '15px' }}>
                {link.label}
              </button>
            ))}
            {isSignedIn ? (
              <button className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '14px' }}
                onClick={() => navigate({ to: '/admin/dashboard' })}>
                Dashboard
              </button>
            ) : (
              <button className="btn-primary" style={{ width: '100%', padding: '12px', marginTop: '8px', fontSize: '14px' }}
                onClick={() => navigate({ to: '/login' })}>
                Get Started Free
              </button>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
