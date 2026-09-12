import { useEffect, useState } from 'react';
import { getProfile } from '../api';
import { useAuth } from '../context/useAuth';

export default function Profile() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then(r => setProfile(r.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="container"><div className="spinner" /></div>;

  const initials = profile.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Your voter account details and verification status</p>
      </div>

      <div className="grid-2" style={{ marginBottom: '1.5rem', alignItems: 'start' }}>
        {/* Info card */}
        <div className="card">
          {/* Avatar + name */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--blue), var(--purple))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', fontWeight: 900, color: '#fff', flexShrink: 0,
              boxShadow: '0 4px 16px rgba(91,138,249,0.35)',
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--ink)', letterSpacing: '-0.3px' }}>{profile.name}</div>
              <div style={{ color: 'var(--ink2)', fontSize: '0.82rem', marginTop: '0.15rem' }}>
                <span className="badge badge-blue" style={{ fontSize: '0.62rem' }}>Voter ID: {profile.voter_id}</span>
              </div>
            </div>
          </div>

          {/* Fields */}
          {[
            { label: 'Email Address', value: profile.email_id, icon: '📧' },
            { label: 'Age', value: `${profile.age} years old`, icon: '🎂' },
            { label: 'Voter ID', value: profile.voter_id, icon: '🪪' },
          ].map(({ label, value, icon }) => (
            <div key={label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.75rem 0', borderBottom: '1px solid rgba(37,37,53,0.6)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem' }}>{icon}</span>
                <span style={{ color: 'var(--ink2)', fontSize: '0.82rem' }}>{label}</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--ink)' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Status card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <h3 style={{ fontWeight: 700, marginBottom: '1.25rem', fontSize: '0.95rem' }}>Verification Status</h3>

            {[
              { label: 'OTP Verified', done: profile.otp_verified, icon: '📧', desc: 'Email address confirmed' },
              { label: 'Face Registered', done: profile.face_registered, icon: '👤', desc: 'Biometric identity set up' },
            ].map(({ label, done, icon, desc }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.9rem 1rem', borderRadius: 'var(--r-sm)', marginBottom: '0.6rem',
                background: done ? 'rgba(62,207,142,0.06)' : 'rgba(240,96,96,0.05)',
                border: `1px solid ${done ? 'rgba(62,207,142,0.2)' : 'rgba(240,96,96,0.15)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{icon}</span>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--ink)' }}>{label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ink2)' }}>{desc}</div>
                  </div>
                </div>
                <span className={`badge ${done ? 'badge-green' : 'badge-red'}`}>
                  {done ? '✓ Done' : 'Pending'}
                </span>
              </div>
            ))}
          </div>

          {/* Elections voted */}
          <div className="card" style={{ textAlign: 'center', padding: '1.75rem' }}>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--blue-l)', letterSpacing: '-2px', lineHeight: 1, marginBottom: '0.4rem' }}>
              {profile.voted_elections.length}
            </div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--ink2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Elections Participated
            </div>
          </div>

          <button className="btn btn-danger btn-full" onClick={logout} style={{ padding: '0.7rem' }}>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
