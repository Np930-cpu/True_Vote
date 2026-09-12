import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendLoginOtp, verifyLoginOtp } from '../api';
import { useAuth } from '../context/useAuth';

const SESSION_KEY = 'login_progress';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const saved = (() => {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY)) || {}; } catch { return {}; }
  })();

  const [step, setStep] = useState(saved.step || 1);
  const [voterId, setVoterId] = useState(saved.voterId || '');
  const [otp, setOtp] = useState('');
  const [maskedEmail, setMaskedEmail] = useState(saved.maskedEmail || '');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ step, voterId, maskedEmail }));
  }, [step, voterId, maskedEmail]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg({});
    try {
      const res = await sendLoginOtp({ voter_id: voterId });
      setMaskedEmail(res.data.message);
      setStep(2);
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to send OTP.';
      setMsg({ type: 'error', text: error });
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg({});
    try {
      const res = await verifyLoginOtp({ voter_id: voterId, otp });
      sessionStorage.removeItem(SESSION_KEY);
      login({ voter_id: voterId }, res.data.access, res.data.refresh);
      navigate('/elections');
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Invalid OTP.' });
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand">✓ TrueVote</div>
        <p className="tagline">
          Passwordless login — enter your Voter ID and we'll send a one-time code to your registered email.
        </p>
        <div className="trust-items">
          {[
            { icon: '🔒', text: 'No password needed' },
            { icon: '📧', text: 'OTP sent to registered email' },
            { icon: '⏱️', text: 'Code expires in 10 minutes' },
          ].map((t, i) => (
            <div className="trust-item" key={i}>
              <span>{t.icon}</span>
              <span>{t.text}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h2>{step === 1 ? 'Sign In' : 'Enter OTP'}</h2>
          <p className="subtitle">
            {step === 1 ? 'Enter your Voter ID to receive a login code' : maskedEmail}
          </p>

          <div className="steps">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`} />
            <div className={`step ${step === 2 ? 'active' : ''}`} />
          </div>

          {msg.text && (
            <div className={`alert alert-${msg.type}`}>
              {msg.text}
              {(msg.text.includes('OTP') || msg.text.includes('Face') || msg.text.includes('registration')) && (
                <div style={{ marginTop: '0.5rem' }}>
                  <a onClick={() => navigate('/register')} style={{ color: 'var(--blue)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>
                    Complete registration →
                  </a>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label>Voter ID</label>
                <input
                  value={voterId}
                  onChange={e => setVoterId(e.target.value)}
                  placeholder="e.g. V1001"
                  required
                />
              </div>
              <button className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
                {loading ? 'Sending OTP…' : 'Send OTP →'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp}>
              <div className="form-group">
                <label>6-Digit OTP</label>
                <input
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  required
                  style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center', fontFamily: 'monospace' }}
                />
              </div>
              <button className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Verifying…' : 'Sign In'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-full"
                style={{ marginTop: '0.5rem' }}
                onClick={() => { setStep(1); setOtp(''); setMsg({}); sessionStorage.removeItem(SESSION_KEY); }}
              >
                ← Back
              </button>
            </form>
          )}

          <div className="switch-link">
            New here? <a onClick={() => { sessionStorage.removeItem(SESSION_KEY); navigate('/register'); }}>Create an account</a>
          </div>
        </div>
      </div>
    </div>
  );
}
