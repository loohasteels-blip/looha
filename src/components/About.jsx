'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import './About.css';

/* ── Animated counter hook ── */
function useCountUp(ref, target, duration = 1800) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target).toLocaleString('en-IN');
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref, target, duration]);
}

/* ── Scroll-reveal hook ── */
function useReveal(selector, stagger = 120) {
  useEffect(() => {
    const items = document.querySelectorAll(selector);
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * stagger);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [selector, stagger]);
}

export default function About() {
  /* Counter refs */
  const refYears = useRef(null);
  const refCities = useRef(null);
  const refGen = useRef(null);
  const refClients = useRef(null);

  useCountUp(refYears, 57);
  useCountUp(refCities, 3, 800);
  useCountUp(refGen, 3, 800);
  useCountUp(refClients, 1000);

  /* Scroll reveals */
  useReveal('.about-timeline-item', 150);
  useReveal('.about-value-card', 100);

  return (
    <>
      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="container about-hero-inner">
          <div className="about-hero-badge">Since 1967 · Nellore, Andhra Pradesh</div>
          <h1>Built on Steel.<br />Rooted in <span>Family.</span></h1>
          <p className="about-hero-sub">
            From a small rolling shutter workshop in Nellore to one of the most trusted
            steel suppliers across Nellore, Tirupati and Ongole — our journey spans over
            six decades of honest work and lasting relationships.
          </p>
          <div className="about-hero-stats">
            <div>
              <div className="about-hero-stat-num">55+</div>
              <div className="about-hero-stat-label">Years of Legacy</div>
            </div>
            <div>
              <div className="about-hero-stat-num">3</div>
              <div className="about-hero-stat-label">Cities Served</div>
            </div>
            <div>
              <div className="about-hero-stat-num">3rd Gen</div>
              <div className="about-hero-stat-label">Family Business</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BREADCRUMB ── */}
      <div className="container" style={{ paddingTop: 20, paddingBottom: 4 }}>
        <div className="breadcrumb">
          <Link href="/">Home</Link>
          <span className="sep">›</span>
          <span>About Us</span>
        </div>
      </div>

      {/* ── OUR STORY ── */}
      <section className="about-story">
        <div className="container">
          <div className="about-story-grid">
            {/* Image */}
            <div className="about-story-img-wrap">
              <img
                className="about-story-img"
                src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&q=85&fit=crop"
                alt="Steel rods stacked at a supply yard in India"
              />
              <div className="about-story-img-tag">
                <div className="year">1967</div>
                <div className="year-label">Founded</div>
              </div>
            </div>

            {/* Text */}
            <div className="about-story-text">
              <div className="about-section-label">Our Story</div>
              <h2>Where It All <span>Began</span></h2>
              <p>
                Our journey started in Nellore in 1967, when our grandfather founded{' '}
                <strong>Balaji Rolling Shutters</strong> — a modest workshop specializing
                in rolling shutter manufacturing and structural fabrication work. Every
                weld was made with pride; every client served like family.
              </p>
              <p>
                With years of hard work, trust, and unwavering quality, the next generation
                expanded the business into <strong>steel wholesale supply</strong> across
                Nellore and Ongole. Today, we are proud to be one of the trusted and leading
                steel suppliers serving Nellore, Tirupati, and Ongole.
              </p>
              <p>
                We supply quality steel products for construction, fabrication, industrial,
                and commercial needs. Built on family values, honest pricing, and long-term
                customer relationships — our goal is simple:{' '}
                <em>reliable steel, dependable service, every time.</em>
              </p>
              <div style={{ marginTop: 28, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="tel:+918885999718" className="btn btn-accent btn-sm">
                  📞 Call Us
                </a>
                <a href="https://wa.me/918885999718" className="btn btn-outline btn-sm">
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="about-timeline">
        <div className="container">
          <div className="about-timeline-header">
            <div className="about-section-label">Our Journey</div>
            <h2>Six Decades of Steel &amp; Trust</h2>
          </div>
          <div className="about-timeline-track">
            {[
              {
                year: '1967',
                title: 'Balaji Rolling Shutters Founded',
                desc: 'Our grandfather established Balaji Rolling Shutters in Nellore — a workshop specializing in rolling shutter manufacturing and structural fabrication. Every weld was made with pride, every client served like family.',
              },
              {
                year: '2002',
                title: 'Indiansteels Founded',
                desc: 'Building on decades of trust and craftsmanship, the next generation launched Indiansteels — expanding into steel wholesale supply to serve the growing construction demands across Nellore and Ongole.',
              },
              {
                year: '2010',
                title: 'MBJ Steels Founded',
                desc: 'Continuing to scale and diversify, MBJ Steels was established, strengthening our regional presence and extending reliable steel supply to Tirupati and surrounding districts.',
              },
              {
                year: 'Today',
                title: 'Looha Technologies Pvt. Ltd.',
                desc: 'Now a digital-first steel distribution platform, Looha Technologies brings transparency, speed, and trust to steel procurement — serving contractors, retailers, and industries across Andhra Pradesh.',
              },
            ].map((item) => (
              <div className="about-timeline-item" key={item.year}>
                <div className="about-timeline-dot" />
                <div className="about-timeline-year">{item.year}</div>
                <div className="about-timeline-title">{item.title}</div>
                <div className="about-timeline-desc">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="about-stats">
        <div className="container">
          <div className="about-stats-grid">
            <div>
              <span className="about-stat-num" ref={refYears}>0</span>
              <div className="about-stat-desc">Years in Business</div>
            </div>
            <div>
              <span className="about-stat-num" ref={refCities}>0</span>
              <div className="about-stat-desc">Cities Served</div>
            </div>
            <div>
              <span className="about-stat-num" ref={refGen}>0</span>
              <div className="about-stat-desc">Generations of Family</div>
            </div>
            <div>
              <span className="about-stat-num" ref={refClients}>0</span>
              <div className="about-stat-desc">Happy Clients &amp; Growing</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="about-values">
        <div className="container">
          <div className="about-values-header">
            <div className="about-section-label">Why Choose Us</div>
            <h2>What We Stand For</h2>
            <p>Every ton of steel we supply carries decades of trust, family commitment, and a promise of quality.</p>
          </div>
          <div className="about-values-grid">
            {[
              { icon: '🏗️', title: 'Quality Steel Products', desc: 'We supply tested steel for construction, fabrication, industrial, and commercial projects. Quality you can build on — literally.' },
              { icon: '💰', title: 'Honest, Transparent Pricing', desc: 'No hidden charges. No inflated rates. Fair, market-aligned prices built on the same integrity our grandfather operated with since 1962.' },
              { icon: '🤝', title: 'Long-Term Relationships', desc: 'Our clients aren\'t just customers — they\'re partners. We believe in relationships that last beyond a single purchase, season after season.' },
              { icon: '🚚', title: 'Reliable Supply & Delivery', desc: 'Serving Nellore, Tirupati, and Ongole with consistent stock availability and dependable delivery timelines — so your project never stalls.' },
              { icon: '👨‍👩‍👦', title: 'Family Values at the Core', desc: 'Three generations of a family-run business means every interaction is personal, every promise is kept, and every client is treated like our own.' },
              { icon: '📍', title: 'Deep Local Roots', desc: 'Born and built in Nellore, we understand the local construction landscape and serve you with knowledge only locals have.' },
            ].map((v) => (
              <div className="about-value-card" key={v.title}>
                <div className="about-value-icon">{v.icon}</div>
                <div className="about-value-title">{v.title}</div>
                <div className="about-value-desc">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY ── */}
      <section className="about-gallery">
        <div className="container">
          <div className="about-gallery-header">
            <div className="about-section-label">Our Work</div>
            <h2>Steel That Builds Dreams</h2>
          </div>
          <div className="about-gallery-grid">
            {[
              { src: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=900&q=80&fit=crop', alt: 'Steel rods stacked in a warehouse' },
              { src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80&fit=crop', alt: 'Construction site with steel structure' },
              { src: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&q=80&fit=crop', alt: 'Industrial steel manufacturing' },
              { src: 'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&q=80&fit=crop', alt: 'Steel beams for construction' },
              { src: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&q=80&fit=crop', alt: 'Business partnership handshake' },
            ].map((img, i) => (
              <div className="about-gallery-item" key={i}>
                <img src={img.src} alt={img.alt} loading="lazy" />
                <div className="about-gallery-overlay" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <div className="container">
          <div className="about-cta-inner">
            <div className="about-section-label" style={{ color: 'var(--color-accent-light)', justifyContent: 'center' }}>
              Get In Touch
            </div>
            <h2>Ready to Source <span>Quality Steel?</span></h2>
            <p>
              Whether you're a builder, contractor, or fabricator — reach out today
              for the best steel prices and fastest supply across Nellore, Tirupati, and Ongole.
            </p>
            <div className="about-cta-buttons">
              <a href="tel:+918885999718" className="btn btn-accent btn-lg">
                📞 Call Now
              </a>
              <Link href="/support" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,0.3)', color: '#fff' }}>
                💬 Contact Us
              </Link>
            </div>
            <div className="about-cta-contact">
              <div className="about-cta-contact-item">
                <div className="about-cta-contact-icon">📍</div>
                <div>
                  <div className="about-cta-contact-label">Location</div>
                  <div className="about-cta-contact-value">Near Mulapet Gate, Nellore — 524003</div>
                </div>
              </div>
              <div className="about-cta-contact-item">
                <div className="about-cta-contact-icon">🕐</div>
                <div>
                  <div className="about-cta-contact-label">Working Hours</div>
                  <div className="about-cta-contact-value">Mon–Sat, 9 AM – 7 PM</div>
                </div>
              </div>
              <div className="about-cta-contact-item">
                <div className="about-cta-contact-icon">🌐</div>
                <div>
                  <div className="about-cta-contact-label">Serving</div>
                  <div className="about-cta-contact-value">Nellore · Tirupati · Ongole</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
