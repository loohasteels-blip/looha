'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';

const CATEGORIES = ['All', 'Steel Industry', 'Construction Tips', 'Market Updates', 'Company News', 'Guides'];

export default function AdminCMS() {
    const { isAdmin, isLoggedIn, user } = useAuth();
    const router = useRouter();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [catFilter, setCatFilter] = useState('All');
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
        const unsub = onSnapshot(q, snap => {
            setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleDelete = async (postId) => {
        setDeleting(true);
        try {
            await deleteDoc(doc(db, 'blog_posts', postId));
            setDeleteConfirm(null);
        } catch (err) {
            alert('Delete failed: ' + err.message);
        } finally {
            setDeleting(false);
        }
    };

    const formatDate = (ts) => {
        if (!ts) return '—';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const filtered = posts.filter(p => {
        const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.slug?.includes(search.toLowerCase());
        const matchStatus = statusFilter === 'all' || p.status === statusFilter;
        const matchCat = catFilter === 'All' || p.category === catFilter;
        return matchSearch && matchStatus && matchCat;
    });

    const published = posts.filter(p => p.status === 'published').length;
    const drafts = posts.filter(p => p.status === 'draft').length;

    if (!isLoggedIn) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
            <div style={{ fontSize: '2rem' }}>🔒</div>
            <h2 style={{ margin: 0 }}>Login Required</h2>
            <Link href="/login" className="btn btn-primary">Login to access CMS</Link>
        </div>
    );

    if (!isAdmin) return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, background: '#f8fafc' }}>
            <div style={{ fontSize: '2rem' }}>⛔</div>
            <h2 style={{ margin: 0 }}>Admin Access Only</h2>
            <Link href="/" className="btn btn-primary">Go Home</Link>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'var(--font-body, Inter, sans-serif)' }}>

            {/* CMS Header */}
            <div style={{
                background: 'linear-gradient(135deg, #0B1F3A 0%, #0e2d5a 100%)',
                padding: '0',
                borderBottom: '3px solid #E98800',
                position: 'sticky', top: 0, zIndex: 100,
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <Link href="/admin" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textDecoration: 'none', fontWeight: 600 }}>← Admin</Link>
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: '1.3rem' }}>📝</span>
                                <span style={{ fontFamily: 'var(--font-heading, Outfit, sans-serif)', fontWeight: 900, fontSize: '1.3rem', color: '#fff', letterSpacing: 2 }}>LOOHA CMS</span>
                                <span style={{ background: '#E98800', color: '#fff', fontSize: '0.6rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, letterSpacing: 1 }}>BLOG</span>
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                                Logged in as {user?.name || user?.email}
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <a href="/blog" target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', textDecoration: 'none', fontWeight: 600, padding: '8px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6 }}>
                            👁️ View Blog
                        </a>
                        <Link href="/blog/new" style={{ background: '#E98800', color: '#fff', fontSize: '0.88rem', fontWeight: 700, padding: '10px 20px', borderRadius: 8, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                            ✍️ New Article
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container" style={{ padding: '32px 24px' }}>

                {/* Stats Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 32 }}>
                    {[
                        { label: 'Total Articles', value: posts.length, icon: '📄', color: '#0B1F3A' },
                        { label: 'Published', value: published, icon: '✅', color: '#22c55e' },
                        { label: 'Drafts', value: drafts, icon: '📝', color: '#f59e0b' },
                        { label: 'Categories', value: [...new Set(posts.map(p => p.category).filter(Boolean))].length, icon: '🏷️', color: '#E98800' },
                    ].map(stat => (
                        <div key={stat.label} style={{ background: '#fff', borderRadius: 12, padding: '20px 24px', border: '1px solid #e2e8f0', borderTop: `3px solid ${stat.color}` }}>
                            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: stat.color }}>{stat.icon} {stat.value}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: 4, fontWeight: 600 }}>{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 20 }}>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        <input
                            className="input"
                            placeholder="🔍 Search by title or slug..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            style={{ flex: '1 1 200px', padding: '10px 14px', minWidth: 180 }}
                        />
                        <select
                            className="select"
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            style={{ padding: '10px 14px' }}
                        >
                            <option value="all">All Status</option>
                            <option value="published">✅ Published</option>
                            <option value="draft">📝 Draft</option>
                        </select>
                        <select
                            className="select"
                            value={catFilter}
                            onChange={e => setCatFilter(e.target.value)}
                            style={{ padding: '10px 14px' }}
                        >
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {(search || statusFilter !== 'all' || catFilter !== 'All') && (
                            <button
                                className="btn btn-ghost btn-sm"
                                onClick={() => { setSearch(''); setStatusFilter('all'); setCatFilter('All'); }}
                            >✕ Clear</button>
                        )}
                    </div>
                </div>

                {/* Articles Table */}
                <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                            {filtered.length} {filtered.length === 1 ? 'Article' : 'Articles'}
                        </h3>
                        {posts.length > 0 && (
                            <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                {filtered.length} of {posts.length} shown
                            </span>
                        )}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748B' }}>
                            <div style={{ width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#E98800', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
                            <p>Loading articles...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '72px 20px', color: '#64748B' }}>
                            <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
                            <h3 style={{ margin: '0 0 8px' }}>{posts.length === 0 ? 'No articles yet' : 'No results found'}</h3>
                            <p style={{ margin: '0 0 20px', fontSize: '0.88rem' }}>
                                {posts.length === 0 ? 'Create your first article to get started.' : 'Try adjusting your search or filters.'}
                            </p>
                            {posts.length === 0 && (
                                <Link href="/blog/new" style={{ background: '#E98800', color: '#fff', padding: '10px 24px', borderRadius: 8, textDecoration: 'none', fontWeight: 700 }}>
                                    ✍️ Write First Article
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(248,250,252,0.9)' }}>
                                        {['Title & Slug', 'Category', 'Status', 'Author', 'Date', 'Actions'].map(h => (
                                            <th key={h} style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid #e2e8f0', fontWeight: 700, fontSize: '0.78rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((post, i) => (
                                        <tr key={post.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: 700, color: '#1E293B', marginBottom: 3, fontSize: '0.9rem', maxWidth: 320 }}>
                                                    {post.title || <em style={{ color: '#94a3b8' }}>Untitled</em>}
                                                </div>
                                                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                                                    /blog/{post.slug}
                                                </div>
                                                {post.excerpt && (
                                                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: 4, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {post.excerpt}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                {post.category && (
                                                    <span style={{ background: 'rgba(233,136,0,0.1)', color: '#E98800', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 4, whiteSpace: 'nowrap' }}>
                                                        {post.category}
                                                    </span>
                                                )}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                                    fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 6,
                                                    background: post.status === 'published' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
                                                    color: post.status === 'published' ? '#16a34a' : '#b45309',
                                                }}>
                                                    {post.status === 'published' ? '● Published' : '○ Draft'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', color: '#64748B', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                                                {post.authorName || 'LOOHA Team'}
                                            </td>
                                            <td style={{ padding: '16px', color: '#64748B', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                                {formatDate(post.publishedAt || post.createdAt)}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                                                    <Link
                                                        href={`/blog/edit/${post.slug}`}
                                                        style={{ background: '#0B1F3A', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '6px 12px', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap' }}
                                                    >
                                                        ✏️ Edit
                                                    </Link>
                                                    {post.status === 'published' && (
                                                        <a
                                                            href={`/blog/${post.slug}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.75rem', fontWeight: 600, padding: '6px 12px', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap' }}
                                                        >
                                                            👁️ View
                                                        </a>
                                                    )}
                                                    {deleteConfirm === post.id ? (
                                                        <div style={{ display: 'flex', gap: 4 }}>
                                                            <button
                                                                style={{ background: '#ef4444', color: '#fff', border: 'none', fontSize: '0.72rem', fontWeight: 700, padding: '6px 10px', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                                onClick={() => handleDelete(post.id)}
                                                                disabled={deleting}
                                                            >
                                                                {deleting ? '...' : '🗑️ Confirm'}
                                                            </button>
                                                            <button
                                                                style={{ background: '#f1f5f9', color: '#475569', border: 'none', fontSize: '0.72rem', padding: '6px 8px', borderRadius: 6, cursor: 'pointer' }}
                                                                onClick={() => setDeleteConfirm(null)}
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            style={{ background: 'transparent', border: '1px solid #fecaca', color: '#ef4444', fontSize: '0.75rem', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                            onClick={() => setDeleteConfirm(post.id)}
                                                        >
                                                            🗑️
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{ textAlign: 'center', marginTop: 32, color: '#94a3b8', fontSize: '0.78rem' }}>
                    LOOHA CMS · Blog articles are live at{' '}
                    <a href="/blog" target="_blank" rel="noreferrer" style={{ color: '#E98800', textDecoration: 'none', fontWeight: 600 }}>
                        looha.in/blog
                    </a>
                </div>
            </div>
        </div>
    );
}
