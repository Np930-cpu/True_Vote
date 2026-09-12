import { useEffect, useState, useCallback } from 'react';
import { getBlockchain, validateBlockchain } from '../api';

export default function Blockchain() {
  const [blocks, setBlocks] = useState([]);
  const [validity, setValidity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true);
    try {
      const r = await getBlockchain();
      setBlocks(r.data);
    } finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(() => load(true), 10000);
    return () => clearInterval(t);
  }, [load]);

  const handleValidate = async () => {
    setValidating(true);
    try {
      const res = await validateBlockchain();
      setValidity(res.data);
    } catch { setValidity({ valid: false, message: 'Validation request failed.' }); }
    setValidating(false);
  };

  return (
    <div className="container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Blockchain Ledger</h1>
          <p>Immutable cryptographic record of all votes</p>
        </div>
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          {refreshing && (
            <span style={{ color: 'var(--ink3)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: 10, height: 10, border: '1.5px solid var(--border)', borderTopColor: 'var(--blue)', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              Refreshing
            </span>
          )}
          <button className="btn btn-secondary" onClick={() => load(true)} disabled={refreshing} style={{ fontSize: '0.82rem' }}>
            ↻ Refresh
          </button>
          <button className="btn btn-primary" onClick={handleValidate} disabled={validating} style={{ fontSize: '0.82rem' }}>
            {validating ? 'Validating…' : '🔍 Validate Chain'}
          </button>
        </div>
      </div>

      <p style={{ color: 'var(--ink3)', fontSize: '0.75rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', boxShadow: '0 0 5px var(--green)' }} />
        Auto-refreshes every 10 seconds
      </p>

      {validity && (
        <div className={`alert alert-${validity.valid ? 'success' : 'error'}`} style={{ marginBottom: '1.5rem' }}>
          {validity.valid ? '✅' : '❌'} {validity.message}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.75rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: 'var(--blue-dim)', border: '1px solid rgba(91,138,249,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
            ⛓️
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--blue-l)', letterSpacing: '-1px', lineHeight: 1 }}>{blocks.length}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginTop: '0.2rem' }}>Total Blocks</div>
          </div>
        </div>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--r-sm)', background: validity?.valid ? 'var(--green-dim)' : validity === null ? 'var(--surface2)' : 'var(--red-dim)', border: `1px solid ${validity?.valid ? 'rgba(62,207,142,0.2)' : validity === null ? 'var(--border)' : 'rgba(240,96,96,0.2)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
            🔒
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.5px', lineHeight: 1, color: validity === null ? 'var(--ink2)' : validity.valid ? 'var(--green)' : 'var(--red)' }}>
              {validity === null ? '—' : validity.valid ? 'Valid' : 'Invalid'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--ink2)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginTop: '0.2rem' }}>Chain Status</div>
          </div>
        </div>
      </div>

      {loading && <div className="spinner" />}
      {!loading && blocks.length === 0 && (
        <div className="alert alert-info">No blocks in the chain yet.</div>
      )}

      {[...blocks].reverse().map((b, i) => (
        <div key={i} className="block-item">
          <div className="block-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--blue)', display: 'inline-block' }} />
              Block #{b.index}
            </span>
            <span style={{ color: 'var(--ink3)', fontFamily: 'inherit', fontSize: '0.72rem' }}>
              {new Date(b.timestamp).toLocaleString()}
            </span>
          </div>
          <div style={{ marginBottom: '0.5rem', color: 'var(--ink2)', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
            <span>
              <span style={{ color: 'var(--ink3)' }}>Voter: </span>
              <strong style={{ color: 'var(--blue-l)' }}>{b.voter_id}</strong>
            </span>
            <span>
              <span style={{ color: 'var(--ink3)' }}>Candidate: </span>
              <strong style={{ color: 'var(--ink)' }}>{b.candidate_id}</strong>
            </span>
          </div>
          <div className="hash"><span style={{ color: 'var(--ink3)' }}>Hash: </span><span style={{ color: 'var(--blue-l)' }}>{b.hash}</span></div>
          <div className="hash"><span style={{ color: 'var(--ink3)' }}>Prev: </span>{b.previous_hash}</div>
        </div>
      ))}
    </div>
  );
}
