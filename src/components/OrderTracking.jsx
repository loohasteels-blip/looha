'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import './OrderTracking.css';

export default function OrderTracking() {
    const { orders, ORDER_STATUSES } = useOrders();
    const { isLoggedIn } = useAuth();
    const [searchParams] = useSearchParams();
    const newOrderId = searchParams.get('new');
    const [searchQuery, setSearchQuery] = useState('');

    if (!isLoggedIn) {
        return (
            <div className="page container" style={{ textAlign: 'center', paddingTop: 80 }}>
                <h2>Please login to view orders</h2>
                <Link href="/login" className="btn btn-primary mt-2">Login</Link>
            </div>
        );
    }

    // Find newly placed order object (for banner)
    const newOrder = orders.find(o => o.id === newOrderId);

    // Filter by search — match L-XXXX order number or Firebase ID
    const filteredOrders = orders.filter(o => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.trim().toLowerCase();
        return (
            (o.orderNumber || '').toLowerCase().includes(q) ||
            (o.id || '').toLowerCase().includes(q)
        );
    });

    return (
        <div className="page animate-fade-in">
            <div className="container">
                <div className="page-header">
                    <h1>My Orders</h1>
                </div>

                {/* ── New Order Banner ── */}
                {newOrder && (
                    <div className="order-success-banner">
                        <div className="order-success-icon" style={{ fontSize: '2rem' }}>✓</div>
                        <div>
                            <strong>Order Placed Successfully!</strong>
                            <p style={{ margin: '4px 0 0' }}>
                                Your order number is{' '}
                                <strong style={{
                                    fontSize: '1.25rem',
                                    color: 'var(--color-primary)',
                                    background: '#eef4ff',
                                    padding: '2px 10px',
                                    borderRadius: 6,
                                    letterSpacing: 1,
                                }}>
                                    {newOrder.orderNumber || newOrder.id}
                                </strong>
                                {' '}— save this to track your order.
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Search Bar ── */}
                {orders.length > 0 && (
                    <div style={{ marginBottom: 24 }}>
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: 10,
                            border: '1.5px solid var(--color-border)', borderRadius: 8,
                            padding: '10px 16px', background: '#fff', maxWidth: 400,
                        }}>
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by Order No. (e.g. L-1001)"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                style={{ border: 'none', outline: 'none', fontSize: '0.9rem', flex: 1, background: 'transparent' }}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '1rem' }}>✕</button>
                            )}
                        </div>
                    </div>
                )}

                {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: 60 }}>
                        <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={1.2} style={{ marginBottom: 16 }}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                        </svg>
                        <h3>No orders yet</h3>
                        <p className="text-light mt-1 mb-3">Start shopping to see your orders here</p>
                        <Link href="/" className="btn btn-primary">Browse Products</Link>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div style={{ textAlign: 'center', paddingTop: 40 }}>
                        <p className="text-light">No orders matching "<strong>{searchQuery}</strong>"</p>
                    </div>
                ) : (
                    <div className="orders-list">
                        {filteredOrders.map(order => (
                            <div key={order.id} className={`order-card ${newOrderId === order.id ? 'order-card-new' : ''}`}>
                                <div className="order-card-header">
                                    <div>
                                        {/* ── Prominent L-XXXX Number ── */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                                            <span style={{
                                                fontSize: '1.1rem', fontWeight: 800,
                                                color: 'var(--color-primary)',
                                                letterSpacing: 0.5,
                                            }}>
                                                {order.orderNumber || 'L-???'}
                                            </span>
                                            {newOrderId === order.id && (
                                                <span style={{ background: '#10b981', color: '#fff', fontSize: '0.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>NEW</span>
                                            )}
                                        </div>
                                        <span className="text-light" style={{ fontSize: '0.78rem' }}>
                                            Ref: {order.id.substring(0, 10)}… &nbsp;·&nbsp;{' '}
                                            {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className={`badge ${order.statusIndex >= 4 ? 'badge-success' : order.statusIndex >= 2 ? 'badge-accent' : 'badge-primary'}`}>
                                            {order.status}
                                        </div>
                                        <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-accent)', marginTop: 4 }}>
                                            ₹{order.total?.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                {/* Status Timeline */}
                                <div className="timeline">
                                    {ORDER_STATUSES.map((status, i) => (
                                        <div key={i} className={`timeline-step ${i <= order.statusIndex ? 'active' : ''} ${i === order.statusIndex ? 'current' : ''}`}>
                                            <div className="timeline-dot">
                                                {i < order.statusIndex ? '✓' : i === order.statusIndex ? '●' : ''}
                                            </div>
                                            {i < ORDER_STATUSES.length - 1 && <div className="timeline-line" />}
                                            <div className="timeline-label">{status}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Driver info when dispatched */}
                                {order.driver && order.statusIndex >= 2 && (
                                    <div className="driver-info">
                                        <h4>Dispatch Details</h4>
                                        <div className="driver-grid">
                                            <div><span className="text-light">Driver Name</span><strong>{order.driver.name}</strong></div>
                                            <div><span className="text-light">Mobile</span><strong>{order.driver.phone}</strong></div>
                                            <div><span className="text-light">Vehicle No.</span><strong>{order.driver.vehicle}</strong></div>
                                        </div>
                                    </div>
                                )}

                                {/* Items summary */}
                                <div className="order-items-summary">
                                    {order.items?.map((item, i) => (
                                        <span key={i} className="badge badge-primary" style={{ marginRight: 6, marginBottom: 4 }}>
                                            {item.size} × {item.quantity}
                                        </span>
                                    ))}
                                </div>

                                <div className="order-card-footer">
                                    <span className="text-light" style={{ fontSize: '0.8rem' }}>
                                        Payment: {order.paymentMethod === 'online' ? 'Online' : order.paymentMethod === 'rtgs' ? 'RTGS' : 'COD'}
                                    </span>
                                    {order.address && (
                                        <span className="text-light" style={{ fontSize: '0.8rem' }}>
                                            {order.address.city}, {order.address.state}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
