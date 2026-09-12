import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResults, listElections } from '../api';

const COLORS = ['#3b6ef8', '#0ea86a', '#d97706', '#e03e3e', '#7c3aed', '#0891b2', '#be185d'];

// Pure SVG donut chart — no external library
function DonutChart({ data, total }) {
  const cx = 90, cy = 90, R = 65, r = 40;
  const circumference = 2 * Math.PI * R;

  if (total === 0) {
    return (
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--border)" strokeWidth="25" />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11" fill="var(--ink3)">No votes</text>
      </svg>
    );
  }

  let offset = 0;
  const slices = data.map((d, i) => {
    const pct = d.value / total;
    const dash = pct * circumference;
    const gap  = circumference - dash;
    const slice = { offset, dash, gap, color: COLORS[i % COLORS.length], name: d.name, value: d.value };
    offset += dash;
    return slice;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
      <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
        {slices.map((s, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={R}
            fill="none"
            stroke={s.color}
            strokeWidth="25"
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeDashoffset={-s.offset}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        ))}
        <circle cx={cx} cy={cy} r={r} fill="var(--surface)" />
      </svg>
      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length], flexShrink: 0, display: 'inline-block' }} />
            <span style={{ color: 'var(--ink2)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</span>
            <span style={{ color: 'var(--ink)', fontWeight: 600 }}>{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ElectionResult({ election }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResults(election.id)
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, [election.id]);

  const total = data?.results?.reduce((s, r) => s + r.total_vote, 0) || 0;
  const chartData = data?.results?.map(r => ({ name: r.candidate__name, value: r.total_vote })) || [];

  const getStatus = () => {
    const now = new Date();
    if (new Date(election.end_date) < now) return { label: 'Ended', cls: 'badge-red' };
    if (new Date(election.start_date) <= now) return { label: 'Active', cls: 'badge-green' };
    return { label: 'Upcoming', cls: 'badge-yellow' };
  };
  const status = getStatus();

  return (
    <div className="card" style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '0.2rem' }}>{election.name}</h2>
          <p style={{ color: 'var(--ink2)', fontSize: '0.82rem' }}>{election.start_date} — {election.end_date}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-blue">{total} votes</span>
          <span className={`badge ${status.cls}`}>{status.label}</span>
        </div>
      </div>

      {loading && (
        <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="spinner" style={{ margin: 0, width: 24, height: 24 }} />
        </div>
      )}

      {!loading && data && (
        <>
          {data.winner && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.85rem',
              background: 'rgba(14,168,106,0.07)',
              border: '1px solid rgba(14,168,106,0.2)',
              borderRadius: 'var(--r-sm)', padding: '0.9rem 1.1rem', marginBottom: '1.25rem',
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, var(--green), transparent)' }} />
              <span style={{ fontSize: '1.4rem' }}>🏆</span>
              <div>
                <div style={{ fontWeight: 800, color: 'var(--green)', fontSize: '0.95rem' }}>{data.winner.candidate__name}</div>
                <div style={{ color: 'var(--ink2)', fontSize: '0.78rem', marginTop: '0.1rem' }}>{data.winner.total_vote} votes · Leading</div>
              </div>
            </div>
          )}

          {data.results.length === 0 && (
            <p style={{ color: 'var(--ink2)', fontSize: '0.875rem' }}>No votes cast yet.</p>
          )}

          {data.results.length > 0 && (
            <div className="grid-2" style={{ alignItems: 'start' }}>
              {/* Bar chart */}
              <div>
                {data.results.map((r, i) => {
                  const pct = total > 0 ? Math.round((r.total_vote / total) * 100) : 0;
                  const color = COLORS[i % COLORS.length];
                  return (
                    <div key={i} className="result-bar-wrap">
                      <div className="result-bar-label">
                        <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.candidate__name}</span>
                        <span style={{ color: 'var(--ink2)' }}>
                          {r.total_vote} · <strong style={{ color }}>{pct}%</strong>
                        </span>
                      </div>
                      <div className="result-bar-bg">
                        <div className="result-bar-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Donut chart */}
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <DonutChart data={chartData} total={total} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function Results() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(id ? parseInt(id) : null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const r = await listElections();
      setElections(r.data);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 10000);
    return () => clearInterval(t);
  }, [load]);

  const displayed = selected ? elections.filter(e => e.id === selected) : elections;

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Results</h1>
          <p>Live vote counts across all elections</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {refreshing && <span style={{ color: 'var(--ink3)', fontSize: '0.78rem' }}>Refreshing…</span>}
          <button className="btn btn-secondary" onClick={() => load(true)} disabled={refreshing} style={{ fontSize: '0.8rem' }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {!loading && elections.length > 1 && (
        <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            className={`btn ${!selected ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
            onClick={() => { setSelected(null); navigate('/results'); }}
          >
            All Elections
          </button>
          {elections.map(e => (
            <button
              key={e.id}
              className={`btn ${selected === e.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}
              onClick={() => { setSelected(e.id); navigate(`/results/${e.id}`); }}
            >
              {e.name}
            </button>
          ))}
        </div>
      )}

      {loading && <div className="spinner" />}
      {!loading && elections.length === 0 && <div className="alert alert-info">No elections found.</div>}
      {!loading && displayed.map(e => <ElectionResult key={e.id} election={e} />)}

      <p style={{ color: 'var(--ink3)', fontSize: '0.75rem', textAlign: 'center', paddingBottom: '2rem' }}>
        Auto-refreshes every 10 seconds
      </p>
    </div>
  );
}
