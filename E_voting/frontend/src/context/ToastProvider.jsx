import { useState, useCallback } from 'react';
import { ToastContext } from './toastContext';

const icons = { success: '✓', error: '✕', info: 'i' };
const colors = {
  success: { bg: 'rgba(62,207,142,0.1)', border: 'rgba(62,207,142,0.3)', text: '#6ee7b7', icon: 'var(--green)' },
  error:   { bg: 'rgba(240,96,96,0.1)',  border: 'rgba(240,96,96,0.3)',  text: '#fca5a5', icon: 'var(--red)' },
  info:    { bg: 'rgba(91,138,249,0.1)', border: 'rgba(91,138,249,0.3)', text: '#93c5fd', icon: 'var(--blue-l)' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((message, type = 'info', duration = 3800) => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), duration);
  }, []);

  const remove = (id) => setToasts(t => t.filter(x => x.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{
        position: 'fixed', bottom: '1.5rem', right: '1.5rem',
        display: 'flex', flexDirection: 'column', gap: '0.5rem',
        zIndex: 9999, maxWidth: '380px', width: 'calc(100vw - 3rem)',
      }}>
        {toasts.map(t => {
          const c = colors[t.type] || colors.info;
          return (
            <div
              key={t.id}
              onClick={() => remove(t.id)}
              style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: 'var(--r-sm)',
                padding: '0.85rem 1rem',
                cursor: 'pointer',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                animation: 'fadeUp 0.3s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                lineHeight: 1.5,
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%',
                background: c.border, border: `1px solid ${c.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 800, color: c.icon,
                flexShrink: 0, marginTop: '0.05rem',
              }}>
                {icons[t.type]}
              </div>
              <span style={{ fontSize: '0.875rem', fontWeight: 500, color: c.text, flex: 1 }}>
                {t.message}
              </span>
              <span style={{ color: c.text, opacity: 0.5, fontSize: '0.75rem', flexShrink: 0, marginTop: '0.1rem' }}>✕</span>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
