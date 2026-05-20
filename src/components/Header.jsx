'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { categories } from '../data/products';
import './Header.css';

export default function Header() {
    const { totalItems } = useCart();
    const { user, isLoggedIn, isAdmin, logout } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const router = useRouter();
    const userMenuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
                setShowUserMenu(false);
            }
        }
        if (showUserMenu) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showUserMenu]);

    const handleSearch = (e) => {
        e.preventDefault();
        const q = searchQuery.trim().toLowerCase();
        if (!q) return;
        const match = categories.find(c =>
            c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
        );
        const targetSlug = match ? match.id : categories[0].id;
        router.push(`/products/${targetSlug}?search=${encodeURIComponent(searchQuery)}`);
        setSearchQuery('');
        setMenuOpen(false);
    };

    return (
        <>
            <header className="header">
                <div className="container header-inner">
                    <button className="menu-toggle hide-desktop" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu" style={{ color: 'var(--color-primary)' }}>
                        <span className={`hamburger ${menuOpen ? 'open' : ''}`} style={{ '--ham-color': 'var(--color-primary)' }}>
                            <span></span><span></span><span></span>
                        </span>
                    </button>

                    <Link href="/" className="logo" title="LOOHA Steel – Steel | Strength | Trust" style={{ outline: 'none', boxShadow: 'none', WebkitTapHighlightColor: 'transparent' }}>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
                            <img src="/logo.png" alt="LOOHA Steel – Steel Strength Trust" className="logo-img"
                                style={{ outline: 'none', boxShadow: 'none' }}
                                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                            />
                            <span className="logo-text" style={{ display: 'none', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '3px', color: 'var(--color-primary)' }}>LOOHA</span>
                                <span style={{ fontSize: '0.5rem', letterSpacing: '3px', color: 'var(--color-accent)', fontWeight: 600 }}>STEEL | STRENGTH | TRUST</span>
                            </span>
                            <span className="logo-brand-sub">
                                A Brand By MBJ Steels
                            </span>
                        </span>
                    </Link>

                    <form className="search-bar hide-mobile" onSubmit={handleSearch}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                        <input type="text" placeholder="Search for steel products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </form>

                    <div className="header-actions">
                        <a href="tel:+918885999718" className="header-action-phone hide-mobile" aria-label="Call us for enquiry">
                            <span className="call-icon-wrap">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.47 11.47 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.47 11.47 0 0 0 .57 3.6 1 1 0 0 1-.25 1.01l-2.2 2.18z" /></svg>
                            </span>
                            <span className="call-label">
                                <span className="call-now">Call Now</span>
                                <span className="call-sub">Free Enquiry</span>
                            </span>
                        </a>

                        <a href="tel:+918885999718" className="header-action-phone show-mobile-only" aria-label="Call us" style={{ padding: '9px 12px', gap: 0 }}>
                            <span className="call-icon-wrap">
                                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24 11.47 11.47 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.47 11.47 0 0 0 .57 3.6 1 1 0 0 1-.25 1.01l-2.2 2.18z" /></svg>
                            </span>
                        </a>

                        {isLoggedIn ? (
                            <div className="user-menu-wrapper hide-mobile" ref={userMenuRef}>
                                <button className="header-action" onClick={() => setShowUserMenu(!showUserMenu)}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm7.5 10c1 0 1.82-.93 1.46-1.9A10 10 0 0 0 2.04 20.1C1.68 21.07 2.5 22 3.5 22h16Z" /></svg>
                                    <span>{user.name.split(' ')[0]}</span>
                                </button>
                                {showUserMenu && (
                                    <div className="user-dropdown">
                                        <div className="user-dropdown-header">
                                            <strong>{user.name}</strong>
                                            <small>{user.email}</small>
                                        </div>
                                        <Link href="/dashboard" onClick={() => setShowUserMenu(false)}>My Dashboard</Link>
                                        <Link href="/orders" onClick={() => setShowUserMenu(false)}>My Orders</Link>
                                        {isAdmin && <Link href="/admin" onClick={() => setShowUserMenu(false)}>Admin Panel</Link>}
                                        <button onClick={() => { logout(); setShowUserMenu(false); }}>Logout</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link href="/login" className="header-action hide-mobile">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm7.5 10c1 0 1.82-.93 1.46-1.9A10 10 0 0 0 2.04 20.1C1.68 21.07 2.5 22 3.5 22h16Z" /></svg>
                                <span>Login</span>
                            </Link>
                        )}

                        <Link href="/cart" className="header-action cart-action">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.63 1.5a1.12 1.12 0 1 0 0 2.25h2.75l1.86 7.67A5.63 5.63 0 0 0 3 16.87C3 17.5 3.5 18 4.13 18h15.75a1.12 1.12 0 1 0 0-2.25H5.44a3.38 3.38 0 0 1 3.18-2.25h9.76a1.12 1.12 0 0 0 1.09-.87l1.27-5.4a1.12 1.12 0 0 0-.87-1.35 66.18 66.18 0 0 0-12-1.37l-.51-2.15a1.13 1.13 0 0 0-1.1-.86H2.63ZM7.5 21a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm12 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg>
                            {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
                            <span className="hide-mobile">Cart</span>
                        </Link>
                    </div>
                </div>

                <nav className="category-nav hide-mobile">
                    <div className="container category-nav-inner">
                        {categories.slice(0, 6).map(cat => (
                            <Link key={cat.id} href={`/products/${cat.id}`} className="cat-nav-link">{cat.name.toUpperCase()}</Link>
                        ))}
                        <Link href="/brands" className="cat-nav-link cat-nav-all">ALL BRANDS</Link>
                        <Link href="/blog" className="cat-nav-link" style={{ color: '#E98800', fontWeight: 700 }}>📰 BLOG</Link>
                    </div>
                </nav>
            </header>

            <div className={`sidebar-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />
            <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    {isLoggedIn ? (
                        <div><strong>{user.name}</strong><small>{user.company}</small></div>
                    ) : (
                        <Link href="/login" onClick={() => setMenuOpen(false)} className="btn btn-outline btn-sm" style={{ color: '#fff', borderColor: '#fff' }}>
                            Login / Register
                        </Link>
                    )}
                </div>
                <div className="sidebar-body">
                    <div className="sidebar-section-title">Product Categories</div>
                    {categories.map(cat => (
                        <Link key={cat.id} href={`/products/${cat.id}`} className="sidebar-link" onClick={() => setMenuOpen(false)}>
                            <span className="sidebar-icon">{cat.icon}</span> {cat.name}
                        </Link>
                    ))}
                    <div className="sidebar-divider" />
                    <Link href="/brands" className="sidebar-link" onClick={() => setMenuOpen(false)}>🏷️ All Brands</Link>
                    <Link href="/blog" className="sidebar-link" onClick={() => setMenuOpen(false)}>📰 Blog</Link>
                    <Link href="/dashboard" className="sidebar-link" onClick={() => setMenuOpen(false)}>📊 My Dashboard</Link>
                    <Link href="/orders" className="sidebar-link" onClick={() => setMenuOpen(false)}>📦 My Orders</Link>
                    <Link href="/support" className="sidebar-link" onClick={() => setMenuOpen(false)}>📞 Help & Support</Link>
                    {isAdmin && <Link href="/admin" className="sidebar-link" onClick={() => setMenuOpen(false)}>⚙️ Admin Panel</Link>}
                    {isLoggedIn && (
                        <button className="sidebar-link" onClick={() => { logout(); setMenuOpen(false); }}>🚪 Logout</button>
                    )}
                </div>
            </aside>
        </>
    );
}
