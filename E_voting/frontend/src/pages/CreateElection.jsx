import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createElection } from '../api';
import { useToast } from '../context/useToast';

const CATEGORIES = [
  { id: 'college', label: 'College / University', icon: '🎓', desc: 'Department reps, student union, societies' },
  { id: 'school',  label: 'School',               icon: '🏫', desc: 'Head boy/girl, house captains, council' },
  { id: 'club',    label: 'Club & Society',       icon: '🎭', desc: 'Tech clubs, cultural bodies, sports leagues' },
  { id: 'local',   label: 'Local Community',      icon: '🏘️', desc: 'HOA, resident associations, committees' },
  { id: 'general', label: 'General / Public',     icon: '🗳️', desc: 'Open referendum, townhall, general election' },
];

const SUGGESTED_EMOJIS = ['🏛️', '🎓', '⚡', '🚀', '🌟', '🦁', '🦅', '🌻', '🎯', '💡', '🛡️', '🔥', '🏆', '💻', '🎨', '🌿'];

export default function CreateElection() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];

  const [category, setCategory] = useState('college');
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(nextWeekStr);

  const [candidates, setCandidates] = useState([
    { name: '', party: '', symbol: '🎓', manifesto: '' },
    { name: '', party: '', symbol: '⚡', manifesto: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addCandidate = () => {
    const nextEmoji = SUGGESTED_EMOJIS[(candidates.length) % SUGGESTED_EMOJIS.length];
    setCandidates([...candidates, { name: '', party: '', symbol: nextEmoji, manifesto: '' }]);
  };

  const removeCandidate = (idx) => {
    if (candidates.length <= 2) {
      showToast('An election requires at least 2 candidates.', 'error');
      return;
    }
    setCandidates(candidates.filter((_, i) => i !== idx));
  };

  const updateCandidate = (idx, field, value) => {
    const updated = [...candidates];
    updated[idx] = { ...updated[idx], [field]: value };
    setCandidates(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide an election title.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a short description or guidelines.');
      return;
    }
    if (!startDate || !endDate) {
      setError('Both start date and end date are required.');
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      setError('End date cannot be earlier than start date.');
      return;
    }

    // Validate candidates
    const validCandidates = candidates.filter(c => c.name.trim().length > 0);
    if (validCandidates.length < 2) {
      setError('Please provide at least 2 candidates with valid names.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        organization: organization.trim(),
        description: description.trim(),
        start_date: startDate,
        end_date: endDate,
        candidates: validCandidates.map(c => ({
          name: c.name.trim(),
          party: c.party.trim() || 'Independent',
          symbol: c.symbol.trim() || '🏛️',
          manifesto: c.manifesto.trim(),
        })),
      };

      const res = await createElection(payload);
      if (res.status === 201 || res.data?.message) {
        showToast('Election created successfully with blockchain audit trail!', 'success');
        navigate('/elections');
      } else {
        setError('Failed to create election. Please check your inputs.');
      }
    } catch (err) {
      const msg = err.response?.data?.error ||
        (typeof err.response?.data === 'string' ? err.response.data : 'Error creating election');
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 840, paddingBottom: '3.5rem' }}>
      <div className="page-header" style={{ marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <button
            onClick={() => navigate('/elections')}
            style={{
              background: 'none', border: 'none', color: 'var(--ink2)',
              cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem'
            }}
          >
            ← Back to Elections
          </button>
        </div>
        <h1>Create an Election</h1>
        <p>Launch an open, transparent, and blockchain-secured election for your school, college, club, or local community.</p>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Step 1: Category Selector */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem', color: 'var(--ink)' }}>
            1. Select Election Category
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink2)', marginBottom: '1rem' }}>
            Choose where this election will take place. This helps voters discover relevant elections.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '0.75rem'
          }}>
            {CATEGORIES.map(c => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategory(c.id)}
                  style={{
                    border: `1.5px solid ${active ? 'var(--blue)' : 'var(--border)'}`,
                    background: active ? 'var(--blue-dim)' : 'var(--surface)',
                    borderRadius: 'var(--r-sm)',
                    padding: '0.85rem 0.65rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.18s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.3rem',
                  }}
                >
                  <span style={{ fontSize: '1.5rem' }}>{c.icon}</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: active ? 'var(--blue)' : 'var(--ink)' }}>
                    {c.label}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--ink3)', lineHeight: 1.3 }}>
                    {c.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Basic Details */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.05rem', marginBottom: '0.4rem', color: 'var(--ink)' }}>
            2. Election Information
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink2)', marginBottom: '1.25rem' }}>
            Enter the title, organization name, dates, and voting guidelines.
          </p>

          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Election Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Student Council President 2026 / CS Dept Representative"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{
                width: '100%', padding: '0.65rem 0.85rem',
                border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.9rem'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.1rem' }}>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Organization / School / College Name
            </label>
            <input
              type="text"
              placeholder="e.g. Stanford University, Lincoln High School, Rotary Club"
              value={organization}
              onChange={e => setOrganization(e.target.value)}
              style={{
                width: '100%', padding: '0.65rem 0.85rem',
                border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.9rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.1rem' }}>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Voting Start Date *
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
                style={{
                  width: '100%', padding: '0.65rem 0.85rem',
                  border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                  background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.9rem'
                }}
              />
            </div>
            <div className="form-group">
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Voting End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                required
                style={{
                  width: '100%', padding: '0.65rem 0.85rem',
                  border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                  background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Description & Guidelines *
            </label>
            <textarea
              rows={3}
              placeholder="Briefly explain the purpose of this election, rules, voter eligibility, and instructions..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              required
              style={{
                width: '100%', padding: '0.65rem 0.85rem',
                border: '1px solid var(--border)', borderRadius: 'var(--r-sm)',
                background: 'var(--bg)', color: 'var(--ink)', fontSize: '0.9rem',
                fontFamily: 'inherit', resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* Step 3: Candidates Builder */}
        <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <h2 style={{ fontSize: '1.05rem', color: 'var(--ink)' }}>
              3. Candidates / Nominees ({candidates.length})
            </h2>
            <button
              type="button"
              onClick={addCandidate}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}
            >
              + Add Candidate
            </button>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--ink2)', marginBottom: '1.25rem' }}>
            Add at least two candidates for voters to choose from. You can specify symbols, affiliations, and manifestos.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {candidates.map((c, idx) => (
              <div
                key={idx}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--r-sm)',
                  background: 'var(--surface2)',
                  padding: '1.1rem',
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--blue)' }}>
                    Candidate #{idx + 1}
                  </span>
                  {candidates.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeCandidate(idx)}
                      style={{
                        background: 'none', border: 'none', color: 'var(--red)',
                        cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600
                      }}
                    >
                      ✕ Remove
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 100px', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink2)', marginBottom: '0.25rem' }}>
                      Candidate Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Alice Johnson"
                      value={c.name}
                      onChange={e => updateCandidate(idx, 'name', e.target.value)}
                      required
                      style={{
                        width: '100%', padding: '0.55rem 0.75rem',
                        border: '1px solid var(--border)', borderRadius: 'var(--r-xs)',
                        background: 'var(--surface)', color: 'var(--ink)', fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink2)', marginBottom: '0.25rem' }}>
                      Party / Team / Slate
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Blue Slate / Independent"
                      value={c.party}
                      onChange={e => updateCandidate(idx, 'party', e.target.value)}
                      style={{
                        width: '100%', padding: '0.55rem 0.75rem',
                        border: '1px solid var(--border)', borderRadius: 'var(--r-xs)',
                        background: 'var(--surface)', color: 'var(--ink)', fontSize: '0.85rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink2)', marginBottom: '0.25rem' }}>
                      Symbol Emoji
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={c.symbol}
                      onChange={e => updateCandidate(idx, 'symbol', e.target.value)}
                      style={{
                        width: '100%', padding: '0.55rem 0.75rem', textAlign: 'center',
                        border: '1px solid var(--border)', borderRadius: 'var(--r-xs)',
                        background: 'var(--surface)', color: 'var(--ink)', fontSize: '1.05rem'
                      }}
                    />
                  </div>
                </div>

                {/* Quick Emoji Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.75rem', overflowX: 'auto', paddingBottom: '0.2rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--ink3)', flexShrink: 0 }}>Pick symbol:</span>
                  {SUGGESTED_EMOJIS.slice(0, 10).map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => updateCandidate(idx, 'symbol', emoji)}
                      style={{
                        background: c.symbol === emoji ? 'var(--blue-dim)' : 'var(--surface)',
                        border: `1px solid ${c.symbol === emoji ? 'var(--blue)' : 'var(--border)'}`,
                        borderRadius: 4, padding: '0.15rem 0.4rem', cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--ink2)', marginBottom: '0.25rem' }}>
                    Manifesto / Key Promises
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dedicated to better campus cafeteria, extended lab hours, and weekly office hours."
                    value={c.manifesto}
                    onChange={e => updateCandidate(idx, 'manifesto', e.target.value)}
                    style={{
                      width: '100%', padding: '0.55rem 0.75rem',
                      border: '1px solid var(--border)', borderRadius: 'var(--r-xs)',
                      background: 'var(--surface)', color: 'var(--ink)', fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addCandidate}
            style={{
              width: '100%', marginTop: '1rem', padding: '0.75rem',
              border: '1.5px dashed var(--border-h)', borderRadius: 'var(--r-sm)',
              background: 'transparent', color: 'var(--blue)', fontWeight: 600,
              cursor: 'pointer', fontSize: '0.85rem', transition: 'all 0.2s'
            }}
          >
            + Add Another Candidate
          </button>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/elections')}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ minWidth: 180 }}
          >
            {loading ? 'Creating Election…' : 'Publish Election 🚀'}
          </button>
        </div>
      </form>
    </div>
  );
}
