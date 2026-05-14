'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import './Dashboard.css';

export default function Dashboard() {
    const { isLoggedIn, user } = useAuth();
    const { orders, addresses, addAddress, removeAddress, ORDER_STATUSES } = useOrders();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('orders');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAddr, setNewAddr] = useState({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });

    if (!isLoggedIn) {
        return (
            <div className="page container" style={{ textAlign: 'center', paddingTop: 80 }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🔒</div>
                <h2>Please login to view your dashboard</h2>
                <p className="text-light mt-1 mb-3">You need to be logged in to access your account</p>
                <Link href="/login" className="btn btn-primary">Login / Register</Link>
            </div>
        );
    }

    const tabs = [
        { id: 'orders', label: '📦 Orders', count: orders.length },
        { id: 'addresses', label: '📍 Addresses', count: addresses.length },
        { id: 'profile', label: '👤 Profile' },
        { id: 'tracking', label: '🚛 Tracking' },
    ];

    const handleAddAddress = () => {
        if (!newAddr.name || !newAddr.phone || !newAddr.line1 || !newAddr.city || !newAddr.pincode) return;
        addAddress(newAddr);
        setShowAddForm(false);
        setNewAddr({ name: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '' });
    };

    const activeOrders = orders.filter(o => o.statusIndex < 4);
    const completedOrders = orders.filter(o => o.statusIndex >= 4);

    return (
        <div className="page animate-fade-in">
            <div className="container">
                <div className="page-header">
                    <h1>👋 Welcome, {user.name}</h1>
                    <p className="text-light">{user.company || 'LOHA Technologies Customer'}</p>
                </div>

                <div className="dashboard-layout">
                    <nav className="dashboard-nav">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`dashboard-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                                {tab.count !== undefined && (
                                    <span style={{
                                        marginLeft: 'auto',
                                        background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : 'var(--color-surface)',
                                        padding: '2px 8px',
                                        borderRadius: 'var(--radius-full)',
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                    }}>{tab.count}</span>
                                )}
                            </button>
                        ))}
                    </nav>

                    <main className="dashboard-content">
                        {/* Orders Tab */}
                        {activeTab === 'orders' && (
                            <div>
                                <h2 style={{ marginBottom: 20 }}>My Orders</h2>
                                {orders.length === 0 ? (
                                    <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📋</div>
                                        <h3>No orders yet</h3>
                                        <p className="text-light mt-1 mb-3">Start shopping to see your orders here</p>
                                        <Link href="/" className="btn btn-primary">Browse Products</Link>
                                    </div>
                                ) : (
                                    <>
                                        {activeOrders.length > 0 && (
                                            <>
                                                <h4 className="text-light mb-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Active Orders ({activeOrders.length})</h4>
                                                <div className="order-mini-list mb-3">
                                                    {activeOrders.map(order => (
                                                        <div key={order.id} className="order-mini-card" onClick={() => router.push('/orders')} style={{ cursor: 'pointer' }}>
                                                            <div>
                                                                <div className="order-mini-id">{order.id}</div>
                                                                <div className="order-mini-date">
                                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </div>
                                                                <div className="order-mini-items">
                                                                    {order.items?.map(i => `${i.size} × ${i.quantity}`).join(', ')}
                                                                </div>
                                                            </div>
                                                            <div className="order-mini-right">
                                                                <span className={`badge ${order.statusIndex >= 2 ? 'badge-accent' : 'badge-primary'}`}>
                                                                    {order.status}
                                                                </span>
                                                                <div className="order-mini-amount mt-1">₹{order.total?.toLocaleString()}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                        {completedOrders.length > 0 && (
                                            <>
                                                <h4 className="text-light mb-2" style={{ fontSize: '0.85rem', fontWeight: 600 }}>Completed Orders ({completedOrders.length})</h4>
                                                <div className="order-mini-list">
                                                    {completedOrders.map(order => (
                                                        <div key={order.id} className="order-mini-card" onClick={() => router.push('/orders')} style={{ cursor: 'pointer' }}>
                                                            <div>
                                                                <div className="order-mini-id">{order.id}</div>
                                                                <div className="order-mini-date">
                                                                    {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                                </div>
                                                            </div>
                                                            <div className="order-mini-right">
                                                                <span className="badge badge-success">Delivered</span>
                                                                <div className="order-mini-amount mt-1">₹{order.total?.toLocaleString()}</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Addresses Tab */}
                        {activeTab === 'addresses' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h2>Saved Addresses</h2>
                                    {!showAddForm && (
                                        <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(true)}>+ Add New</button>
                                    )}
                                </div>

                                {showAddForm && (
                                    <div className="card mb-3">
                                        <div className="card-body">
                                            <h4 style={{ marginBottom: 16 }}>Add New Address</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                                <div className="input-group"><label>Full Name *</label><input className="input" value={newAddr.name} onChange={e => setNewAddr({ ...newAddr, name: e.target.value })} /></div>
                                                <div className="input-group"><label>Phone *</label><input className="input" value={newAddr.phone} onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })} /></div>
                                                <div className="input-group" style={{ gridColumn: '1/-1' }}><label>Address Line 1 *</label><input className="input" value={newAddr.line1} onChange={e => setNewAddr({ ...newAddr, line1: e.target.value })} /></div>
                                                <div className="input-group" style={{ gridColumn: '1/-1' }}><label>Address Line 2</label><input className="input" value={newAddr.line2} onChange={e => setNewAddr({ ...newAddr, line2: e.target.value })} /></div>
                                                <div className="input-group"><label>City *</label><input className="input" value={newAddr.city} onChange={e => setNewAddr({ ...newAddr, city: e.target.value })} /></div>
                                                <div className="input-group"><label>State</label><input className="input" value={newAddr.state} onChange={e => setNewAddr({ ...newAddr, state: e.target.value })} /></div>
                                                <div className="input-group"><label>Pincode *</label><input className="input" value={newAddr.pincode} onChange={e => setNewAddr({ ...newAddr, pincode: e.target.value })} /></div>
                                            </div>
                                            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                                                <button className="btn btn-primary" onClick={handleAddAddress}>Save Address</button>
                                                <button className="btn btn-ghost" onClick={() => setShowAddForm(false)}>Cancel</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {addresses.length === 0 && !showAddForm ? (
                                    <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>📍</div>
                                        <h3>No saved addresses</h3>
                                        <p className="text-light mt-1 mb-3">Add a delivery address for faster checkout</p>
                                        <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>+ Add Address</button>
                                    </div>
                                ) : (
                                    <div className="address-list">
                                        {addresses.map(addr => (
                                            <div key={addr.id} className="address-card">
                                                <button className="address-card-delete" onClick={() => removeAddress(addr.id)} title="Delete">✕</button>
                                                <div className="address-card-name">{addr.name}</div>
                                                <div className="address-card-phone">📞 {addr.phone}</div>
                                                <div className="address-card-detail">
                                                    {addr.line1}{addr.line2 && `, ${addr.line2}`}<br />
                                                    {addr.city}{addr.state && `, ${addr.state}`} - {addr.pincode}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div>
                                <h2 style={{ marginBottom: 20 }}>My Profile</h2>
                                <div className="card">
                                    <div className="card-body">
                                        <div className="profile-card">
                                            <div className="profile-field">
                                                <div className="profile-field-label">Full Name</div>
                                                <div className="profile-field-value">{user.name}</div>
                                            </div>
                                            <div className="profile-field">
                                                <div className="profile-field-label">Email</div>
                                                <div className="profile-field-value">{user.email}</div>
                                            </div>
                                            <div className="profile-field">
                                                <div className="profile-field-label">Phone</div>
                                                <div className="profile-field-value">{user.phone || 'Not set'}</div>
                                            </div>
                                            <div className="profile-field">
                                                <div className="profile-field-label">Company</div>
                                                <div className="profile-field-value">{user.company || 'Not set'}</div>
                                            </div>
                                            <div className="profile-field">
                                                <div className="profile-field-label">GST Number</div>
                                                <div className="profile-field-value">{user.gst || 'Not set'}</div>
                                            </div>
                                            <div className="profile-field">
                                                <div className="profile-field-label">Account Type</div>
                                                <div className="profile-field-value" style={{ textTransform: 'capitalize' }}>{user.role || 'Buyer'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tracking Tab */}
                        {activeTab === 'tracking' && (
                            <div>
                                <h2 style={{ marginBottom: 20 }}>Order Tracking</h2>
                                {activeOrders.length === 0 ? (
                                    <div className="card" style={{ textAlign: 'center', padding: 48 }}>
                                        <div style={{ fontSize: '3rem', marginBottom: 12 }}>🚛</div>
                                        <h3>No active orders to track</h3>
                                        <p className="text-light mt-1 mb-3">All your orders have been delivered</p>
                                        <Link href="/" className="btn btn-primary">Shop Now</Link>
                                    </div>
                                ) : (
                                    activeOrders.map(order => (
                                        <div key={order.id} className="tracking-order-card">
                                            <div className="tracking-order-header">
                                                <div>
                                                    <h4 style={{ color: 'var(--color-primary)' }}>{order.id}</h4>
                                                    <span className="text-light" style={{ fontSize: '0.8rem' }}>
                                                        {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className={`badge ${order.statusIndex >= 2 ? 'badge-accent' : 'badge-primary'}`}>{order.status}</span>
                                                    <div style={{ fontWeight: 700, color: 'var(--color-accent)', marginTop: 4, textAlign: 'right' }}>₹{order.total?.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            {/* Mini timeline */}
                                            <div style={{ display: 'flex', gap: 0, alignItems: 'center', margin: '16px 0' }}>
                                                {ORDER_STATUSES.map((status, i) => (
                                                    <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                                                        <div style={{
                                                            width: 24, height: 24, borderRadius: '50%',
                                                            background: i <= order.statusIndex ? (i === order.statusIndex ? 'var(--color-primary)' : 'var(--color-success)') : 'var(--color-surface)',
                                                            border: `2px solid ${i <= order.statusIndex ? (i === order.statusIndex ? 'var(--color-primary)' : 'var(--color-success)') : 'var(--color-border)'}`,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: '#fff', fontSize: '0.6rem', fontWeight: 700, flexShrink: 0,
                                                        }}>
                                                            {i < order.statusIndex ? '✓' : i === order.statusIndex ? '●' : ''}
                                                        </div>
                                                        {i < ORDER_STATUSES.length - 1 && (
                                                            <div style={{ flex: 1, height: 2, background: i < order.statusIndex ? 'var(--color-success)' : 'var(--color-border)' }} />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--color-text-light)' }}>
                                                {ORDER_STATUSES.map((s, i) => <span key={i} style={{ textAlign: 'center', flex: 1, fontWeight: i === order.statusIndex ? 700 : 400 }}>{s}</span>)}
                                            </div>

                                            {order.driver && order.statusIndex >= 2 && (
                                                <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-sm)', padding: '12px 16px', marginTop: 16, fontSize: '0.85rem' }}>
                                                    <strong>🚛 Dispatch:</strong> {order.driver.name} | 📞 {order.driver.phone} | 🚗 {order.driver.vehicle}
                                                </div>
                                            )}

                                            <div style={{ marginTop: 12 }}>
                                                <Link href="/orders" className="btn btn-ghost btn-sm" style={{ fontSize: '0.8rem' }}>View Full Details →</Link>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
