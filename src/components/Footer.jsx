'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { categories } from '../data/products';
import './Footer.css';

const PhoneIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.47 11.47 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.47 11.47 0 0 0 .57 3.6 1 1 0 0 1-.25 1.01l-2.2 2.18z"/></svg>);
const MailIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>);
const ClockIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>);
const WaIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>);
const MapIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);

export default function Footer() {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-main">
                    <div className="footer-brand-col">
                        <div className="footer-logo-wrap">
                            <img src="/logo.png" alt="LOOHA Steel" className="footer-logo-img" onError={e => e.target.style.display = 'none'} />
                        </div>
                        <p className="footer-tagline">Nellore&apos;s most trusted steel supplier.<br />Premium quality steel with transparent pricing and fast delivery.</p>
                        <div className="footer-socials">
                            <a href="https://facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg></a>
                            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><circle cx="12" cy="12" r="4"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
                            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z"/><circle cx="4" cy="4" r="2"/></svg></a>
                            <a href="https://wa.me/918885999718" target="_blank" rel="noreferrer" aria-label="WhatsApp"><WaIcon /></a>
                        </div>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">COMPANY</h4>
                        <Link href="/about">About Us</Link>
                        <Link href="/products/ms-pipes">Our Products</Link>
                        <Link href="/brands">Brands</Link>
                        <Link href="/blog">Blog</Link>
                        <Link href="/contact">Contact Us</Link>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">POLICIES</h4>
                        <Link href="/payment-policy">Payment Policy</Link>
                        <Link href="/shipping-policy">Shipping &amp; Delivery</Link>
                        <Link href="/refund">Return &amp; Refund</Link>
                        <Link href="/terms">Terms &amp; Conditions</Link>
                        <Link href="/privacy">Privacy Policy</Link>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">CUSTOMER SUPPORT</h4>
                        <a href="tel:+918885999718" className="footer-contact-row"><PhoneIcon /> +91 88859 99718</a>
                        <a href="mailto:support@looha.in" className="footer-contact-row"><MailIcon /> support@looha.in</a>
                        <span className="footer-contact-row muted"><ClockIcon /> Mon – Sat: 9:00 AM – 6:00 PM</span>
                        <a href="https://wa.me/918885999718" target="_blank" rel="noreferrer" className="footer-contact-row footer-wa"><WaIcon /> Chat on WhatsApp</a>
                    </div>

                    <div className="footer-col">
                        <h4 className="footer-col-title">OUR ADDRESS</h4>
                        <div className="footer-address">
                            <MapIcon />
                            <span>Looha Steel, Mru Industrial Area,<br />D.No. 20/441, Walkers Road,<br />Mulapeta, Nellore,<br />Andhra Pradesh – 524001</span>
                        </div>
                        <div className="footer-gst">GSTIN: <strong>37GOUPS1032G1ZJ</strong></div>
                    </div>
                </div>

                <div className="footer-bottom-bar">
                    <span>© 2025 Looha Steel. All Rights Reserved.</span>
                    <span className="footer-bottom-links">
                        <Link href="/privacy">Privacy</Link>
                        <Link href="/terms">Terms</Link>
                        <Link href="/refund">Refund</Link>
                    </span>
                </div>
            </div>
        </footer>
    );
}
