'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { categories } from '../../data/products';
import { notifyNearestWholesalers } from '../../lib/notifyWholesalers';
import './rfq.css';

const UNITS = ['Nos', 'Ton', 'Kg', 'Boxes', 'Bundles', 'Feet', 'Meter'];
const emptyItem = () => ({ product: '', size: '', quantity: '', unit: 'Nos', estimatedTons: '', notes: '' });

// ── SVG Icons ────────────────────────────────────────────────────────────────
const IconAI = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
    <circle cx="9" cy="13" r="1" fill="currentColor" stroke="none"/>
    <circle cx="15" cy="13" r="1" fill="currentColor" stroke="none"/>
    <path d="M9 17c.83.67 1.67 1 3 1s2.17-.33 3-1"/>
  </svg>
);

const IconSparkle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
  </svg>
);

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const IconX = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconBolt = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const IconMapPin = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);
// ─────────────────────────────────────────────────────────────────────────────

export default function RFQPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();

  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [items, setItems] = useState([emptyItem()]);
  const [pincode, setPincode] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const textareaRef = useRef(null);

  async function handleParse() {
    if (!rawText.trim()) return;
    setParsing(true);
    setParseError('');
    try {
      const res = await fetch('/api/parse-rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: rawText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Parse failed');
      if (data.items?.length) {
        setItems(data.items.map(i => ({
          product: i.product || '',
          size: i.size || '',
          quantity: String(i.quantity || ''),
          unit: i.unit || 'Nos',
          estimatedTons: String(i.estimatedTons || ''),
          notes: i.notes || '',
        })));
      } else {
        setParseError('No steel products found. Please check your input and try again.');
      }
    } catch (err) {
      setParseError(err.message);
    } finally {
      setParsing(false);
    }
  }

  function updateItem(idx, field, value) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }
  function addItem() { setItems(prev => [...prev, emptyItem()]); }
  function removeItem(idx) { setItems(prev => prev.filter((_, i) => i !== idx)); }

  async function handleSubmit() {
    if (!isLoggedIn) { router.push('/login'); return; }
    if (!pincode || pincode.length !== 6) { setSubmitError('Please enter a valid 6-digit pincode.'); return; }
    const validItems = items.filter(it => it.product && it.quantity);
    if (!validItems.length) { setSubmitError('Please add at least one item.'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      const docRef = await addDoc(collection(db, 'rfqs'), {
        contractorUid: user.uid,
        contractorName: user.name || '',
        contractorPhone: user.phone || '',
        pincode,
        items: validItems,
        notes: generalNotes,
        status: 'pending',
        quotesCount: 0,
        notifiedCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Notify nearest wholesalers in background (non-blocking)
      notifyNearestWholesalers(docRef.id, {
        pincode,
        contractorName: user.name || '',
        contractorPhone: user.phone || '',
        items: validItems,
        notes: generalNotes,
      }).catch(err => console.warn('Wholesaler notify failed:', err));

      router.push(`/rfq/${docRef.id}`);
    } catch (err) {
      setSubmitError(err.message || 'Failed to submit RFQ. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="rfq-page">

      {/* ── Hero ── */}
      <section className="rfq-hero">
        <div className="rfq-hero-inner">
          <span className="rfq-badge">
            <IconBolt /> Instant Quotation
          </span>
          <h1>Get Steel Quotes Fast</h1>
          <p>Paste your requirement or fill the form. We alert the nearest wholesalers and get you competitive quotes in minutes.</p>
        </div>
      </section>

      <div className="rfq-container">

        {/* ── Universal Reader ── */}
        <section className="rfq-ai-section">
          <div className="rfq-ai-header">
            <div className="rfq-ai-icon">
              <IconAI />
            </div>
            <div>
              <h2>Universal RFQ Reader</h2>
              <p>Paste a WhatsApp message, typed list, or any informal requirement — our AI will extract the details automatically.</p>
            </div>
          </div>

          <div className="rfq-ai-body">
            <textarea
              ref={textareaRef}
              className="rfq-ai-textarea"
              placeholder={`Paste any format, e.g.\n\n"Need 200 nos 12mm TMT TATA brand, 50 nos 25 NB MS pipe Apollo, and 10 boxes binding wire"\n\nor:\n\n"TMT 12mm - 200 pcs\nMS Pipe 1 inch - 50 nos\nBinding wire - 10 boxes"`}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              rows={5}
            />
            {parseError && <p className="rfq-error">{parseError}</p>}
            <button className="rfq-ai-btn" onClick={handleParse} disabled={parsing || !rawText.trim()}>
              {parsing ? (
                <><span className="rfq-spinner" /> Parsing…</>
              ) : (
                <><IconSparkle /> Extract Items with AI</>
              )}
            </button>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="rfq-divider"><span>or add items manually</span></div>

        {/* ── Items Table ── */}
        <section className="rfq-items-section">
          <div className="rfq-section-header">
            <h2>Your Requirements</h2>
            <button className="rfq-add-btn" onClick={addItem}>
              <IconPlus /> Add Row
            </button>
          </div>

          <div className="rfq-table-wrap">
            <table className="rfq-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size / Spec</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>~ Tons</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <select className="rfq-select" value={item.product} onChange={e => updateItem(idx, 'product', e.target.value)}>
                        <option value="">Select…</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    </td>
                    <td>
                      <input className="rfq-input" placeholder="e.g. 12mm, 25 NB" value={item.size} onChange={e => updateItem(idx, 'size', e.target.value)} />
                    </td>
                    <td>
                      <input className="rfq-input rfq-input-sm" type="number" min="1" placeholder="0" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                    </td>
                    <td>
                      <select className="rfq-select rfq-select-sm" value={item.unit} onChange={e => updateItem(idx, 'unit', e.target.value)}>
                        {UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td>
                      <input className="rfq-input rfq-input-sm rfq-input-muted" placeholder="auto" value={item.estimatedTons} onChange={e => updateItem(idx, 'estimatedTons', e.target.value)} />
                    </td>
                    <td>
                      <input className="rfq-input" placeholder="Brand, grade…" value={item.notes} onChange={e => updateItem(idx, 'notes', e.target.value)} />
                    </td>
                    <td>
                      <button className="rfq-remove-btn" onClick={() => removeItem(idx)} disabled={items.length === 1} title="Remove row">
                        <IconX />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── Delivery Details ── */}
        <section className="rfq-details-section">
          <h2>Delivery Details</h2>
          <div className="rfq-details-grid">
            <div className="rfq-field">
              <label>
                <IconMapPin /> Delivery Pincode <span className="rfq-required">*</span>
              </label>
              <input
                className="rfq-input"
                type="text"
                maxLength={6}
                placeholder="e.g. 524003"
                value={pincode}
                onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
              />
              <span className="rfq-field-hint">We find the 3 nearest wholesalers within 100 km</span>
            </div>
            <div className="rfq-field">
              <label>Additional Notes</label>
              <textarea
                className="rfq-input rfq-textarea-sm"
                placeholder="Any special requirements, preferred brands, timeline…"
                value={generalNotes}
                onChange={e => setGeneralNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* ── Submit ── */}
        <div className="rfq-submit-row">
          {submitError && <p className="rfq-error">{submitError}</p>}
          {!isLoggedIn && (
            <p className="rfq-login-hint">
              <IconLock /> You&apos;ll need to <a href="/login">log in</a> before submitting.
            </p>
          )}
          <button className="rfq-submit-btn" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <><span className="rfq-spinner" /> Submitting…</>
            ) : (
              <><IconSend /> Submit RFQ — Get Quotes Now</>
            )}
          </button>
          <p className="rfq-submit-hint">
            Your RFQ is sent to the 3 nearest registered wholesalers. Quotes arrive within minutes.
          </p>
        </div>

      </div>
    </div>
  );
}
