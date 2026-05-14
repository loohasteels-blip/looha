'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import './ShippingPolicy.css';

const sections = [
  {
    id: 'legal-acceptance',
    title: 'Legal Acceptance',
    content: 'By accessing or using Looha.in ("Platform"), you agree to be bound by these Terms & Conditions, our Privacy Policy, and all applicable laws and regulations, including the Information Technology Act 2000, Indian Contract Act 1872, GST Laws, and Consumer Protection Laws. This document is an electronic record and does not require physical or digital signatures.',
    items: [],
  },
  {
    id: 'eligibility',
    title: 'Eligibility',
    items: [
      'You must be at least 18 years old or a legally authorised representative of a registered company.',
      'You confirm that all information provided during registration and transactions is true, lawful, and accurate.',
    ],
  },
  {
    id: 'platform-ownership',
    title: 'Platform Ownership & Access',
    items: [
      'This Platform is owned and operated by Looha Technologies Pvt. Ltd., having its registered office at Near Mulapet Gate Centre, Nellore, Andhra Pradesh — 524003.',
      'We reserve the right to modify, suspend, or terminate access at any time without prior notice.',
    ],
  },
  {
    id: 'definitions',
    title: 'Key Definitions',
    items: [
      'User / You: Any person or business using the Platform.',
      'Services: Sale, listing, logistics, and support for steel products.',
      'Transaction: Any order, purchase, or commercial action on the Platform.',
      'Contractor: Independent suppliers or logistics partners engaged by Looha Technologies.',
      'User Content: Reviews, documents, feedback, or any material posted by users.',
    ],
  },
  {
    id: 'account-verification',
    title: 'Account & Verification',
    items: [
      'You must register using a valid mobile number and OTP / password.',
      'KYC documents (PAN, GSTIN, Aadhaar / CIN) may be required based on user type and order value.',
      'You are solely responsible for maintaining the confidentiality and security of your account credentials.',
    ],
  },
  {
    id: 'orders-pricing-payment',
    title: 'Orders, Pricing & Payment',
    items: [
      'All prices are in Indian Rupees (INR) and exclusive of GST, unless explicitly stated otherwise.',
      'Orders are confirmed only upon successful payment (full or agreed partial amount).',
      'Accepted payment methods: NEFT, RTGS, UPI, Debit/Credit Cards, Wallets, Cheque, and Finance Partners.',
      'Looha Technologies deducts TDS/TCS as per the Income Tax Act and GST Act wherever applicable.',
      'We operate on 100% advance payment — zero credit, zero risk.',
    ],
    highlight: '⚡ Looha Technologies operates on a 100% advance-payment model. No credit is extended. This ensures transparent, risk-free transactions for all parties.',
  },
  {
    id: 'delivery-fulfilment',
    title: 'Delivery & Fulfilment',
    items: [
      'Delivery estimates are indicative only and subject to external factors such as weather, transport, and logistics.',
      'We are not liable for delays after the material has been dispatched from our warehouse or supplier.',
      'Proof of delivery, photographs, and weighbridge reports must be retained for any future claims.',
    ],
  },
  {
    id: 'cancellation-returns-refunds',
    title: 'Cancellation, Returns & Refunds',
    items: [
      'Wrong or Damaged Material: Must be reported within 24 hours of delivery with photographic and written evidence.',
      'Short Supply: Claims must include a weighbridge slip, invoice, and receiver confirmation.',
      'Cancellation Before Dispatch: Allowed subject to deduction of applicable processing fees.',
      'Refunds: Processed to the original payment method within 7–10 business days after approval.',
    ],
  },
  {
    id: 'compliance-restrictions',
    title: 'Compliance & Usage Restrictions',
    content: 'You must NOT:',
    items: [
      'Violate any applicable law (GST, FEMA, IT Act, etc.).',
      'Upload defamatory, misleading, or unauthorised content.',
      'Use bots, malware, or unauthorised scrapers on our Platform.',
      "Impersonate others or damage Looha Technologies' infrastructure or reputation.",
    ],
    subContent: 'You MUST:',
    subItems: [
      'Maintain accurate business records.',
      'Use the Platform lawfully and ethically.',
      'Follow data privacy, KYC, and anti-fraud protocols as required.',
    ],
  },
  {
    id: 'intellectual-property',
    title: 'Intellectual Property',
    items: [
      'All content, designs, UI/UX, logos, software, and trademarks on this Platform are the exclusive property of Looha Technologies Pvt. Ltd. or its licensors.',
      'Any unauthorised use, reproduction, redistribution, or commercial application is strictly prohibited and may attract legal action.',
    ],
  },
  {
    id: 'platform-role',
    title: 'Platform Role & Intermediary Clause',
    items: [
      'Looha Technologies is a technology-driven steel distribution platform, not a contracting party between independent buyers and third-party suppliers.',
      'All direct-supply transactions are contracts between the buyer and the seller / logistics partner.',
      'Looha Technologies bears no liability for defaults by independent suppliers, transporters, or finance partners.',
    ],
  },
  {
    id: 'privacy-data',
    title: 'Privacy & Data Protection',
    items: [
      'Your data is collected, stored, and shared in compliance with our Privacy Policy.',
      'We may share relevant data with trusted third parties (e.g., payment gateways, logistics providers) solely to fulfil your order.',
      'You may contact our Grievance Officer to raise privacy or misuse-related complaints.',
    ],
  },
  {
    id: 'limitation-liability',
    title: 'Limitation of Liability',
    content: 'Looha Technologies is not liable for:',
    items: [
      'Indirect, punitive, or consequential losses arising from Platform use.',
      'Delays or failures caused by third parties including logistics partners.',
      'Any claim exceeding the value of the specific transaction in dispute.',
    ],
    subContent: 'Platform usage is entirely at your own risk.',
  },
  {
    id: 'dispute-resolution',
    title: 'Dispute Resolution',
    items: [
      'Governing Law: Laws of India.',
      'Jurisdiction: Courts of Nellore, Andhra Pradesh.',
      'Arbitration: In case of unresolved disputes within 30 days, arbitration will be held under the Arbitration and Conciliation Act, 1996.',
      'Language: English.',
      'Mode: Remote / Virtual Arbitration is permitted. Fast-Track Arbitration under Section 29B may be initiated.',
    ],
  },
  {
    id: 'force-majeure',
    title: 'Force Majeure',
    content: 'Looha Technologies shall not be held liable for non-performance caused by:',
    items: [
      'Natural calamities (e.g., floods, earthquakes, cyclones).',
      'Government orders, restrictions, or regulatory actions.',
      'Transportation or supply chain disruptions beyond our control.',
      'Strikes, wars, pandemics, or other unforeseeable events.',
    ],
  },
  {
    id: 'termination',
    title: 'Termination of Access',
    content: 'We may, at our sole discretion:',
    items: [
      'Suspend or permanently block your account for fraud, non-compliance, or misuse.',
      'Hold or reverse payments pending dispute investigation or regulatory review.',
    ],
  },
  {
    id: 'amendments',
    title: 'Amendments',
    items: [
      'These Terms & Conditions may be updated at any time without prior notice.',
      'It is your responsibility to review the terms periodically.',
      'Continued usage of the Platform implies automatic acceptance of the latest version.',
    ],
    highlight: '📋 Last Updated: 12 July 2025. For questions, contact grievance@looha.in — Monday to Saturday, 9 AM – 6 PM.',
  },
];

export default function TermsConditions() {
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
      <div className="policy-page-header">
        <div className="policy-page-header-inner">
          <div className="breadcrumb">
            <Link href="/">Home</Link><span className="sep">›</span><span>Terms &amp; Conditions</span>
          </div>
          <h1>Terms &amp; Conditions</h1>
          <div className="policy-meta-row">
            <span><strong>Effective Date:</strong> 12 July 2025</span>
            <span><strong>Last Updated:</strong> 12 July 2025</span>
            <span><strong>Entity:</strong> Looha Technologies Pvt. Ltd.</span>
          </div>
        </div>
      </div>

      <div className="policy-layout">
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

        <main className="policy-content">
          {sections.map((s) => (
            <section className="policy-section" id={s.id} key={s.id}>
              <h2>{s.title}</h2>
              {s.content && <p>{s.content}</p>}
              {s.items?.length > 0 && (
                <ul className="policy-list">
                  {s.items.map((item, i) => <li className="policy-list-item" key={i}>{item}</li>)}
                </ul>
              )}
              {s.subContent && <p style={{ marginTop: 18 }}>{s.subContent}</p>}
              {s.subItems && (
                <ul className="policy-list">
                  {s.subItems.map((item, i) => <li className="policy-list-item" key={i}>{item}</li>)}
                </ul>
              )}
              {s.highlight && <div className="policy-highlight-box">{s.highlight}</div>}
            </section>
          ))}

          <div className="policy-cta-box">
            <h3>Have Questions About Our Terms?</h3>
            <p>Contact our support team for any clarifications on our policies, your account, or transaction terms.</p>
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
