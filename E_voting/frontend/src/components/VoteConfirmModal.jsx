export default function VoteConfirmModal({ candidate, election, onConfirm, onCancel, loading }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '2rem',
        maxWidth: '420px', width: '100%',
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'fadeUp 0.25s ease',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, var(--blue), var(--purple))' }} />

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--blue-dim)', border: '1px solid rgba(91,138,249,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', margin: '0 auto 1rem',
          }}>
            🗳️
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.35rem', letterSpacing: '-0.3px' }}>
            Confirm Your Vote
          </h2>
          <p style={{ color: 'var(--ink2)', fontSize: '0.85rem' }}>
            This action is permanent and cannot be undone.
          </p>
        </div>

        <div style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--r-sm)',
          padding: '1.1rem 1.25rem',
          marginBottom: '1.75rem',
        }}>
          <div style={{ marginBottom: '0.85rem' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '0.3rem' }}>
              Election
            </div>
            <div style={{ fontWeight: 600, color: 'var(--ink)', fontSize: '0.9rem' }}>{election.name}</div>
          </div>
          <div style={{ height: 1, background: 'var(--border)', margin: '0.75rem 0' }} />
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: '0.3rem' }}>
              Your Candidate
            </div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--blue-l)', marginBottom: '0.2rem' }}>
              {candidate.name}
            </div>
            <div style={{ color: 'var(--ink2)', fontSize: '0.82rem' }}>
              <span style={{ fontSize: '1.1rem', marginRight: '0.35rem' }}>{candidate.symbol || '🏛️'}</span>
              {candidate.party}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            className="btn btn-secondary"
            style={{ flex: 1 }}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className="btn btn-success"
            style={{ flex: 1 }}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                Casting…
              </span>
            ) : '✓ Confirm Vote'}
          </button>
        </div>
      </div>
    </div>
  );
}
