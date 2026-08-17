'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import PDFQuoteButton from '../../../components/PDFQuoteButton';
import './rfq-detail.css';

export default function RFQDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();

  const [rfq, setRfq] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // ── Live RFQ doc listener ──────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'rfqs', id), snap => {
      if (snap.exists()) setRfq({ id: snap.id, ...snap.data() });
      else setRfq(null);
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  // ── Live quotes subcollection listener ────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(collection(db, 'rfqs', id, 'quotes'), snap => {
      const qs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      qs.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
      setQuotes(qs);
    });
    return () => unsub();
  }, [id]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function waShare(quote) {
    const phone = quote.wholesalerPhone?.replace(/\D/g, '') || '';
    const msg = encodeURIComponent(
      `Hi, I'm interested in your quote for RFQ #${id.slice(0, 8).toUpperCase()} on Looha. Please confirm availability.`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  }

  function calcQuoteTotal(quote) {
    if (!rfq?.items || !quote.prices) return 0;
    let total = 0;
    rfq.items.forEach(item => {
      const priceEntry = quote.prices.find(p => p.product === item.product && p.size === item.size);
      if (priceEntry) {
        const tons = parseFloat(item.estimatedTons) || 0;
        total += tons * (parseFloat(priceEntry.pricePerTon) || 0);
        total += tons * (parseFloat(quote.freightPerTon) || 0);
      }
    });
    return Math.round(total);
  }

  if (loading) return (
    <div className="rfqd-loading">
      <div className="rfqd-loader" />
      <p>Loading your RFQ…</p>
    </div>
  );

  if (!rfq) return (
    <div className="rfqd-notfound">
      <h2>RFQ not found</h2>
      <button onClick={() => router.push('/rfq')}>Submit New RFQ</button>
    </div>
  );

  const statusMap = {
    pending: { label: 'Awaiting Quotes', color: 'orange', icon: '⏳' },
    quoted:  { label: 'Quotes Received', color: 'blue',   icon: '📥' },
    accepted:{ label: 'Quote Accepted',  color: 'green',  icon: '✅' },
    closed:  { label: 'Closed',          color: 'gray',   icon: '🔒' },
  };
  const status = statusMap[rfq.status] || statusMap.pending;

  return (
    <div className="rfqd-page">
      {/* ── Header ── */}
      <div className="rfqd-header">
        <div className="rfqd-header-inner">
          <div className="rfqd-header-left">
            <button className="rfqd-back" onClick={() => router.push('/rfq')}>← New RFQ</button>
            <div>
              <h1>RFQ #{id.slice(0, 8).toUpperCase()}</h1>
              <div className="rfqd-meta">
                <span className="rfqd-status-badge" data-status={rfq.status}>
                  {status.icon} {status.label}
                </span>
                <span className="rfqd-meta-item">📍 Pincode: {rfq.pincode}</span>
                <span className="rfqd-meta-item">📦 {rfq.items?.length} item(s)</span>
                {rfq.quotesCount > 0 && (
                  <span className="rfqd-meta-item">💬 {rfq.quotesCount} quote(s)</span>
                )}
              </div>
            </div>
          </div>
          <button className="rfqd-copy-btn" onClick={copyLink}>
            {copied ? '✅ Copied!' : '🔗 Share Link'}
          </button>
        </div>
      </div>

      <div className="rfqd-container">
        {/* ── Items Summary ── */}
        <section className="rfqd-card">
          <h2>Your Requirements</h2>
          <div className="rfqd-items-list">
            {rfq.items?.map((item, i) => (
              <div key={i} className="rfqd-item-row">
                <div className="rfqd-item-main">
                  <span className="rfqd-item-name">{item.product}</span>
                  <span className="rfqd-item-spec">{item.size}</span>
                </div>
                <div className="rfqd-item-qty">
                  {item.quantity} {item.unit}
                  {item.estimatedTons && <span className="rfqd-item-tons">≈ {item.estimatedTons} T</span>}
                </div>
                {item.notes && <span className="rfqd-item-note">{item.notes}</span>}
              </div>
            ))}
          </div>
          {rfq.notes && <p className="rfqd-general-notes">📝 {rfq.notes}</p>}
        </section>

        {/* ── Quotes Comparison ── */}
        <section className="rfqd-card">
          <div className="rfqd-quotes-header">
            <h2>Quotes Comparison</h2>
            {rfq.status === 'pending' && (
              <div className="rfqd-pending-notice">
                <div className="rfqd-pulse" />
                Waiting for wholesalers to respond…
              </div>
            )}
          </div>

          {quotes.length === 0 ? (
            <div className="rfqd-no-quotes">
              <div className="rfqd-no-quotes-icon">📭</div>
              <p>No quotes yet. Wholesalers near <strong>{rfq.pincode}</strong> have been notified.</p>
              <p className="rfqd-no-quotes-sub">Quotes typically arrive within 15–30 minutes during business hours.</p>
            </div>
          ) : (
            <div className="rfqd-quotes-grid">
              {quotes.map((quote, idx) => {
                const total = calcQuoteTotal(quote);
                return (
                  <div key={quote.id} className={`rfqd-quote-card ${idx === 0 ? 'rfqd-quote-best' : ''}`}>
                    {idx === 0 && <div className="rfqd-best-badge">🏆 Best Price</div>}
                    <div className="rfqd-quote-top">
                      <div>
                        <h3>{quote.wholesalerName || 'Wholesaler'}</h3>
                        {quote.wholesalerGST && <span className="rfqd-quote-gst">GST: {quote.wholesalerGST}</span>}
                      </div>
                      <div className="rfqd-quote-total">
                        {total > 0 ? `₹${total.toLocaleString('en-IN')}` : 'Custom pricing'}
                      </div>
                    </div>

                    <div className="rfqd-quote-details">
                      <div className="rfqd-quote-stat">
                        <span className="rfqd-stat-label">🚚 Delivery</span>
                        <span className="rfqd-stat-val">{quote.deliveryDays || '—'} days</span>
                      </div>
                      <div className="rfqd-quote-stat">
                        <span className="rfqd-stat-label">🚛 Freight</span>
                        <span className="rfqd-stat-val">₹{(quote.freightPerTon || 0).toLocaleString('en-IN')}/T</span>
                      </div>
                      <div className="rfqd-quote-stat">
                        <span className="rfqd-stat-label">⏱️ Valid</span>
                        <span className="rfqd-stat-val">{quote.validDays || 3} days</span>
                      </div>
                    </div>

                    {/* Price breakdown per item */}
                    {quote.prices?.length > 0 && (
                      <div className="rfqd-price-breakdown">
                        <p className="rfqd-breakdown-title">Price Breakdown</p>
                        {quote.prices.map((p, pi) => (
                          <div key={pi} className="rfqd-breakdown-row">
                            <span>{p.product} {p.size}</span>
                            <span>₹{Number(p.pricePerTon).toLocaleString('en-IN')}/T</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {quote.notes && <p className="rfqd-quote-note">{quote.notes}</p>}

                    <div className="rfqd-quote-actions">
                      <PDFQuoteButton rfq={rfq} quote={quote} total={total} />
                      <button className="rfqd-wa-btn" onClick={() => waShare(quote)}>
                        💬 WhatsApp
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
