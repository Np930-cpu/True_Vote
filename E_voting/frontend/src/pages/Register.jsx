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

  const [form, setForm] = useState(saved.form || { voter_id: '', name: '', age: '', email_id: '' });
  const [step2Verified, setStep2Verified] = useState(saved.step2_verified || false);
  const [step, setStep] = useState(() => {
    if (saved.step === 3 && saved.form?.voter_id && saved.step2_verified) return 3;
    if (saved.step === 2 && saved.form?.voter_id) return 2;
    return 1;
  });
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Persist step + form + verified flag whenever they change
  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ step, form, step2_verified: step2Verified }));
  }, [step, form, step2Verified]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async (e) => {
    e.preventDefault(); setLoading(true); setMsg({});

    const trimmedForm = {
      voter_id: (form.voter_id || '').trim(),
      name: (form.name || '').trim(),
      age: parseInt(form.age, 10),
      email_id: (form.email_id || '').trim().toLowerCase(),
    };

    if (trimmedForm.name.length < 2) {
      setMsg({ type: 'error', text: 'Please enter your full name (at least 2 characters).' });
      setLoading(false);
      return;
    }
    if (trimmedForm.voter_id.length < 3) {
      setMsg({ type: 'error', text: 'Voter ID must be at least 3 characters long.' });
      setLoading(false);
      return;
    }
    if (!trimmedForm.age || trimmedForm.age < 18) {
      setMsg({ type: 'error', text: 'You must be at least 18 years old to register.' });
      setLoading(false);
      return;
    }

    try {
      await registerVoter(trimmedForm);
      const res = await sendOtp({ voter_id: trimmedForm.voter_id, email: trimmedForm.email_id });
      setForm(trimmedForm);
      setOtp('');
      setStep2Verified(false);
      setMsg({ type: 'success', text: res.data?.message || `OTP sent to ${trimmedForm.email_id}. Please check your email inbox.` });
      setStep(2);
    } catch (err) {
      let errorText = err.response?.data?.error || err.response?.data?.message;
      if (!errorText) {
        if (!err.response) {
          errorText = 'Unable to connect to server. Please try again.';
        } else {
          errorText = 'Registration failed. Please check your details.';
        }
      }
      setMsg({ type: 'error', text: errorText });
    }
    setLoading(false);
  };

  const handleResendOtp = async () => {
    setLoading(true); setMsg({});
    try {
      const res = await sendOtp({ voter_id: form.voter_id, email: form.email_id });
      setOtp('');
      setMsg({ type: 'success', text: res.data?.message || `New OTP sent to ${form.email_id}. Please check your inbox.` });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to resend OTP.' });
    }
    setLoading(false);
  };

  const handleOtp = async (e) => {
    e.preventDefault(); setLoading(true); setMsg({});
    const cleanOtp = (otp || '').trim();
    if (cleanOtp.length !== 6) {
      setMsg({ type: 'error', text: 'Please enter a valid 6-digit verification code.' });
      setLoading(false);
      return;
    }
    try {
      await verifyOtp({ voter_id: form.voter_id, otp: cleanOtp });
      setStep2Verified(true);
      setMsg({ type: 'success', text: 'Email verified successfully! Proceeding to face setup.' });
      setStep(3);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'OTP verification failed. Please try again.' });
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
            Your account is <strong style={{ color: 'var(--ink)' }}>not registered in the database</strong> until all three steps are successfully completed. Incomplete registrations are discarded automatically.
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
                  <input type="number" value={form.age} onChange={e => set('age', e.target.value)} placeholder="18" min="18" max="120" required />
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
                We sent a 6-digit verification code to <strong style={{ color: 'var(--blue)' }}>{form.email_id}</strong>. Please check your inbox (and spam folder) and enter the code below.
              </p>
              <div className="form-group">
                <label>Verification Code</label>
                <input
                  value={otp} onChange={e => setOtp(e.target.value)}
                  placeholder="000000" maxLength={6} required
                  style={{ fontSize: '1.6rem', letterSpacing: '0.6rem', textAlign: 'center', fontFamily: 'monospace' }}
                  autoFocus
                />
              </div>
              <button className="btn btn-primary btn-full" disabled={loading} style={{ marginBottom: '0.75rem' }}>
                {loading ? 'Verifying…' : 'Verify Code'}
              </button>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
                <button
                  type="button"
                  onClick={() => { setStep(1); setStep2Verified(false); }}
                  style={{ background: 'none', border: 'none', color: 'var(--ink2)', cursor: 'pointer', padding: 0 }}
                >
                  ← Edit details
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={loading}
                  style={{ background: 'none', border: 'none', color: 'var(--blue)', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  Resend code
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div>
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(59,110,248,0.06)', borderRadius: 'var(--r-sm)', fontSize: '0.82rem', color: 'var(--ink2)', lineHeight: 1.5 }}>
                🔒 <strong>Final Step:</strong> Please look into your camera to register your biometric face profile. Your voter account will only be activated and created in the system after this step completes successfully.
              </div>
              <FaceCapture
                userId={form.voter_id}
                onSuccess={() => {
                  sessionStorage.removeItem(SESSION_KEY);
                  setMsg({ type: 'success', text: 'Registration complete! All steps verified. Redirecting to login…' });
                  setTimeout(() => navigate('/login'), 2200);
                }}
                onError={(err) => setMsg({ type: 'error', text: err || 'Face registration failed.' })}
              />
            </div>
          )}

          <div className="switch-link">
            Already registered? <a onClick={() => { sessionStorage.removeItem(SESSION_KEY); navigate('/login'); }}>Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
