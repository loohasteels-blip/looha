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

export default function Payment() {
    const { items, clearCart } = useCart();
    const { createOrder, addresses } = useOrders();
    const { isLoggedIn, user } = useAuth();
    const { charges } = usePricing();
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState('online');

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

    // Use the most recently added address or first available
    const deliveryAddress = addresses.length > 0 ? addresses[addresses.length - 1] : null;

    const handlePlaceOrder = async () => {
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
        }
    };

    const paymentOptions = [
        {
            value: 'online',
            label: '💳 Online Payment',
            desc: 'Pay securely using UPI, Net Banking, or Payment Gateway',
            icon: '💳',
        },
        {
            value: 'upi',
            label: '📱 UPI Payment',
            desc: 'Pay instantly using Google Pay, PhonePe, Paytm, or any UPI app',
            icon: '📱',
        },
        {
            value: 'netbanking',
            label: '🏛️ Net Banking',
            desc: 'Pay using your bank\'s internet banking service',
            icon: '🏛️',
        },
        {
            value: 'rtgs',
            label: '🏦 RTGS / NEFT Transfer',
            desc: 'Transfer directly to our bank account',
            icon: '🏦',
        },
        {
            value: 'cod',
            label: '📦 Cash on Delivery',
            desc: 'Available only after admin approval',
            icon: '📦',
        },
    ];

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

                                {/* RTGS Bank Details */}
                                {paymentMethod === 'rtgs' && (
                                    <div style={{ background: 'var(--color-surface)', padding: 20, borderRadius: 'var(--radius-md)', marginTop: 20 }}>
                                        <h4 style={{ marginBottom: 12, fontSize: '0.95rem' }}>🏦 Bank Details for RTGS/NEFT</h4>
                                        <div style={{ fontSize: '0.85rem', lineHeight: 1.8 }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                                <span className="text-light">Bank Name</span>
                                                <strong>State Bank of India</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                                <span className="text-light">Account Name</span>
                                                <strong>Loha Technologies Pvt Ltd</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                                <span className="text-light">Account No.</span>
                                                <strong>39876543210</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                                <span className="text-light">IFSC Code</span>
                                                <strong>SBIN0001234</strong>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                                                <span className="text-light">Branch</span>
                                                <strong>Visakhapatnam Main</strong>
                                            </div>
                                        </div>
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

                                <button className="btn btn-accent btn-block btn-lg mt-3" onClick={handlePlaceOrder}>
                                    {paymentMethod === 'cod' ? '📦 Place COD Order' : paymentMethod === 'rtgs' ? '🏦 Confirm & Get Bank Details' : '💳 Pay ₹' + grandTotal.toLocaleString()}
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
                @media (max-width: 768px) {
                    .page > .container > div { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}
