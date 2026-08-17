'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { db } from '../../../lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import './wholesaler-register.css';

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const IconShield = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
// ─────────────────────────────────────────────────────────────────────────────

function WholesalerRegisterInner() {
  const router = useRouter();
  const { sendOTP, verifyOTP, firebaseUser, isLoggedIn, user } = useAuth();

  // flow: 'phone' | 'otp' | 'profile' | 'done'
  const [flow, setFlow] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [profile, setProfile] = useState({
    name: '',
    company: '',
    gst: '',
    pincode: '',
    email: '',
  });

  // Already logged in as wholesaler
  if (isLoggedIn && user?.role === 'wholesaler') {
    return (
      <div className="wreg-page">
        <div className="wreg-box">
          <div className="wreg-success">
            <div className="wreg-success-icon"><IconShield /></div>
            <h2>You&apos;re registered as a Supplier!</h2>
            <p>Start viewing RFQ alerts from contractors near you.</p>
            <button className="wreg-btn" onClick={() => router.push('/wholesaler/rfqs')}>
              View My RFQ Alerts →
            </button>
          </div>
        </div>
      </div>
    );
  }

  async function handleSendOTP() {
    if (!phone || phone.length < 10) { setError('Enter a valid 10-digit number'); return; }
    setLoading(true); setError('');
    const res = await sendOTP(phone);
    setLoading(false);
    if (res.success) setFlow('otp');
    else setError(res.message);
  }

  async function handleVerifyOTP(val) {
    const code = val || otp;
    if (!code || code.length < 6) return;
    setLoading(true); setError('');
    const res = await verifyOTP(code);
    setLoading(false);
    if (res.success) setFlow('profile');
    else setError(res.message);
  }

  async function handleSaveProfile() {
    if (!profile.name.trim()) { setError('Full name is required'); return; }
    if (!profile.company.trim()) { setError('Company name is required'); return; }
    if (!profile.pincode || profile.pincode.length !== 6) { setError('Enter a valid 6-digit pincode'); return; }

    setLoading(true); setError('');
    try {
      const { auth } = await import('../../../lib/firebase');
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error('Not authenticated');

      const userData = {
        name: profile.name.trim(),
        company: profile.company.trim(),
        gst: profile.gst.trim(),
        pincode: profile.pincode,
        email: profile.email.trim(),
        phone: `+91${phone}`,
        role: 'wholesaler',
        profileComplete: true,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', uid), userData);
      setFlow('done');
    } catch (err) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wreg-page">

      {/* Left panel — info */}
      <div className="wreg-left">
        <div className="wreg-left-inner">
          <div className="wreg-left-logo">LOOHA</div>
          <h1>Register as a Steel Supplier</h1>
          <p>Join the Looha network and receive RFQ alerts from contractors in your area automatically.</p>
          <ul className="wreg-benefits">
            {[
              'Get matched to RFQs within 100 km of your pincode',
              'Receive WhatsApp alerts instantly',
              'Enter your quote in seconds on mobile',
              'Branded PDF auto-generated for every quote',
              'No subscription fee — pay only when you win',
            ].map((b, i) => (
              <li key={i}><span className="wreg-check"><IconCheck /></span>{b}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="wreg-right">
        <div className="wreg-box">

          {/* Step indicator */}
          {flow !== 'done' && (
            <div className="wreg-steps">
              {['Phone', 'Verify', 'Profile'].map((s, i) => {
                const stepIndex = ['phone', 'otp', 'profile'].indexOf(flow);
                return (
                  <div key={s} className={`wreg-step ${i <= stepIndex ? 'wreg-step-active' : ''}`}>
                    <div className="wreg-step-dot">{i < stepIndex ? <IconCheck /> : i + 1}</div>
                    <span>{s}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── PHONE ── */}
          {flow === 'phone' && (
            <div className="wreg-form">
              <h2>Enter Your Phone</h2>
              <p className="wreg-sub">We&apos;ll send a one-time verification code</p>
              {error && <div className="wreg-error">{error}</div>}
              <label>Phone Number</label>
              <div className="wreg-phone-row">
                <span className="wreg-prefix">+91</span>
                <input
                  className="wreg-input"
                  type="tel"
                  maxLength={10}
                  placeholder="Enter 10-digit number"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                />
              </div>
              <button className="wreg-btn" onClick={handleSendOTP} disabled={loading}>
                {loading ? 'Sending…' : 'Send OTP →'}
              </button>
              <div id="recaptcha-container" />
            </div>
          )}

          {/* ── OTP ── */}
          {flow === 'otp' && (
            <div className="wreg-form">
              <h2>Verify OTP</h2>
              <p className="wreg-sub">Sent to +91 {phone}</p>
              {error && <div className="wreg-error">{error}</div>}
              <label>6-Digit OTP</label>
              <input
                className="wreg-input wreg-otp-input"
                type="text"
                maxLength={6}
                placeholder="— — — — — —"
                value={otp}
                onChange={e => {
                  const val = e.target.value.replace(/\D/g, '');
                  setOtp(val);
                  if (val.length === 6) handleVerifyOTP(val);
                }}
              />
              <button className="wreg-btn" onClick={() => handleVerifyOTP()} disabled={loading}>
                {loading ? 'Verifying…' : 'Verify & Continue →'}
              </button>
              <button className="wreg-link-btn" onClick={() => { setFlow('phone'); setOtp(''); setError(''); }}>
                ← Change number
              </button>
            </div>
          )}

          {/* ── PROFILE ── */}
          {flow === 'profile' && (
            <div className="wreg-form">
              <h2>Your Business Details</h2>
              <p className="wreg-sub">This info appears on your quotes and PDFs</p>
              {error && <div className="wreg-error">{error}</div>}

              <div className="wreg-grid">
                <div className="wreg-field">
                  <label>Full Name *</label>
                  <input className="wreg-input" placeholder="Your name" value={profile.name}
                    onChange={e => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div className="wreg-field">
                  <label>Company / Business Name *</label>
                  <input className="wreg-input" placeholder="e.g. Sri Balaji Steels" value={profile.company}
                    onChange={e => setProfile({ ...profile, company: e.target.value })} />
                </div>
                <div className="wreg-field">
                  <label>GST Number</label>
                  <input className="wreg-input" placeholder="e.g. 37AAXCS0067P1ZE" value={profile.gst}
                    onChange={e => setProfile({ ...profile, gst: e.target.value.toUpperCase() })} />
                </div>
                <div className="wreg-field">
                  <label>Business Pincode * <span className="wreg-hint">(used for RFQ matching)</span></label>
                  <input className="wreg-input" type="text" maxLength={6} placeholder="e.g. 524003" value={profile.pincode}
                    onChange={e => setProfile({ ...profile, pincode: e.target.value.replace(/\D/g, '') })} />
                </div>
                <div className="wreg-field wreg-field-full">
                  <label>Email <span className="wreg-hint">(optional)</span></label>
                  <input className="wreg-input" type="email" placeholder="for quote notifications" value={profile.email}
                    onChange={e => setProfile({ ...profile, email: e.target.value })} />
                </div>
              </div>

              <button className="wreg-btn" onClick={handleSaveProfile} disabled={loading}>
                {loading ? 'Saving…' : 'Complete Registration →'}
              </button>
            </div>
          )}

          {/* ── DONE ── */}
          {flow === 'done' && (
            <div className="wreg-success">
              <div className="wreg-success-icon"><IconShield /></div>
              <h2>Welcome to Looha Supplier Network!</h2>
              <p>Your account is set up. You&apos;ll receive RFQ alerts for requirements within 100 km of your pincode.</p>
              <button className="wreg-btn" onClick={() => router.push('/wholesaler/rfqs')}>
                Go to My RFQ Alerts →
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function WholesalerRegisterPage() {
  return (
    <Suspense fallback={null}>
      <WholesalerRegisterInner />
    </Suspense>
  );
}
