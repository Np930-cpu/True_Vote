import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, resetPassword } from '../api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true); setMsg({});
    try {
      await forgotPassword({ email });
      setMsg({ type: 'success', text: `OTP sent to ${email}` });
      setStep(2);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to send OTP.' });
    }
    setLoading(false);
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirm) {
      setMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    setLoading(true); setMsg({});
    try {
      await resetPassword({ email, otp, new_password: newPassword });
      setMsg({ type: 'success', text: 'Password reset! Redirecting to login…' });
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Reset failed.' });
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand">✓ TrueVote</div>
        <p className="tagline">Reset your password using your registered email address.</p>
        <div className="trust-items" style={{ marginTop: '2rem' }}>
          {[
            { icon: '📧', text: 'OTP sent to your email' },
            { icon: '⏱️', text: 'Code expires in 10 minutes' },
            { icon: '🔐', text: 'New password takes effect immediately' },
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
          <h2>{step === 1 ? 'Forgot Password' : 'Reset Password'}</h2>
          <p className="subtitle">
            {step === 1 ? 'Enter your registered email to receive an OTP' : `Enter the OTP sent to ${email}`}
          </p>

          <div className="steps">
            <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'done' : ''}`} />
            <div className={`step ${step === 2 ? 'active' : ''}`} />
          </div>

          {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

          {step === 1 && (
            <form onSubmit={handleSendOtp}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                />
              </div>
              <button className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleReset}>
              <div className="form-group">
                <label>OTP Code</label>
                <input
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="6-digit code"
                  maxLength={6}
                  required
                  style={{ fontSize: '1.4rem', letterSpacing: '0.5rem', textAlign: 'center', fontFamily: 'monospace' }}
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  required
                />
              </div>
              <button className="btn btn-primary btn-full" disabled={loading}>
                {loading ? 'Resetting…' : 'Reset Password'}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-full"
                style={{ marginTop: '0.5rem' }}
                onClick={() => { setStep(1); setMsg({}); setOtp(''); }}
              >
                ← Back
              </button>
            </form>
          )}

          <div className="switch-link">
            Remember it? <a onClick={() => navigate('/login')}>Sign in</a>
          </div>
        </div>
      </div>
    </div>
  );
}
