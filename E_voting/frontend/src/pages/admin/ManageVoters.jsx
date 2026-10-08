import { useEffect, useState, useCallback } from 'react';
import { listVoters, updateVoter, deleteVoter } from '../../api';

export default function ManageVoters() {
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchVoters = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await listVoters(params);
      setVoters(res.data);
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to load voters.' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVoters();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchVoters]);

  const handleToggleStatus = async (voter) => {
    setActionLoading(true);
    try {
      await updateVoter(voter.voter_id, { is_active: !voter.is_active });
      setMsg({ type: 'success', text: `Voter ${voter.voter_id} status updated.` });
      fetchVoters();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update status.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleVerified = async (voter) => {
    setActionLoading(true);
    try {
      await updateVoter(voter.voter_id, { is_verified: !voter.is_verified });
      setMsg({ type: 'success', text: `Voter ${voter.voter_id} verification updated.` });
      fetchVoters();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update verification.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (voterId) => {
    setActionLoading(true);
    try {
      await deleteVoter(voterId);
      setMsg({ type: 'success', text: `Voter ${voterId} and face biometric data deleted.` });
      setDeletingId(null);
      fetchVoters();
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.error || 'Failed to delete voter.' });
    } finally {
      setActionLoading(false);
    }
  };

  const totalVoters = voters.length;
  const verifiedCount = voters.filter(v => v.is_verified).length;
  const faceCount = voters.filter(v => v.face_registered).length;
  const activeCount = voters.filter(v => v.is_active).length;

  return (
    <div className="container" style={{ paddingBottom: '3rem' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Voter Management</h1>
          <p>Monitor registrations, face biometrics, and voter statuses</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={fetchVoters}
          disabled={loading || actionLoading}
          style={{ fontSize: '0.82rem', gap: '0.4rem' }}
        >
          <span>↻</span> {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type}`} style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg({ type: '', text: '' })} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid-4" style={{ marginBottom: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink3)', fontWeight: 600, textTransform: 'uppercase' }}>Total Voters</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--blue)', marginTop: '0.2rem' }}>{totalVoters}</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink3)', fontWeight: 600, textTransform: 'uppercase' }}>Verified</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--green)', marginTop: '0.2rem' }}>{verifiedCount}</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink3)', fontWeight: 600, textTransform: 'uppercase' }}>Face Enrolled</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--purple)', marginTop: '0.2rem' }}>{faceCount}</div>
        </div>
        <div className="card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--ink3)', fontWeight: 600, textTransform: 'uppercase' }}>Active Status</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--ink)', marginTop: '0.2rem' }}>{activeCount}</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
            <input
              type="text"
              placeholder="Search by Voter ID, Name, or Email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.2rem', borderRadius: 'var(--r-sm)', background: 'var(--bg2)', border: '1px solid var(--border)' }}
            />
            <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'verified', label: 'Verified' },
              { id: 'unverified', label: 'Unverified' },
              { id: 'active', label: 'Active' },
              { id: 'inactive', label: 'Suspended' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                className={`btn ${statusFilter === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: '0.78rem', padding: '0.4rem 0.75rem' }}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Voters Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading && <div style={{ padding: '2rem', textAlign: 'center' }} className="spinner" />}

        {!loading && voters.length === 0 && (
          <div style={{ padding: '3rem 1.5rem', textAlign: 'center', color: 'var(--ink2)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>👥</div>
            <div style={{ fontWeight: 600 }}>No voters found</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--ink3)', marginTop: '0.2rem' }}>
              {search ? 'Try clearing your search query' : 'Registered voters will appear here'}
            </div>
          </div>
        )}

        {!loading && voters.length > 0 && (
          <div className="table-wrap">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem' }}>Voter ID</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem' }}>Voter Name</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'left', fontSize: '0.78rem' }}>Email & Age</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontSize: '0.78rem' }}>Face Biometric</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontSize: '0.78rem' }}>Verification</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontSize: '0.78rem' }}>Votes Cast</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center', fontSize: '0.78rem' }}>Account Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right', fontSize: '0.78rem' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {voters.map((v) => (
                  <tr key={v.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 700, fontFamily: 'monospace', color: 'var(--blue-l)' }}>
                      {v.voter_id}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{v.name || 'Unnamed Voter'}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--ink2)' }}>
                      <div>{v.email_id}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--ink3)' }}>Age: {v.age}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      {v.face_registered ? (
                        <span className="badge badge-green" style={{ fontSize: '0.72rem' }}>Enrolled 📷</span>
                      ) : (
                        <span className="badge badge-yellow" style={{ fontSize: '0.72rem' }}>Pending</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleVerified(v)}
                        disabled={actionLoading}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                          fontSize: '0.75rem',
                        }}
                        title="Click to toggle verification"
                      >
                        {v.is_verified ? (
                          <span className="badge badge-blue">Verified ✓</span>
                        ) : (
                          <span className="badge badge-red">Unverified ✕</span>
                        )}
                      </button>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600 }}>
                      {v.voted_count > 0 ? (
                        <span style={{ color: 'var(--green)' }}>{v.voted_count} {v.voted_count === 1 ? 'vote' : 'votes'}</span>
                      ) : (
                        <span style={{ color: 'var(--ink3)' }}>0</span>
                      )}
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(v)}
                        disabled={actionLoading}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                          fontSize: '0.75rem',
                        }}
                        title="Click to toggle Active / Suspended status"
                      >
                        {v.is_active ? (
                          <span className="badge badge-green">Active</span>
                        ) : (
                          <span className="badge badge-red">Suspended</span>
                        )}
                      </button>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', color: 'var(--red)', padding: '0.3rem 0.6rem' }}
                        onClick={() => setDeletingId(v.voter_id)}
                        disabled={actionLoading}
                      >
                        🗑 Delete
                      </button>
                    </td>
                  </tr>
                ))}
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
            <h3 style={{ marginBottom: '0.5rem' }}>Delete Voter {deletingId}?</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink2)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              This will permanently delete the voter account, remove their cast votes, and wipe their stored biometric face dataset.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setDeletingId(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                style={{ background: 'var(--red)', borderColor: 'var(--red)' }}
                onClick={() => handleDelete(deletingId)}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting…' : 'Yes, Delete Voter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
