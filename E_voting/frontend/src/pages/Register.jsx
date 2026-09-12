import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerVoter, sendOtp, verifyOtp } from '../api';
import FaceCapture from '../components/FaceCapture';

const STEPS = ['Your Details', 'Verify Email', 'Face Setup'];
const SESSION_KEY = 'register_progress';

export default function Register() {
  const navigate = useNavigate();

  // Restore progress from sessionStorage so a page refresh doesn't lose the step
  const saved = (() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || {}; } catch { return {}; }
  })();

  const [step, setStep] = useState(saved.step || 1);
  const [form, setForm] = useState(saved.form || { voter_id: '', name: '', age: '', email_id: '' });
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Persist step + form whenever they change
  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ step, form }));
  }, [step, form]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); setMsg({});
    try {
      await registerVoter(form);
      await sendOtp({ voter_id: form.voter_id, email: form.email_id });
      setMsg({ type: 'success', text: `OTP sent to ${form.email_id}` });
      setStep(2);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Registration failed.' });
    }
    setLoading(false);
  };

  const handleOtp = async (e) => {
    e.preventDefault(); setLoading(true); setMsg({});
    try {
      await verifyOtp({ voter_id: form.voter_id, otp });
      setMsg({ type: 'success', text: 'Email verified.' });
      setStep(3);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'OTP verification failed.' });
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand">✓ TrueVote</div>
        <p className="tagline">Complete all three steps to activate your voter account.</p>
        <div className="trust-items" style={{ marginTop: '2rem' }}>
          {STEPS.map((s, i) => (
            <div className="trust-item" key={i} style={{ opacity: step > i + 1 ? 0.5 : step === i + 1 ? 1 : 0.35 }}>
              <span>{step > i + 1 ? '✓' : i + 1}</span>
              <span style={{ fontWeight: step === i + 1 ? 600 : 400 }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(59,110,248,0.05)', border: '1px solid rgba(59,110,248,0.15)', borderRadius: 'var(--r-sm)' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--ink2)', lineHeight: 1.6 }}>
            Your account is <strong style={{ color: 'var(--ink)' }}>not created</strong> until all three steps are complete. Incomplete registrations are discarded automatically.
          </p>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h2>{STEPS[step - 1]}</h2>
          <p className="subtitle">Step {step} of 3</p>

          <div className="steps">
            {[1, 2, 3].map(s => (
              <div key={s} className={`step ${s < step ? 'done' : s === step ? 'active' : ''}`} />
            ))}
          </div>

          {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          {step === 1 && (
            <form onSubmit={handleRegister}>
              <div className="grid-2" style={{ gap: '0.75rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Voter ID</label>
                  <input value={form.voter_id} onChange={e => set('voter_id', e.target.value)} placeholder="V1001" required />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Age</label>
                  <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="18" min="18" required />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '0.75rem' }}>
                <label>Full Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your full name" required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email_id} onChange={e => set('email_id', e.target.value)} placeholder="you@email.com" required />
              </div>
              <button className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Saving…' : 'Continue →'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtp}>
              <p style={{ color: 'var(--ink2)', fontSize: '0.875rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                We sent a 6-digit code to <strong style={{ color: 'var(--blue)' }}>{form.email_id}</strong>
              </p>
              <div className="form-group">
                <label>Verification Code</label>
                <input
                  value={otp} onChange={e => setOtp(e.target.value)}
                  placeholder="000000" maxLength={6} required
                  style={{ fontSize: '1.6rem', letterSpacing: '0.6rem', textAlign: 'center', fontFamily: 'monospace' }}
                />
              </div>
              <button className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Verifying…' : 'Verify Code'}
              </button>
            </form>
          )}

          {step === 3 && (
            <FaceCapture
              userId={form.voter_id}
              onSuccess={() => {
                sessionStorage.removeItem(SESSION_KEY);
                setMsg({ type: 'success', text: 'Registration complete! Redirecting to login…' });
                setTimeout(() => navigate('/login'), 2000);
              }}
              onError={(err) => setMsg({ type: 'error', text: err || 'Face registration failed.' })}
            />
          )}

          <div className="switch-link">
            Already registered? <a onClick={() => { sessionStorage.removeItem(SESSION_KEY); navigate('/login'); }}>Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
