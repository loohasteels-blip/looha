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
    content: 'This Return Policy applies to all items purchased through the Looha Technologies platform (Looha.in) after the material has been dispatched by our warehouse or logistics partners. We maintain strict quality checks before dispatch; however, we have a clear and fair process in place for all return, replacement, and refund situations.',
    highlight: '⚠️ As a general rule, once material is delivered as per the order specifications, it cannot be returned. Returns are only accepted under specific conditions listed below.',
    items: [],
  },
  {
    id: 'eligible-returns',
    title: 'Eligible Return Conditions',
    content: 'Returns and replacements are accepted only under the following circumstances:',
    items: [
      'Wrong Item Delivered: The delivered material is different from what was ordered (e.g., wrong grade, wrong size, wrong product type).',
      'Quality Defect: The material has a confirmed manufacturing defect, is in rusted/pitted condition upon delivery, or fails a test conducted at a standard laboratory.',
      'Short Supply / Weight Shortage: The delivered quantity or weight is significantly less than what was invoiced.',
      'Surplus Material: Unused, undamaged material remaining after project completion (subject to conditions in Section 07).',
    ],
  },
  {
    id: 'non-returnable',
    title: 'Non-Returnable Situations',
    content: 'Returns will NOT be accepted in the following cases:',
    items: [
      'Material delivered exactly as ordered — correct grade, size, quantity, and condition.',
      'Change of colour or surface finish of the material (colour variation is not a quality defect in steel).',
      'Material that has been cut, processed, welded, or altered after delivery.',
      'Delay in raising the return claim beyond the stipulated time windows.',
      'Material that is not in the same condition as it was delivered.',
      'Change of mind or project plan changes by the buyer.',
    ],
  },
  {
    id: 'how-to-claim',
    title: 'How to Raise a Return Claim',
    items: [
      'Call our support number +91 88859 99718 immediately upon identifying a discrepancy.',
      'Send photographs of the delivered material, the delivery challan, and the invoice to support@looha.in.',
      'Provide a written description of the issue — including lot number, quantity affected, and nature of the problem.',
      'Our team will acknowledge your claim within 24 hours and initiate inspection.',
      'Do not use, process, or move the disputed material until the claim is resolved.',
    ],
    highlight: '📞 Claims must be raised within the stipulated time window. Late claims may not be entertained.',
  },
  {
    id: 'wrong-item',
    title: 'Wrong Item Delivered',
    items: [
      'Claim must be raised within 48 hours of receipt of material.',
      'The material must be in the same undamaged condition as delivered.',
      'Looha Technologies will arrange pickup and replacement at our own cost upon verification.',
      'Replacement will be dispatched within 3–5 working days after claim approval.',
    ],
  },
  {
    id: 'quality-complaints',
    title: 'Quality Complaints',
    items: [
      'A Test Certificate (TC) is issued along with all materials at the time of dispatch.',
      'Quality complaints must be raised in writing (email or letter) within 3 days of receiving the material.',
      'Change of colour of material alone does not constitute a quality problem — no complaint will be entertained on this basis.',
      'If the delivered material is in a rusted or pitted condition, a quality complaint may be raised.',
      'If material fails a test conducted at a recognised, standard laboratory, the claim will be accepted.',
      "Upon verification and acceptance, the material will be replaced with correct material at Looha Technologies' cost.",
    ],
  },
  {
    id: 'surplus-returns',
    title: 'Surplus Material Returns',
    content: 'If there is surplus (unused) material remaining after your project is complete, we will consider taking it back subject to the following conditions:',
    items: [
      'Material must be in prime, undamaged condition — exactly as delivered by us.',
      'A written request with original invoice, delivery receipt, and lot number must be submitted.',
      'Material must not have been cut, welded, drilled, or altered in any way.',
      'Transportation charges back to our warehouse are to be borne by the buyer.',
      'Price variation as per current market rates and handling charges will be adjusted.',
      'Balance refund amount (after deductions) will be processed within 10 working days of material receipt and verification.',
    ],
    highlight: '💡 Surplus return requests must be submitted within 30 days of the original delivery date.',
  },
  {
    id: 'short-supply',
    title: 'Short Supply / Weight Shortage',
    items: [
      'Claims for short supply must be made within 24 hours of delivery.',
      'Required documentation: Weighbridge slip, delivery challan, invoice, and confirmation from the site receiver.',
      'Looha Technologies will verify the claim against our dispatch records and logistics partner data.',
      'If confirmed, the shortage will be fulfilled in the next available dispatch at no additional cost.',
    ],
  },
  {
    id: 'refund-process',
    title: 'Refund Process & Timeline',
    items: [
      'Refunds are initiated only after the returned material is received, inspected, and the claim is approved.',
      'Refunds are processed to the original payment method (bank account / UPI / NEFT).',
      'Standard refund timeline: 7–10 working days after approval.',
      'For surplus material returns, refund is processed within 10 working days after material receipt.',
      'TDS / TCS deducted at source during the original transaction will be reconciled per applicable tax rules.',
      'Any transportation, restocking, or handling charges incurred will be deducted before refund.',
    ],
  },
  {
    id: 'conditions',
    title: 'General Conditions for Return Acceptance',
    items: [
      'Material must be in its original, unaltered condition.',
      'All original documents — invoice, delivery challan, TC (Test Certificate) — must be provided.',
      'Photographic evidence of the issue must be submitted at the time of claim.',
      'Looha Technologies reserves the right to reject any claim that does not meet these conditions.',
      'Any decision on return/refund by Looha Technologies after inspection shall be final.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact for Returns',
    content: 'For all return, replacement, or refund-related queries, reach us through:',
    items: [
      'Phone: +91 88859 99718 (Mon–Sat, 9 AM – 6 PM)',
      'Email: support@looha.in',
      'WhatsApp: +91 88859 99718',
      'Address: Near Mulapet Gate Centre, Nellore, Andhra Pradesh — 524003',
    ],
    highlight: '📋 Last Updated: 12 July 2025. This policy is subject to change. Please review periodically.',
  },
];

export default function ReturnPolicy() {
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
            <Link href="/">Home</Link><span className="sep">›</span><span>Return &amp; Refund Policy</span>
          </div>
          <h1>Return &amp; Refund Policy</h1>
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
              {s.highlight && !s.items?.length && <div className="policy-highlight-box">{s.highlight}</div>}
              {s.items?.length > 0 && (
                <ul className="policy-list">
                  {s.items.map((item, i) => <li className="policy-list-item" key={i}>{item}</li>)}
                </ul>
              )}
              {s.highlight && s.items?.length > 0 && (
                <div className="policy-highlight-box">{s.highlight}</div>
              )}
            </section>
          ))}

          <div className="policy-cta-box">
            <h3>Need Help With a Return?</h3>
            <p>Our team is available Mon–Sat, 9 AM to 6 PM to assist you with return claims, quality complaints, and refund status.</p>
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
