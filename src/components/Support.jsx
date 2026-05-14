'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import './Support.css';

const faqs = [
  {
    q: 'How do I place an order on Looha?',
    a: 'Browse our product categories, select the steel product and size you need, add it to your cart, and proceed to checkout. You can also WhatsApp or call us directly for bulk orders.',
  },
  {
    q: 'What is the minimum order quantity?',
    a: 'Minimum order quantity varies by product. For TMT Bars it is typically 1 tonne. For pipes and sheets, it is per bundle. Contact us for exact details on your product.',
  },
  {
    q: 'Do you offer credit or payment on delivery?',
    a: 'No. Looha operates on a 100% advance payment model. This ensures transparent pricing with zero hidden charges and allows us to offer you the best market rates.',
  },
  {
    q: 'How long does delivery take in Nellore?',
    a: 'Standard delivery within Nellore city is 1–2 business days. For areas outside Nellore in Andhra Pradesh, it is 2–4 business days depending on location.',
  },
  {
    q: 'Do you provide GST invoices?',
    a: 'Yes. Every order comes with a proper GST invoice that you can use for your books of accounts and ITR filing.',
  },
  {
    q: 'How are steel prices determined?',
    a: 'Our prices are updated every morning based on the prevailing market rates from manufacturers like TATA, JSW, Vizag Steel, and Jindal. You always get today\'s correct price.',
  },
  {
    q: 'Can I track my order?',
    a: 'Yes. Log in to your Looha account and go to "Track Orders" in your dashboard to view real-time status of your order.',
  },
  {
    q: 'What brands do you supply?',
    a: 'We supply TATA Tiscon, Vizag Steel (RINL), JSW Neo, Jindal Panther, SAIL, APL Apollo, Surya Roshni, Kamdhenu, Shyam Steel, and more. Visit our Brands page to see the full list.',
  },
  {
    q: 'Can I cancel or return an order?',
    a: 'Cancellations are accepted only before the order is dispatched. Once dispatched, steel products cannot be returned due to the nature of the material. Contact us immediately if you need to cancel.',
  },
  {
    q: 'Do you deliver outside Nellore?',
    a: 'Yes, we deliver across Andhra Pradesh. For locations outside Nellore city, transport charges may apply. Contact us for a delivery quote to your location.',
  },
];

export default function Support() {
  const [openFaq, setOpenFaq] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const msg = `Hi Looha Support,\n\nName: ${form.name}\nPhone: ${form.phone}\n\nMessage: ${form.message}`;
    window.open(`https://wa.me/918885999718?text=${encodeURIComponent(msg)}`, '_blank');
    setSubmitted(true);
  };

  return (
    <div className="support-page page">

      {/* Hero */}
      <div className="support-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span>/</span>
            <span>Support</span>
          </nav>
          <h1>How can we help you?</h1>
          <p>Questions, orders, feedback — we&apos;re here for all of it. Mon–Sat, 9 AM – 7 PM.</p>
        </div>
      </div>

      {/* Contact Cards */}
      <div className="container">
        <div className="support-contact-grid">
          <a href="tel:+918885999718" className="support-contact-card">
            <div className="support-contact-icon">📞</div>
            <div>
              <div className="support-contact-label">CALL US</div>
              <div className="support-contact-value">+91 88859 99718</div>
              <div className="support-contact-sub">Mon–Sat, 9 AM – 7 PM</div>
            </div>
          </a>
          <a
            href="https://wa.me/918885999718?text=Hello%20Looha%2C%20I%20need%20support"
            target="_blank"
            rel="noopener noreferrer"
            className="support-contact-card support-contact-card--green"
          >
            <div className="support-contact-icon">💬</div>
            <div>
              <div className="support-contact-label">WHATSAPP US</div>
              <div className="support-contact-value">+91 88859 99718</div>
              <div className="support-contact-sub">Instant response</div>
            </div>
          </a>
          <a href="mailto:support@looha.in" className="support-contact-card">
            <div className="support-contact-icon">📧</div>
            <div>
              <div className="support-contact-label">EMAIL US</div>
              <div className="support-contact-value">support@looha.in</div>
              <div className="support-contact-sub">Reply within 24 hours</div>
            </div>
          </a>
          <div className="support-contact-card support-contact-card--navy">
            <div className="support-contact-icon">📍</div>
            <div>
              <div className="support-contact-label">VISIT US</div>
              <div className="support-contact-value" style={{ fontSize: '0.95rem' }}>Near Mulapet Gate Centre</div>
              <div className="support-contact-sub">Nellore, AP – 524003</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: FAQ + Form */}
      <div className="container support-main">

        {/* FAQ Section */}
        <div className="support-faq">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={`faq-item${openFaq === i ? ' open' : ''}`}
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="faq-question">
                  <span>{faq.q}</span>
                  <span className="faq-chevron">{openFaq === i ? '▲' : '▼'}</span>
                </div>
                {openFaq === i && (
                  <div className="faq-answer">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="support-form-col">
          <div className="support-form-card">
            <h2>Send Us a Message</h2>
            <p className="support-form-sub">Tell us your requirements and we'll get back to you on WhatsApp.</p>
            {submitted ? (
              <div className="support-form-success">
                <div style={{ fontSize: '2.5rem' }}>✅</div>
                <h3>Message Sent!</h3>
                <p>We've opened WhatsApp with your message. Our team will respond shortly.</p>
                <button className="btn btn-primary mt-2" onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', message: '' }); }}>
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="support-form">
                <div className="input-group">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="e.g. Ravi Kumar"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>Mobile Number *</label>
                  <input
                    type="tel"
                    className="input"
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '') })}
                    required
                  />
                </div>
                <div className="input-group">
                  <label>How can we help? *</label>
                  <textarea
                    className="input"
                    rows={5}
                    placeholder="Describe your query — product, size, quantity, delivery location..."
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    required
                    style={{ resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="btn btn-accent btn-block" style={{ marginTop: 8 }}>
                  📲 Send via WhatsApp →
                </button>
              </form>
            )}
          </div>

          {/* Quick Links */}
          <div className="support-quick-links">
            <h3>Quick Links</h3>
            <div className="support-quick-grid">
              <Link href="/orders" className="support-quick-item">?? Track My Order</Link>
              <Link href="/brands" className="support-quick-item">?? All Brands</Link>
              <Link href="/products/tmt-bars" className="support-quick-item">?? TMT Bars</Link>
              <Link href="/products/ms-pipes-tubes" className="support-quick-item">?? MS Pipes</Link>
              <Link href="/privacy" className="support-quick-item">?? Privacy Policy</Link>
              <Link href="/terms" className="support-quick-item">?? Terms & Conditions</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
