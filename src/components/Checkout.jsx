'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { usePricing } from '../context/PricingContext';
import { calculatePricing } from '../data/products';

export default function Checkout() {
    const { items, clearCart } = useCart();
    const { addresses, addAddress, createOrder } = useOrders();
    const { isLoggedIn, user } = useAuth();
    const { charges } = usePricing();
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAddr, setNewAddr] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
    const [paymentMethod, setPaymentMethod] = useState('online');
    const [geoLoading, setGeoLoading] = useState(false);
    const [geoError, setGeoError] = useState('');
    const [placing, setPlacing] = useState(false);

    if (items.length === 0) {
        return (
            <div className="page container" style={{ textAlign: 'center', paddingTop: 80 }}>
                <h2>No items to checkout</h2>
                <Link href="/" className="btn btn-primary mt-2">Browse Products</Link>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="page container" style={{ textAlign: 'center', paddingTop: 80 }}>
                <h2>Please login to continue</h2>
                <p className="text-light mt-1 mb-3">You need to be logged in to place an order</p>
                <Link href="/login" className="btn btn-primary">Login / Register</Link>
            </div>
        );
    }

    const cartPricing = items.map(item => ({ item, pricing: calculatePricing(item, item.quantity, charges) }));
    const grandTotal = cartPricing.reduce((sum, cp) => sum + cp.pricing.total, 0);

    const handleAddAddress = async () => {
        if (!newAddr.name || !newAddr.phone || !newAddr.line1 || !newAddr.city || !newAddr.pincode) return;
        const addr = await addAddress(newAddr);
        if (addr) setSelectedAddress(addr.id);
        setShowAddForm(false);
        setNewAddr({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
    };

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            setGeoError('Geolocation is not supported by your browser.');
            return;
        }
        setGeoLoading(true);
        setGeoError('');
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                try {
                    const { latitude, longitude } = pos.coords;
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                        { headers: { 'Accept-Language': 'en' } }
                    );
                    const data = await res.json();
                    const a = data.address || {};
                    setNewAddr(prev => ({
                        ...prev,
                        line1: [
                            a.road || a.pedestrian || a.footway || '',
                            a.neighbourhood || a.suburb || ''
                        ].filter(Boolean).join(', '),
                        line2: a.county || a.district || '',
                        city: a.city || a.town || a.village || a.municipality || '',
                        state: a.state || '',
                        pincode: a.postcode || '',
                    }));
                } catch {
                    setGeoError('Could not fetch address. Please fill manually.');
                } finally {
                    setGeoLoading(false);
                }
            },
            (err) => {
                setGeoLoading(false);
                setGeoError('Location access denied. Please allow location permission and try again.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handlePlaceOrder = async () => {
        if (placing) return;
        setPlacing(true);
        const addr = addresses.find(a => a.id === selectedAddress);
        const orderItems = cartPricing.map(cp => ({ ...cp.item, pricing: cp.pricing }));
        const order = await createOrder({
            items: orderItems,
            address: addr,
            paymentMethod,
            total: grandTotal,
            user: { name: user.name, email: user.email, phone: user.phone },
        });
        setPlacing(false);
        if (order) {
            // WhatsApp admin notification — must be in click-handler context to avoid popup blocker
            const itemsSummary = orderItems
                .map(i => `${i.categoryName} ${i.size} × ${i.quantity}${i.unit}`)
                .join(', ');
            const adminMsg = [
                `NEW ORDER: ${order.orderNumber}`,
                `Customer: ${user.name} | ${user.phone}`,
                `Items: ${itemsSummary}`,
                `Total: ₹${grandTotal.toLocaleString('en-IN')}`,
                `Payment: ${paymentMethod.toUpperCase()}`,
                `View: looha.in/admin`,
            ].join('\n');
            window.open(`https://wa.me/918885999718?text=${encodeURIComponent(adminMsg)}`, '_blank');
            clearCart();
            router.push(`/orders?new=${order.id}`);
        }
    };

    return (
        <div className="page animate-fade-in">
            <div className="container">
                <div className="breadcrumb">
                    <Link href="/">Home</Link><span className="sep">›</span>
                    <Link href="/cart">Cart</Link><span className="sep">›</span>
                    <span>Checkout</span>
                </div>

                {/* Steps indicator */}
                <div style={{ display: 'flex', gap: 0, margin: '24px 0 32px', justifyContent: 'center' }}>
                    {['Delivery Address', 'Order Review', 'Payment'].map((label, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                            <div style={{
                                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: step > i + 1 ? 'var(--color-success)' : step === i + 1 ? 'var(--color-primary)' : 'var(--color-surface)',
                                color: step >= i + 1 ? '#fff' : 'var(--color-text-light)', fontWeight: 700, fontSize: '0.85rem',
                            }}>
                                {step > i + 1 ? '✓' : i + 1}
                            </div>
                            <span style={{ marginLeft: 8, fontSize: '0.85rem', fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? 'var(--color-primary)' : 'var(--color-text-light)' }}>{label}</span>
                            {i < 2 && <div style={{ width: 60, height: 2, background: step > i + 1 ? 'var(--color-success)' : 'var(--color-border)', margin: '0 12px' }} />}
                        </div>
                    ))}
                </div>

                {/* Step 1: Address */}
                {step === 1 && (
                    <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
                        <div className="card-body">
                            <h3 style={{ marginBottom: 20 }}>📍 Delivery Address</h3>
                            {addresses.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                                    {addresses.map(addr => (
                                        <label key={addr.id} style={{
                                            display: 'flex', gap: 12, padding: 16, border: selectedAddress === addr.id ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-md)', cursor: 'pointer', background: selectedAddress === addr.id ? 'rgba(10,31,68,0.03)' : '#fff',
                                        }}>
                                            <input type="radio" name="address" checked={selectedAddress === addr.id} onChange={() => setSelectedAddress(addr.id)} />
                                            <div>
                                                <strong>{addr.name}</strong> — {addr.phone}<br />
                                                <span className="text-light">{addr.line1}, {addr.line2 && `${addr.line2}, `}{addr.city}, {addr.state} - {addr.pincode}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            )}
                            {showAddForm ? (
                                <div style={{ background: 'var(--color-surface)', padding: 20, borderRadius: 'var(--radius-md)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                                        <h4 style={{ margin: 0 }}>Add New Address</h4>
                                        <button
                                            type="button"
                                            onClick={handleUseLocation}
                                            disabled={geoLoading}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 7,
                                                padding: '8px 14px', borderRadius: 8,
                                                border: '1.5px solid var(--color-primary)',
                                                background: geoLoading ? 'var(--color-surface)' : 'var(--color-primary)',
                                                color: geoLoading ? 'var(--color-primary)' : '#fff',
                                                fontWeight: 600, fontSize: '0.82rem', cursor: geoLoading ? 'wait' : 'pointer',
                                                transition: 'all 0.2s',
                                            }}
                                        >
                                            {geoLoading ? (
                                                <>
                                                    <div style={{ width: 14, height: 14, border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                                    Detecting location…
                                                </>
                                            ) : (
                                                <>
                                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                                    </svg>
                                                    Use Current Location
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    {geoError && (
                                        <div style={{ background: '#fef2f2', color: '#b91c1c', fontSize: '0.8rem', padding: '8px 12px', borderRadius: 6, marginBottom: 12, border: '1px solid #fecaca' }}>
                                            {geoError}
                                        </div>
                                    )}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                        <div className="input-group"><label>Full Name</label><input className="input" value={newAddr.name} onChange={e => setNewAddr({ ...newAddr, name: e.target.value })} /></div>
                                        <div className="input-group"><label>Phone</label><input className="input" value={newAddr.phone} onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} /></div>
                                        <div className="input-group" style={{ gridColumn: '1/-1' }}><label>Address Line 1</label><input className="input" value={newAddr.line1} onChange={e => setNewAddr({ ...newAddr, line1: e.target.value })} /></div>
                                        <div className="input-group" style={{ gridColumn: '1/-1' }}><label>Address Line 2</label><input className="input" value={newAddr.line2} onChange={e => setNewAddr({ ...newAddr, line2: e.target.value })} /></div>
                                        <div className="input-group"><label>City</label><input className="input" value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} /></div>
                                        <div className="input-group"><label>State</label><input className="input" value={newAddr.state} onChange={e => setNewAddr({ ...newAddr, state: e.target.value })} /></div>
                                        <div className="input-group"><label>Pincode</label><input className="input" value={newAddr.pincode} onChange={e => setNewAddr({ ...newAddr, pincode: e.target.value })} /></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                                        <button className="btn btn-primary" onClick={handleAddAddress}>Save Address</button>
                                        <button className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <button className="btn btn-outline btn-sm" onClick={() => setShowAddForm(true)}>+ Add New Address</button>
                            )}
                            <div style={{ marginTop: 24, textAlign: 'right' }}>
                                <button className="btn btn-primary btn-lg" disabled={!selectedAddress} onClick={() => setStep(2)}>
                                    Continue to Review →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Review */}
                {step === 2 && (
                    <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
                        <div className="card-body">
                            <h3 style={{ marginBottom: 20 }}>📋 Order Review</h3>
                            {cartPricing.map(({ item, pricing }) => (
                                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
                                    <div>
                                        <strong>{item.categoryName} — {item.size}</strong>
                                        <div className="text-light" style={{ fontSize: '0.8rem' }}>{item.quantity} {item.unit} × ₹{item.pricePerTon.toLocaleString()}/ton | {pricing.totalWeightKg}kg</div>
                                    </div>
                                    <strong>₹{pricing.total.toLocaleString()}</strong>
                                </div>
                            ))}
                            <div style={{ padding: '16px 0', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between', borderTop: '2px solid var(--color-primary)', marginTop: 8 }}>
                                <strong>Grand Total</strong>
                                <strong style={{ color: 'var(--color-accent)' }}>₹{grandTotal.toLocaleString()}</strong>
                            </div>
                            <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'space-between' }}>
                                <button className="btn btn-ghost" onClick={() => setStep(1)}>← Back</button>
                                <button className="btn btn-primary btn-lg" onClick={() => setStep(3)}>Continue to Payment →</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Payment */}
                {step === 3 && (
                    <div className="card" style={{ maxWidth: 700, margin: '0 auto' }}>
                        <div className="card-body">
                            <h3 style={{ marginBottom: 20 }}>💳 Payment Method</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                {[
                                    { value: 'online', label: '💳 Online Payment', desc: 'UPI / Net Banking / Payment Gateway' },
                                    { value: 'rtgs', label: '🏦 RTGS Transfer', desc: 'Bank details will be shared after order confirmation' },
                                    { value: 'cod', label: '📦 Cash on Delivery', desc: 'Subject to admin approval only' },
                                ].map(opt => (
                                    <label key={opt.value} style={{
                                        display: 'flex', gap: 12, padding: 16, border: paymentMethod === opt.value ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                                        borderRadius: 'var(--radius-md)', cursor: 'pointer', background: paymentMethod === opt.value ? 'rgba(10,31,68,0.03)' : '#fff',
                                    }}>
                                        <input type="radio" name="payment" value={opt.value} checked={paymentMethod === opt.value} onChange={() => setPaymentMethod(opt.value)} />
                                        <div><strong>{opt.label}</strong><div className="text-light" style={{ fontSize: '0.8rem' }}>{opt.desc}</div></div>
                                    </label>
                                ))}
                            </div>

                            {paymentMethod === 'rtgs' && (
                                <div style={{ background: 'var(--color-surface)', padding: 16, borderRadius: 'var(--radius-md)', marginTop: 16, fontSize: '0.85rem' }}>
                                    <strong>Bank Details for RTGS:</strong><br />
                                    Bank: State Bank of India<br />
                                    A/C Name: Loha Technologies Pvt Ltd<br />
                                    A/C No: 39876543210<br />
                                    IFSC: SBIN0001234<br />
                                    Branch: Visakhapatnam Main
                                </div>
                            )}

                            <div style={{ background: '#FEF3C7', padding: 12, borderRadius: 'var(--radius-sm)', marginTop: 16, fontSize: '0.8rem', color: '#92400E', fontWeight: 600 }}>
                                ⚠️ 100% Advance Required Before Dispatch for Bulk Orders
                            </div>

                            <div style={{ padding: '16px 0', fontSize: '1.2rem', display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
                                <strong>Amount to Pay</strong>
                                <strong style={{ color: 'var(--color-accent)' }}>₹{grandTotal.toLocaleString()}</strong>
                            </div>

                            <div style={{ display: 'flex', gap: 12, marginTop: 16, justifyContent: 'space-between' }}>
                                <button className="btn btn-ghost" onClick={() => setStep(2)} disabled={placing}>← Back</button>
                                <button
                                    className="btn btn-accent btn-lg"
                                    onClick={handlePlaceOrder}
                                    disabled={placing}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 160, justifyContent: 'center' }}
                                >
                                    {placing ? (
                                        <>
                                            <div style={{ width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                                            Placing Order…
                                        </>
                                    ) : (
                                        <>
                                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                            Place Order
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
