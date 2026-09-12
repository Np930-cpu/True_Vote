import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listElections, hasVoted } from '../api';

export default function Elections() {
  const [elections, setElections] = useState([]);
  const [votedMap, setVotedMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    listElections().then(async r => {
      const list = r.data;
      setElections(list);
      const results = await Promise.allSettled(list.map(e => hasVoted(e.id)));
      const map = {};
      results.forEach((res, i) => {
        if (res.status === 'fulfilled') map[list[i].id] = res.value.data.has_voted;
      });
      setVotedMap(map);
    }).finally(() => setLoading(false));
  }, []);

  const getStatus = (e) => {
    const now = new Date();
    if (new Date(e.end_date) < now) return 'ended';
    if (new Date(e.start_date) <= now) return 'active';
    return 'upcoming';
  };

  const filtered = elections.filter(e => {
    const s = getStatus(e);
    return (filter === 'all' || s === filter) &&
      (e.name.toLowerCase().includes(search.toLowerCase()) ||
       e.description.toLowerCase().includes(search.toLowerCase()));
  });

  const counts = { all: elections.length, active: 0, upcoming: 0, ended: 0 };
  elections.forEach(e => counts[getStatus(e)]++);

  const statusConfig = {
    active:   { cls: 'badge-green',  label: 'Active',   dot: 'var(--green)' },
    upcoming: { cls: 'badge-yellow', label: 'Upcoming', dot: 'var(--amber)' },
    ended:    { cls: 'badge-red',    label: 'Ended',    dot: 'var(--red)' },
  };

  return (
    <div className="container">
      <div className="page-header">
        <h1>Elections</h1>
        <p>Browse and participate in ongoing elections</p>
      </div>

      {/* Stats row */}
      {!loading && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total', value: counts.all, color: 'var(--blue-l)' },
            { label: 'Active', value: counts.active, color: 'var(--green)' },
            { label: 'Upcoming', value: counts.upcoming, color: 'var(--amber)' },
            { label: 'Ended', value: counts.ended, color: 'var(--red)' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)', padding: '0.65rem 1.1rem',
              display: 'flex', alignItems: 'center', gap: '0.6rem',
            }}>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--ink2)', fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--ink3)', fontSize: '0.85rem', pointerEvents: 'none' }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search elections…"
            style={{
              width: '100%',
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)', padding: '0.6rem 0.9rem 0.6rem 2.2rem',
              color: 'var(--ink)', fontSize: '0.875rem', fontFamily: 'inherit', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--blue)'}
            onBlur={e => e.target.style.borderColor = 'var(--border)'}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.35rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '0.25rem' }}>
          {['all', 'active', 'upcoming', 'ended'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.38rem 0.85rem', fontSize: '0.78rem', fontWeight: 600,
                border: 'none', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit',
                textTransform: 'capitalize', transition: 'all 0.15s',
                background: filter === f ? 'var(--blue)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--ink2)',
              }}
            >
              {f} <span style={{ opacity: 0.65, marginLeft: '0.15rem', fontSize: '0.72rem' }}>{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="spinner" />}
      {!loading && filtered.length === 0 && (
        <div className="alert alert-info">No elections found matching your criteria.</div>
      )}

      <div className="grid-2">
        {filtered.map((e) => {
          const s = getStatus(e);
          const cfg = statusConfig[s];
          const voted = votedMap[e.id];
          return (
            <div key={e.id} className="election-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.65rem', gap: '0.5rem' }}>
                <h3 style={{ flex: 1 }}>{e.name}</h3>
                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0, alignItems: 'center' }}>
                  {voted && <span className="badge badge-blue">✓ Voted</span>}
                  <span className={`badge ${cfg.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {s === 'active' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 4px var(--green)' }} />}
                    {cfg.label}
                  </span>
                </div>
              </div>
              <p>{e.description}</p>
              <div className="dates" style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>📅</span>
                <span>{e.start_date} — {e.end_date}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  className={`btn ${s === 'active' && !voted ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => navigate('/vote', { state: { election: e } })}
                  disabled={s !== 'active' || voted}
                  style={{ flex: 1 }}
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
