'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useAuth } from '../context/AuthContext';

function LoginInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { isLoggedIn, sendOTP, verifyOTP, completeProfile, loginWithEmail } = useAuth();

    // If redirected from /admin, auto-open the admin email login form
    const fromParam = searchParams.get('from') || '';
    const fromAdmin = fromParam === '/admin';

    // Flow states: 'phone' | 'otp' | 'profile' | 'admin'
    const [flow, setFlow] = useState(fromAdmin ? 'admin' : 'phone');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Admin login
    const [adminEmail, setAdminEmail] = useState('');
    const [adminPassword, setAdminPassword] = useState('');

    // Profile (new user)
    const [profile, setProfile] = useState({ name: '', email: '', company: '', gst: '' });

    // Where to go after login — read 'from' from URL query param
    const redirectTo = fromParam || '/dashboard';

    if (isLoggedIn) {
        return (
            <div className="page container" style={{ textAlign: 'center', paddingTop: 80 }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
                <h2>You are logged in!</h2>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24 }}>
                    <button className="btn btn-primary" onClick={() => router.push(redirectTo)}>Go to Dashboard</button>
                    <button className="btn btn-outline" onClick={() => router.push('/')}>Continue Shopping</button>
                </div>
            </div>
        );
    }

    const handleSendOTP = async () => {
        if (!phone || phone.length < 10) {
            setError('Enter a valid 10-digit phone number');
            return;
        }
        setLoading(true);
        setError('');
        const result = await sendOTP(phone);
        setLoading(false);
        if (result.success) {
            setFlow('otp');
        } else {
            setError(result.message);
        }
    };

    // Accepts value directly — used by auto-submit (React state may not have flushed yet)
    const handleVerifyOTPWithValue = async (value) => {
        if (!value || value.length < 6) return;
        setLoading(true);
        setError('');
        const result = await verifyOTP(value);
        setLoading(false);
        if (result.success) {
            if (result.isNewUser) {
                setFlow('profile');
            } else {
                router.push(redirectTo);
            }
        } else {
            setError(result.message);
        }
    };

    const handleVerifyOTP = async () => {
        if (!otp || otp.length < 6) {
            setError('Enter the 6-digit OTP');
            return;
        }
        await handleVerifyOTPWithValue(otp);
    };

    const handleCompleteProfile = async () => {
        if (!profile.name.trim()) {
            setError('Name is required');
            return;
        }
        setLoading(true);
        setError('');
        const result = await completeProfile({ ...profile, phone });
        setLoading(false);
        if (result.success) {
            router.push(redirectTo);
        } else {
            setError(result.message);
        }
    };

    const handleAdminLogin = async () => {
        if (!adminEmail || !adminPassword) {
            setError('Enter email and password');
            return;
        }
        setLoading(true);
        setError('');
        const result = await loginWithEmail(adminEmail, adminPassword);
        setLoading(false);
        if (result.success) {
            router.push(redirectTo === '/dashboard' ? '/admin' : redirectTo);
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="page animate-fade-in">
            <div className="container" style={{ maxWidth: 440, paddingTop: 48, paddingBottom: 48 }}>

                {/* Phone Number Entry */}
                {flow === 'phone' && (
                    <div className="card">
                        <div className="card-body" style={{ padding: 32 }}>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📱</div>
                                <h2 style={{ marginBottom: 4 }}>Login / Register</h2>
                                <p className="text-light" style={{ fontSize: '0.9rem' }}>Enter your phone number to get started</p>
                            </div>

                            {error && (
                                <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: '0.85rem' }}>
                                    {error}
                                </div>
                            )}

                            <div className="input-group">
                                <label>Phone Number</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <span style={{
                                        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: '0.9rem',
                                        fontWeight: 600, color: 'var(--color-text-light)', whiteSpace: 'nowrap',
                                    }}>+91</span>
                                    <input
                                        className="input"
                                        type="tel"
                                        maxLength={10}
                                        placeholder="Enter 10-digit number"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                                        onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                                    />
                                </div>
                            </div>

                            <button
                                className="btn btn-primary btn-block btn-lg mt-2"
                                onClick={handleSendOTP}
                                disabled={loading}
                            >
                                {loading ? '⏳ Sending OTP...' : '📩 Send OTP'}
                            </button>

                            <div style={{ borderTop: '1px solid var(--color-border)', margin: '24px 0', position: 'relative' }}>
                                <span style={{
                                    position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)',
                                    background: '#fff', padding: '0 12px', fontSize: '0.8rem', color: 'var(--color-text-lighter)',
                                }}>or</span>
                            </div>

                            <button
                                className="btn btn-ghost btn-block"
                                onClick={() => { setFlow('admin'); setError(''); }}
                                style={{ fontSize: '0.85rem' }}
                            >
                                🔑 Admin Login (Email & Password)
                            </button>
                        </div>
                    </div>
                )}

                {/* OTP Verification */}
                {flow === 'otp' && (
                    <div className="card">
                        <div className="card-body" style={{ padding: 32 }}>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔐</div>
                                <h2 style={{ marginBottom: 4 }}>Verify OTP</h2>
                                <p className="text-light" style={{ fontSize: '0.9rem' }}>Enter the OTP sent to +91 {phone}</p>
                            </div>

                            {error && (
                                <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: '0.85rem' }}>
                                    {error}
                                </div>
                            )}

                            <div className="input-group">
                                <label>6-Digit OTP</label>
                                <input
                                    className="input"
                                    type="text"
                                    maxLength={6}
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={e => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        setOtp(val);
                                        // Auto-verify as soon as 6 digits are entered
                                        if (val.length === 6 && !loading) {
                                            // Use the raw value directly (state update is async)
                                            handleVerifyOTPWithValue(val);
                                        }
                                    }}
                                    onKeyDown={e => e.key === 'Enter' && handleVerifyOTP()}
                                    style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: 8, fontWeight: 700 }}
                                />
                            </div>

                            <button
                                className="btn btn-primary btn-block btn-lg mt-2"
                                onClick={handleVerifyOTP}
                                disabled={loading}
                            >
                                {loading ? '⏳ Verifying...' : '✅ Verify & Login'}
                            </button>

                            <button
                                className="btn btn-ghost btn-block mt-1"
                                onClick={() => { setFlow('phone'); setOtp(''); setError(''); }}
                                style={{ fontSize: '0.85rem' }}
                            >
                                ← Change Phone Number
                            </button>

                            <button
                                className="btn btn-ghost btn-block"
                                onClick={handleSendOTP}
                                disabled={loading}
                                style={{ fontSize: '0.85rem', color: 'var(--color-accent)' }}
                            >
                                🔄 Resend OTP
                            </button>
                        </div>
                    </div>
                )}

                {/* Complete Profile (New User) */}
                {flow === 'profile' && (
                    <div className="card">
                        <div className="card-body" style={{ padding: 32 }}>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>👤</div>
                                <h2 style={{ marginBottom: 4 }}>Complete Your Profile</h2>
                                <p className="text-light" style={{ fontSize: '0.9rem' }}>Tell us about yourself to get started</p>
                            </div>

                            {error && (
                                <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: '0.85rem' }}>
                                    {error}
                                </div>
                            )}

                            <div className="input-group">
                                <label>Full Name *</label>
                                <input className="input" placeholder="Enter your name" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Email</label>
                                <input className="input" type="email" placeholder="Optional" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>Company Name</label>
                                <input className="input" placeholder="Your company" value={profile.company} onChange={e => setProfile({ ...profile, company: e.target.value })} />
                            </div>
                            <div className="input-group">
                                <label>GST Number</label>
                                <input className="input" placeholder="e.g. 37AAXCS0067P1ZE" value={profile.gst} onChange={e => setProfile({ ...profile, gst: e.target.value })} />
                            </div>

                            <button
                                className="btn btn-primary btn-block btn-lg mt-2"
                                onClick={handleCompleteProfile}
                                disabled={loading}
                            >
                                {loading ? '⏳ Saving...' : '🚀 Start Shopping'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Admin Email Login */}
                {flow === 'admin' && (
                    <div className="card">
                        <div className="card-body" style={{ padding: 32 }}>
                            <div style={{ textAlign: 'center', marginBottom: 24 }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔑</div>
                                <h2 style={{ marginBottom: 4 }}>Admin Login</h2>
                                <p className="text-light" style={{ fontSize: '0.9rem' }}>For administrators only</p>
                            </div>

                            {error && (
                                <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 'var(--radius-sm)', marginBottom: 16, fontSize: '0.85rem' }}>
                                    {error}
                                </div>
                            )}

                            <div className="input-group">
                                <label>Email</label>
                                <input className="input" type="email" placeholder="admin@loha.com" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                            </div>
                            <div className="input-group">
                                <label>Password</label>
                                <input className="input" type="password" placeholder="Enter password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAdminLogin()} />
                            </div>

                            <button
                                className="btn btn-primary btn-block btn-lg mt-2"
                                onClick={handleAdminLogin}
                                disabled={loading}
                            >
                                {loading ? '⏳ Logging in...' : '🔓 Login as Admin'}
                            </button>

                            <button
                                className="btn btn-ghost btn-block mt-2"
                                onClick={() => { setFlow('phone'); setError(''); }}
                                style={{ fontSize: '0.85rem' }}
                            >
                                ← Back to Phone Login
                            </button>
                        </div>
                    </div>
                )}

                {/* Invisible reCAPTCHA container — required by Firebase phone auth */}
                <div id="recaptcha-container"></div>
            </div>
        </div>
    );
}

export default function Login() {
    return (
        <Suspense fallback={null}>
            <LoginInner />
        </Suspense>
    );
}
