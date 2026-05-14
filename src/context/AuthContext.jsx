'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../lib/firebase';
import {
    onAuthStateChanged,
    signInWithPhoneNumber,
    RecaptchaVerifier,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext();

// ── Session cookie helpers ───────────────────────────────────────────────────
// The proxy.js (middleware) reads __session to decide whether to allow access
// to protected routes (/dashboard, /checkout, /payment, /orders, /admin).
// We use the Firebase ID token as the cookie value — it's opaque to the browser
// but proves the user is authenticated. SameSite=Strict prevents CSRF.
async function setSessionCookie(fbUser) {
    try {
        const token = await fbUser.getIdToken();
        // Max-age: 1 hour (Firebase ID tokens expire in 1h; refresh is handled by SDK)
        document.cookie = `__session=${token}; path=/; max-age=3600; SameSite=Strict`;
    } catch (_) {}
}

function clearSessionCookie() {
    document.cookie = '__session=; path=/; max-age=0; SameSite=Strict';
}
// ────────────────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let resolved = false;
        const timer = setTimeout(() => {
            if (!resolved) { resolved = true; setLoading(false); }
        }, 300);

        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
            resolved = true;
            clearTimeout(timer);
            if (fbUser) {
                setFirebaseUser(fbUser);
                // Set cookie so proxy.js can guard protected routes server-side
                await setSessionCookie(fbUser);
                try {
                    const userDoc = await getDoc(doc(db, 'users', fbUser.uid));
                    if (userDoc.exists()) {
                        setUser({ uid: fbUser.uid, ...userDoc.data() });
                    } else {
                        setUser({ uid: fbUser.uid, phone: fbUser.phoneNumber || '', email: fbUser.email || '', name: fbUser.displayName || '', role: 'buyer', profileComplete: false });
                    }
                } catch (err) {
                    console.error('Error fetching user profile:', err);
                    setUser({ uid: fbUser.uid, phone: fbUser.phoneNumber || '', email: fbUser.email || '', name: fbUser.displayName || '', role: 'buyer', profileComplete: false });
                }
            } else {
                setFirebaseUser(null);
                setUser(null);
                clearSessionCookie();
            }
            setLoading(false);
        });

        // Refresh the cookie every 50 minutes so it doesn't expire mid-session
        const refreshInterval = setInterval(async () => {
            const currentUser = auth.currentUser;
            if (currentUser) await setSessionCookie(currentUser);
        }, 50 * 60 * 1000);

        return () => {
            clearTimeout(timer);
            clearInterval(refreshInterval);
            unsubscribe();
        };
    }, []);

    const clearRecaptcha = () => {
        try { if (window.recaptchaVerifier) { window.recaptchaVerifier.clear(); } } catch (_) {}
        window.recaptchaVerifier = null;
        const el = document.getElementById('recaptcha-container');
        if (el) el.innerHTML = '';
    };

    const sendOTP = async (phoneNumber) => {
        try {
            clearRecaptcha();
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible', callback: () => {}, 'expired-callback': () => { clearRecaptcha(); },
            });
            await window.recaptchaVerifier.render();
            const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
            const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, window.recaptchaVerifier);
            window.confirmationResult = confirmationResult;
            return { success: true };
        } catch (err) {
            console.error('OTP send error:', err);
            clearRecaptcha();
            return { success: false, message: err.message || 'Failed to send OTP' };
        }
    };

    const verifyOTP = async (otp) => {
        try {
            if (!window.confirmationResult) return { success: false, message: 'Please request OTP first' };
            const result = await window.confirmationResult.confirm(otp);
            // Cookie is set automatically via onAuthStateChanged above
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));
            if (userDoc.exists()) return { success: true, isNewUser: false };
            return { success: true, isNewUser: true };
        } catch (err) {
            console.error('OTP verify error:', err);
            return { success: false, message: err.message || 'Invalid OTP' };
        }
    };

    const completeProfile = async (profileData) => {
        try {
            const uid = firebaseUser?.uid || auth.currentUser?.uid;
            if (!uid) return { success: false, message: 'Not authenticated' };
            const userData = { name: profileData.name, phone: firebaseUser?.phoneNumber || profileData.phone || '', email: profileData.email || '', company: profileData.company || '', gst: profileData.gst || '', role: 'buyer', profileComplete: true, createdAt: serverTimestamp() };
            await setDoc(doc(db, 'users', uid), userData);
            setUser({ uid, ...userData, createdAt: new Date().toISOString() });
            return { success: true };
        } catch (err) {
            console.error('Profile save error:', err);
            return { success: false, message: err.message || 'Failed to save profile' };
        }
    };

    const loginWithEmail = async (email, password) => {
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            // Cookie is set automatically via onAuthStateChanged above
            const userDoc = await getDoc(doc(db, 'users', result.user.uid));
            if (userDoc.exists()) setUser({ uid: result.user.uid, ...userDoc.data() });
            return { success: true };
        } catch (err) {
            console.error('Email login error:', err);
            return { success: false, message: err.message || 'Invalid credentials' };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setFirebaseUser(null);
            clearSessionCookie();
            if (window.recaptchaVerifier) { window.recaptchaVerifier.clear(); window.recaptchaVerifier = null; }
            window.confirmationResult = null;
        } catch (err) { console.error('Logout error:', err); }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAdmin: user?.role === 'admin', isLoggedIn: !!user, sendOTP, verifyOTP, completeProfile, loginWithEmail, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
