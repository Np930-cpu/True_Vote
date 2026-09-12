import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { listCandidates, castVote } from '../api';
import { useToast } from '../context/useToast';
import VoteConfirmModal from '../components/VoteConfirmModal';
import FaceVerify from '../components/FaceVerify';

const REDIRECT_DELAY = 30; // seconds before auto-redirect to results

export default function Vote() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const election = state?.election;

  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [step, setStep] = useState('face');
  const [showModal, setShowModal] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [countdown, setCountdown] = useState(REDIRECT_DELAY);
  const [downloaded, setDownloaded] = useState(false);
  const countdownRef = useRef(null);

  const storedVoter = localStorage.getItem('voter');
  const voterId = storedVoter ? JSON.parse(storedVoter)?.voter_id : '';

  useEffect(() => {
    if (!election) { navigate('/elections'); return; }
    listCandidates()
      .then(r => setCandidates(r.data.filter(c => c.election === election.id)))
      .finally(() => setFetching(false));
  }, [election, navigate]);

  const handleVote = async () => {
    setShowModal(false);
    setLoading(true);
    try {
      const res = await castVote({ candidate: selected, face_verified: true });
      if (res.data?.message) {
        toast('Vote cast successfully!', 'success');
        setReceipt(res.data.receipt);
        setStep('done');
        // Start countdown — auto-redirect after REDIRECT_DELAY seconds
        setCountdown(REDIRECT_DELAY);
        setDownloaded(false);
      } else {
        const errText = res.data?.error || 'Vote failed.';
        const isFraud = errText.toLowerCase().includes('fraud') || errText.toLowerCase().includes('multiple');
        toast((isFraud ? '🤖 Fraud detected: ' : '') + errText, 'error');
      }
    } catch (err) {
      const errText = err.response?.data?.error || 'Failed to cast vote.';
      const isFraud = errText.toLowerCase().includes('fraud') || errText.toLowerCase().includes('multiple');
      toast((isFraud ? '🤖 Fraud detected: ' : '') + errText, 'error');
    }
    setLoading(false);
  };

  // Countdown timer — starts when step becomes 'done'
  useEffect(() => {
    if (step !== 'done') return;
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          navigate(`/results/${election.id}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdownRef.current);
  }, [step, election, navigate]);

  const downloadReceipt = () => {
    const canvas = document.createElement('canvas');
    const W = 600, H = 520;    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    // background — white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // top blue bar
    ctx.fillStyle = '#3b6ef8';
    ctx.fillRect(0, 0, W, 4);

    // border
    ctx.strokeStyle = '#dde1f0';
    ctx.lineWidth = 1;
    ctx.strokeRect(1, 1, W - 2, H - 2);

    // header
    ctx.fillStyle = '#3b6ef8';
    ctx.font = 'bold 22px Inter, sans-serif';
    ctx.fillText('✓ TrueVote', 36, 52);

    ctx.fillStyle = '#5a6080';
    ctx.font = '13px Inter, sans-serif';
    ctx.fillText('Official Vote Receipt', 36, 74);

    // divider
    ctx.strokeStyle = '#dde1f0';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(36, 92); ctx.lineTo(W - 36, 92); ctx.stroke();

    // success badge
    ctx.fillStyle = '#f0fdf4';
    ctx.beginPath();
    ctx.roundRect(36, 108, W - 72, 48, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(14,168,106,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(36, 108, W - 72, 48, 8);
    ctx.stroke();
    ctx.fillStyle = '#065f46';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✅  Vote Cast Successfully — Recorded on Blockchain', W / 2, 138);
    ctx.textAlign = 'left';

    // fields
    const fields = [
      ['Voter ID',   receipt.voter_id],
      ['Election',   receipt.election],
      ['Candidate',  receipt.candidate],
      ['Party',      receipt.party],
      ['Timestamp',  new Date(receipt.timestamp).toLocaleString()],
      ['Block',      `#${receipt.block_index}`],
    ];

    let y = 186;
    fields.forEach(([label, value]) => {
      ctx.fillStyle = '#9aa0bc';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText(label.toUpperCase(), 36, y);
      ctx.fillStyle = '#0f1120';
      ctx.font = '13px Inter, sans-serif';
      ctx.fillText(String(value), 180, y);
      ctx.strokeStyle = '#dde1f0';
      ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(36, y + 10); ctx.lineTo(W - 36, y + 10); ctx.stroke();
      y += 34;
    });

    // hash box
    ctx.fillStyle = '#f5f7ff';
    ctx.beginPath();
    ctx.roundRect(36, y + 4, W - 72, 64, 6);
    ctx.fill();
    ctx.strokeStyle = '#dde1f0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(36, y + 4, W - 72, 64, 6);
    ctx.stroke();
    ctx.fillStyle = '#9aa0bc';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('BLOCKCHAIN HASH (PROOF OF VOTE)', 48, y + 22);
    ctx.fillStyle = '#3b6ef8';
    ctx.font = '10px "Courier New", monospace';
    const hash = receipt.block_hash;
    ctx.fillText(hash.slice(0, 42), 48, y + 40);
    ctx.fillText(hash.slice(42), 48, y + 56);

    // footer
    ctx.fillStyle = '#9aa0bc';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('This receipt is cryptographically verifiable on the TrueVote blockchain.', W / 2, H - 20);

    const link = document.createElement('a');
    link.download = `TrueVote_Receipt_${receipt.voter_id}_Block${receipt.block_index}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    // Mark as downloaded and pause auto-redirect for 10 more seconds
    setDownloaded(true);
    clearInterval(countdownRef.current);
    setCountdown(10);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          navigate(`/results/${election.id}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const selectedCandidate = candidates.find(c => c.id === selected);

  if (!election) return null;

  return (
    <div className="container">
      {showModal && selectedCandidate && (
        <VoteConfirmModal
          candidate={selectedCandidate}
          election={election}
          onConfirm={handleVote}
          onCancel={() => setShowModal(false)}
          loading={loading}
        />
      )}

      <div className="page-header">
        <h1>Cast Your Vote</h1>
        <p>{election.name}</p>
      </div>

      <div className="steps" style={{ maxWidth: 360, marginBottom: '1.75rem' }}>
        <div className={`step ${step !== 'face' ? 'done' : 'active'}`} />
        <div className={`step ${step === 'done' ? 'done' : step === 'select' ? 'active' : ''}`} />
        <div className={`step ${step === 'done' ? 'done' : ''}`} />
      </div>

      {step === 'face' && (
        <div className="card" style={{ maxWidth: 380, margin: '0 auto' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.3rem' }}>Identity Verification</h3>
          <p style={{ color: 'var(--ink2)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Verify your face before selecting a candidate.
          </p>
          <FaceVerify
            expectedUserId={voterId}
            onSuccess={() => { toast('Identity verified', 'success'); setStep('select'); }}
            onError={(err) => toast(err || 'Verification failed.', 'error')}
          />
        </div>
      )}

      {step === 'select' && (
        <>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--ink2)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Select a Candidate
          </h3>

          {fetching && <div className="spinner" />}
          {!fetching && candidates.length === 0 && (
            <div className="alert alert-info">No candidates registered for this election.</div>
          )}

          <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
            {candidates.map(c => (
              <div key={c.id} className={`candidate-card ${selected === c.id ? 'selected' : ''}`} onClick={() => setSelected(c.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4>{c.name}</h4>
                  {selected === c.id && <span style={{ color: 'var(--green)', fontSize: '0.9rem' }}>✓</span>}
                </div>
                <div className="party">
                  <span style={{ fontSize: '1.3rem', marginRight: '0.4rem' }}>{c.symbol || '🏛️'}</span>
                  {c.party}
                </div>
                <div className="manifesto">{c.manifesto}</div>
              </div>
            ))}
          </div>

          {candidates.length > 0 && (
            <button className="btn btn-success" onClick={() => setShowModal(true)} disabled={!selected || loading}>
              Cast Vote
            </button>
          )}
        </>
      )}

      {step === 'done' && receipt && (
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div className="card" style={{ borderColor: 'var(--green)', marginBottom: '1rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✅</div>
              <h2 style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--green)', marginBottom: '0.2rem' }}>Vote Cast Successfully</h2>
              <p style={{ color: 'var(--ink2)', fontSize: '0.82rem' }}>Your vote has been recorded on the blockchain</p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[
                { label: 'Voter ID',   value: receipt.voter_id },
                { label: 'Election',   value: receipt.election },
                { label: 'Candidate',  value: receipt.candidate },
                { label: 'Party',      value: `${receipt.symbol || '🏛️'} ${receipt.party}` },
                { label: 'Timestamp',  value: new Date(receipt.timestamp).toLocaleString() },
                { label: 'Block',      value: `#${receipt.block_index}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--ink2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', flexShrink: 0 }}>{label}</span>
                  <span style={{ fontSize: '0.875rem', color: 'var(--ink)', fontWeight: 500, textAlign: 'right' }}>{value}</span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', padding: '0.85rem 1rem' }}>
              <div style={{ fontSize: '0.68rem', color: 'var(--ink2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                Blockchain Hash (Proof of Vote)
              </div>
              <div style={{ fontFamily: '"Fira Code","Courier New",monospace', fontSize: '0.72rem', color: 'var(--blue)', wordBreak: 'break-all', lineHeight: 1.6 }}>
                {receipt.block_hash}
              </div>
            </div>
          </div>

          {/* Download prompt banner */}
          {!downloaded && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.3)',
              borderRadius: 'var(--r-sm)', padding: '0.75rem 1rem', marginBottom: '0.75rem',
            }}>
              <span style={{ fontSize: '1.2rem' }}>📥</span>
              <p style={{ fontSize: '0.82rem', color: '#92400e', margin: 0, lineHeight: 1.5 }}>
                <strong>Download your receipt</strong> before leaving — it's your proof of vote and cannot be retrieved later.
              </p>
            </div>
          )}

          {downloaded && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              background: 'rgba(14,168,106,0.07)', border: '1px solid rgba(14,168,106,0.2)',
              borderRadius: 'var(--r-sm)', padding: '0.75rem 1rem', marginBottom: '0.75rem',
            }}>
              <span style={{ fontSize: '1.2rem' }}>✅</span>
              <p style={{ fontSize: '0.82rem', color: 'var(--green)', margin: 0 }}>
                <strong>Receipt downloaded.</strong> Redirecting to results in {countdown}s…
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => { clearInterval(countdownRef.current); navigate(`/results/${election.id}`); }}
            >
              View Results
            </button>
            <button
              className={`btn ${downloaded ? 'btn-secondary' : 'btn-success'}`}
              style={{ flex: 1, position: 'relative' }}
              onClick={downloadReceipt}
            >
              {downloaded ? '⬇ Download Again' : '⬇ Download Receipt'}
            </button>
          </div>

          <button
            className="btn btn-secondary btn-full"
            style={{ marginTop: '0.5rem' }}
            onClick={() => { clearInterval(countdownRef.current); navigate('/blockchain'); }}
          >
            Verify on Blockchain
          </button>

          {/* Countdown bar */}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--ink3)', fontSize: '0.72rem' }}>
                {downloaded
                  ? `Redirecting to results in ${countdown}s…`
                  : `Auto-redirecting in ${countdown}s — download your receipt first`}
              </span>
              <button
                style={{ background: 'none', border: 'none', color: 'var(--blue)', fontSize: '0.72rem', cursor: 'pointer', padding: 0 }}
                onClick={() => {
                  clearInterval(countdownRef.current);
                  setCountdown(60);
                  countdownRef.current = setInterval(() => {
                    setCountdown(prev => {
                      if (prev <= 1) {
                        clearInterval(countdownRef.current);
                        navigate(`/results/${election.id}`);
                        return 0;
                      }
                      return prev - 1;
                    });
                  }, 1000);
                }}
              >
                Need more time? +60s
              </button>
            </div>
            <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${(countdown / (downloaded ? 10 : REDIRECT_DELAY)) * 100}%`,
                background: countdown <= 5 ? 'var(--red)' : downloaded ? 'var(--green)' : 'var(--blue)',
                transition: 'width 1s linear, background 0.3s',
                borderRadius: 4,
              }} />
            </div>
          </div>
        </div>
      )}

      <div className="fraud-info">
        <span className="fi-icon">🤖</span>
        <div>
          <h4>AI Fraud Detection Active</h4>
          <p>Suspicious voting patterns are monitored and blocked in real time.</p>
        </div>
      </div>
    </div>
  );
}
