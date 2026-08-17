'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import { categories } from '../../data/products';
import './rfq.css';

const UNITS = ['Nos', 'Ton', 'Kg', 'Boxes', 'Bundles', 'Feet', 'Meter'];

const emptyItem = () => ({ product: '', size: '', quantity: '', unit: 'Nos', estimatedTons: '', notes: '' });

export default function RFQPage() {
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();

  // AI Parser state
  const [rawText, setRawText] = useState('');
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState('');

  // Form state
  const [items, setItems] = useState([emptyItem()]);
  const [pincode, setPincode] = useState('');
  const [generalNotes, setGeneralNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [step, setStep] = useState(1); // 1 = build list, 2 = confirm & submit

  const textareaRef = useRef(null);

  // ── AI Parser ─────────────────────────────────────────────────────────────
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
        const parsed = data.items.map(i => ({
          product: i.product || '',
          size: i.size || '',
          quantity: String(i.quantity || ''),
          unit: i.unit || 'Nos',
          estimatedTons: String(i.estimatedTons || ''),
          notes: i.notes || '',
        }));
        setItems(parsed);
        setStep(1);
      } else {
        setParseError('No steel products found. Please check your input and try again.');
      }
    } catch (err) {
      setParseError(err.message);
    } finally {
      setParsing(false);
    }
  }

  // ── Item helpers ───────────────────────────────────────────────────────────
  function updateItem(idx, field, value) {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  }
  function addItem() { setItems(prev => [...prev, emptyItem()]); }
  function removeItem(idx) { setItems(prev => prev.filter((_, i) => i !== idx)); }

  // ── Submit ─────────────────────────────────────────────────────────────────
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
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
          <span className="rfq-badge">⚡ Instant Quotation</span>
          <h1>Get Steel Quotes Fast</h1>
          <p>Paste your requirement or fill the form. We alert the nearest wholesalers and get you competitive quotes in minutes.</p>
        </div>
      </section>

      <div className="rfq-container">
        {/* ── Universal Reader ── */}
        <section className="rfq-ai-section">
          <div className="rfq-ai-header">
            <div className="rfq-ai-icon">🤖</div>
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
            <button
              className="rfq-ai-btn"
              onClick={handleParse}
              disabled={parsing || !rawText.trim()}
            >
              {parsing ? (
                <><span className="rfq-spinner" /> Parsing…</>
              ) : (
                <><span>✨</span> Extract Items with AI</>
              )}
            </button>
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="rfq-divider">
          <span>or add items manually</span>
        </div>

        {/* ── Items Table ── */}
        <section className="rfq-items-section">
          <div className="rfq-section-header">
            <h2>Your Requirements</h2>
            <button className="rfq-add-btn" onClick={addItem}>+ Add Row</button>
          </div>

          <div className="rfq-table-wrap">
            <table className="rfq-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size / Spec</th>
                  <th>Qty</th>
                  <th>Unit</th>
                  <th>~Tons</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <select
                        className="rfq-select"
                        value={item.product}
                        onChange={e => updateItem(idx, 'product', e.target.value)}
                      >
                        <option value="">Select…</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.name}>{c.icon} {c.name}</option>
                        ))}
                        <option value="Other">Other</option>
                      </select>
                    </td>
                    <td>
                      <input
                        className="rfq-input"
                        placeholder="e.g. 12mm, 25 NB"
                        value={item.size}
                        onChange={e => updateItem(idx, 'size', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="rfq-input rfq-input-sm"
                        type="number"
                        min="1"
                        placeholder="0"
                        value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', e.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="rfq-select rfq-select-sm"
                        value={item.unit}
                        onChange={e => updateItem(idx, 'unit', e.target.value)}
                      >
                        {UNITS.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        className="rfq-input rfq-input-sm rfq-input-muted"
                        placeholder="auto"
                        value={item.estimatedTons}
                        onChange={e => updateItem(idx, 'estimatedTons', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="rfq-input"
                        placeholder="Brand, grade…"
                        value={item.notes}
                        onChange={e => updateItem(idx, 'notes', e.target.value)}
                      />
                    </td>
                    <td>
                      <button
                        className="rfq-remove-btn"
                        onClick={() => removeItem(idx)}
                        disabled={items.length === 1}
                        title="Remove row"
                      >✕</button>
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
              <label>Delivery Pincode <span className="rfq-required">*</span></label>
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
              <span>🔐</span> You&apos;ll need to <a href="/login">log in</a> before submitting.
            </p>
          )}
          <button
            className="rfq-submit-btn"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <><span className="rfq-spinner" /> Submitting…</>
            ) : (
              <>🚀 Submit RFQ — Get Quotes Now</>
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
