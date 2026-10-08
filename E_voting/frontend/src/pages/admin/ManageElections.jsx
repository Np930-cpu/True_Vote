import { useEffect, useState, useCallback } from 'react';
import { listElections, createElection, updateElection, deleteElection } from '../../api';

const CATEGORIES = [
  { id: 'all', label: 'All Categories' },
  { id: 'college', label: 'College / University' },
  { id: 'school', label: 'School' },
  { id: 'club', label: 'Club & Society' },
  { id: 'local', label: 'Local Community' },
  { id: 'general', label: 'General' },
];

const INITIAL_FORM = {
  name: '',
  category: 'general',
  organization: '',
  description: '',
  start_date: '',
  end_date: '',
};

export default function ManageElections() {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingElection, setEditingElection] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (search.trim()) params.search = search.trim();
      const res = await listElections(params);
      setElections(res.data);
    } catch {
      setMsg({ type: 'error', text: 'Failed to load elections.' });
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 250);
    return () => clearTimeout(t);
  }, [load]);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const startCreate = () => {
    setEditingElection(null);
    setForm(INITIAL_FORM);
    setShowForm(true);
  };

  const startEdit = (e) => {
    setEditingElection(e);
    setForm({
      name: e.name || '',
      category: e.category || 'general',
      organization: e.organization || '',
      description: e.description || '',
      start_date: e.start_date || '',
      end_date: e.end_date || '',
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    try {
      if (editingElection) {
        await updateElection(editingElection.id, form);
        setMsg({ type: 'success', text: `Election "${form.name}" updated successfully!` });
      } else {
        await createElection(form);
        setMsg({ type: 'success', text: `Election "${form.name}" created successfully!` });
      }
      setShowForm(false);
      setEditingElection(null);
      setForm(INITIAL_FORM);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: JSON.stringify(err.response?.data) || 'Operation failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setSubmitting(true);
    try {
      await deleteElection(id);
      setMsg({ type: 'success', text: 'Election deleted successfully.' });
      setDeletingId(null);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to delete election.' });
    } finally {
      setSubmitting(false);
    }
  };

  const status = (e) => {
    const now = new Date();
    if (new Date(e.end_date) < now) return { label: 'Ended', cls: 'badge-red' };
    if (new Date(e.start_date) <= now) return { label: 'Active', cls: 'badge-green' };
    return { label: 'Upcoming', cls: 'badge-yellow' };
  };

  const exportCSV = () => {
    if (elections.length === 0) return;
    const headers = ['ID', 'Name', 'Category', 'Organization', 'Start Date', 'End Date', 'Description'];
    const rows = elections.map(e => [
      e.id,
      `"${(e.name || '').replace(/"/g, '""')}"`,
      e.category || '',
      `"${(e.organization || '').replace(/"/g, '""')}"`,
      e.start_date,
      e.end_date,
      `"${(e.description || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `truevote_elections_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Manage Elections</h1>
          <p>Customize election categories, organizations, voting windows, and settings</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <button className="btn btn-secondary" onClick={exportCSV} disabled={elections.length === 0} style={{ fontSize: '0.82rem' }}>
            📥 Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => (showForm ? setShowForm(false) : startCreate())}>
            {showForm ? '✕ Close Form' : '+ New Election'}
          </button>
        </div>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg({ type: '', text: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Create / Edit Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'rgba(59,130,246,0.3)', animation: 'fadeIn 0.2s' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontWeight: 700 }}>
              {editingElection ? `Edit Election: ${editingElection.name}` : 'Create New Election'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--ink3)' }}>
              {editingElection ? `ID #${editingElection.id}` : 'Customizable template'}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label>Election Title</label>
                <input
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="e.g. Student Council Presidential Election 2026"
                  required
                />
              </div>

              <div className="form-group">
                <label>Election Category</label>
                <select
                  value={form.category}
                  onChange={e => setField('category', e.target.value)}
                  required
                >
                  <option value="college">🎓 College / University</option>
                  <option value="school">🏫 School</option>
                  <option value="club">🤝 Club & Society</option>
                  <option value="local">🏡 Local Community</option>
                  <option value="general">🌐 General / Open</option>
                </select>
              </div>

              <div className="form-group">
                <label>Organization / Institution Name <span style={{ color: 'var(--ink3)', fontWeight: 400 }}>(Optional)</span></label>
                <input
                  value={form.organization}
                  onChange={e => setField('organization', e.target.value)}
                  placeholder="e.g. Stanford University / Tech Club / West Ward"
                />
              </div>

              <div className="form-group">
                <label>Description & Guidelines</label>
                <input
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  placeholder="Rules, eligible voters, or election scope…"
                  required
                />
              </div>

              <div className="form-group">
                <label>Voting Start Date</label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={e => setField('start_date', e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Voting End Date</label>
                <input
                  type="date"
                  value={form.end_date}
                  onChange={e => setField('end_date', e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button className="btn btn-success" disabled={submitting}>
                {submitting ? 'Saving…' : editingElection ? '✓ Save Changes' : '✓ Create Election'}
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
              placeholder="Filter by election or institution…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.2rem', borderRadius: 'var(--r-sm)', background: 'var(--bg2)', border: '1px solid var(--border)' }}
            />
            <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                type="button"
                className={`btn ${selectedCategory === cat.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.7rem' }}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Elections Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 700, margin: 0 }}>Elections List</h3>
          <span className="badge badge-blue">{elections.length} total</span>
        </div>

        {loading && <div style={{ padding: '2.5rem', textAlign: 'center' }} className="spinner" />}

        {!loading && elections.length === 0 && (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--ink2)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🗳️</div>
            <div style={{ fontWeight: 600 }}>No elections found</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ink3)', marginTop: '0.2rem' }}>
              Create an election above to get started
            </div>
          </div>
        )}

        {!loading && elections.length > 0 && (
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem' }}>ID</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem' }}>Title & Organization</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem' }}>Category</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem' }}>Voting Window</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontSize: '0.78rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '0.78rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {elections.map(e => {
                  const s = status(e);
                  return (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--ink3)', fontFamily: 'monospace' }}>#{e.id}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{e.name}</div>
                        {e.organization && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--ink3)' }}>🏛️ {e.organization}</div>
                        )}
                        <div style={{ fontSize: '0.75rem', color: 'var(--ink2)', marginTop: '0.2rem', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {e.description}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className="badge badge-blue" style={{ textTransform: 'capitalize' }}>
                          {e.category || 'General'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--ink2)' }}>
                        <div>From: <strong>{e.start_date}</strong></div>
                        <div>To: <strong>{e.end_date}</strong></div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <span className={`badge ${s.cls}`}>{s.label}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                            onClick={() => startEdit(e)}
                          >
                            ✏️ Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ fontSize: '0.75rem', color: 'var(--red)', padding: '0.3rem 0.6rem' }}
                            onClick={() => setDeletingId(e.id)}
                          >
                            🗑 Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
        }}>
          <div className="card" style={{ maxWidth: 420, width: '90%', margin: '0 auto', textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚠️</div>
            <h3 style={{ marginBottom: '0.5rem' }}>Delete Election #{deletingId}?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink2)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Deleting this election will also remove all candidate entries and votes cast under it.
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
                {submitting ? 'Deleting…' : 'Yes, Delete Election'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
