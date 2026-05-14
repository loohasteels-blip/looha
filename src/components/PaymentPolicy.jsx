'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import './ShippingPolicy.css';

const sections = [
  {
    id: 'overview',
    title: 'Overview',
    content: 'This Payment Policy governs all financial transactions conducted on the Looha Technologies platform (Looha.in). By placing an order on our platform, you agree to comply with the terms outlined in this policy. Looha Technologies Pvt. Ltd. is committed to providing a transparent, secure, and efficient payment experience for all buyers and sellers.',
    items: [],
  },
  {
    id: 'advance-payment',
    title: '100% Advance Payment Model',
    items: [
      'Looha Technologies operates exclusively on a 100% advance payment basis.',
      'No credit, no pay-later, and no deferred payment options are available on this platform.',
      'Orders are confirmed and processed only after full payment has been received and cleared.',
      'This model ensures price transparency, eliminates hidden charges, and protects both buyers and sellers.',
      'No material will be dispatched until payment is fully settled in our account.',
    ],
    highlight: '⚡ Zero credit. Zero risk. 100% advance payment ensures your order is locked in at the agreed price with no surprises.',
  },
  {
    id: 'accepted-methods',
    title: 'Accepted Payment Methods',
    content: 'We accept the following payment modes for all transactions on Looha.in:',
    items: [
      'NEFT (National Electronic Funds Transfer) — for same-day or next-day bank transfers.',
      'RTGS (Real Time Gross Settlement) — for high-value, real-time transfers above ₹2 lakhs.',
      'UPI (Unified Payments Interface) — for instant payments via PhonePe, Google Pay, BHIM, Paytm, etc.',
      'Debit Cards / Credit Cards — Visa, Mastercard, RuPay accepted via our payment gateway.',
      'Net Banking — supported for major Indian banks through our secured gateway.',
      'Cheque — accepted for select bulk orders above ₹5 lakhs (subject to clearance before dispatch).',
      'Finance Partners — EMI and trade finance options via our partnered NBFCs (on request).',
    ],
    highlight: '💳 All digital payments are processed through PCI-DSS compliant, encrypted payment gateways. Your card or bank details are never stored on our servers.',
  },
  {
    id: 'payment-confirmation',
    title: 'Payment Confirmation',
    items: [
      'Once payment is received, you will get an automated confirmation via SMS and WhatsApp within 15 minutes.',
      'A GST-compliant tax invoice will be issued within 24 hours of payment confirmation.',
      'Orders move into processing only after payment is confirmed in our system.',
      'For NEFT/RTGS transfers, share the transaction reference (UTR number) on WhatsApp (+91 88859 99718) to expedite confirmation.',
      'Cheque payments are subject to a 2–3 working day bank clearance period before order processing begins.',
    ],
  },
  {
    id: 'pricing-validity',
    title: 'Pricing & Price Validity',
    items: [
      'All prices displayed on Looha.in are in Indian Rupees (INR) and exclusive of GST unless explicitly stated.',
      'Steel prices are market-linked and subject to change without prior notice.',
      'The price at which your order is confirmed is the price applicable to your transaction.',
      'Prices quoted verbally or via WhatsApp/email are valid for the same business day only.',
      'Looha Technologies reserves the right to revise prices before an order is formally confirmed.',
    ],
    highlight: '📊 To lock your price, complete payment on the same day the quote is provided. Delayed payments may attract revised pricing.',
  },
  {
    id: 'gst-invoicing',
    title: 'GST & Tax Invoicing',
    items: [
      'GSTIN: 37GOUPS1032G1ZJ — Looha Technologies Pvt. Ltd.',
      'GST @ 18% is applicable on all products and services unless otherwise specified.',
      'A GST-compliant tax invoice is issued for every transaction.',
      'E-way bill (EWB) is generated for all shipments above ₹50,000 as required under GST law.',
      'Your GSTIN must be provided at the time of order placement for B2B GST credit.',
      'For individuals or businesses without GSTIN, invoices are raised as B2C transactions.',
    ],
  },
  {
    id: 'tds-tcs',
    title: 'TDS & TCS Compliance',
    items: [
      'Tax Collected at Source (TCS) under Section 206C(1H) of the Income Tax Act is applicable on transactions above ₹50 lakhs in a financial year.',
      'TCS is collected at 0.1% on the amount exceeding ₹50 lakhs from the same buyer in a financial year.',
      'Tax Deducted at Source (TDS) under Section 194Q is applicable for buyers with turnover above ₹10 crores.',
      'TDS certificates (Form 16A) must be shared with us within 30 days of the end of each quarter.',
      'All TDS/TCS amounts will be reconciled in your 26AS statement and reflected in our records.',
    ],
    highlight: '📋 Please share your PAN and GSTIN at the time of registration to ensure accurate TDS/TCS computation and compliance.',
  },
  {
    id: 'payment-security',
    title: 'Payment Security',
    items: [
      'All transactions on Looha.in are secured with 256-bit SSL encryption.',
      'Card payments are processed through RBI-authorised, PCI-DSS Level 1 compliant payment gateways.',
      'We do not store your card number, CVV, or net banking credentials on our servers.',
      'Looha Technologies will NEVER ask for your OTP, card PIN, or password via phone, SMS, or email.',
      'Two-factor authentication (2FA) is used for all high-value transaction approvals.',
    ],
    highlight: '🔒 If you receive any suspicious call or message asking for payment-related credentials, do not share any details. Report immediately to support@looha.in.',
  },
  {
    id: 'failed-payments',
    title: 'Failed & Declined Payments',
    items: [
      'If a payment fails due to a bank or gateway error, the amount will be automatically refunded within 5–7 working days.',
      'Do not retry the same failed payment more than once — check your bank statement before retrying.',
      'For payment failures during NEFT/RTGS, contact your bank with the UTR number for immediate resolution.',
      'Looha Technologies is not responsible for delays caused by third-party payment gateway failures.',
      'In case of duplicate payment, the excess amount will be refunded within 7–10 working days.',
    ],
  },
  {
    id: 'cancellation-refunds',
    title: 'Cancellation & Payment Refunds',
    items: [
      'Cancellations are accepted only before the material is loaded for dispatch.',
      'Refunds for approved cancellations are processed to the original payment source.',
      'Standard refund timeline: 7–10 working days after cancellation approval.',
      'A processing fee may be deducted for orders already in sourcing or production.',
      'Post-dispatch cancellations are not accepted under any circumstances.',
      'Partial refunds may apply for orders where sourcing has already been initiated.',
    ],
    highlight: '⚠️ Refunds for NEFT/RTGS payments may take additional 2–3 days depending on your bank\'s processing time.',
  },
  {
    id: 'bulk-orders',
    title: 'Bulk Order Payment Terms',
    content: 'For large-volume orders (above 25 MT or ₹10 lakhs), special payment arrangements may be considered:',
    items: [
      'Phased payment schedules may be offered for project-based bulk orders — contact our sales team.',
      'Letter of Credit (LC) from a scheduled Indian bank may be accepted for orders above ₹25 lakhs.',
      'Bank Guarantee (BG) arrangements are available for long-term supply contracts.',
      'All special payment terms must be agreed upon in writing before order confirmation.',
    ],
  },
  {
    id: 'currency',
    title: 'Currency & Jurisdiction',
    items: [
      'All transactions on Looha.in are conducted exclusively in Indian Rupees (INR).',
      'Foreign currency payments are not accepted at this time.',
      'All payment disputes are subject to the jurisdiction of courts in Nellore, Andhra Pradesh.',
      'Governing law: Laws of India, including the Payment and Settlement Systems Act, 2007.',
    ],
  },
  {
    id: 'payment-disputes',
    title: 'Payment Disputes',
    items: [
      'For any payment-related discrepancy, contact our accounts team at support@looha.in within 48 hours.',
      'Provide your order ID, UTR number, and payment screenshot for swift resolution.',
      'Chargeback requests raised without prior contact will be contested with transaction evidence.',
      'Disputes will be resolved within 15 working days of receiving complete documentation.',
    ],
  },
  {
    id: 'contact',
    title: 'Payment Support Contact',
    content: 'For all payment-related queries, reach our accounts team through:',
    items: [
      'Phone: +91 88859 99718 (Mon–Sat, 9 AM – 6 PM)',
      'Email: support@looha.in',
      'WhatsApp: +91 88859 99718',
      'Address: Near Mulapet Gate Centre, Nellore, Andhra Pradesh — 524003',
    ],
    highlight: '📋 Last Updated: 12 July 2025. This policy is subject to change in line with RBI guidelines and applicable Indian law.',
  },
];

export default function PaymentPolicy() {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((e) => { if (e.isIntersecting) setActiveId(e.target.id); }); },
      { rootMargin: '-10% 0px -80% 0px' }
    );
    sections.forEach((s) => { const el = document.getElementById(s.id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="policy-page">
      {/* ── Clean Header ── */}
      <div className="policy-page-header">
        <div className="policy-page-header-inner">
          <div className="breadcrumb">
            <Link href="/">Home</Link><span className="sep">›</span><span>Payment Policy</span>
          </div>
          <h1>Payment Policy</h1>
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
              <a key={s.id} href={`#${s.id}`}
                className={`policy-toc-item${activeId === s.id ? ' active' : ''}`}
                onClick={(e) => { e.preventDefault(); scrollTo(s.id); }}>
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
              {s.content && <p>{s.content}</p>}
              {s.highlight && !s.items?.length && (
                <div className="policy-highlight-box">{s.highlight}</div>
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
            <h3>Payment Questions?</h3>
            <p>Our accounts team is available Mon–Sat, 9 AM to 6 PM to assist with payment confirmations, invoices, and refund status.</p>
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
