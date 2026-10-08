import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { getBaseURL } from '../api';
import ServerConfigModal from './ServerConfigModal';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const isDeployed = typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1';

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  const voterLinks = [
    { to: '/elections', label: 'Elections' },
    { to: '/create-election', label: '+ Create Election' },
    { to: '/results', label: 'Results' },
    { to: '/blockchain', label: 'Blockchain' },
    { to: '/profile', label: 'Profile' },
  ];
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/elections', label: 'Elections' },
    { to: '/admin/candidates', label: 'Candidates' },
    { to: '/admin/voters', label: 'Voters' },
    { to: '/admin/blockchain', label: 'Blockchain' },
  ];
  const guestLinks = [
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
    { to: '/admin/login', label: 'Admin' },
  ];

  const links = isAdmin ? adminLinks : user ? voterLinks : guestLinks;

  return (
    <>
      {isDeployed && !getBaseURL() && (
        <div style={{
          background: 'linear-gradient(90deg, #1e1b4b, #312e81)',
          color: '#e0e7ff',
          padding: '0.45rem 1rem',
          textAlign: 'center',
          fontSize: '0.85rem',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          zIndex: 100,
        }}>
          <span>⚡ Live Backend not connected yet.</span>
          <button
            onClick={() => setShowConfig(true)}
            style={{
              background: '#4f46e5',
              color: '#fff',
              border: 'none',
              padding: '0.2rem 0.75rem',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Connect Backend
          </button>
        </div>
      )}

      <nav>
        <div className="container nav-inner">
          <NavLink to="/" className="logo" onClick={() => setOpen(false)}>
            ✓ True<span>Vote</span>
          </NavLink>

          <ul style={{ display: 'flex', alignItems: 'center' }} className="desktop-nav">
            {links.map(l => (
              <li key={l.to}>
                <NavLink to={l.to}>{l.label}</NavLink>
              </li>
            ))}
            {(user || isAdmin) && (
              <li>
                <button
                  onClick={handleLogout}
                  style={{ color: 'var(--red) !important' }}
                >
                  Logout
                </button>
              </li>
            )}
            <li>
              <button
                onClick={() => setShowConfig(true)}
                title="Configure Backend Server URL"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  padding: '0.3rem 0.6rem',
                  fontSize: '0.8rem',
                  color: 'var(--ink2, #aaa)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  marginLeft: '0.5rem',
                }}
              >
                <span>⚙️</span> Server
              </button>
            </li>
          </ul>

        <button
          onClick={() => setOpen(o => !o)}
          className="hamburger"
          aria-label="Toggle menu"
          style={{
            display: 'none', background: 'none', border: 'none',
            cursor: 'pointer', color: 'var(--ink2)', fontSize: '1.3rem',
            padding: '0.3rem', lineHeight: 1,
          }}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div style={{
          background: 'rgba(8,8,16,0.97)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--border)',
          padding: '0.75rem 1.5rem 1.25rem',
          animation: 'fadeUp 0.2s ease',
        }}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center',
                padding: '0.7rem 0',
                color: isActive ? 'var(--blue-l)' : 'var(--ink2)',
                fontSize: '0.95rem',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                fontWeight: isActive ? 600 : 400,
              })}
            >
              {l.label}
            </NavLink>
          ))}
          {(user || isAdmin) && (
            <button
              onClick={handleLogout}
              style={{
                marginTop: '0.85rem', background: 'none', border: 'none',
                color: 'var(--red)', cursor: 'pointer', fontSize: '0.95rem',
                padding: 0, fontFamily: 'inherit', fontWeight: 500,
              }}
            >
              Logout
            </button>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-nav { display: none !important; }
        }
      `}</style>
      <ServerConfigModal isOpen={showConfig} onClose={() => setShowConfig(false)} />
    </nav>
  </>
  );
}


