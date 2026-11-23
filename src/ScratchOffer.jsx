import { useEffect, useRef, useState } from 'react';
import './ScratchOffer.css';

const prizes = [
  { percent: 10, code: 'INK10' },
  { percent: 15, code: 'INK15' },
  { percent: 20, code: 'INK20' },
  { percent: 25, code: 'INK25' },
];

export default function ScratchOffer({ phone }) {
  const [open, setOpen] = useState(false);
  const [prize, setPrize] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const canvasRef = useRef(null);
  const scratching = useRef(false);
  const scratched = useRef(0);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('divineScratchSeen')) return;
      const timer = window.setTimeout(() => setOpen(true), 8500);
      return () => window.clearTimeout(timer);
    } catch { return undefined; }
  }, []);

  useEffect(() => {
    if (!open || prize || revealed) return;
    const chosen = prizes[Math.floor(Math.random() * prizes.length)];
    setPrize(chosen);
  }, [open, prize, revealed]);

  useEffect(() => {
    if (!open || !prize || revealed) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#b9a16b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#171717';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', canvas.width / 2, canvas.height / 2 + 8);
  }, [open, prize, revealed]);

  const scratch = (event) => {
    if (!scratching.current || revealed) return;
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvas.width / rect.width);
    const y = (event.clientY - rect.top) * (canvas.height / rect.height);
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 25, 0, Math.PI * 2);
    ctx.fill();
    scratched.current += 1;
    if (scratched.current > 18) {
      setRevealed(true);
      try { sessionStorage.setItem('divineScratchSeen', '1'); } catch {}
    }
  };

  const close = () => {
    setOpen(false);
    try { sessionStorage.setItem('divineScratchSeen', '1'); } catch {}
  };

  const claim = () => {
    const message = `Hi Divine Ink Tattoos! I won ${prize.percent}% OFF (coupon ${prize.code}) through the website Scratch & Win. I'd like to book.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  if (!open) return <button type="button" className="di-scratch-launch" onClick={() => setOpen(true)}>✨ Scratch & Win</button>;
  return (
    <div className="di-scratch-backdrop" role="dialog" aria-modal="true" aria-label="Scratch and win offer" onClick={close}>
      <div className="di-scratch-modal" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="di-scratch-close" onClick={close} aria-label="Close offer">×</button>
        <p className="di-scratch-kicker">DIVINE INK · SPECIAL REWARD</p>
        <h2>Scratch & Win</h2>
        <p className="di-scratch-sub">Reveal a special tattoo booking offer.</p>
        {!revealed ? (
          <canvas ref={canvasRef} width={340} height={150} className="di-scratch-canvas" onPointerDown={(e) => { scratching.current = true; e.currentTarget.setPointerCapture(e.pointerId); scratch(e); }} onPointerMove={scratch} onPointerUp={() => { scratching.current = false; }} onPointerCancel={() => { scratching.current = false; }} />
        ) : (
          <div className="di-scratch-reward"><span>YOU WON</span><strong>{prize?.percent}% OFF</strong><small>Coupon: {prize?.code}</small></div>
        )}
        {revealed ? <><p className="di-scratch-terms">Show this coupon when booking. Subject to studio confirmation and offer availability.</p><button type="button" className="di-scratch-claim" onClick={claim}>CLAIM ON WHATSAPP</button></> : <p className="di-scratch-instruction">Use your finger or mouse to scratch the card.</p>}
        <button type="button" className="di-scratch-dismiss" onClick={close}>Maybe later</button>
      </div>
    </div>
  );
}
