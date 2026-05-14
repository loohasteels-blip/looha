'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { calculatePricing } from '../data/products';

export default function Cart() {
    const { items, updateQuantity, removeItem, clearCart } = useCart();
    const router = useRouter();

    if (items.length === 0) {
        return (
            <div className="page container" style={{ textAlign: 'center', paddingTop: 80 }}>
                <div style={{ fontSize: '4rem', marginBottom: 16 }}>🛒</div>
                <h2>Your cart is empty</h2>
                <p className="text-light mt-1 mb-3">Add some steel products to get started</p>
                <Link href="/" className="btn btn-primary">Browse Products</Link>
            </div>
        );
    }

    const cartPricing = items.map(item => ({
        item,
        pricing: calculatePricing(item, item.quantity),
    }));

    const grandTotal = cartPricing.reduce((sum, cp) => sum + cp.pricing.total, 0);
    const totalWeight = cartPricing.reduce((sum, cp) => sum + cp.pricing.totalWeightKg, 0);

    return (
        <div className="page animate-fade-in">
            <div className="container">
                <div className="breadcrumb">
                    <Link href="/">Home</Link><span className="sep">›</span><span>Cart</span>
                </div>
                <div className="page-header flex justify-between items-center">
                    <h1>🛒 Shopping Cart ({items.length} items)</h1>
                    <button className="btn btn-ghost btn-sm" onClick={clearCart}>Clear All</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32 }}>
                    <div>
                        {cartPricing.map(({ item, pricing }) => (
                            <div key={item.id} className="card" style={{ marginBottom: 12 }}>
                                <div className="card-body" style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ marginBottom: 4 }}>{item.categoryName} — {item.size}</h4>
                                        <p className="text-light" style={{ fontSize: '0.8rem' }}>
                                            {item.brand || 'Standard'} | {item.length} | {item.weightPerPiece}kg/piece
                                        </p>
                                        <p style={{ fontSize: '0.85rem', marginTop: 4 }}>
                                            <span className="text-accent font-bold">₹{item.pricePerTon.toLocaleString()}</span>
                                            <span className="text-lighter"> /ton</span>
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ padding: '4px 10px' }}>−</button>
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={e => updateQuantity(item.id, parseInt(e.target.value) || 0)}
                                                style={{ width: 60, textAlign: 'center', padding: '6px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}
                                            />
                                            <button className="btn btn-ghost btn-sm" onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ padding: '4px 10px' }}>+</button>
                                        </div>
                                        <small className="text-light">{item.unit}</small>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: 120 }}>
                                        <div className="font-bold" style={{ fontSize: '1.05rem' }}>₹{pricing.total.toLocaleString()}</div>
                                        <div className="text-lighter" style={{ fontSize: '0.75rem' }}>{pricing.totalWeightKg}kg</div>
                                    </div>
                                    <button onClick={() => removeItem(item.id)} style={{ background: 'none', border: 'none', color: 'var(--color-danger)', fontSize: '1.2rem', padding: 8 }}>✕</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div>
                        <div className="card" style={{ position: 'sticky', top: 100 }}>
                            <div className="card-body">
                                <h3 style={{ marginBottom: 20 }}>Order Summary</h3>
                                {cartPricing.map(({ item, pricing }) => (
                                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: '0.85rem' }}>
                                        <span className="text-light">{item.size} × {item.quantity}</span>
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
                                    <strong>Grand Total</strong>
                                    <strong style={{ color: 'var(--color-accent)' }}>₹{grandTotal.toLocaleString()}</strong>
                                </div>
                                <div className="text-lighter" style={{ fontSize: '0.75rem', marginTop: 4 }}>
                                    Total Weight: {totalWeight.toLocaleString()}kg ({(totalWeight / 1000).toFixed(2)}T)
                                </div>
                                <button className="btn btn-accent btn-block btn-lg mt-3" onClick={() => router.push('/checkout')}>
                                    Proceed to Checkout →
                                </button>
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
