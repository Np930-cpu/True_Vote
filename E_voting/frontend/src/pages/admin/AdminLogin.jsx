import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { adminLogin } from '../../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [form, setForm] = useState({ voter_id: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setMsg('');
    try {
      const res = await adminLogin(form);
      localStorage.setItem('admin_access', res.data.access);
      loginAdmin();
      navigate('/admin/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.error || (!err.response ? 'Cannot connect to backend server. If deployed on Render, it may be waking up (wait 30s) or check VITE_API_BASE_URL on Vercel.' : 'Login failed.');
      setMsg(errorMsg);
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="brand">✓ TrueVote</div>
        <p className="tagline">Admin panel — manage elections, candidates, and monitor the blockchain ledger.</p>
        <div className="trust-items">
          {[
            { icon: '🗳️', text: 'Create & manage elections' },
            { icon: '👥', text: 'Register candidates' },
            { icon: '⛓️', text: 'Monitor blockchain integrity' },
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
          <h2>Admin Sign In</h2>
          <p className="subtitle">Use your superuser credentials (default: Admin / admin123)</p>

          {msg && <div className="alert alert-error">{msg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Voter ID</label>
              <input
                value={form.voter_id}
                onChange={e => setForm(f => ({ ...f, voter_id: e.target.value }))}
                placeholder="Admin or admin"
                autoComplete="username"
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Admin password"
                  autoComplete="current-password"
                  style={{ width: '100%', paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute',
                    right: '0.6rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1rem',
                    opacity: 0.7,
                  }}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '🔒'}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '0.5rem' }}>
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
