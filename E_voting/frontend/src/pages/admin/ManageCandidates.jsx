import { useEffect, useState } from 'react';
import { listCandidates, registerCandidate, listElections } from '../../api';

export default function ManageCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [form, setForm] = useState({ name: '', party: '', symbol: '🏛️', manifesto: '', election: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => {
    listCandidates().then(r => setCandidates(r.data));
    listElections().then(r => setElections(r.data));
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true); setMsg({});
    try {
      await registerCandidate(form);
      setMsg({ type: 'success', text: 'Candidate registered successfully!' });
      setForm({ name: '', party: '', symbol: '🏛️', manifesto: '', election: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: JSON.stringify(err.response?.data) || 'Failed.' });
    }
    setLoading(false);
  };

  const electionName = (id) => elections.find(e => e.id === id)?.name || `Election #${id}`;

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><h1>Candidates</h1><p>Register and manage candidates</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ New Candidate'}
        </button>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(59,130,246,0.3)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Register Candidate</h3>
          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Candidate name" required />
              </div>
              <div className="form-group">
                <label>Party</label>
                <input value={form.party} onChange={e => set('party', e.target.value)} placeholder="Party name" required />
              </div>
              <div className="form-group">
                <label>Party Symbol <span style={{ color: 'var(--ink3)', fontWeight: 400, fontSize: '0.78rem' }}>(emoji)</span></label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    value={form.symbol}
                    onChange={e => set('symbol', e.target.value)}
                    placeholder="🏛️"
                    maxLength={10}
                    required
                    style={{ width: 80, fontSize: '1.4rem', textAlign: 'center' }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {['🌹','🌻','⚡','🦁','🌊','🔥','🕊️','⭐','🌿','🦅','🌙','🏆','🛡️','⚖️','🌐'].map(s => (
                      <button
                        key={s} type="button"
                        onClick={() => set('symbol', s)}
                        style={{
                          fontSize: '1.2rem', padding: '0.2rem 0.3rem', border: '1px solid var(--border)',
                          borderRadius: 6, background: form.symbol === s ? 'var(--blue-dim)' : 'var(--bg2)',
                          cursor: 'pointer', lineHeight: 1,
                        }}
                      >{s}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Election</label>
                <select value={form.election} onChange={e => set('election', e.target.value)} required>
                  <option value="">Select election</option>
                  {elections.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Manifesto</label>
                <textarea value={form.manifesto} onChange={e => set('manifesto', e.target.value)} placeholder="Candidate's manifesto..." required />
              </div>
            </div>
            <button className="btn btn-success" disabled={loading}>
              {loading ? 'Registering...' : '✓ Register Candidate'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700 }}>All Candidates</h3>
          <span className="badge badge-blue">{candidates.length} total</span>
        </div>
        {candidates.length === 0 ? (
          <p style={{ color: 'var(--ink2)' }}>No candidates registered yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Symbol</th><th>Party</th><th>Election</th><th>Manifesto</th></tr>
              </thead>
              <tbody>
                {candidates.map(c => (
                  <tr key={c.id}>
                    <td style={{ color: 'var(--ink3)' }}>#{c.id}</td>
                    <td style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.name}</td>
                    <td style={{ fontSize: '1.4rem', textAlign: 'center' }}>{c.symbol || '🏛️'}</td>
                    <td><span className="badge badge-blue">{c.party}</span></td>
                    <td>{electionName(c.election)}</td>
                    <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.manifesto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
