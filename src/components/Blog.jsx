'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import './Blog.css';

const CATEGORIES = ['All', 'Steel Industry', 'Construction Tips', 'Market Updates', 'Company News', 'Guides'];

export default function Blog() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const q = query(
                collection(db, 'blog_posts'),
                where('status', '==', 'published'),
                orderBy('publishedAt', 'desc')
            );
            const snap = await getDocs(q);
            setPosts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        } catch (err) {
            console.error('Failed to fetch posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const filtered = posts.filter(p => {
        const matchCat = activeCategory === 'All' || p.category === activeCategory;
        const matchSearch = !searchTerm || 
            p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchCat && matchSearch;
    });

    const featured = filtered[0];
    const rest = filtered.slice(1);

    const formatDate = (ts) => {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    return (
        <div className="blog-page animate-fade-in">
            {/* Hero */}
            <div className="blog-hero">
                <div className="blog-hero-bg" />
                <div className="container blog-hero-content">
                    <div className="blog-hero-badge">📰 LOOHA INSIGHTS</div>
                    <h1 className="blog-hero-title">Steel Industry<br />Knowledge Hub</h1>
                    <p className="blog-hero-sub">
                        Market updates, construction guides & industry insights from Nellore's leading steel platform.
                    </p>
                    <div className="blog-search-wrap">
                        <span className="blog-search-icon">🔍</span>
                        <input
                            id="blog-search"
                            className="blog-search-input"
                            type="text"
                            placeholder="Search articles..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="container blog-container">
                {/* Category Filter */}
                <div className="blog-category-bar">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`blog-cat-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="blog-loading">
                        <div className="blog-spinner" />
                        <p>Loading articles...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="blog-empty">
                        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
                        <h3>No articles found</h3>
                        <p className="text-light">Try a different category or search term.</p>
                    </div>
                ) : (
                    <>
                        {/* Featured Post */}
                        {featured && activeCategory === 'All' && !searchTerm && (
                            <Link href={`/blog/${featured.slug}`} className="blog-featured">
                                <div className="blog-featured-img-wrap">
                                    {featured.coverImage ? (
                                        <img src={featured.coverImage} alt={featured.title} className="blog-featured-img" />
                                    ) : (
                                        <div className="blog-featured-img-placeholder">
                                            <span>🏗️</span>
                                        </div>
                                    )}
                                    <span className="blog-featured-label">Featured</span>
                                </div>
                                <div className="blog-featured-body">
                                    {featured.category && (
                                        <span className="blog-cat-tag">{featured.category}</span>
                                    )}
                                    <h2 className="blog-featured-title">{featured.title}</h2>
                                    <p className="blog-featured-excerpt">{featured.excerpt}</p>
                                    <div className="blog-meta">
                                        <span className="blog-meta-author">✍️ {featured.authorName || 'LOOHA Team'}</span>
                                        <span className="blog-meta-date">📅 {formatDate(featured.publishedAt)}</span>
                                        {featured.readTime && <span className="blog-meta-read">⏱ {featured.readTime} min read</span>}
                                    </div>
                                    <span className="blog-read-more">Read Article →</span>
                                </div>
                            </Link>
                        )}

                        {/* Post Grid */}
                        <div className="blog-grid">
                            {(activeCategory === 'All' && !searchTerm ? rest : filtered).map(post => (
                                <Link key={post.id} href={`/blog/${post.slug}`} className="blog-card">
                                    <div className="blog-card-img-wrap">
                                        {post.coverImage ? (
                                            <img src={post.coverImage} alt={post.title} className="blog-card-img" />
                                        ) : (
                                            <div className="blog-card-img-placeholder">🏗️</div>
                                        )}
                                        {post.category && (
                                            <span className="blog-card-cat">{post.category}</span>
                                        )}
                                    </div>
                                    <div className="blog-card-body">
                                        <h3 className="blog-card-title">{post.title}</h3>
                                        <p className="blog-card-excerpt">{post.excerpt}</p>
                                        <div className="blog-card-footer">
                                            <span className="blog-card-author">{post.authorName || 'LOOHA Team'}</span>
                                            <span className="blog-card-date">{formatDate(post.publishedAt)}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
