'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import './Brands.css';

export const brands = [
  {
    id: 'tata-tiscon',
    name: 'TATA Tiscon',
    logo: 'https://tatatiscon.co.in/samajhdar-banein-behtar-chunein/images/tata-tiscon-logo.png',
    initials: 'TT',
    color: '#003087',
    tagline: 'Fe 500D TMT Bars',
    startingPrice: 52000,
    categories: ['TMT Bars'],
    featured: true,
  },
  {
    id: 'vizag-steel',
    name: 'Vizag Steel',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN-Kd_sEx2xPXWI0FQ_NLCe4Z6SO7MZMY3xw&s',
    initials: 'VS',
    color: '#1a6b3c',
    tagline: 'RINL TMT Bars',
    startingPrice: 51500,
    categories: ['TMT Bars'],
    featured: true,
  },
  {
    id: 'jsw',
    name: 'JSW Neo',
    logo: 'https://5.imimg.com/data5/ANDROID/Default/2021/5/DY/JT/IB/126135785/img-20210519-160559-jpg.jpg',
    initials: 'JSW',
    color: '#e31e24',
    tagline: 'Pure TMT Bars',
    startingPrice: 52500,
    categories: ['TMT Bars'],
    featured: true,
  },
  {
    id: 'jindal',
    name: 'Jindal Panther',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkLOM8S-TGyZoQuELgeE6zj0oxbiON4kZcLA&s',
    initials: 'JP',
    color: '#004b87',
    tagline: 'Fe 500/550 TMT',
    startingPrice: 51800,
    categories: ['TMT Bars'],
    featured: true,
  },
  {
    id: 'sail',
    name: 'SAIL',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Steel_Authority_of_India_logo.svg',
    initials: 'SAIL',
    color: '#003f8a',
    tagline: 'Steel Authority of India',
    startingPrice: 51000,
    categories: ['TMT Bars', 'MS Beams', 'MS Channels'],
    featured: true,
  },
  {
    id: 'apl-apollo',
    name: 'APL Apollo',
    logo: 'https://tubepipeindia.com/wp-content/uploads/2025/05/apl-apollo.jpg',
    initials: 'APL',
    color: '#e63900',
    tagline: 'Pipes & Tubes',
    startingPrice: 53000,
    categories: ['MS Pipes & Tubes', 'GP Pipes & Tubes'],
    featured: true,
  },
  {
    id: 'surya-roshni',
    name: 'Surya Roshni',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDGkRFN6M8QmGff58jyCab4TyUlY7axaYVLQ&s',
    initials: 'SR',
    color: '#f7941d',
    tagline: 'Steel Pipes',
    startingPrice: 54000,
    categories: ['MS Pipes & Tubes', 'GP Pipes & Tubes'],
    featured: false,
  },
  {
    id: 'tata-pipes',
    name: 'TATA Pipes',
    logo: 'https://www.tatasteel.com/media/3659/tata-pipes.jpg',
    initials: 'TP',
    color: '#003087',
    tagline: 'GI & MS Pipes',
    startingPrice: 65000,
    categories: ['GI Pipes & Tubes'],
    featured: false,
  },
  {
    id: 'essar',
    name: 'Essar Steel',
    logo: 'https://i.pinimg.com/474x/0d/d2/f3/0dd2f3a028ac5a4ef5279c9953b97e39.jpg',
    initials: 'ESR',
    color: '#1a237e',
    tagline: 'HR/CR Sheets',
    startingPrice: 55000,
    categories: ['MS Sheets'],
    featured: false,
  },
  {
    id: 'bhushan',
    name: 'Bhushan Steel',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT07HRflDeBMpqHrZbt6mb8knjhPqP1X30t_Q&s',
    initials: 'BS',
    color: '#37474f',
    tagline: 'GI / GP Sheets',
    startingPrice: 64000,
    categories: ['GI / GP Sheets'],
    featured: false,
  },
  {
    id: 'kamdhenu',
    name: 'Kamdhenu',
    logo: 'https://5.imimg.com/data5/SELLER/Default/2022/5/XF/YT/HH/25595663/kamdhenu-steel.jpg',
    initials: 'KD',
    color: '#b71c1c',
    tagline: 'TMT Bars',
    startingPrice: 52200,
    categories: ['TMT Bars'],
    featured: false,
  },
  {
    id: 'shyam-steel',
    name: 'Shyam Steel',
    logo: 'https://campaigns.shyamsteel.com/retailindia/images/userlogo-review.png',
    initials: 'SS',
    color: '#0d47a1',
    tagline: 'Fe 500D TMT Bars',
    startingPrice: 51900,
    categories: ['TMT Bars'],
    featured: false,
  },
];

const ALL_CATS = ['All', 'TMT Bars', 'MS Pipes & Tubes', 'MS Beams', 'MS Channels', 'MS Sheets', 'GI / GP Sheets', 'GI Pipes & Tubes', 'GP Pipes & Tubes'];

import { useState } from 'react';

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
