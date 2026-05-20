'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { usePricing } from '../context/PricingContext';
import { calculatePricing } from '../data/products';
import { db } from '../lib/firebase';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

// ── Load Razorpay script dynamically ──────────────────────────────────────────
function loadRazorpayScript() {
    return new Promise((resolve) => {
        if (window.Razorpay) { resolve(true); return; }
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export default function Payment() {
    const { items, clearCart } = useCart();
    const { createOrder, addresses } = useOrders();
    const { isLoggedIn, user } = useAuth();
    const { charges } = usePricing();
    const router = useRouter();

    const [paymentMethod, setPaymentMethod] = useState('online');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (items.length === 0) {
        return (
            <div className="page container" style={{ textAlign: 'center', paddingTop: 80 }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>💳</div>
                <h2>No items to pay for</h2>
                <p className="text-light mt-1 mb-3">Add products to your cart first</p>
                <Link href="/" className="btn btn-primary">Browse Products</Link>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="page container" style={{ textAlign: 'center', paddingTop: 80 }}>
                <h2>Please login to continue</h2>
                <p className="text-light mt-1 mb-3">You need to be logged in to make a payment</p>
                <Link href="/login" className="btn btn-primary">Login / Register</Link>
            </div>
        );
    }

    const cartPricing = items.map(item => ({ item, pricing: calculatePricing(item, item.quantity, charges) }));
    const grandTotal = cartPricing.reduce((sum, cp) => sum + cp.pricing.total, 0);
    const totalWeight = cartPricing.reduce((sum, cp) => sum + cp.pricing.totalWeightKg, 0);
    const isBulk = totalWeight > 5000;

    const deliveryAddress = addresses.length > 0 ? addresses[addresses.length - 1] : null;

    // ── Mark payment as paid in Firestore ─────────────────────────────────────
    const markPaymentPaid = async (orderId, razorpayOrderId, razorpayPaymentId) => {
        try {
            // Update the order document
            await updateDoc(doc(db, 'orders', orderId), {
                paymentStatus: 'paid',
                razorpayOrderId,
                razorpayPaymentId,
                paidAt: new Date().toISOString(),
            });
            // Update the payments collection record
            const pq = query(collection(db, 'payments'), where('orderId', '==', orderId));
            const snap = await getDocs(pq);
            snap.forEach(async (d) => {
                await updateDoc(doc(db, 'payments', d.id), {
                    status: 'paid',
                    razorpayOrderId,
                    razorpayPaymentId,
                    paidAt: new Date().toISOString(),
                });
            });
        } catch (err) {
            console.error('markPaymentPaid error:', err);
        }
    };

    // ── Non-online methods (RTGS / COD) ───────────────────────────────────────
    const handleNonOnlineOrder = async () => {
        setLoading(true);
        setError('');
        try {
            const order = await createOrder({
                items: cartPricing.map(cp => ({ ...cp.item, pricing: cp.pricing })),
                address: deliveryAddress,
                paymentMethod,
                total: grandTotal,
                user: { name: user.name, email: user.email, phone: user.phone },
            });
            if (order) {
                clearCart();
                router.push(`/orders?new=${order.id}`);
            } else {
                setError('Failed to place order. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // ── Online payment via Razorpay ────────────────────────────────────────────
    const handleRazorpayPayment = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            // 1. Load the Razorpay JS SDK
            const sdkLoaded = await loadRazorpayScript();
            if (!sdkLoaded) {
                setError('Failed to load Razorpay. Check your internet connection.');
                setLoading(false);
                return;
            }

            // 2. Create a Looha order in Firestore first (status: pending)
            const order = await createOrder({
                items: cartPricing.map(cp => ({ ...cp.item, pricing: cp.pricing })),
                address: deliveryAddress,
                paymentMethod,
                total: grandTotal,
                user: { name: user.name, email: user.email, phone: user.phone },
            });

            if (!order) {
                setError('Failed to create order. Please try again.');
                setLoading(false);
                return;
            }

            // 3. Create Razorpay order on server
            const res = await fetch('/api/razorpay/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: grandTotal,
                    currency: 'INR',
                    receipt: order.orderNumber || order.id,
                    notes: { loohaOrderId: order.id, customerName: user.name || '', phone: user.phone || '' },
                }),
            });

            const rzpData = await res.json();
            if (!res.ok || !rzpData.orderId) {
                setError(rzpData.error || 'Payment gateway error. Please try RTGS instead.');
                setLoading(false);
                return;
            }

            // 4. Open Razorpay checkout modal
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: rzpData.amount,
                currency: rzpData.currency,
                name: 'Looha Steel',
                description: `Order ${order.orderNumber} — Steel Products`,
                image: 'https://www.looha.in/logo.png',
                order_id: rzpData.orderId,
                prefill: {
                    name: user.name || '',
                    email: user.email || '',
                    contact: user.phone || '',
                },
                notes: { loohaOrderId: order.id },
                theme: { color: '#0B1F3A' },
                handler: async (response) => {
                    // 5. Payment success — update Firestore
                    await markPaymentPaid(order.id, response.razorpay_order_id, response.razorpay_payment_id);
                    clearCart();
                    router.push(`/orders?new=${order.id}`);
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        setError('Payment cancelled. Your order is saved — you can retry from Orders page.');
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (resp) => {
                setError(`Payment failed: ${resp.error.description}. Please try again or use RTGS.`);
                setLoading(false);
            });
            rzp.open();

        } catch (err) {
            console.error('Razorpay flow error:', err);
            setError('Something went wrong. Please try again.');
            setLoading(false);
        }
    }, [cartPricing, deliveryAddress, paymentMethod, grandTotal, user, createOrder, clearCart, router]);

    // ── Main handler ───────────────────────────────────────────────────────────
    const handlePlaceOrder = () => {
        if (paymentMethod === 'online' || paymentMethod === 'upi' || paymentMethod === 'netbanking') {
            handleRazorpayPayment();
        } else {
            handleNonOnlineOrder();
        }
    };

    const paymentOptions = [
        {
            value: 'online',
            label: '💳 Online Payment',
            desc: 'Pay securely via UPI, Debit/Credit Card, Net Banking — powered by Razorpay',
            icon: '💳',
        },
        {
            value: 'upi',
            label: '📱 UPI / QR Pay',
            desc: 'Google Pay, PhonePe, Paytm, BHIM — instant payment via Razorpay',
            icon: '📱',
        },
        {
            value: 'netbanking',
            label: '🏛️ Net Banking',
            desc: 'All major banks supported via Razorpay secure gateway',
            icon: '🏛️',
        },
        {
            value: 'rtgs',
            label: '🏦 RTGS / NEFT Transfer',
            desc: 'Transfer directly to our bank account (manually confirmed)',
            icon: '🏦',
        },
        {
            value: 'cod',
            label: '📦 Cash on Delivery',
            desc: 'Available only after admin approval — for bulk orders',
            icon: '📦',
        },
    ];

    const isOnlineMethod = ['online', 'upi', 'netbanking'].includes(paymentMethod);

    return (
        <div className="page animate-fade-in">
            <div className="container">
                <div className="breadcrumb">
                    <Link href="/">Home</Link><span className="sep">›</span>
                    <Link href="/cart">Cart</Link><span className="sep">›</span>
                    <Link href="/checkout">Checkout</Link><span className="sep">›</span>
                    <span>Payment</span>
                </div>

                <div className="page-header">
                    <h1>💳 Payment</h1>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
                    {/* Left: Payment Methods */}
                    <div>
                        <div className="card">
                            <div className="card-body">
                                <h3 style={{ marginBottom: 20 }}>Select Payment Method</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {paymentOptions.map(opt => (
                                        <label key={opt.value} style={{
                                            display: 'flex', gap: 12, padding: 16,
                                            border: paymentMethod === opt.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-md)', cursor: 'pointer',
                                            background: paymentMethod === opt.value ? 'rgba(11,31,58,0.03)' : '#fff',
                                            transition: 'all 0.2s',
                                        }}>
                                            <input type="radio" name="payment" value={opt.value}
                                                checked={paymentMethod === opt.value}
                                                onChange={() => setPaymentMethod(opt.value)}
                                                style={{ marginTop: 2 }}
                                            />
                                            <div style={{ flex: 1 }}>
                                                <strong>{opt.label}</strong>
                                                <div className="text-light" style={{ fontSize: '0.8rem', marginTop: 2 }}>{opt.desc}</div>
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                {/* Razorpay badge for online methods */}
                                {isOnlineMethod && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, padding: '10px 14px', background: '#f0f7ff', borderRadius: 8, border: '1px solid #bfdbfe', fontSize: '0.8rem', color: '#1e40af' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                                        <span><strong>Secured by Razorpay</strong> — 256-bit SSL encrypted, RBI compliant</span>
                                    </div>
                                )}

                                {/* RTGS Bank Details */}
                                {paymentMethod === 'rtgs' && (
                                    <div style={{ background: 'var(--color-surface)', padding: 20, borderRadius: 'var(--radius-md)', marginTop: 20 }}>
                                        <h4 style={{ marginBottom: 12, fontSize: '0.95rem' }}>🏦 Bank Details for RTGS/NEFT</h4>
                                        <div style={{ fontSize: '0.85rem', lineHeight: 1.8 }}>
                                            {[
                                                ['Bank Name', 'State Bank of India'],
                                                ['Account Name', 'MBJSTEELS'],
                                                ['Account No.', '39876543210'],
                                                ['IFSC Code', 'SBIN0001234'],
                                                ['Branch', 'Nellore Main'],
                                            ].map(([label, value]) => (
                                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid var(--color-border)' }}>
                                                    <span className="text-light">{label}</span>
                                                    <strong style={{ letterSpacing: label === 'Account No.' || label === 'IFSC Code' ? 1 : 0 }}>{value}</strong>
                                                </div>
                                            ))}
                                        </div>
                                        <p style={{ fontSize: '0.78rem', color: '#854D0E', marginTop: 10, background: '#FEF9C3', padding: '8px 12px', borderRadius: 6 }}>
                                            ⚠️ After transferring, WhatsApp your UTR number to <strong>8885999718</strong> for order confirmation.
                                        </p>
                                    </div>
                                )}

                                {/* COD Note */}
                                {paymentMethod === 'cod' && (
                                    <div style={{ background: '#FEF9C3', padding: 16, borderRadius: 'var(--radius-sm)', marginTop: 16, fontSize: '0.85rem', color: '#854D0E' }}>
                                        <strong>⚠️ Note:</strong> Cash on Delivery is subject to admin approval. You will receive a confirmation call within 24 hours.
                                    </div>
                                )}

                                {/* Bulk Order Warning */}
                                {isBulk && (
                                    <div style={{ background: '#FEE2E2', padding: 16, borderRadius: 'var(--radius-sm)', marginTop: 16, fontSize: '0.85rem', color: '#991B1B', fontWeight: 600 }}>
                                        ⚠️ 100% Advance Required Before Dispatch — Your order exceeds 5 tons.
                                    </div>
                                )}

                                {/* Error Message */}
                                {error && (
                                    <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '12px 16px', marginTop: 16, color: '#991B1B', fontSize: '0.85rem', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                        <span style={{ fontSize: '1rem', flexShrink: 0 }}>⚠️</span>
                                        <span>{error}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Order Summary */}
                    <div>
                        <div className="card" style={{ position: 'sticky', top: 100 }}>
                            <div className="card-body">
                                <h3 style={{ marginBottom: 16 }}>Order Summary</h3>

                                {cartPricing.map(({ item, pricing }) => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem' }}>
                                        <span className="text-light">{item.categoryName} — {item.size} × {item.quantity}</span>
                                        <span>₹{pricing.subtotal.toLocaleString()}</span>
                                    </div>
                                ))}

                                <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 12, paddingTop: 12 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem' }}>
                                        <span className="text-light">Loading Charges</span>
                                        <span>₹{cartPricing.reduce((s, cp) => s + cp.pricing.loadingCharges, 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem' }}>
                                        <span className="text-light">Transport Charges</span>
                                        <span>₹{cartPricing.reduce((s, cp) => s + cp.pricing.transportCharges, 0).toLocaleString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.85rem' }}>
                                        <span className="text-light">GST (18%)</span>
                                        <span>₹{cartPricing.reduce((s, cp) => s + cp.pricing.gstAmount, 0).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div style={{ borderTop: '2px solid var(--color-primary)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem' }}>
                                    <strong>Total Amount</strong>
                                    <strong style={{ color: 'var(--color-accent)' }}>₹{grandTotal.toLocaleString()}</strong>
                                </div>

                                <div className="text-lighter" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                                    Total Weight: {totalWeight.toLocaleString()}kg ({(totalWeight / 1000).toFixed(2)}T)
                                </div>

                                {deliveryAddress && (
                                    <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', padding: 12, marginTop: 16, fontSize: '0.8rem' }}>
                                        <strong>📍 Delivering to:</strong><br />
                                        {deliveryAddress.name}, {deliveryAddress.city} - {deliveryAddress.pincode}
                                    </div>
                                )}

                                <button
                                    id="pay-now-btn"
                                    className="btn btn-accent btn-block btn-lg mt-3"
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                                >
                                    {loading ? (
                                        <>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} style={{ animation: 'spin 1s linear infinite' }}>
                                                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                                            </svg>
                                            Processing…
                                        </>
                                    ) : paymentMethod === 'cod' ? '📦 Place COD Order'
                                        : paymentMethod === 'rtgs' ? '🏦 Confirm & Get Bank Details'
                                            : `💳 Pay ₹${grandTotal.toLocaleString()} via Razorpay`}
                                </button>

                                <div style={{ textAlign: 'center', marginTop: 12 }}>
                                    <Link href="/checkout" className="btn btn-ghost btn-sm">← Back to Checkout</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media (max-width: 768px) {
                    .page > .container > div { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
