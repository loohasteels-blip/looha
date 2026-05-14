'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import './ShippingPolicy.css';

const sections = [
  {
    id: 'coverage',
    title: 'Shipping Coverage',
    items: [
      'Looha Technologies delivers to all serviceable pin codes across India.',
      'Delivery to residential sites, construction sites, warehouses, and commercial locations.',
      'Currently serving Nellore, Tirupati, Ongole, and surrounding districts of Andhra Pradesh.',
      'Pan-India dispatch available for bulk orders above 10 MT — contact us for logistics terms.',
    ],
  },
  {
    id: 'processing-time',
    title: 'Order Processing Time',
    items: [
      'Orders confirmed before 12:00 PM (IST) are processed the same business day.',
      'Orders placed after 12:00 PM are processed the next working day.',
      'Processing time excludes Sundays and public holidays.',
      'You will receive an order confirmation via SMS and WhatsApp once payment is cleared.',
    ],
    highlight: '⚡ 100% advance payment is required. Orders are processed only after full payment confirmation.',
  },
  {
    id: 'delivery-timeline',
    title: 'Delivery Timeline',
    infoCards: [
      { icon: '🏙️', title: 'Nellore City', value: 'Same Day' },
      { icon: '🛣️', title: 'Nellore District', value: '1–2 Days' },
      { icon: '🗺️', title: 'AP & Telangana', value: '2–4 Days' },
      { icon: '🚚', title: 'Pan India', value: '4–7 Days' },
    ],
    items: [
      'Delivery timelines are estimates and may vary due to weather, transport, or logistics conditions.',
      'Peak construction season (October–March) may see increased lead times.',
      'Time-sensitive deliveries — contact us before placing the order for guaranteed scheduling.',
    ],
  },
  {
    id: 'shipping-charges',
    title: 'Shipping & Handling Charges',
    items: [
      'Loading charges: ₹500 per metric ton.',
      'Transport/delivery charges: ₹1,500 per metric ton.',
      'GST @ 18% applicable on all charges including loading and transport.',
      'Charges are calculated at checkout based on delivery location and order weight.',
      'Free delivery available for orders above 25 MT to select districts — contact sales.',
    ],
    highlight: '💡 All charges are itemised on your GST invoice for full transparency.',
  },
  {
    id: 'delivery-process',
    title: 'Delivery Process',
    items: [
      'A delivery challan (DC) is issued with every shipment — retain this for your records.',
      'A Test Certificate (TC) is provided with all branded materials.',
      'Ensure a site representative is available to receive and sign for the delivery.',
      'For crane-unloading or special site access, inform our team at least 24 hours in advance.',
      'Photograph the delivered material before unloading for your own records.',
    ],
  },
  {
    id: 'weighbridge',
    title: 'Weighbridge & Short Supply',
    items: [
      'All dispatches are weighed at an NABL-certified weighbridge before loading.',
      'A copy of the weighbridge slip is included with your delivery.',
      'Any short supply claim must be raised within 24 hours of delivery.',
      'Claims must be accompanied by the weighbridge slip, delivery challan, and invoice.',
    ],
  },
  {
    id: 'tracking',
    title: 'Order Tracking',
    items: [
      'Real-time tracking updates are sent via WhatsApp and SMS.',
      'You can track your order status on the Looha platform under "My Orders".',
      'For urgent tracking queries, call our logistics team at +91 88859 99718.',
    ],
  },
  {
    id: 'failed-delivery',
    title: 'Failed or Missed Delivery',
    items: [
      'If delivery fails due to incorrect address or no recipient available, we will attempt re-delivery.',
      'Additional transport charges may apply for re-delivery attempts.',
      'If two delivery attempts fail, the material will be returned to our warehouse and you will be notified.',
    ],
    highlight: '⚠️ Ensure your delivery address and site contact number are accurate before confirming your order.',
  },
  {
    id: 'damaged-delivery',
    title: 'Damaged Material on Arrival',
    items: [
      'Inspect all material before accepting delivery from the transporter.',
      'If material is visibly damaged in transit, note it on the delivery challan before signing.',
      'Report transit damage with photographs to support@looha.in within 24 hours.',
      'We will coordinate with the logistics partner and arrange replacement at no cost.',
    ],
  },
  {
    id: 'special-requirements',
    title: 'Special Delivery Requirements',
    items: [
      'Floor delivery, crane services, or offloading assistance can be arranged on request.',
      'Deliveries to high-rise projects, restricted sites, or gated communities — inform us in advance.',
      'Bulk project deliveries with phased schedules — contact our project coordination team.',
    ],
  },
  {
    id: 'holidays',
    title: 'Holidays & Non-Working Days',
    items: [
      'We operate Monday to Saturday, 9:00 AM to 6:00 PM IST.',
      'No dispatches on Sundays and national holidays (Pongal, Diwali, Republic Day, Independence Day).',
      'During festival seasons, please order 2–3 days in advance to avoid delays.',
    ],
  },
  {
    id: 'third-party-logistics',
    title: 'Third-Party Logistics',
    items: [
      'Looha Technologies partners with vetted transport and logistics providers for delivery.',
      'While we coordinate the delivery, the logistics partner is responsible for transit.',
      'Looha Technologies is not liable for delays caused by third-party transport failures beyond our control.',
    ],
  },
  {
    id: 'gst-documentation',
    title: 'GST & Documentation',
    items: [
      'A GST-compliant tax invoice is issued for every order.',
      'E-way bill (EWB) is generated for all inter-state and intra-state shipments above ₹50,000.',
      'GSTIN: 37GOUPS1032G1ZJ — Looha Technologies Pvt. Ltd.',
      'All documents (Invoice, DC, TC, Weighbridge slip) are shared digitally and/or physically.',
    ],
  },
  {
    id: 'cancellation',
    title: 'Cancellation Before Dispatch',
    items: [
      'Cancellations are accepted before the material is loaded for dispatch.',
      'A processing fee may be deducted from the refund for orders already in production or sourcing.',
      'Post-dispatch cancellations are not accepted.',
      'Refunds for approved cancellations are processed within 7–10 business days.',
    ],
  },
  {
    id: 'force-majeure',
    title: 'Force Majeure',
    items: [
      'Looha Technologies shall not be liable for failure or delay due to events beyond reasonable control.',
      'This includes natural disasters, strikes, pandemics, government restrictions, or transport disruptions.',
      'Customers will be notified promptly with revised timelines or refund options in such cases.',
    ],
  },
];

export default function ShippingPolicy() {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-10% 0px -80% 0px' }
    );
    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="policy-page">

      {/* ── Clean Header ── */}
      <div className="policy-page-header">
        <div className="policy-page-header-inner">
          <div className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="sep">›</span>
            <span>Shipping Policy</span>
          </div>
          <h1>Shipping Policy</h1>
          <div className="policy-meta-row">
            <span><strong>Effective Date:</strong> 12 July 2025</span>
            <span><strong>Last Updated:</strong> 12 July 2025</span>
            <span><strong>Entity:</strong> Looha Technologies Pvt. Ltd.</span>
          </div>
        </div>
      </div>

      {/* ── Two-column Layout ── */}
      <div className="policy-layout">

        {/* Sticky TOC Sidebar */}
        <aside className="policy-sidebar">
          <div className="policy-toc-label">On This Page</div>
          <nav className="policy-toc-nav">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`policy-toc-item${activeId === s.id ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollTo(s.id); }}
              >
                {s.title}
              </a>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="policy-content">
          {sections.map((s) => (
            <section className="policy-section" id={s.id} key={s.id}>
              <h2>{s.title}</h2>

              {s.highlight && !s.items?.length && (
                <div className="policy-highlight-box">{s.highlight}</div>
              )}

              {s.infoCards && (
                <div className="policy-info-grid">
                  {s.infoCards.map((card) => (
                    <div className="policy-info-card" key={card.title}>
                      <div className="policy-info-card-icon">{card.icon}</div>
                      <div className="policy-info-card-title">{card.title}</div>
                      <div className="policy-info-card-value">{card.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {s.items?.length > 0 && (
                <ul className="policy-list">
                  {s.items.map((item, i) => (
                    <li className="policy-list-item" key={i}>{item}</li>
                  ))}
                </ul>
              )}

              {s.highlight && s.items?.length > 0 && (
                <div className="policy-highlight-box">{s.highlight}</div>
              )}
            </section>
          ))}

          {/* CTA */}
          <div className="policy-cta-box">
            <h3>Questions About Your Shipment?</h3>
            <p>Reach our support team for tracking updates, delivery issues, or any policy clarifications.</p>
            <div className="policy-cta-btns">
              <a href="tel:+918885999718" className="btn-accent">📞 Call +91 88859 99718</a>
              <a href="https://wa.me/918885999718" className="btn-outline">💬 WhatsApp Us</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
