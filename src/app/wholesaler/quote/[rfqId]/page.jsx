'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '../../../../lib/firebase';
import { doc, onSnapshot, collection, addDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../../../context/AuthContext';
import './wholesaler-quote.css';

export default function WholesalerQuotePage() {
  const { rfqId } = useParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();

  const [rfq, setRfq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState([]);
  const [freightPerTon, setFreightPerTon] = useState('');
  const [deliveryDays, setDeliveryDays] = useState('3');
  const [validDays, setValidDays] = useState('3');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!rfqId) return;
    const unsub = onSnapshot(doc(db, 'rfqs', rfqId), snap => {
      if (snap.exists()) {
        const data = { id: snap.id, ...snap.data() };
        setRfq(data);
        // Initialise prices array from items
        setPrices(data.items?.map(item => ({
          product: item.product,
          size: item.size,
          quantity: item.quantity,
          unit: item.unit,
          estimatedTons: item.estimatedTons || '',
          pricePerTon: '',
        })) || []);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [rfqId]);

  function updatePrice(idx, value) {
    setPrices(prev => prev.map((p, i) => i === idx ? { ...p, pricePerTon: value } : p));
  }

  async function handleSubmit() {
    if (!isLoggedIn) { router.push('/login'); return; }
    const hasAllPrices = prices.every(p => p.pricePerTon && !isNaN(Number(p.pricePerTon)));
    if (!hasAllPrices) { setError('Please fill in a price for every item.'); return; }

    setSubmitting(true);
    setError('');
    try {
      const quoteRef = doc(db, 'rfqs', rfqId, 'quotes', user.uid);
      await setDoc(quoteRef, {
        wholesalerUid: user.uid,
        wholesalerName: user.name || user.company || 'Wholesaler',
        wholesalerGST: user.gst || '',
        wholesalerPhone: user.phone || '',
        prices: prices.map(p => ({ ...p, pricePerTon: Number(p.pricePerTon) })),
        freightPerTon: Number(freightPerTon) || 0,
        deliveryDays: Number(deliveryDays) || 3,
        validDays: Number(validDays) || 3,
        notes,
        submittedAt: serverTimestamp(),
      });
      // Update parent RFQ
      await updateDoc(doc(db, 'rfqs', rfqId), {
        quotesCount: increment(1),
        status: 'quoted',
        updatedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Failed to submit quote.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="wq-loading"><div className="wq-loader" /><p>Loading RFQ…</p></div>
  );
  if (!rfq) return (
    <div className="wq-notfound"><h2>RFQ not found</h2></div>
  );

  if (submitted) return (
    <div className="wq-success">
      <div className="wq-success-icon">✅</div>
      <h2>Quote Submitted!</h2>
      <p>The contractor has been notified. Your quote is live on the comparison table.</p>
      <a href={`/rfq/${rfqId}`} className="wq-view-btn">View Comparison →</a>
    </div>
  );

  return (
    <div className="wq-page">
      <div className="wq-header">
        <div className="wq-header-inner">
          <div>
            <p className="wq-label">Wholesaler Quote Entry</p>
            <h1>RFQ #{rfqId.slice(0, 8).toUpperCase()}</h1>
            <p className="wq-sub">📍 Delivery Pincode: <strong>{rfq.pincode}</strong> &nbsp;·&nbsp; {rfq.items?.length} item(s) required</p>
          </div>
        </div>
      </div>

      <div className="wq-container">
        {/* ── Price Matrix ── */}
        <section className="wq-card">
          <h2>Enter Your Prices</h2>
          <p className="wq-hint">Enter your best price per ton for each item. Estimated tonnage is shown for reference.</p>

          <div className="wq-matrix">
            {prices.map((item, idx) => (
              <div key={idx} className="wq-matrix-row">
                <div className="wq-matrix-item">
                  <span className="wq-item-name">{item.product}</span>
                  <span className="wq-item-spec">{item.size}</span>
                  <span className="wq-item-qty">{item.quantity} {item.unit}</span>
                  {item.estimatedTons && (
                    <span className="wq-item-tons">≈ {item.estimatedTons} T</span>
                  )}
                </div>
                <div className="wq-price-input-wrap">
                  <span className="wq-rupee">₹</span>
                  <input
                    className="wq-price-input"
                    type="number"
                    placeholder="Price per ton"
                    value={item.pricePerTon}
                    onChange={e => updatePrice(idx, e.target.value)}
                    min="0"
                  />
                  <span className="wq-per-ton">/ton</span>
                </div>
                {item.pricePerTon && item.estimatedTons && (
                  <div className="wq-subtotal">
                    ≈ ₹{Math.round(Number(item.pricePerTon) * Number(item.estimatedTons)).toLocaleString('en-IN')} total
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* ── Logistics ── */}
        <section className="wq-card">
          <h2>Logistics & Terms</h2>
          <div className="wq-logistics-grid">
            <div className="wq-field">
              <label>Freight Cost (₹ / ton)</label>
              <input className="wq-input" type="number" placeholder="e.g. 1500" value={freightPerTon} onChange={e => setFreightPerTon(e.target.value)} min="0" />
              <span className="wq-field-hint">Enter 0 if freight is included</span>
            </div>
            <div className="wq-field">
              <label>Delivery in (days)</label>
              <input className="wq-input" type="number" placeholder="3" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} min="1" max="30" />
            </div>
            <div className="wq-field">
              <label>Quote valid for (days)</label>
              <input className="wq-input" type="number" placeholder="3" value={validDays} onChange={e => setValidDays(e.target.value)} min="1" max="7" />
            </div>
            <div className="wq-field wq-field-full">
              <label>Additional Notes</label>
              <textarea className="wq-input wq-textarea" placeholder="Credit terms, brand availability, conditions…" value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            </div>
          </div>
        </section>

        {/* ── Submit ── */}
        <div className="wq-submit-row">
          {error && <p className="wq-error">{error}</p>}
          <button className="wq-submit-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <><span className="wq-spinner" />Submitting…</> : <>📤 Submit Quote</>}
          </button>
          <p className="wq-submit-hint">Your quote will appear instantly on the contractor's comparison table.</p>
        </div>
      </div>
    </div>
  );
}
