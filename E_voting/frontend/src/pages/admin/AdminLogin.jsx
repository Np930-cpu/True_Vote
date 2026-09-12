import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { adminLogin } from '../../api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [form, setForm] = useState({ voter_id: '', password: '' });
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
      setMsg(err.response?.data?.error || 'Login failed.');
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
          <p className="subtitle">Use your superuser credentials</p>

          {msg && <div className="alert alert-error">{msg}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Voter ID</label>
              <input value={form.voter_id} onChange={e => setForm(f => ({ ...f, voter_id: e.target.value }))} placeholder="Admin voter ID" required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Password" required />
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
