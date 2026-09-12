import { useRef, useState, useEffect, useCallback } from 'react';
import { recognizeFrame } from '../api';

export default function FaceVerify({ expectedUserId, onSuccess, onError }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [phase, setPhase] = useState('idle');
  const [faceDetected, setFaceDetected] = useState(false);
  const [msg, setMsg] = useState('');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = async () => {
    setMsg('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        // Wait for the camera to actually produce frames before allowing verify
        await new Promise((resolve) => {
          videoRef.current.oncanplay = resolve;
          videoRef.current.play();
        });
        // Extra warm-up: some cameras need a moment after canplay to expose correctly
        await new Promise(r => setTimeout(r, 800));
      }
      setPhase('streaming');
    } catch {
      setMsg('Camera access denied. Please allow camera permissions.');
      setPhase('error');
    }
  };

  const verify = async () => {
    setPhase('scanning');
    setMsg('');

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Helper: check if a frame is mostly black (camera not ready)
    const isBlackFrame = () => {
      const sample = ctx.getImageData(canvas.width / 2 - 20, canvas.height / 2 - 20, 40, 40).data;
      let total = 0;
      for (let i = 0; i < sample.length; i += 4) total += sample[i] + sample[i + 1] + sample[i + 2];
      return total / (sample.length / 4) < 15;
    };

    let attempts = 0;
    const maxAttempts = 15;

    while (attempts < maxAttempts) {
      await new Promise(r => setTimeout(r, 500));

      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      // Skip black frames silently
      if (isBlackFrame()) continue;

      const frame = canvas.toDataURL('image/jpeg', 0.92);

      try {
        const res = await recognizeFrame({ frame });
        setFaceDetected(true);

        const recognizedId = String(res.data.user_id).trim().toLowerCase();
        const expectedId   = String(expectedUserId).trim().toLowerCase();

        if (recognizedId !== expectedId) {
          setMsg('Face does not match the logged-in voter. Access denied.');
          setPhase('error');
          stopCamera();
          onError?.('Face does not match the logged-in voter.');
          return;
        }

        setPhase('done');
        stopCamera();
        onSuccess?.(res.data.user_id);
        return;
      } catch (err) {
        const errMsg = err.response?.data?.error || '';
        if (errMsg.includes('No face')) {
          setFaceDetected(false);
        } else {
          setFaceDetected(true);
          attempts++;
        }
      }
    }

    setMsg('Face not recognized. Make sure you are in good lighting and registered.');
    setPhase('error');
    stopCamera();
    onError?.('Face not recognized.');
  };

  const reset = () => {
    stopCamera();
    setPhase('idle');
    setFaceDetected(false);
    setMsg('');
  };

  const isActive = phase === 'streaming' || phase === 'scanning';

  return (
    <div style={{ textAlign: 'center' }}>
      <canvas ref={canvasRef} width={640} height={480} style={{ display: 'none' }} />

      <div style={{
        position: 'relative', width: 280, height: 320,
        margin: '0 auto 1.1rem', borderRadius: 'var(--r)', overflow: 'hidden',
        background: 'var(--bg2)',
        border: `1px solid ${phase === 'done' ? 'var(--green)' : phase === 'error' ? 'var(--red)' : 'var(--border)'}`,
      }}>
        <video ref={videoRef} muted playsInline style={{
          width: '100%', height: '100%', objectFit: 'cover',
          display: isActive || phase === 'done' ? 'block' : 'none',
          transform: 'scaleX(-1)',
        }} />

        {(phase === 'idle' || phase === 'error') && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--ink3)', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem' }}>👤</span>
            <span style={{ fontSize: '0.8rem' }}>Camera off</span>
          </div>
        )}

        {isActive && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            <svg width="100%" height="100%" viewBox="0 0 280 320" style={{ position: 'absolute', inset: 0 }}>
              <defs>
                <mask id="oval-mask-v">
                  <rect width="280" height="320" fill="white" />
                  <ellipse cx="140" cy="148" rx="88" ry="112" fill="black" />
                </mask>
              </defs>
              <rect width="280" height="320" fill="rgba(0,0,0,0.45)" mask="url(#oval-mask-v)" />
              <ellipse cx="140" cy="148" rx="88" ry="112" fill="none"
                stroke={phase === 'scanning' && faceDetected ? '#4f7ef8' : faceDetected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.35)'}
                strokeWidth="2" strokeDasharray={faceDetected ? 'none' : '6 4'}
              />
            </svg>

            {phase === 'scanning' && (
              <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', width: 176, height: 2, background: 'linear-gradient(90deg, transparent, #4f7ef8, transparent)', animation: 'scan-v 1.8s ease-in-out infinite', top: 36 }} />
            )}

            <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.65)', borderRadius: 999, padding: '0.25rem 0.75rem', fontSize: '0.72rem', fontWeight: 600, color: phase === 'scanning' ? '#4f7ef8' : faceDetected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.45)', display: 'flex', alignItems: 'center', gap: '0.35rem', whiteSpace: 'nowrap' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: phase === 'scanning' ? '#4f7ef8' : faceDetected ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.3)', display: 'inline-block' }} />
              {phase === 'scanning' ? 'Verifying…' : faceDetected ? 'Face in frame' : 'Align your face'}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(62,207,142,0.15)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '2.5rem' }}>✅</span>
            <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.875rem' }}>Verified</span>
          </div>
        )}
      </div>

      {msg && <div className={`alert alert-${phase === 'error' ? 'error' : 'success'}`} style={{ marginBottom: '1rem', textAlign: 'left' }}>{msg}</div>}

      {phase === 'scanning' && (
        <div style={{ marginBottom: '1rem', padding: '0 0.5rem' }}>
          <div style={{ background: 'var(--surface2)', borderRadius: 999, height: 4, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 999, background: 'var(--blue)', width: '100%', animation: 'pulse-bar-v 1s ease-in-out infinite' }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
        {phase === 'idle' && <button className="btn btn-primary" onClick={startCamera}>Open Camera</button>}
        {phase === 'streaming' && (
          <>
            <button className="btn btn-primary" onClick={verify}>Verify Face</button>
            <button className="btn btn-secondary" onClick={reset}>Cancel</button>
          </>
        )}
        {phase === 'error' && <button className="btn btn-secondary" onClick={reset}>Try Again</button>}
      </div>

      <p style={{ color: 'var(--ink3)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
        {phase === 'idle' && 'Face verification is required before voting.'}
        {phase === 'streaming' && 'Centre your face in the oval, then press Verify Face.'}
        {phase === 'scanning' && 'Hold still…'}
        {phase === 'done' && 'Identity confirmed. You may now cast your vote.'}
      </p>

      <style>{`
        @keyframes scan-v { 0%{top:36px;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:260px;opacity:0} }
        @keyframes pulse-bar-v { 0%,100%{opacity:1} 50%{opacity:0.45} }
      `}</style>
    </div>
  );
}
