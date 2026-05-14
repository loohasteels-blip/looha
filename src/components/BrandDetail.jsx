'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { brands } from './Brands';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import './Brands.css';

const SIZES = [
  { label: '8mm TMT Bars', kg: 5.92 },
  { label: '10mm TMT Bars', kg: 9.25 },
  { label: '12mm TMT Bars', kg: 13.32 },
  { label: '16mm TMT Bars', kg: 23.68 },
  { label: '20mm TMT Bars', kg: 37.0 },
  { label: '25mm TMT Bars', kg: 57.8 },
  { label: '32mm TMT Bars', kg: 94.8 },
];

const WHY_LOOHA = [
  { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M3 3h7.5a2 2 0 011.414.586l8 8a2 2 0 010 2.828l-4.5 4.5a2 2 0 01-2.828 0l-8-8A2 2 0 013 9.5V5a2 2 0 012-2z" /></svg>, text: 'Lowest Pricing' },
  { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>, text: 'Verified Suppliers' },
  { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" /></svg>, text: 'Fast Delivery' },
  { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>, text: 'Quality Assured' },
  { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="2" y="7" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 01-8 0M2 11h20" /></svg>, text: 'Secure Payments' },
  { icon: <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>, text: 'Instant Support' },
];

export default function BrandDetail() {
  const { brandId } = useParams();
  const brand = brands.find(b => b.id === brandId);
  const [quantities, setQuantities] = useState({});
  const [phone, setPhone] = useState('');

  if (!brand) {
    return (
      <div className="container section" style={{ textAlign: 'center', padding: '80px 24px' }}>
        <h2>Brand not found</h2>
        <Link href="/brands" className="btn btn-primary" style={{ marginTop: 16 }}>← Back to Brands</Link>
      </div>
    );
  }

  const handleQtyChange = (sizeLabel, field, value) => {
    setQuantities(prev => ({ ...prev, [sizeLabel]: { ...prev[sizeLabel], [field]: value } }));
  };

  const whatsappMsg = `Hi, I'm interested in ${brand.name} steel products. Please share current prices.`;

  return (
    <div className="brand-detail-page page">
      <div className="container">

        {/* Breadcrumb */}
        <nav className="breadcrumb" style={{ marginBottom: 20 }}>
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/brands">Brands</Link>
          <span>/</span>
          <span>{brand.name}</span>
        </nav>

        {/* Brand Header */}
        <div className="brand-header-card">
          <div className="brand-header-logo" style={!brand.logo ? { background: brand.color + '12', borderColor: brand.color + '30' } : {}}>
            {brand.logo
              ? <img src={brand.logo} alt={brand.name} className="brand-header-logo-img"
                  onError={e => { e.currentTarget.style.display='none'; e.currentTarget.nextElementSibling.style.display='flex'; }}
                />
              : null
            }
            <span className="brand-header-initials" style={{ color: brand.color, display: brand.logo ? 'none' : 'block' }}>{brand.initials}</span>
          </div>
          <div>
            <h1 className="brand-header-name">{brand.name}</h1>
            <p className="brand-header-price">
              Starts from <strong>₹{brand.startingPrice.toLocaleString('en-IN')}/ton</strong>
            </p>
            <div className="brand-header-cats">
              {brand.categories.map(c => <span key={c} className="brand-cat-chip">{c}</span>)}
            </div>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="brand-detail-layout">

          {/* Left — Size Selector */}
          <div className="brand-detail-main">
            <h2 className="brand-section-title">Select Size & Quantity</h2>
            <p className="brand-section-sub">Enter pieces or tonnes for each size you need</p>

            <div className="size-rows">
              {SIZES.map(size => (
                <div key={size.label} className="size-row">
                  <div className="size-row-label">
                    <span className="size-name">{size.label}</span>
                    <span className="size-weight">{size.kg} kg/piece · 12m length</span>
                  </div>
                  <div className="size-row-inputs">
                    <input
                      type="number"
                      min="0"
                      placeholder="Pieces"
                      className="size-input"
                      value={quantities[size.label]?.pieces || ''}
                      onChange={e => handleQtyChange(size.label, 'pieces', e.target.value)}
                    />
                    <span className="size-or">or</span>
                    <input
                      type="number"
                      min="0"
                      placeholder="Tonnes"
                      className="size-input"
                      value={quantities[size.label]?.tonnes || ''}
                      onChange={e => handleQtyChange(size.label, 'tonnes', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'right', marginTop: 24 }}>
              <Link href="/login" className="btn btn-primary btn-lg">Login &amp; Get Best Price →</Link>
            </div>

            {/* SEO Article */}
            <div className="brand-article">
              <h2>Why Choose {brand.name} Steel?</h2>
              <p>{brand.name} is one of India's most trusted steel brands, widely used by contractors, builders, and infrastructure projects across Andhra Pradesh and Nellore. Their TMT bars meet strict BIS standards for strength, bendability, and corrosion resistance.</p>

              <h3>Key Benefits</h3>
              <ul>
                <li><strong>High Yield Strength</strong> — Fe 500 &amp; Fe 550D grades for long-lasting structures</li>
                <li><strong>Corrosion Resistant</strong> — Ideal for coastal climates like Nellore</li>
                <li><strong>Earthquake Resistant</strong> — Tested for seismic zones</li>
                <li><strong>BIS Certified</strong> — IS:1786:2008 compliance guaranteed</li>
              </ul>

              <h3>How to Buy {brand.name} Steel from LOOHA TECHNOLOGIES</h3>
              <ol>
                <li>Select the size and quantity above</li>
                <li>Log in to get your confirmed price with GST breakdown</li>
                <li>Pay 100% advance — zero credit hassle</li>
                <li>Get delivery to your site in Nellore or anywhere in AP</li>
              </ol>
            </div>
          </div>

          {/* Right — Sidebar */}
          <div className="brand-detail-sidebar">

            {/* Best Price Estimator */}
            <div className="sidebar-card sidebar-estimator">
              <div className="sidebar-estimator-badge">BEST PRICE</div>
              <h3>Get Best Price</h3>
              <p>View live pricing in 2 steps</p>
              <ol className="estimator-steps">
                <li>Enter size &amp; quantity</li>
                <li>View best price instantly</li>
              </ol>
            </div>

            {/* Talk to Expert */}
            <div className="sidebar-card sidebar-expert">
              <h3>Talk to a Steel Expert</h3>
              <p className="sidebar-expert-sub">For today's price and discount</p>
              <input
                type="tel"
                placeholder="Enter your phone number"
                className="input"
                maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value)}
                style={{ marginBottom: 12 }}
              />
              <button className="btn btn-primary btn-block">Request a Call Back</button>
              <div className="sidebar-divider"><span>or</span></div>
              <a
                href={buildWhatsAppUrl(`Hi! I want to enquire about ${brand.name} steel. Please help me with pricing.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-success btn-block"
              >
                💬 Message on WhatsApp
              </a>
            </div>

            {/* Why LOOHA */}
            <div className="sidebar-card sidebar-why">
              <h3>Why LOOHA TECHNOLOGIES?</h3>
              <ul className="sidebar-why-list">
                {WHY_LOOHA.map(w => (
                  <li key={w.text} className="sidebar-why-item">
                    <span className="sidebar-why-icon">{w.icon}</span>
                    <span>{w.text}</span>
                  </li>
                ))}
              </ul>
              <Link href="/login" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>
                Connect with our expert
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
