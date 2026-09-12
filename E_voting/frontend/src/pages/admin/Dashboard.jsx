import { useEffect, useState, useCallback } from 'react';
import { getDashboard } from '../../api';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try { const r = await getDashboard(); setData(r.data); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 10000);
    return () => clearInterval(t);
  }, [load]);

  const total = data?.candidate_votes?.reduce((s, c) => s + c.total, 0) || 0;
  const turnout = data?.total_voters > 0 ? Math.round((data.total_votes / data.total_voters) * 100) : 0;

  const statCards = data ? [
    { label: 'Registered Voters', value: data.total_voters, icon: '👥', color: 'var(--blue-l)', glow: 'rgba(91,138,249,0.15)' },
    { label: 'Votes Cast', value: data.total_votes, icon: '🗳️', color: 'var(--green)', glow: 'rgba(62,207,142,0.12)' },
    { label: 'Voter Turnout', value: `${turnout}%`, icon: '📊', color: 'var(--purple)', glow: 'rgba(167,139,250,0.12)' },
  ] : [];

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1>Dashboard</h1>
          <p>Live overview — auto-refreshes every 10 seconds</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => load(true)}
          disabled={refreshing}
          style={{ fontSize: '0.82rem', gap: '0.4rem' }}
        >
          <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.7s linear infinite' : 'none' }}>↻</span>
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {loading && <div className="spinner" />}

      {data && (
        <>
          {/* Stat cards */}
          <div className="grid-3" style={{ marginBottom: '1.75rem' }}>
            {statCards.map((s, i) => (
              <div key={i} style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 'var(--r)', padding: '1.5rem',
                transition: 'border-color 0.2s, transform 0.2s',
                position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-h)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none'; }}
              >
                <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '50%', background: s.glow, transform: 'translate(20px, -20px)', pointerEvents: 'none' }} />
                <div style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>{s.icon}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: s.color, letterSpacing: '-1.5px', lineHeight: 1, marginBottom: '0.4rem' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--ink2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Turnout bar */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--ink2)' }}>Voter Turnout</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--purple)' }}>{turnout}%</span>
            </div>
            <div style={{ background: 'var(--surface2)', borderRadius: 999, height: 8, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                background: 'linear-gradient(90deg, var(--blue), var(--purple))',
                width: `${turnout}%`,
                transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
                boxShadow: '0 0 12px rgba(167,139,250,0.4)',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.4rem', fontSize: '0.7rem', color: 'var(--ink3)' }}>
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Winner */}
          {data.winner && (
            <div className="winner-banner" style={{ marginBottom: '1.5rem' }}>
              <span className="trophy">🏆</span>
              <h2>{data.winner.candidate__name}</h2>
              <p>{data.winner.total} votes · current leader</p>
            </div>
          )}

          {/* Votes by candidate */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>Votes by Candidate</h3>
              <span className="badge badge-blue">{total} total</span>
            </div>
            {data.candidate_votes.length === 0 && (
              <p style={{ color: 'var(--ink2)', fontSize: '0.875rem' }}>No votes cast yet.</p>
            )}
            {data.candidate_votes.map((c, i) => {
              const pct = total > 0 ? Math.round((c.total / total) * 100) : 0;
              const colors = ['var(--blue)', 'var(--green)', 'var(--purple)', 'var(--amber)', 'var(--red)'];
              const color = colors[i % colors.length];
              return (
                <div key={i} className="result-bar-wrap">
                  <div className="result-bar-label">
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{c.candidate__name}</span>
                    <span style={{ color: 'var(--ink2)' }}>
                      {c.total} votes · <strong style={{ color }}>{pct}%</strong>
                    </span>
                  </div>
                  <div className="result-bar-bg">
                    <div className="result-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
