'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './index.css';

export default function WholesalerQuoteIndex() {
  const router = useRouter();
  const [rfqId, setRfqId] = useState('');

  function handleGo() {
    const id = rfqId.trim();
    if (id) router.push(`/wholesaler/quote/${id}`);
  }

  return (
    <div className="wqi-page">
      <div className="wqi-card">
        <div className="wqi-icon">🏪</div>
        <h1>Wholesaler Quote Portal</h1>
        <p>You need a valid RFQ link shared by Looha or a contractor to enter prices.</p>

        <div className="wqi-divider">
          <span>Enter RFQ ID manually</span>
        </div>

        <div className="wqi-input-row">
          <input
            className="wqi-input"
            placeholder="Paste RFQ ID here…"
            value={rfqId}
            onChange={e => setRfqId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleGo()}
          />
          <button className="wqi-btn" onClick={handleGo} disabled={!rfqId.trim()}>
            Go →
          </button>
        </div>

        <div className="wqi-help">
          <p>📋 RFQ links look like:</p>
          <code>looha.in/wholesaler/quote/abc123xyz</code>
        </div>
      </div>
    </div>
  );
}
