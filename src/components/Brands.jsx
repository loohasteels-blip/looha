'use client'
import Link from 'next/link';
import { useState } from 'react';
import { brands } from '../data/brands';
import './Brands.css';


const ALL_CATS = ['All', 'TMT Bars', 'MS Pipes & Tubes', 'MS Beams', 'MS Channels', 'MS Sheets', 'GI / GP Sheets', 'GI Pipes & Tubes', 'GP Pipes & Tubes'];


export default function Brands() {
  const [activeTab, setActiveTab] = useState('All');

  const filtered = activeTab === 'All'
    ? brands
    : brands.filter(b => b.categories.includes(activeTab));

  return (
    <div className="brands-page page">
      {/* Page Hero */}
      <div className="brands-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>All Brands</span>
          </nav>
          <h1>Top Steel Brands in Nellore</h1>
          <p className="brands-hero-sub">Buy from India's most trusted steel manufacturers — transparent pricing, 100% genuine products</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="brands-tabs-wrap">
        <div className="container brands-tabs">
          {ALL_CATS.map(cat => (
            <button
              key={cat}
              className={`brands-tab${activeTab === cat ? ' active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Brands Grid */}
      <div className="container section">
        {filtered.length === 0 ? (
          <div className="brands-empty">No brands available in this category yet.</div>
        ) : (
          <div className="brands-grid">
            {filtered.map(brand => (
              <Link key={brand.id} href={`/brands/${brand.id}`} className="brand-card">
                <div className="brand-logo-box">
                  {brand.logo
                    ? <img
                        src={brand.logo}
                        alt={brand.name}
                        className="brand-logo-img"
                        onError={e => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling.style.display = 'flex';
                        }}
                      />
                    : null
                  }
                  <div
                    className="brand-initials"
                    style={{ color: brand.color, background: brand.color + '12', display: brand.logo ? 'none' : 'flex' }}
                  >
                    {brand.initials}
                  </div>
                </div>
                <div className="brand-card-info">
                  <span className="brand-card-name">{brand.name}</span>
                  <span className="brand-card-tag">{brand.tagline}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
