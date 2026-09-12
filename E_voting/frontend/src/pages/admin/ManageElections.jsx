import { useEffect, useState } from 'react';
import { listElections, createElection } from '../../api';

export default function ManageElections() {
  const [elections, setElections] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '' });
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => listElections().then(r => setElections(r.data));
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async (e) => {
    e.preventDefault(); setLoading(true); setMsg({});
    try {
      await createElection(form);
      setMsg({ type: 'success', text: 'Election created successfully!' });
      setForm({ name: '', description: '', start_date: '', end_date: '' });
      setShowForm(false);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: JSON.stringify(err.response?.data) || 'Failed.' });
    }
    setLoading(false);
  };

  const status = (e) => {
    const now = new Date();
    if (new Date(e.end_date) < now) return { label: 'Ended', cls: 'badge-red' };
    if (new Date(e.start_date) <= now) return { label: 'Active', cls: 'badge-green' };
    return { label: 'Upcoming', cls: 'badge-yellow' };
  };

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div><h1>Elections</h1><p>Create and manage elections</p></div>
        <button className="btn btn-primary" onClick={() => setShowForm(s => !s)}>
          {showForm ? '✕ Cancel' : '+ New Election'}
        </button>
      </div>

      {msg.text && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(59,130,246,0.3)' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Create New Election</h3>
          <form onSubmit={handleCreate}>
            <div className="grid-2">
              <div className="form-group">
                <label>Election Name</label>
                <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="General Election 2025" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description" required />
              </div>
              <div className="form-group">
                <label>Start Date</label>
                <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} required />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input type="date" value={form.end_date} onChange={e => set('end_date', e.target.value)} required />
              </div>
            </div>
            <button className="btn btn-success" disabled={loading}>
              {loading ? 'Creating...' : '✓ Create Election'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontWeight: 700 }}>All Elections</h3>
          <span className="badge badge-blue">{elections.length} total</span>
        </div>
        {elections.length === 0 ? (
          <p style={{ color: 'var(--ink2)' }}>No elections created yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Description</th><th>Start</th><th>End</th><th>Status</th></tr>
              </thead>
              <tbody>
                {elections.map(e => {
                  const s = status(e);
                  return (
                    <tr key={e.id}>
                      <td style={{ color: 'var(--ink3)' }}>#{e.id}</td>
                      <td style={{ fontWeight: 600, color: 'var(--ink)' }}>{e.name}</td>
                      <td>{e.description}</td>
                      <td>{e.start_date}</td>
                      <td>{e.end_date}</td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
