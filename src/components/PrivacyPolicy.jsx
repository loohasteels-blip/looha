'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import './ShippingPolicy.css';

const sections = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: 'This Privacy Policy ("Policy") applies to the personal information that Looha Technologies Pvt. Ltd. (hereinafter referred to as "Looha", "We", "Us", or "Our") collects when you use or access Looha.in ("Platform"), and other online products and services that link to this Policy (collectively, our "Services").',
    items: [
      'Data protection is a matter of trust and your privacy is very important to us.',
      'We store your personal information only as necessary for the purposes described in this Policy.',
      'By accessing our Services, you acknowledge your acceptance of the terms of this Privacy Policy and expressly consent to our use and disclosure of your personal information in accordance with this Policy.',
      'Our Privacy Policy is subject to change at any time. You are advised to review it periodically to stay informed of any updates.',
    ],
  },
  {
    id: 'info-you-provide',
    title: 'Information You Provide to Us',
    content: 'We collect information you provide directly when you use our Platform. This includes:',
    items: [
      'Account Registration: Name, email address, mobile number, and password when creating an account.',
      'Business Details: GSTIN, PAN, company name, business address, and CIN (for trade/enterprise accounts).',
      'Order Information: Delivery address, site supervisor contact, and project details for fulfilment.',
      'Communications: Messages, emails, feedback, complaints, or support queries you send us.',
      'KYC Documents: Aadhaar, PAN card, or other identity documents required for verification.',
      'Survey & Promotions: Additional information you provide when participating in surveys or promotional activities.',
    ],
  },
  {
    id: 'info-auto-collected',
    title: 'Information Collected Automatically',
    content: 'When you access or use our Services, we automatically collect certain information:',
    items: [
      'Transaction Information: Product details, purchase price, order date, and location of transactions.',
      'Log Information: Browser type, access times, pages viewed, IP address, and the referring page.',
      'Device Information: Hardware model, operating system, version, unique device identifiers, and mobile network information.',
      'Location Information: Approximate location data when you access our Platform or consent to location sharing.',
      'Usage Data: Time spent on pages, clicks, search queries, and navigation patterns within the Platform.',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies & Tracking Technologies',
    content: 'We use various technologies to collect information and enhance your experience:',
    items: [
      'Cookies: Small data files stored on your device that help us improve our Services and remember your preferences.',
      'Web Beacons: Tiny graphic files used in emails and pages to track opening and interaction.',
      'Analytics Tools: Third-party analytics (e.g., Google Analytics) to understand traffic patterns and improve our Platform.',
      'Session Storage: Temporary data used to maintain your session during a visit.',
    ],
    highlight: '💡 You can control cookie settings through your browser preferences. Disabling cookies may affect some features of our Platform.',
  },
  {
    id: 'use-of-information',
    title: 'How We Use Your Information',
    content: 'We use the information we collect for the following purposes:',
    items: [
      'Providing, maintaining, and improving our Platform and Services.',
      'Processing and fulfilling your orders, payments, and deliveries.',
      'Verifying your identity and business credentials (KYC).',
      'Sending order confirmations, invoices, delivery updates via SMS, Email, and WhatsApp.',
      'Responding to your support queries, feedback, and complaints.',
      'Personalising your experience and product recommendations.',
      'Conducting analytics to understand usage patterns and improve our offerings.',
      'Complying with legal obligations including GST, TDS/TCS, and other regulatory requirements.',
      'Detecting and preventing fraud, unauthorized access, and misuse of our Platform.',
    ],
  },
  {
    id: 'sharing-information',
    title: 'How We Share Your Information',
    content: 'We do not sell or rent your personal information. We may share it only in the following circumstances:',
    items: [
      'With Your Consent: When you explicitly authorise us to share your information.',
      'Logistics Partners: Delivery address and contact details shared with transport/logistics providers to fulfil your order.',
      'Payment Gateways: Transaction details shared with payment processors (e.g., Razorpay, PayU) for payment processing.',
      'Legal Obligations: When required by law, court order, or government authority under applicable Indian law.',
      'Business Transfers: In the event of a merger, acquisition, or sale of assets, your data may be transferred to the successor entity.',
      'Fraud Prevention: With law enforcement or security agencies to investigate suspected fraud or security breaches.',
    ],
  },
  {
    id: 'data-protection',
    title: 'How We Protect Your Information',
    items: [
      'Confidentiality & Security: We implement industry-standard security measures including SSL encryption, secure servers, and access controls.',
      'Access Control: Only authorised Looha personnel with a legitimate business need can access your personal data.',
      'Retention of Data: We retain your personal data only as long as necessary for legal, business, or regulatory compliance purposes.',
      'Breach Notification: In the event of a data breach affecting your information, we will notify you as required under applicable law.',
      'Third-party Audits: Our data handling practices are subject to periodic internal review and where required, third-party audits.',
    ],
    highlight: '🔒 Your payment information is never stored on our servers. All transactions are processed through PCI-DSS compliant payment gateways.',
  },
  {
    id: 'your-rights',
    title: 'Your Choices & Rights',
    items: [
      'Account Information: You may update or correct your account information at any time by logging into your account settings.',
      'Location Information: You may disable location access through your device settings at any time.',
      'Cookies: You may opt out of cookies by adjusting your browser settings, though some features may be unavailable.',
      'Promotional Communications: You may opt out of marketing emails by clicking "Unsubscribe" in any email, or by contacting us directly.',
      'Data Deletion: You may request deletion of your personal data by writing to us at support@looha.in, subject to legal retention requirements.',
      'Data Portability: You may request a copy of your personal data we hold in a structured, machine-readable format.',
    ],
  },
  {
    id: 'phishing',
    title: 'Phishing & False Communications',
    content: 'Looha Technologies will NEVER ask for your password, OTP, or sensitive financial information via email, SMS, or WhatsApp.',
    items: [
      'If you receive any suspicious communication that appears to be from Looha, treat it as a potential scam.',
      'Do not click on any links, download attachments, or share any personal information in response.',
      'Report any such communications immediately to support@looha.in or call +91 88859 99718.',
    ],
    highlight: '⚠️ Looha Technologies does not have any partner agents who collect cash or personal documents at your doorstep. Beware of impersonators.',
  },
  {
    id: 'breach-policy',
    title: 'Breach of Privacy Policy',
    items: [
      'If we find that you have violated our Privacy Policy, we reserve the right to immediately terminate or suspend your account without prior notice.',
      'This includes using false identity information, attempting unauthorised access, or otherwise misusing our Platform.',
      'Looha Technologies reserves the right to pursue legal action for serious violations.',
    ],
  },
  {
    id: 'third-party-links',
    title: 'Third-Party Links',
    items: [
      'Our Platform may contain links to third-party websites or services not operated by Looha Technologies.',
      'We are not responsible for the privacy practices or content of third-party sites.',
      'We encourage you to review the privacy policy of any third-party site you visit.',
    ],
  },
  {
    id: 'policy-changes',
    title: 'Changes to This Policy',
    items: [
      'We may update this Privacy Policy at any time without prior notice.',
      'Continued use of the Platform after any changes constitutes acceptance of the revised Policy.',
      'The "Last Updated" date at the top of this page will always reflect the most recent revision.',
      'For material changes, we may notify you via email or a prominent notice on the Platform.',
    ],
    highlight: '📋 Last Updated: 12 July 2025. Effective Date: 12 July 2025.',
  },
  {
    id: 'grievance-officer',
    title: 'Grievance Officer',
    content: 'In accordance with the Information Technology Act, 2000 and rules made thereunder, the details of our Grievance Officer are:',
    items: [
      'Name: Grievance Officer — Looha Technologies Pvt. Ltd.',
      'Email: support@looha.in',
      'Phone: +91 88859 99718',
      'Address: Near Mulapet Gate Centre, Nellore, Andhra Pradesh — 524003',
      'Working Hours: Monday to Saturday, 9:00 AM – 6:00 PM',
      'Response Time: We will acknowledge your grievance within 24 hours and resolve it within 30 days.',
    ],
  },
];

export default function PrivacyPolicy() {
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
            <Link href="/">Home</Link><span className="sep">›</span><span>Privacy Policy</span>
          </div>
          <h1>Privacy Policy</h1>
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
            <h3>Privacy Questions or Concerns?</h3>
            <p>Contact our Grievance Officer at support@looha.in or call us directly. We respond to all privacy queries within 24 hours.</p>
            <div className="policy-cta-btns">
              <a href="mailto:support@looha.in" className="btn-accent">✉️ Email Support</a>
              <a href="https://wa.me/918885999718" className="btn-outline">💬 WhatsApp Us</a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
