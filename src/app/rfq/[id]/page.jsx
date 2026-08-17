'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import PDFQuoteButton from '../../../components/PDFQuoteButton';
import './rfq-detail.css';

// ── SVG Icons ────────────────────────────────────────────────────────────────
const IconArrowLeft = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
);
const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const IconPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconBox = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);
const IconChat = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const IconBell = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconTruck = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconTrophy = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 9H2V3h4v6zm16-6h-4v6h4V3zM12 17c-2.76 0-5-2.24-5-5V3h10v9c0 2.76-2.24 5-5 5zm0 2c1.1 0 2 .9 2 2H10c0-1.1.9-2 2-2zm-4 4h8v-1H8v1z"/>
  </svg>
);
const IconWhatsapp = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.554 4.122 1.523 5.855L0 24l6.335-1.507A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.877 9.877 0 0 1-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374A9.865 9.865 0 0 1 2.118 12C2.118 6.53 6.53 2.118 12 2.118c5.468 0 9.882 4.412 9.882 9.882 0 5.469-4.414 9.882-9.882 9.882z"/>
  </svg>
);
// ─────────────────────────────────────────────────────────────────────────────

export default function RFQDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [rfq, setRfq] = useState(null);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'rfqs', id), snap => {
      if (snap.exists()) setRfq({ id: snap.id, ...snap.data() });
      else setRfq(null);
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(collection(db, 'rfqs', id, 'quotes'), snap => {
      const qs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      qs.sort((a, b) => calcTotal(rfq, a) - calcTotal(rfq, b));
      setQuotes(qs);
    });
    return () => unsub();
  }, [id, rfq]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function waContact(quote) {
    const phone = quote.wholesalerPhone?.replace(/\D/g, '') || '';
    const msg = encodeURIComponent(
      `Hi, I'm interested in your quote for RFQ #${id.slice(0, 8).toUpperCase()} on Looha. Please confirm availability.`
    );
    window.open(`https://wa.me/91${phone.slice(-10)}?text=${msg}`, '_blank');
  }

  function waAlertWholesaler(w) {
    const phone = w.phone?.replace(/\D/g, '').slice(-10);
    if (!phone) return;
    const msg = encodeURIComponent(
      `Hi ${w.name || 'there'}, there is a new steel RFQ near ${rfq.pincode} on Looha.\n\nItems: ${rfq.items?.map(i => `${i.quantity} ${i.unit} ${i.product} ${i.size}`).join(', ')}\n\nPlease respond here: https://www.looha.in/wholesaler/quote/${id}`
    );
    window.open(`https://wa.me/91${phone}?text=${msg}`, '_blank');
  }

  if (loading) return (
    <div className="rfqd-loading"><div className="rfqd-loader" /><p>Loading your RFQ…</p></div>
  );
  if (!rfq) return (
    <div className="rfqd-notfound">
      <h2>RFQ not found</h2>
      <button onClick={() => router.push('/rfq')}>Submit New RFQ</button>
    </div>
  );

  const statusMap = {
    pending:  { label: 'Awaiting Quotes', color: 'orange' },
    quoted:   { label: 'Quotes Received', color: 'blue'   },
    accepted: { label: 'Quote Accepted',  color: 'green'  },
    closed:   { label: 'Closed',          color: 'gray'   },
  };
  const status = statusMap[rfq.status] || statusMap.pending;

  return (
    <div className="rfqd-page">

      {/* ── Header ── */}
      <div className="rfqd-header">
        <div className="rfqd-header-inner">
          <div className="rfqd-header-left">
            <button className="rfqd-back" onClick={() => router.push('/rfq')}>
              <IconArrowLeft /> New RFQ
            </button>
            <div>
              <h1>RFQ #{id.slice(0, 8).toUpperCase()}</h1>
              <div className="rfqd-meta">
                <span className="rfqd-status-badge" data-status={rfq.status}>
                  {status.label}
                </span>
                <span className="rfqd-meta-item"><IconPin /> {rfq.pincode}</span>
                <span className="rfqd-meta-item"><IconBox /> {rfq.items?.length} item(s)</span>
                {rfq.quotesCount > 0 && (
                  <span className="rfqd-meta-item"><IconChat /> {rfq.quotesCount} quote(s)</span>
                )}
                {rfq.notifiedCount > 0 && (
                  <span className="rfqd-meta-item rfqd-meta-notified">
                    <IconBell /> {rfq.notifiedCount} wholesaler(s) alerted
                  </span>
                )}
              </div>
            </div>
          </div>
          <button className="rfqd-copy-btn" onClick={copyLink}>
            {copied ? <><IconCheck /> Copied!</> : <><IconCopy /> Share Link</>}
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
          {rfq.notes && <p className="rfqd-general-notes">{rfq.notes}</p>}
        </section>

        {/* ── Wholesalers Alerted ── */}
        {rfq.notifiedWholesalers?.length > 0 && (
          <section className="rfqd-card rfqd-notified-card">
            <div className="rfqd-notified-header">
              <div className="rfqd-notified-title">
                <IconBell />
                <h2>{rfq.notifiedWholesalers.length} Wholesaler{rfq.notifiedWholesalers.length > 1 ? 's' : ''} Alerted</h2>
              </div>
              <span className="rfqd-notified-sub">Within 100 km of {rfq.pincode}</span>
            </div>
            <div className="rfqd-notified-list">
              {rfq.notifiedWholesalers.map((w, i) => (
                <div key={i} className="rfqd-notified-row">
                  <div className="rfqd-notified-info">
                    <span className="rfqd-notified-name">{w.name || 'Wholesaler'}</span>
                    <span className="rfqd-notified-dist">{w.distanceKm} km away</span>
                  </div>
                  {w.phone && (
                    <button className="rfqd-wa-alert-btn" onClick={() => waAlertWholesaler(w)}>
                      <IconWhatsapp /> Send Alert
                    </button>
                  )}
                </div>
              ))}
            </div>
            <p className="rfqd-notified-hint">
              Wholesalers can view and respond at their quote link. You can also manually ping them via WhatsApp above.
            </p>
          </section>
        )}

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
              <div className="rfqd-no-quotes-icon">
                <IconChat />
              </div>
              <p>No quotes yet. Wholesalers near <strong>{rfq.pincode}</strong> have been notified.</p>
              <p className="rfqd-no-quotes-sub">Quotes typically arrive within 15–30 minutes during business hours.</p>
            </div>
          ) : (
            <div className="rfqd-quotes-grid">
              {quotes.map((quote, idx) => {
                const total = calcTotal(rfq, quote);
                return (
                  <div key={quote.id} className={`rfqd-quote-card ${idx === 0 ? 'rfqd-quote-best' : ''}`}>
                    {idx === 0 && (
                      <div className="rfqd-best-badge"><IconTrophy /> Best Price</div>
                    )}
                    <div className="rfqd-quote-top">
                      <div>
                        <h3>{quote.wholesalerName || 'Wholesaler'}</h3>
                        {quote.wholesalerGST && <span className="rfqd-quote-gst">GST: {quote.wholesalerGST}</span>}
                      </div>
                      <div className="rfqd-quote-total">
                        {total > 0 ? `₹${total.toLocaleString('en-IN')}` : 'Custom'}
                      </div>
                    </div>

                    <div className="rfqd-quote-details">
                      <div className="rfqd-quote-stat">
                        <span className="rfqd-stat-label"><IconTruck /> Delivery</span>
                        <span className="rfqd-stat-val">{quote.deliveryDays || '—'} days</span>
                      </div>
                      <div className="rfqd-quote-stat">
                        <span className="rfqd-stat-label"><IconBox /> Freight</span>
                        <span className="rfqd-stat-val">₹{(quote.freightPerTon || 0).toLocaleString('en-IN')}/T</span>
                      </div>
                      <div className="rfqd-quote-stat">
                        <span className="rfqd-stat-label"><IconClock /> Valid</span>
                        <span className="rfqd-stat-val">{quote.validDays || 3} days</span>
                      </div>
                    </div>

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
                      <button className="rfqd-wa-btn" onClick={() => waContact(quote)}>
                        <IconWhatsapp /> WhatsApp
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

function calcTotal(rfq, quote) {
  if (!rfq?.items || !quote?.prices) return 0;
  let total = 0;
  rfq.items.forEach(item => {
    const p = quote.prices.find(p => p.product === item.product && p.size === item.size);
    if (p) {
      const tons = parseFloat(item.estimatedTons) || 0;
      total += tons * (parseFloat(p.pricePerTon) || 0);
      total += tons * (parseFloat(quote.freightPerTon) || 0);
    }
  });
  return Math.round(total);
}
