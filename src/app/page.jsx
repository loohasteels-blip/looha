'use client';
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { categories, products } from '../data/products';
import { usePricing } from '../context/PricingContext';
import './Home.css';

const RATE_CARD_ITEMS = [
    { slug: 'tmt-bars',     label: 'TMT Bars',     sizeId: 'tmt-12',       size: '12mm',         unit: 'Per Ton' },
    { slug: 'ms-pipes',     label: 'MS Pipes',     sizeId: 'msp-25nb-2_9', size: '25 NB (1")',   unit: 'Per Ton' },
    { slug: 'ms-sheets',    label: 'MS Sheets',    sizeId: 'mss-6_3-2',    size: '6x3 ft / 2mm', unit: 'Per Ton' },
    { slug: 'gi-sheets',    label: 'GI Sheets',    sizeId: 'gi-6_3-1',     size: '6x3 ft / 1mm', unit: 'Per Ton' },
    { slug: 'binding-wire', label: 'Binding Wire', sizeId: 'bw-20g',       size: '20 Gauge',     unit: 'Per Ton' },
];

function getLocalBase(sizeId) {
    for (const cat of Object.values(products)) {
        const item = cat.items?.find(i => i.id === sizeId);
        if (item) return item.pricePerTon ?? item.pricePerKg ?? null;
    }
    return null;
}

function buildWhatsAppUrl() {
    const phone = '918885999718';
    const message = encodeURIComponent('Hello! I would like a quick quote for steel products.');
    return `https://wa.me/${phone}?text=${message}`;
}

const features = [
    { icon: '🚫', label: 'Zero Credit Risk',       sub: '100% advance payment' },
    { icon: '📈', label: 'Live Price Updates',      sub: 'Daily rate updates' },
    { icon: '🧾', label: 'GST Invoicing',           sub: 'Auto-generated invoices' },
    { icon: '📍', label: 'Nellore Focused',         sub: 'Local network, faster delivery' },
    { icon: '🔒', label: 'Secure Payments',         sub: 'Safe & protected transactions' },
    { icon: '🎙️', label: 'Expert Support',          sub: "We're here to help you" },
];

const stats = [
    { value: '100%', label: 'Advance Payment — Zero Credit Risk' },
    { value: '15',   label: 'Steel Products' },
    { value: 'Nellore', label: 'Headquarters, Andhra Pradesh' },
    { value: '20+',  label: 'Years of Industry Experience' },
];

const customers = [
    'Contractors', 'Civil Retailers', 'SME Industries',
    'Real Estate Developers', 'Fabricators', 'Infrastructure Projects',
    'Builders', 'Government Projects', 'Factory Units',
];

const whyLooha = [
    { title: 'Zero Credit Risk',         desc: '100% advance payment — no bad debts, no collection headaches, clean business.' },
    { title: 'Digital-First Platform',   desc: 'Order steel online with transparent pricing, weight calculation, and instant confirmation.' },
    { title: 'Nellore-Focused Delivery', desc: 'Deep local network means faster dispatch and reliable delivery across Nellore & AP.' },
    { title: 'Daily Rate Updates',       desc: "Steel rates updated every morning — you always get today's correct market price." },
    { title: 'GST Invoicing',            desc: 'Auto-generated GST invoices for every order — ready for your books and ITR.' },
    { title: 'Full Transparency',        desc: 'Weight, loading, transport, and GST shown before you pay — no hidden charges.' },
];

export default function Home() {
    const { getPrice } = usePricing();
    const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

    const rateRows = useMemo(() =>
        RATE_CARD_ITEMS.map(item => {
            const base = getLocalBase(item.sizeId);
            const live = base !== null ? getPrice(item.sizeId, base) : null;
            const display = live ? live.toLocaleString('en-IN') : '—';
            return { ...item, display };
        })
    , [getPrice]);

    return (
        <div className="home">

            {/* ══ HERO ══ */}
            <section className="hero-steel">
                <div className="hero-steel-backdrop" />
                <div className="hero-steel-overlay" />

                <div className="hero-steel-content">
                    {/* LEFT */}
                    <div className="hero-steel-left">
                        <div className="hero-eyebrow-tag">Nellore&apos;s Trusted Digital Steel Supplier</div>

                        {/* ✅ Koray-aligned H1 — now server-rendered, visible to Google on first crawl */}
                        <h1 className="hero-big-heading">
                            Wholesale Steel Supplier<br />
                            <span className="hero-accent-line">in Nellore, Andhra Pradesh</span>
                        </h1>

                        <div className="hero-promise-lines">
                            <div className="hero-promise"><span className="hero-check">✓</span> Transparent Rates.</div>
                            <div className="hero-promise"><span className="hero-check">✓</span> Fastest Delivery.</div>
                            <div className="hero-promise"><span className="hero-check">✓</span> 100% GST Invoice.</div>
                        </div>

                        <div className="hero-cta-row">
                            <Link href="/products/tmt-bars" className="hero-btn-primary">
                                Shop Steel Now
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                            </Link>
                            <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer" className="hero-btn-wa">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                Quick Quote
                            </a>
                        </div>
                    </div>

                    {/* RIGHT: Rate Card */}
                    <div className="hero-rate-card">
                        <div className="rate-card-header">
                            <div className="rate-card-title">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                TODAY&apos;S STEEL RATE CARD
                            </div>
                            <Link href="/products/tmt-bars" className="rate-card-view-all">View All Rates →</Link>
                        </div>

                        <table className="rate-table">
                            <thead>
                                <tr><th>Product</th><th>Unit</th><th>Price</th></tr>
                            </thead>
                            <tbody>
                                {rateRows.map(row => (
                                    <tr key={row.sizeId}>
                                        <td><Link href={`/products/${row.slug}`}>{row.label}</Link></td>
                                        <td>{row.unit}</td>
                                        <td className="rate-price">₹ {row.display}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="rate-card-footer">
                            <span>* Rates updated on {today}, 09:00 AM</span>
                            <button className="rate-refresh-btn" onClick={() => window.location.reload()}>
                                <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Update Rates
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Bar */}
            <section className="features-bar">
                <div className="features-inner">
                    {features.map((f, i) => (
                        <div key={i} className="feature-item">
                            <span className="feature-icon-svg" style={{ fontSize: '20px' }}>{f.icon}</span>
                            <div className="feature-text-group">
                                <span className="feature-label">{f.label}</span>
                                <span className="feature-sub">{f.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Product Categories */}
            <section className="container section section-centered">
                <div className="section-header">
                    <h2>Shop Steel by Category</h2>
                    <span className="text-light">Browse our complete steel range — live prices updated daily</span>
                </div>
                <div className="categories-grid">
                    {categories.map((cat, i) => (
                        <Link key={cat.id} href={`/products/${cat.id}`} className="category-card" style={{ animationDelay: `${i * 0.06}s` }}>
                            <div className="category-image-wrap">
                                <img src={cat.image} alt={cat.name} className="category-img" loading="lazy" />
                            </div>
                            <div className="category-label"><h3>{cat.name}</h3></div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Why LOOHA */}
            <section className="why-section">
                <div className="container section section-centered">
                    <div className="section-header">
                        <h2>Why Choose <span className="text-accent">LOOHA TECHNOLOGIES?</span></h2>
                        <span className="text-light">Built different — transparent, digital, zero credit</span>
                    </div>
                    <div className="why-grid">
                        {whyLooha.map((item, i) => (
                            <div key={i} className="why-card" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="why-number">{String(i + 1).padStart(2, '0')}</div>
                                <h4>{item.title}</h4>
                                <p>{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="stats-section">
                <div className="stats-overlay" />
                <div className="container stats-content section-centered">
                    <h2><span className="text-accent">LOOHA TECHNOLOGIES</span> — Nellore&apos;s most transparent steel platform</h2>
                    <div className="stats-grid">
                        {stats.map((s, i) => (
                            <div key={i} className="stat-item" style={{ animationDelay: `${i * 0.15}s` }}>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trusted By */}
            <section className="container section section-centered">
                <div className="section-header">
                    <h2>Built For <span className="text-accent">Every Steel Buyer</span></h2>
                    <span className="text-light">From individual contractors to large industries</span>
                </div>
                <div className="customers-grid">
                    {customers.map((name, i) => (
                        <div key={i} className="customer-item"><span>{name}</span></div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section className="how-section">
                <div className="container section section-centered">
                    <div className="section-header">
                        <h2>How It Works</h2>
                        <span className="text-light">Order steel in 4 simple steps</span>
                    </div>
                    <div className="how-steps">
                        {[
                            { step: '01', title: 'Browse Products',   desc: 'Select your steel category and size from live price listings' },
                            { step: '02', title: 'Calculate Price',   desc: 'Enter quantity — we show exact weight, loading, transport & GST' },
                            { step: '03', title: 'Pay Securely',      desc: 'Pay 100% online via UPI, card, or net banking — confirmed instantly' },
                            { step: '04', title: 'Track Delivery',    desc: 'Get real-time status updates from loading to doorstep delivery' },
                        ].map((s, i) => (
                            <div key={i} className="how-step">
                                <div className="how-step-number">{s.step}</div>
                                <h4>{s.title}</h4>
                                <p>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="cta-section">
                <div className="container cta-content">
                    <h2>Ready to order steel at the best prices?</h2>
                    <p>Join LOOHA TECHNOLOGIES — Nellore&apos;s transparent, no-credit digital steel platform</p>
                    <div className="cta-buttons">
                        <Link href="/products/tmt-bars" className="btn btn-accent btn-lg">Start Shopping →</Link>
                        <Link href="/register" className="btn btn-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>
                            Register Free
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
