import { useNavigate } from 'react-router-dom';

const features = [
  { icon: '🔐', title: 'Multi-Factor Auth', desc: 'OTP email verification + face recognition for every login.' },
  { icon: '👤', title: 'Face Recognition', desc: 'OpenCV-powered biometric identity check before casting votes.' },
  { icon: '⛓️', title: 'Blockchain Ledger', desc: 'SHA-256 hashed, immutable record of every vote cast.' },
  { icon: '🤖', title: 'AI Fraud Detection', desc: 'Real-time pattern analysis blocks duplicate or suspicious votes.' },
  { icon: '📊', title: 'Live Results', desc: 'Watch vote counts update in real time with charts.' },
  { icon: '🔍', title: 'Verifiable Votes', desc: 'Every voter gets a cryptographic receipt tied to a block.' },
];

const steps = [
  { n: '01', title: 'Register', desc: 'Create your voter account with ID, email, and age.' },
  { n: '02', title: 'Verify', desc: 'Confirm your email via OTP, then register your face via webcam.' },
  { n: '03', title: 'Vote', desc: 'Verify your face, pick your candidate, and confirm.' },
  { n: '04', title: 'Track', desc: 'Watch live results and verify your vote on the blockchain.' },
];

export default function Home() {
  const nav = useNavigate();

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', fontFamily: '"Inter", sans-serif' }}>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: '7rem 0 5rem', overflow: 'hidden' }}>
        {/* background glows */}
        <div style={{ position: 'absolute', top: '-120px', left: '10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,138,249,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '60px', right: '5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(62,207,142,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(91,138,249,0.1)', border: '1px solid rgba(91,138,249,0.2)', borderRadius: 999, padding: '0.3rem 0.85rem', marginBottom: '1.5rem' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 6px var(--green)' }} />
              <span style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--blue-l)' }}>Secure E-Voting Platform</span>
            </div>

            <h1 style={{ fontSize: 'clamp(2.6rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.08, letterSpacing: '-1.5px', color: 'var(--ink)', marginBottom: '1.25rem' }}>
              Your vote.<br />
              <span style={{ background: 'linear-gradient(135deg, #5b8af9, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Protected.
              </span>
            </h1>

            <p style={{ fontSize: '1rem', color: 'var(--ink2)', lineHeight: 1.8, marginBottom: '2rem', maxWidth: 400 }}>
              Multi-factor auth, face recognition, and a blockchain ledger — every vote secured end to end.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                onClick={() => nav('/register')}
                className="btn btn-primary"
                style={{ padding: '0.75rem 1.75rem', fontSize: '0.9rem' }}
              >
                Register to Vote
              </button>
              <button
                onClick={() => nav('/login')}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
              >
                Sign In →
              </button>
            </div>

            <div style={{ display: 'flex', gap: '2rem', marginTop: '2.5rem' }}>
              {[['🔒', 'End-to-end encrypted'], ['⚡', 'Real-time results'], ['✅', 'Blockchain verified']].map(([icon, label]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', color: 'var(--ink2)' }}>
                  <span>{icon}</span><span>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mock UI */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}>
            {/* browser chrome */}
            <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              {['#f06060', '#f0a040', '#3ecf8e'].map((c, i) => (
                <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c, display: 'inline-block' }} />
              ))}
              <div style={{ marginLeft: '0.75rem', flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, padding: '0.2rem 0.65rem', fontSize: '0.62rem', color: 'var(--ink3)', fontFamily: 'monospace' }}>
                truevote.app/elections
              </div>
            </div>

            <div style={{ padding: '1.1rem' }}>
              {/* header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink)' }}>Elections</span>
                <span style={{ fontSize: '0.6rem', background: 'var(--blue-dim)', color: 'var(--blue-l)', border: '1px solid rgba(91,138,249,0.2)', borderRadius: 4, padding: '0.15rem 0.45rem', fontWeight: 700 }}>2 Active</span>
              </div>

              {/* election card */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.85rem', marginBottom: '0.6rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink)' }}>General Election 2025</span>
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, background: 'rgba(62,207,142,0.12)', color: '#3ecf8e', border: '1px solid rgba(62,207,142,0.25)', borderRadius: 4, padding: '0.12rem 0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active</span>
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--ink3)', marginBottom: '0.65rem' }}>Apr 1 — Apr 30, 2025</div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <div style={{ flex: 1, background: 'var(--blue)', borderRadius: 5, padding: '0.32rem 0', textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: '#fff' }}>Vote</div>
                  <div style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 5, padding: '0.32rem 0', textAlign: 'center', fontSize: '0.65rem', color: 'var(--ink2)' }}>Results</div>
                </div>
              </div>

              {/* live results */}
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '0.85rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.7rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Live Results</span>
                  <span style={{ color: 'var(--green)', fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 4px var(--green)' }} />
                    Live
                  </span>
                </div>
                {[{ n: 'Candidate A', p: 62, c: 'var(--blue)' }, { n: 'Candidate B', p: 28, c: 'var(--green)' }, { n: 'Candidate C', p: 10, c: 'var(--amber)' }].map((c, i) => (
                  <div key={i} style={{ marginBottom: i < 2 ? '0.55rem' : 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.62rem', color: 'var(--ink2)', marginBottom: '0.2rem' }}>
                      <span>{c.n}</span>
                      <span style={{ color: c.c, fontWeight: 700 }}>{c.p}%</span>
                    </div>
                    <div style={{ background: 'var(--surface2)', borderRadius: 999, height: 4, overflow: 'hidden' }}>
                      <div style={{ width: `${c.p}%`, height: '100%', background: c.c, borderRadius: 999 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{ padding: '5rem 0', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue-l)', marginBottom: '0.75rem' }}>Why TrueVote</div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px' }}>Built for trust, designed for security</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r)', padding: '1.5rem',
                transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                cursor: 'default',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-h)'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 'var(--r-sm)', background: 'var(--blue-dim)', border: '1px solid rgba(91,138,249,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', marginBottom: '1rem' }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '0.4rem' }}>{f.title}</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink2)', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ padding: '5rem 0', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: '0.75rem' }}>Process</div>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px' }}>How it works</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            {steps.map((s, i) => (
              <div key={i} style={{ position: 'relative' }}>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: 20, left: '60%', right: '-40%', height: 1, background: 'linear-gradient(90deg, var(--border-h), var(--border))', zIndex: 0 }} />
                )}
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--blue-dim)', border: '2px solid rgba(91,138,249,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--blue-l)', marginBottom: '1rem', fontFamily: 'monospace' }}>
                    {s.n}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--ink)', marginBottom: '0.4rem' }}>{s.title}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--ink2)', lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BLOCKCHAIN SECTION ── */}
      <section style={{ padding: '5rem 0', borderTop: '1px solid var(--border)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: '-100px', right: '10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,138,249,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--blue-l)', marginBottom: '0.75rem' }}>Blockchain</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: '1rem', lineHeight: 1.2 }}>
              Every vote on the blockchain.
            </h2>
            <p style={{ color: 'var(--ink2)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '1.5rem' }}>
              SHA-256 hashed and chained — any tampering breaks the entire ledger instantly. Your vote is permanent and verifiable.
            </p>
            <button
              onClick={() => nav('/login')}
              className="btn btn-secondary"
              style={{ fontSize: '0.85rem' }}
            >
              View blockchain →
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { b: 'Block #1', hash: 'a3f8c291...d4e7', prev: '00000000' },
              { b: 'Block #2', hash: 'b7d2e104...9f3a', prev: 'a3f8c291...' },
              { b: 'Block #3', hash: 'f1a98b37...2c6d', prev: 'b7d2e104...' },
            ].map((b, i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-sm)', padding: '0.85rem 1.1rem',
                fontFamily: '"Fira Code","Courier New",monospace', fontSize: '0.72rem',
                transition: 'border-color 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-h)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <span style={{ color: 'var(--blue-l)', fontWeight: 700 }}>{b.b}</span>
                <span style={{ color: 'var(--ink3)', marginLeft: '1rem' }}>hash: <span style={{ color: 'var(--ink2)' }}>{b.hash}</span></span>
                <span style={{ color: 'var(--ink3)', marginLeft: '1rem' }}>prev: <span style={{ color: 'var(--ink2)' }}>{b.prev}</span></span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1.1rem', fontSize: '0.7rem', color: 'var(--green)', fontFamily: 'monospace' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 6px var(--green)' }} />
              Chain integrity: VALID
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '5rem 0', borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: 520, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: '0.75rem' }}>
              Ready to participate?
            </h2>
            <p style={{ color: 'var(--ink2)', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.7 }}>
              Create your account in under a minute. Your identity is protected at every step.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={() => nav('/register')}
                className="btn btn-primary"
                style={{ padding: '0.75rem 2rem', fontSize: '0.9rem' }}
              >
                Register to Vote
              </button>
              <button
                onClick={() => nav('/admin/login')}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 1.5rem', fontSize: '0.9rem' }}
              >
                Admin Panel
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '1.5rem 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--ink2)', letterSpacing: '-0.3px' }}>
            ✓ True<span style={{ color: 'var(--blue)' }}>Vote</span>
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--ink3)' }}>Django · React · OpenCV · SHA-256 Blockchain</span>
        </div>
      </footer>

      <style>{`
        @media (max-width: 700px) {
          section > div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; }
          section > div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; }
          section > div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  );
}
