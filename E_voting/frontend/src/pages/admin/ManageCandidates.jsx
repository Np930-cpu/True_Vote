import { useEffect, useState, useCallback } from 'react';
import { listCandidates, registerCandidate, updateCandidate, deleteCandidate, listElections } from '../../api';

const EMOJI_SYMBOLS = ['🏛️', '🌹', '🌻', '⚡', '🦁', '🌊', '🔥', '🕊️', '⭐', '🌿', '🦅', '🌙', '🏆', '🛡️', '⚖️', '🌐', '🚀', '🎯', '💡', '💎'];

const INITIAL_FORM = {
  name: '',
  party: '',
  symbol: '🏛️',
  manifesto: '',
  election: '',
};

export default function ManageCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [filterElection, setFilterElection] = useState('');
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [candRes, elecRes] = await Promise.all([
        listCandidates(filterElection || undefined),
        listElections(),
      ]);
      setCandidates(candRes.data);
      setElections(elecRes.data);
    } catch {
      setMsg({ type: 'error', text: 'Failed to load candidates.' });
    } finally {
      setLoading(false);
    }
  }, [filterElection]);

  useEffect(() => {
    load();
  }, [load]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const startCreate = () => {
    setEditingCandidate(null);
    setForm({
      ...INITIAL_FORM,
      election: filterElection || (elections[0]?.id || ''),
    });
    setShowForm(true);
  };

  const startEdit = (c) => {
    setEditingCandidate(c);
    setForm({
      name: c.name || '',
      party: c.party || '',
      symbol: c.symbol || '🏛️',
      manifesto: c.manifesto || '',
      election: c.election || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    try {
      if (editingCandidate) {
        await updateCandidate(editingCandidate.id, form);
        setMsg({ type: 'success', text: `Candidate "${form.name}" updated successfully!` });
      } else {
        await registerCandidate(form);
        setMsg({ type: 'success', text: `Candidate "${form.name}" registered successfully!` });
      }
      setShowForm(false);
      setEditingCandidate(null);
      setForm(INITIAL_FORM);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: JSON.stringify(err.response?.data) || 'Failed to save candidate.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setSubmitting(true);
    try {
      await deleteCandidate(id);
      setMsg({ type: 'success', text: 'Candidate deleted successfully.' });
      setDeletingId(null);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to delete candidate.' });
    } finally {
      setSubmitting(false);
    }
  };

  const electionName = (id) => elections.find(e => e.id === id)?.name || `Election #${id}`;

  const filteredCandidates = candidates.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.party || '').toLowerCase().includes(q) ||
      (c.manifesto || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Candidate Management</h1>
          <p>Register, customize party symbols, edit manifestos, and manage ballot contestants</p>
        </div>
        <button className="btn btn-primary" onClick={() => (showForm ? setShowForm(false) : startCreate())}>
          {showForm ? '✕ Close Form' : '+ New Candidate'}
        </button>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg({ type: '', text: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Candidate Create/Edit Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(59,130,246,0.3)', animation: 'fadeIn 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700 }}>
              {editingCandidate ? `Edit Candidate: ${editingCandidate.name}` : 'Register New Candidate'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink3)' }}>
              {editingCandidate ? `Candidate #${editingCandidate.id}` : 'Ballot Entry'}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Candidate Full Name</label>
                <input
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="Candidate full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Party / Affiliation</label>
                <input
                  value={form.party}
                  onChange={e => setField('party', e.target.value)}
                  placeholder="e.g. Progressive Student Alliance / Independent"
                  required
                />
              </div>

              <div className="form-group">
                <label>Party Symbol Emoji</label>
                <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                  <input
                    value={form.symbol}
                    onChange={e => setField('symbol', e.target.value)}
                    placeholder="🏛️"
                    maxLength={10}
                    required
                    style={{ width: 75, fontSize: '1.4rem', textAlign: 'center' }}
                  />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', flex: 1 }}>
                    {EMOJI_SYMBOLS.map(sym => (
                      <button
                        key={sym}
                        type="button"
                        onClick={() => setField('symbol', sym)}
                        style={{
                          fontSize: '1.15rem', padding: '0.2rem 0.35rem', border: '1px solid var(--border)',
                          borderRadius: 6, background: form.symbol === sym ? 'var(--blue-dim)' : 'var(--bg2)',
                          cursor: 'pointer', lineHeight: 1,
                        }}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Assigned Election</label>
                <select
                  value={form.election}
                  onChange={e => setField('election', e.target.value)}
                  required
                >
                  <option value="">Select an election</option>
                  {elections.map(e => (
                    <option key={e.id} value={e.id}>{e.name} (#{e.id})</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Manifesto & Key Promises</label>
                <textarea
                  rows={3}
                  value={form.manifesto}
                  onChange={e => setField('manifesto', e.target.value)}
                  placeholder="Candidate's vision, pledges, and bio…"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-success" disabled={submitting}>
                {submitting ? 'Saving…' : editingCandidate ? '✓ Update Candidate' : '✓ Register Candidate'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)} disabled={submitting}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search candidate name, party, or manifesto…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.2rem', borderRadius: 'var(--r-sm)', background: 'var(--bg2)', border: '1px solid var(--border)' }}
            />
            <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink2)', margin: 0 }}>Election:</label>
            <select
              value={filterElection}
              onChange={e => setFilterElection(e.target.value)}
              style={{ padding: '0.45rem 0.75rem', borderRadius: 'var(--r-sm)', background: 'var(--bg2)', border: '1px solid var(--border)', fontSize: '0.82rem' }}
            >
              <option value="">All Elections</option>
              {elections.map(e => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 700, margin: 0 }}>Registered Candidates</h3>
          <span className="badge badge-blue">{filteredCandidates.length} total</span>
        </div>

        {loading && <div style={{ padding: '2.5rem', textAlign: 'center' }} className="spinner" />}

        {!loading && filteredCandidates.length === 0 && (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--ink2)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
            <div style={{ fontWeight: 600 }}>No candidates found</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ink3)', marginTop: '0.2rem' }}>
              Add a candidate using the button above
            </div>
          </div>
        )}

        {!loading && filteredCandidates.length > 0 && (
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem' }}>Symbol</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem' }}>Candidate Name</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem' }}>Party Affiliation</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem' }}>Election</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem' }}>Manifesto Summary</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '0.78rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '1.6rem', textAlign: 'center', width: 60 }}>
                      {c.symbol || '🏛️'}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--ink3)' }}>Candidate #{c.id}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge badge-purple">{c.party}</span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--ink2)' }}>
                      {electionName(c.election)}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--ink3)', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.manifesto}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                          onClick={() => startEdit(c)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ fontSize: '0.75rem', color: 'var(--red)', padding: '0.3rem 0.6rem' }}
                          onClick={() => setDeletingId(c.id)}
                        >
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Candidate Confirmation Modal */}
      {deletingId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div className="card" style={{ maxWidth: 420, width: '90%', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Delete Candidate #{deletingId}?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink2)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              This candidate will be removed from the election ballot and will no longer be eligible for votes.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeletingId(null)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: 'var(--red)', borderColor: 'var(--red)' }}
                onClick={() => handleDelete(deletingId)}
                disabled={submitting}
              >
                {submitting ? 'Deleting…' : 'Yes, Delete Candidate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
