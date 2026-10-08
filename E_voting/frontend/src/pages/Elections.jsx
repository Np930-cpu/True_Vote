import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listElections, hasVoted, deleteElection } from '../api';
import { useAuth } from '../context/useAuth';
import { useToast } from '../context/useToast';

const CATEGORY_TABS = [
  { id: 'all',     label: 'All',             icon: '🌐' },
  { id: 'college', label: 'College / Uni',   icon: '🎓' },
  { id: 'school',  label: 'School',          icon: '🏫' },
  { id: 'club',    label: 'Clubs & Socs',    icon: '🎭' },
  { id: 'local',   label: 'Local Community', icon: '🏘️' },
  { id: 'general', label: 'General',         icon: '🗳️' },
  { id: 'my',      label: 'My Elections',    icon: '👤' },
];

const CATEGORY_META = {
  college: { label: 'College', icon: '🎓', bg: 'rgba(59,110,248,0.1)', color: 'var(--blue)' },
  school:  { label: 'School',  icon: '🏫', bg: 'rgba(217,119,6,0.1)',  color: 'var(--amber)' },
  club:    { label: 'Club',    icon: '🎭', bg: 'rgba(124,58,237,0.1)', color: 'var(--purple)' },
  local:   { label: 'Local',   icon: '🏘️', bg: 'rgba(14,168,106,0.1)', color: 'var(--green)' },
  general: { label: 'General', icon: '🗳️', bg: 'rgba(90,96,128,0.1)',  color: 'var(--ink2)' },
};

export default function Elections() {
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [elections, setElections] = useState([]);
  const [votedMap, setVotedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchElections = () => {
    setLoading(true);
    listElections().then(async (r) => {
      const list = r.data || [];
      setElections(list);
      const results = await Promise.allSettled(list.map(e => hasVoted(e.id)));
      const map = {};
      results.forEach((res, i) => {
        if (res.status === 'fulfilled') map[list[i].id] = res.value.data.has_voted;
      });
      setVotedMap(map);
    }).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchElections();
  }, []);

  const getStatus = (e) => {
    const now = new Date();
    if (new Date(e.end_date) < now) return 'ended';
    if (new Date(e.start_date) <= now) return 'active';
    return 'upcoming';
  };

  const handleDelete = async (e, electionId) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this election? This cannot be undone.')) return;

    setDeletingId(electionId);
    try {
      await deleteElection(electionId);
      showToast('Election deleted successfully.', 'success');
      setElections(prev => prev.filter(item => item.id !== electionId));
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete election.';
      showToast(msg, 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = elections.filter((e) => {
    const s = getStatus(e);
    const matchesStatus = statusFilter === 'all' || s === statusFilter;

    let matchesCategory = true;
    if (categoryFilter === 'my') {
      matchesCategory = (user && e.creator_voter_id === user.voter_id) || (isAdmin && !e.creator_voter_id);
    } else if (categoryFilter !== 'all') {
      matchesCategory = (e.category || 'general') === categoryFilter;
    }

    const q = search.toLowerCase();
    const matchesSearch =
      (e.name || '').toLowerCase().includes(q) ||
      (e.description || '').toLowerCase().includes(q) ||
      (e.organization || '').toLowerCase().includes(q);

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const counts = { all: elections.length, active: 0, upcoming: 0, ended: 0 };
  elections.forEach((e) => {
    const s = getStatus(e);
    if (counts[s] !== undefined) counts[s]++;
  });

  const statusConfig = {
    active:   { cls: 'badge-green',  label: 'Active',   dot: 'var(--green)' },
    upcoming: { cls: 'badge-yellow', label: 'Upcoming', dot: 'var(--amber)' },
    ended:    { cls: 'badge-red',    label: 'Ended',    dot: 'var(--red)' },
  };

  return (
    <div className="container" style={{ paddingBottom: '3.5rem' }}>
      {/* Header with Create CTA */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Elections</h1>
          <p>Browse campus, school, community, and open elections — or launch your own!</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/create-election')}
          style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.65rem 1.25rem' }}
        >
          <span>➕</span>
          <span>Create Election</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div style={{
        display: 'flex', gap: '0.5rem', marginBottom: '1.25rem',
        overflowX: 'auto', paddingBottom: '0.35rem', scrollbarWidth: 'none'
      }}>
        {CATEGORY_TABS.map((tab) => {
          const active = categoryFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.5rem 0.95rem', fontSize: '0.82rem', fontWeight: 600,
                borderRadius: 'var(--r-sm)', border: `1.5px solid ${active ? 'var(--blue)' : 'var(--border)'}`,
                background: active ? 'var(--blue)' : 'var(--surface)',
                color: active ? '#ffffff' : 'var(--ink2)',
                cursor: 'pointer', transition: 'all 0.15s ease', flexShrink: 0,
                boxShadow: active ? 'var(--shadow-sm)' : 'none',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status Stats + Search Row */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 420 }}>
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)', fontSize: '0.85rem', pointerEvents: 'none' }}>🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by election, school, college, or keyword…"
            style={{
              width: '100%',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)', padding: '0.55rem 0.85rem 0.55rem 2.2rem',
              color: 'var(--ink)', fontSize: '0.85rem', fontFamily: 'inherit', outline: 'none',
            }}
          />
        </div>

        {/* Status Pills */}
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '0.25rem' }}>
          {['all', 'active', 'upcoming', 'ended'].map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              style={{
                padding: '0.35rem 0.8rem', fontSize: '0.76rem', fontWeight: 600,
                border: 'none', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit',
                textTransform: 'capitalize', transition: 'all 0.15s',
                background: statusFilter === f ? 'var(--blue)' : 'transparent',
                color: statusFilter === f ? '#fff' : 'var(--ink2)',
              }}
            >
              {f} <span style={{ opacity: 0.65, marginLeft: '0.15rem', fontSize: '0.7rem' }}>{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="spinner" style={{ margin: '3rem auto' }} />}

      {!loading && filtered.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', margin: '1rem 0' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🗳️</div>
          <h3 style={{ marginBottom: '0.4rem', color: 'var(--ink)' }}>No elections found</h3>
          <p style={{ color: 'var(--ink2)', fontSize: '0.9rem', maxWidth: 460, margin: '0 auto 1.5rem' }}>
            {categoryFilter === 'my'
              ? "You haven't created any elections yet. Start one for your school, college, or club!"
              : "No elections match your current category and search filter."}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/create-election')}
            style={{ padding: '0.65rem 1.5rem' }}
          >
            Create Your First Election 🚀
          </button>
        </div>
      )}

      {/* Grid of Elections */}
      <div className="grid-2">
        {filtered.map((e) => {
          const s = getStatus(e);
          const cfg = statusConfig[s] || statusConfig.active;
          const voted = votedMap[e.id];
          const cat = CATEGORY_META[e.category] || CATEGORY_META.general;
          const isCreator = (user && e.creator_voter_id === user.voter_id) || isAdmin;

          return (
            <div key={e.id} className="election-card" style={{ display: 'flex', flexDirection: 'column' }}>
              {/* Badges Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.55rem',
                    borderRadius: 20, background: cat.bg, color: cat.color,
                    display: 'flex', alignItems: 'center', gap: '0.25rem'
                  }}>
                    {cat.icon} {cat.label}
                  </span>

                  {e.organization && (
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600, padding: '0.2rem 0.55rem',
                      borderRadius: 20, background: 'var(--surface2)', color: 'var(--ink2)',
                      border: '1px solid var(--border)'
                    }}>
                      🏛️ {e.organization}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                  {voted && <span className="badge badge-blue">✓ Voted</span>}
                  <span className={`badge ${cfg.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {s === 'active' && (
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 4px var(--green)' }} />
                    )}
                    {cfg.label}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.45rem', color: 'var(--ink)', lineHeight: 1.3 }}>
                {e.name}
              </h3>

              <p style={{
                color: 'var(--ink2)', fontSize: '0.875rem', lineHeight: 1.5,
                marginBottom: '1rem', flex: 1,
                display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden'
              }}>
                {e.description}
              </p>

              {/* Info Badges (Candidates count, Creator) */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingTop: '0.65rem', borderTop: '1px solid var(--border)',
                marginBottom: '1rem', fontSize: '0.76rem', color: 'var(--ink3)'
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ color: 'var(--ink2)', fontWeight: 600 }}>
                    👥 {e.candidates_count || (e.candidates ? e.candidates.length : 0)} Candidates
                  </span>
                  {e.creator_name && (
                    <span>By: <strong style={{ color: 'var(--ink2)' }}>{e.creator_name}</strong></span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>📅</span>
                  <span>{e.start_date} — {e.end_date}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                <button
                  className={`btn ${s === 'active' && !voted ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => navigate('/vote', { state: { election: e } })}
                  disabled={s !== 'active' || voted}
                  style={{ flex: 1.5 }}
                >
                  {voted ? '✓ Voted' : s !== 'active' ? cfg.label : 'Vote Now'}
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => navigate(`/results/${e.id}`)}
                  style={{ flex: 1 }}
                >
                  Results
                </button>

                {isCreator && (
                  <button
                    onClick={(evt) => handleDelete(evt, e.id)}
                    disabled={deletingId === e.id}
                    title="Delete Election"
                    style={{
                      background: 'var(--surface2)', border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)', padding: '0.55rem 0.75rem',
                      color: 'var(--red)', cursor: 'pointer', fontSize: '0.85rem',
                      transition: 'all 0.15s'
                    }}
                  >
                    {deletingId === e.id ? '…' : '🗑️'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
