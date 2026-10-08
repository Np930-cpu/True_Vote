import { useState, useEffect } from 'react';
import axios from 'axios';
import { getBaseURL, setBaseURL } from '../api';

export default function ServerConfigModal({ isOpen, onClose }) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success'|'error'|'info', msg: '' }
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUrl(getBaseURL() || '');
      setStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestAndSave = async (e) => {
    e.preventDefault();
    const cleanUrl = url.trim().replace(/\/+$/, '');
    if (!cleanUrl) {
      setBaseURL('');
      setStatus({ type: 'info', msg: 'Cleared custom URL. Defaulting to environment configuration.' });
      return;
    }

    setTesting(true);
    setStatus({ type: 'info', msg: 'Testing connection to backend (Render may take 30-40s to wake up)...' });

    try {
      // Test the public elections endpoint
      await axios.get(`${cleanUrl}/api/elections/election/`, { timeout: 45000 });
      setBaseURL(cleanUrl);
      setStatus({ type: 'success', msg: 'Connected successfully to backend!' });
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 1200);
    } catch (err) {
      if (err.response) {
        // Server replied with an HTTP code (e.g., 200, 401, 403, 404) -> it IS reachable!
        setBaseURL(cleanUrl);
        setStatus({ type: 'success', msg: `Connected successfully! (Server responded with HTTP ${err.response.status})` });
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      } else if (err.code === 'ECONNABORTED') {
        setStatus({ type: 'error', msg: 'Connection timed out. The Render server might still be booting up or the URL is incorrect.' });
      } else {
        setStatus({ type: 'error', msg: 'Unable to reach backend at this URL. Please ensure your Render service is Live and CORS is enabled.' });
      }
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(5, 5, 12, 0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: 'var(--surface, #111122)', border: '1px solid var(--border, rgba(255,255,255,0.1))',
        borderRadius: '16px', maxWidth: '480px', width: '100%', padding: '1.75rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--ink, #fff)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>⚙️</span> Backend Connection
          </h3>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--ink2, #888)', fontSize: '1.25rem', cursor: 'pointer', padding: '0.2rem' }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--ink2, #aaa)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Enter your live Django backend URL (e.g. from your Render Dashboard). This connects your live frontend to the cloud database and blockchain.
        </p>

        {status && (
          <div style={{
            padding: '0.75rem 1rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '0.85rem',
            background: status.type === 'success' ? 'rgba(34, 197, 94, 0.15)' : status.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            border: `1px solid ${status.type === 'success' ? 'rgba(34, 197, 94, 0.4)' : status.type === 'error' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)'}`,
            color: status.type === 'success' ? '#4ade80' : status.type === 'error' ? '#f87171' : '#60a5fa',
          }}>
            {status.msg}
          </div>
        )}

        <form onSubmit={handleTestAndSave}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: 'var(--ink, #ccc)' }}>
              Backend URL (HTTPS)
            </label>
            <input
              type="url"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="https://truevote-backend.onrender.com"
              style={{
                width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff', fontSize: '0.9rem', outline: 'none',
              }}
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.6rem 1.1rem', fontSize: '0.85rem' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={testing}
              className="btn btn-primary"
              style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}
            >
              {testing ? 'Testing Connection…' : 'Save & Connect'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
