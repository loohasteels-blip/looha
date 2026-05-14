'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import './BlogPost.css';

export default function BlogPost() {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        fetchPost();
    }, [slug]);

    const fetchPost = async () => {
        setLoading(true);
        setNotFound(false);
        try {
            const q = query(
                collection(db, 'blog_posts'),
                where('slug', '==', slug),
                where('status', '==', 'published')
            );
            const snap = await getDocs(q);
            if (snap.empty) { setNotFound(true); return; }
            const data = { id: snap.docs[0].id, ...snap.docs[0].data() };
            setPost(data);

            // Fetch related posts (same category, excluding current)
            if (data.category) {
                const rq = query(
                    collection(db, 'blog_posts'),
                    where('status', '==', 'published'),
                    where('category', '==', data.category),
                    limit(4)
                );
                const rSnap = await getDocs(rq);
                setRelated(
                    rSnap.docs
                        .map(d => ({ id: d.id, ...d.data() }))
                        .filter(p => p.id !== data.id)
                        .slice(0, 3)
                );
            }
        } catch (err) {
            console.error('Failed to fetch post:', err);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (ts) => {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    if (loading) {
        return (
            <div className="blogpost-loading">
                <div className="blog-spinner" />
                <p>Loading article...</p>
            </div>
        );
    }

    if (notFound || !post) {
        return (
            <div className="blogpost-notfound">
                <div style={{ fontSize: '3rem' }}>📭</div>
                <h2>Article Not Found</h2>
                <p className="text-light">This article may have been removed or doesn't exist.</p>
                <Link href="/blog" className="btn btn-primary mt-2">← Back to Blog</Link>
            </div>
        );
    }

    return (
        <div className="blogpost-page animate-fade-in">
            {/* Hero */}
            <div className="blogpost-hero">
                <div className="container blogpost-hero-inner">
                    <Link href="/blog" className="blogpost-back">← All Articles</Link>
                    {post.category && <span className="blog-cat-tag">{post.category}</span>}
                    <h1 className="blogpost-title">{post.title}</h1>
                    <p className="blogpost-excerpt">{post.excerpt}</p>
                    <div className="blogpost-meta">
                        <div className="blogpost-author-chip">
                            <div className="blogpost-author-avatar">
                                {(post.authorName || 'L').charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="blogpost-author-name">{post.authorName || 'LOOHA Team'}</div>
                                <div className="blogpost-date">{formatDate(post.publishedAt)}</div>
                            </div>
                        </div>
                        {post.readTime && (
                            <span className="blogpost-readtime">⏱ {post.readTime} min read</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Cover Image */}
            {post.coverImage && (
                <div className="container">
                    <div className="blogpost-cover-wrap">
                        <img src={post.coverImage} alt={post.title} className="blogpost-cover-img" />
                    </div>
                </div>
            )}

            {/* Body */}
            <div className="container blogpost-layout">
                <article className="blogpost-article">
                    <div
                        className="blogpost-body tiptap-content"
                        dangerouslySetInnerHTML={{ __html: post.content || '' }}
                    />

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                        <div className="blogpost-tags">
                            <span className="blogpost-tags-label">Tags:</span>
                            {post.tags.map(tag => (
                                <span key={tag} className="blogpost-tag">#{tag}</span>
                            ))}
                        </div>
                    )}

                    {/* Share */}
                    <div className="blogpost-share">
                        <span className="blogpost-share-label">Share:</span>
                        <a
                            href={`https://wa.me/?text=${encodeURIComponent(post.title + ' - ' + window.location.href)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="share-btn share-wa"
                        >
                            💬 WhatsApp
                        </a>
                        <button
                            className="share-btn share-copy"
                            onClick={() => { navigator.clipboard.writeText(window.location.href); }}
                        >
                            🔗 Copy Link
                        </button>
                    </div>
                </article>

                {/* Sidebar */}
                <aside className="blogpost-sidebar">
                    <div className="sidebar-card">
                        <h3 className="sidebar-card-title">🏗️ About LOOHA</h3>
                        <p style={{ fontSize: '0.85rem', lineHeight: 1.7, color: 'var(--color-text-light)' }}>
                            Nellore's #1 digital steel platform. TMT Bars, MS Pipes, Beams, Channels & more from TATA, JSW, Vizag, Jindal, SAIL.
                        </p>
                        <Link href="/" className="btn btn-primary mt-2" style={{ width: '100%', textAlign: 'center' }}>
                            Shop Steel →
                        </Link>
                    </div>
                    {related.length > 0 && (
                        <div className="sidebar-card mt-3">
                            <h3 className="sidebar-card-title">📚 Related Articles</h3>
                            <div className="sidebar-related">
                                {related.map(r => (
                                    <Link key={r.id} href={`/blog/${r.slug}`} className="sidebar-related-item">
                                        {r.coverImage
                                            ? <img src={r.coverImage} alt={r.title} className="sidebar-related-img" />
                                            : <div className="sidebar-related-img-ph">🏗️</div>
                                        }
                                        <div className="sidebar-related-body">
                                            <div className="sidebar-related-title">{r.title}</div>
                                            <div className="sidebar-related-date">{formatDate(r.publishedAt)}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* Back to Blog */}
            <div className="container" style={{ textAlign: 'center', paddingBottom: 48 }}>
                <Link href="/blog" className="btn btn-outline">← Back to All Articles</Link>
            </div>
        </div>
    );
}
