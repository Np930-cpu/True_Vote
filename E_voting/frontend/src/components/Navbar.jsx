import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); setOpen(false); };

  const voterLinks = [
    { to: '/elections', label: 'Elections' },
    { to: '/results', label: 'Results' },
    { to: '/blockchain', label: 'Blockchain' },
    { to: '/profile', label: 'Profile' },
  ];
  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard' },
    { to: '/admin/elections', label: 'Elections' },
    { to: '/admin/candidates', label: 'Candidates' },
    { to: '/admin/blockchain', label: 'Blockchain' },
  ];
  const guestLinks = [
    { to: '/login', label: 'Login' },
    { to: '/register', label: 'Register' },
    { to: '/admin/login', label: 'Admin' },
  ];

  const links = isAdmin ? adminLinks : user ? voterLinks : guestLinks;

  return (
    <nav>
      <div className="container nav-inner">
        <NavLink to="/" className="logo" onClick={() => setOpen(false)}>
          ✓ True<span>Vote</span>
        </NavLink>

        <ul style={{ display: 'flex' }} className="desktop-nav">
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
          .hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
