const TESTIMONIALS = [
  {
    name: 'Rizky Pratama',
    role: 'Founder, TokoOnline.id',
    avatar: '👨‍💼',
    text: '"Chatbotz reduced our support tickets by 70% in the first week. Setup was literally 5 minutes. Absolutely mind-blowing."',
    rating: 5,
  },
  {
    name: 'Sarah Wijaya',
    role: 'CEO, BudgetTravel App',
    avatar: '👩‍💻',
    text: '"Our users love the instant responses. The system prompt customization is perfect — the bot knows our product better than some of our staff!"',
    rating: 5,
  },
  {
    name: 'Dian Santoso',
    role: 'Digital Marketing Lead',
    avatar: '👨‍🎨',
    text: '"I manage 12 client websites. Chatbotz Agency plan saved me 20+ hours per month. The white-label feature is chef\'s kiss."',
    rating: 5,
  },
]

export function Testimonials() {
  return (
    <section style={{ padding: '80px 24px', background: 'rgba(8,13,31,0.3)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div className="badge" style={{ margin: '0 auto 20px' }}>💬 Testimonials</div>
          <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 800, letterSpacing: '-1px' }}>
            Loved by <span className="gradient-text">500+ Websites</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="glass-card" style={{ padding: '28px', transition: 'all 0.3s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-6px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)' }}>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', color: '#ffd93d' }}>
                {'★'.repeat(t.rating)}
              </div>
              <p style={{ color: '#c8d0e7', fontSize: '14px', lineHeight: 1.7, marginBottom: '20px', fontStyle: 'italic' }}>
                {t.text}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff30, #00d4ff30)', border: '1px solid rgba(108,99,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                  {t.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px' }}>{t.name}</div>
                  <div style={{ color: '#8892b0', fontSize: '12px' }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <footer style={{ borderTop: '1px solid rgba(108,99,255,0.15)', padding: '60px 24px 32px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', marginBottom: '48px' }} className="footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #6c63ff, #00d4ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🤖</div>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: '18px' }}>
                chat<span className="gradient-text">botz</span>
              </span>
            </div>
            <p style={{ color: '#8892b0', fontSize: '14px', lineHeight: 1.7, maxWidth: '280px' }}>
              Deploy intelligent AI chatbots on any website in minutes. Trusted by 500+ businesses worldwide.
            </p>
          </div>

          {/* Links */}
          {[
            { title: 'Product', links: [['Features', '#features'], ['How It Works', '#how-it-works'], ['Demo', '#demo'], ['Pricing', '#pricing']] },
            { title: 'Company', links: [['About', '#'], ['Blog', '#'], ['Careers', '#'], ['Contact', '#']] },
            { title: 'Legal', links: [['Privacy Policy', '#'], ['Terms of Service', '#'], ['Cookie Policy', '#']] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontWeight: 700, fontSize: '13px', letterSpacing: '0.05em', textTransform: 'uppercase', color: '#f0f4ff', marginBottom: '16px' }}>{col.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {col.links.map(([label, href]) => (
                  <button key={label} onClick={() => scrollTo(href)}
                    style={{ background: 'none', border: 'none', color: '#8892b0', fontSize: '14px', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'color 0.2s', padding: 0 }}
                    onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = '#f0f4ff' }}
                    onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = '#8892b0' }}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <p style={{ color: '#8892b0', fontSize: '13px' }}>© 2024 Chatbotz. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '20px' }}>
            {['🐦 Twitter', '💬 Discord', '📧 Email'].map(s => (
              <button key={s} style={{ background: 'none', border: 'none', color: '#8892b0', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.2s' }}
                onMouseEnter={e => { (e.target as HTMLButtonElement).style.color = '#f0f4ff' }}
                onMouseLeave={e => { (e.target as HTMLButtonElement).style.color = '#8892b0' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
