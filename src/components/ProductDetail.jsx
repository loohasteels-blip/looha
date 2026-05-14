'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { products, categories, calculatePricing } from '../data/products';
import { useCart } from '../context/CartContext';
import { usePricing } from '../context/PricingContext';
import { useState, useEffect } from 'react';
import { buildWhatsAppUrl } from '../utils/whatsapp';
import './ProductDetail.css';

// Demo reviews data
const demoReviews = [
    { name: 'Rajesh Kumar', rating: 5, text: 'Excellent quality TMT bars. Delivery was on time and the packaging was very good. Will order again for our next project.', date: '2026-02-15' },
    { name: 'Suresh Patel', rating: 4, text: 'Good quality steel, pricing was competitive. Loading charges were reasonable. Only wish dispatch was a bit faster.', date: '2026-02-10' },
    { name: 'Anil Reddy', rating: 5, text: 'We have been ordering from LOHA for 2 years. Consistent quality and reliable service. Highly recommend for bulk orders.', date: '2026-01-28' },
    { name: 'Mohan Singh', rating: 4, text: 'Fair pricing and good customer support. The steel quality matches ISI standards. Suitable for commercial construction projects.', date: '2026-01-15' },
    { name: 'Vikram Sharma', rating: 5, text: 'Best steel marketplace we have used. Transparent pricing, GST invoice provided instantly. Very professional team.', date: '2025-12-20' },
];

// Product images helper
function getProductImages(categoryId) {
    const base = `/images/products/${categoryId}`;
    return [
        `${base}-1.svg`,
        `${base}-2.svg`,
        `${base}-3.svg`,
        `${base}-4.svg`,
    ];
}

// Today's date formatted
function todayFormatted() {
    return new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Stars component
function Stars({ rating, size = '1rem' }) {
    return (
        <span className="pd-stars" style={{ fontSize: size }}>
            {[1, 2, 3, 4, 5].map(i => (
                <span key={i}>{i <= Math.round(rating) ? '?' : '?'}</span>
            ))}
        </span>
    );
}

// Review Modal
function ReviewModal({ onClose, onSubmit }) {
    const [name, setName] = useState('');
    const [rating, setRating] = useState(0);
    const [text, setText] = useState('');
    const [hover, setHover] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name.trim() || rating === 0 || !text.trim()) return;
        onSubmit({
            name: name.trim(),
            rating,
            text: text.trim(),
            date: new Date().toISOString().split('T')[0],
        });
    };

    return (
        <div className="pd-modal-overlay" onClick={onClose}>
            <div className="pd-modal" onClick={e => e.stopPropagation()}>
                <button className="pd-modal-close" onClick={onClose}>?</button>
                <h3>Write a Review</h3>
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Your Name</label>
                        <input className="input" placeholder="Enter your name" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <label>Rating</label>
                        <div className="pd-star-input">
                            {[1, 2, 3, 4, 5].map(i => (
                                <button
                                    key={i}
                                    type="button"
                                    className={i <= (hover || rating) ? 'filled' : ''}
                                    onMouseEnter={() => setHover(i)}
                                    onMouseLeave={() => setHover(0)}
                                    onClick={() => setRating(i)}
                                >?</button>
                            ))}
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Your Review</label>
                        <textarea
                            className="input"
                            rows={4}
                            placeholder="Share your experience with this product..."
                            value={text}
                            onChange={e => setText(e.target.value)}
                            style={{ resize: 'vertical' }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={!name.trim() || rating === 0 || !text.trim()}
                    >
                        Submit Review
                    </button>
                </form>
            </div>
        </div>
    );
}

export default function ProductDetail() {
    const { id } = useParams();
    const router = useRouter();
    const { addItem } = useCart();
    const { getPrice, charges } = usePricing();
    const [quantity, setQuantity] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [added, setAdded] = useState(false);
    const [activeImage, setActiveImage] = useState(0);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [userReviews, setUserReviews] = useState([]);
    const [imgErrors, setImgErrors] = useState({});

    // Find the product across all categories
    let product = null, categoryData = null, category = null;
    for (const [catSlug, catData] of Object.entries(products)) {
        const found = catData.items.find(i => i.id === id);
        if (found) {
            product = found;
            categoryData = catData;
            category = categories.find(c => c.id === catSlug);
            break;
        }
    }

    // Load user reviews from localStorage
    useEffect(() => {
        if (id) {
            try {
                const stored = localStorage.getItem(`loha_reviews_${id}`);
                if (stored) setUserReviews(JSON.parse(stored));
                else setUserReviews([]);
            } catch { setUserReviews([]); }
        }
        setActiveImage(0);
        setImgErrors({});
    }, [id]);

    if (!product) {
        return (
            <div className="page container" style={{ textAlign: 'center', paddingTop: 80 }}>
                <h2>Product not found</h2>
                <Link href="/" className="btn btn-primary mt-2">Back to Home</Link>
            </div>
        );
    }

    // Override price with Firestore value
    product = { ...product, pricePerTon: getPrice(product.id, product.pricePerTon) };

    const qty = parseInt(quantity) || 0;
    const pricing = qty > 0 ? calculatePricing(product, qty, charges) : null;

    const images = getProductImages(category.id);
    const categoryIcon = category.image; // fallback SVG from categories

    const handleImgError = (idx) => {
        setImgErrors(prev => ({ ...prev, [idx]: true }));
    };

    const allReviews = [...demoReviews, ...userReviews];
    const avgRating = allReviews.length > 0
        ? (allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length).toFixed(1)
        : '0';

    const handleAddToCart = () => {
        if (qty <= 0) return;
        addItem({ ...product, categoryName: categoryData.categoryName, brand: selectedBrand || categoryData.brands[0] }, qty);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const handleBuyNow = () => {
        if (qty <= 0) return;
        addItem({ ...product, categoryName: categoryData.categoryName, brand: selectedBrand || categoryData.brands[0] }, qty);
        router.push('/cart');
    };

    const handleReviewSubmit = (review) => {
        const updated = [...userReviews, review];
        setUserReviews(updated);
        localStorage.setItem(`loha_reviews_${id}`, JSON.stringify(updated));
        setShowReviewModal(false);
    };

    // Determine grade based on category
    const grade = categoryData.categoryId === 'tmt-bars' ? 'Fe 500D' : 'IS 2062 E250';

    return (
        <div className="page animate-fade-in">
            <div className="container">
                <div className="breadcrumb">
                    <Link href="/">Home</Link>
                    <span className="sep">�</span>
                    <Link href={`/products/${category.id}`}>{category.name}</Link>
                    <span className="sep">�</span>
                    <span>{product.size}</span>
                </div>

                <div className="pd-layout">
                    {/* Left Column: Gallery + Info */}
                    <div className="pd-left">
                        {/* Image Gallery */}
                        <div className="pd-gallery">
                            <div className="pd-main-image-wrap">
                                {imgErrors[activeImage] ? (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={categoryIcon} alt={category.name} style={{ width: 120, height: 120, objectFit: 'contain' }} />
                                    </div>
                                ) : (
                                    <img
                                        src={images[activeImage]}
                                        alt={`${categoryData.categoryName} ${product.size} - View ${activeImage + 1}`}
                                        onError={() => handleImgError(activeImage)}
                                    />
                                )}
                            </div>
                            <div className="pd-thumbnails">
                                {images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        className={`pd-thumb ${activeImage === idx ? 'active' : ''}`}
                                        onClick={() => setActiveImage(idx)}
                                    >
                                        {imgErrors[idx] ? (
                                            <img src={categoryIcon} alt={`Thumb ${idx + 1}`} />
                                        ) : (
                                            <img src={img} alt={`Thumb ${idx + 1}`} onError={() => handleImgError(idx)} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Info Header */}
                        <div className="pd-info-header">
                            <div className="pd-category-label">
                                <span>{category.icon}</span>
                                <span>{categoryData.categoryName}</span>
                            </div>
                            <h1 className="pd-product-title">
                                {categoryData.categoryName} � {product.size}
                            </h1>
                            <div className="pd-price-updated">
                                ?? Price updated on {todayFormatted()}
                            </div>
                        </div>

                        {/* Price Block */}
                        <div className="pd-price-block">
                            <span className="pd-price-value">?{product.pricePerTon.toLocaleString()}</span>
                            <span className="pd-price-unit">/ ton (excl. GST)</span>
                            <span className="pd-availability">
                                <span className="badge badge-success">? In Stock</span>
                            </span>
                        </div>

                        {/* Trust Badges */}
                        <div className="pd-trust-row">
                            <div className="pd-trust-item">
                                <span className="trust-icon">?</span>
                                <span className="trust-text">Verified Suppliers</span>
                            </div>
                            <div className="pd-trust-item">
                                <span className="trust-icon">??</span>
                                <span className="trust-text">Fast Dispatch</span>
                            </div>
                            <div className="pd-trust-item">
                                <span className="trust-icon">??</span>
                                <span className="trust-text">Quality Checked</span>
                            </div>
                            <div className="pd-trust-item">
                                <span className="trust-icon">??</span>
                                <span className="trust-text">GST Invoice</span>
                            </div>
                        </div>

                        {/* Specs Table */}
                        <div className="pd-specs">
                            <h3>?? Specifications</h3>
                            <table className="pd-specs-table">
                                <tbody>
                                    <tr><td>Size</td><td>{product.size}</td></tr>
                                    <tr><td>Grade</td><td>{grade}</td></tr>
                                    <tr><td>Length</td><td>{product.length}</td></tr>
                                    <tr><td>Unit</td><td>Metric Ton</td></tr>
                                    <tr><td>Weight per piece</td><td>{product.weightPerPiece} kg</td></tr>
                                    <tr><td>Delivery</td><td>As per pincode</td></tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Brand Selector */}
                        <div className="pd-brand-select">
                            <label>Select Brand</label>
                            <select className="select" value={selectedBrand} onChange={e => setSelectedBrand(e.target.value)} style={{ maxWidth: 320 }}>
                                {categoryData.brands.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>

                        {/* Size Variants */}
                        <div>
                            <label style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8, display: 'block' }}>Available Sizes</label>
                            <div className="pd-sizes">
                                {categoryData.items.map(item => (
                                    <Link
                                        key={item.id}
                                        href={`/product/${item.id}`}
                                        className={`pd-size-chip ${item.id === product.id ? 'active' : ''}`}
                                    >
                                        {item.size}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Calculator */}
                    <div>
                        <div className="card pd-calc-card">
                            <div className="card-body">
                                <h3>?? Quantity Calculator</h3>

                                <div className="input-group">
                                    <label>Enter Quantity ({product.unit})</label>
                                    <input
                                        type="number"
                                        className="input"
                                        placeholder={`Enter number of ${product.unit}`}
                                        min="1"
                                        value={quantity}
                                        onChange={e => setQuantity(e.target.value)}
                                        style={{ fontSize: '1.1rem' }}
                                    />
                                </div>

                                {pricing && (
                                    <div className="animate-fade-in" style={{ marginTop: 20 }}>
                                        <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', padding: 20 }}>
                                            <div className="pd-breakdown-row">
                                                <span className="text-light">Quantity</span>
                                                <strong>{pricing.quantity} {product.unit}</strong>
                                            </div>
                                            <div className="pd-breakdown-row">
                                                <span className="text-light">Weight per piece</span>
                                                <span>{pricing.weightPerPiece} kg</span>
                                            </div>
                                            <div className="pd-breakdown-row">
                                                <span className="text-light">Approx Total Weight</span>
                                                <strong>{pricing.totalWeightKg} kg ({pricing.totalWeightTons} T)</strong>
                                            </div>
                                            <div className="pd-breakdown-row">
                                                <span className="text-light">Rate</span>
                                                <span>?{pricing.pricePerTon.toLocaleString()} / ton</span>
                                            </div>
                                            <div className="pd-breakdown-row">
                                                <span className="text-light">Subtotal</span>
                                                <span>?{pricing.subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="pd-breakdown-row">
                                                <span className="text-light">Loading Charges</span>
                                                <span>?{pricing.loadingCharges.toLocaleString()}</span>
                                            </div>
                                            <div className="pd-breakdown-row">
                                                <span className="text-light">Transport Charges</span>
                                                <span>?{pricing.transportCharges.toLocaleString()}</span>
                                            </div>
                                            <div className="pd-breakdown-row">
                                                <span className="text-light">GST ({pricing.gstPercent}%)</span>
                                                <span>?{pricing.gstAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="pd-total-row">
                                                <strong style={{ color: 'var(--color-primary)' }}>Total Amount</strong>
                                                <strong style={{ color: 'var(--color-accent)' }}>?{pricing.total.toLocaleString()}</strong>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pd-actions">
                                    <button className={`btn btn-block ${added ? 'btn-success' : 'btn-outline'}`} onClick={handleAddToCart} disabled={qty <= 0}>
                                        {added ? '? Added to Cart' : '?? Add to Cart'}
                                    </button>
                                    <button className="btn btn-accent btn-block" onClick={handleBuyNow} disabled={qty <= 0}>
                                        Buy Now ?
                                    </button>
                                </div>

                                <a
                                    href={buildWhatsAppUrl({
                                        productName: categoryData.categoryName,
                                        size: product.size,
                                        qty: qty > 0 ? `${qty} ${product.unit}` : '',
                                    })}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-block"
                                    style={{
                                        marginTop: 12,
                                        background: '#25D366',
                                        color: '#fff',
                                        fontSize: '0.9rem',
                                        gap: 8,
                                    }}
                                >
                                    <svg viewBox="0 0 32 32" width="18" height="18" fill="#fff" style={{ flexShrink: 0 }}>
                                        <path d="M16.004 2.667A13.24 13.24 0 0 0 2.76 15.91a13.17 13.17 0 0 0 1.76 6.59L2.667 29.333l7.04-1.84a13.24 13.24 0 0 0 6.3 1.6h.005A13.24 13.24 0 0 0 16.004 2.667zm0 24.266a10.96 10.96 0 0 1-5.59-1.528l-.4-.238-4.16 1.09 1.11-4.053-.26-.415a10.93 10.93 0 0 1-1.68-5.84A10.99 10.99 0 0 1 16.004 4.96 10.99 10.99 0 0 1 27 15.95a11 11 0 0 1-10.996 10.983zm6.03-8.227c-.33-.166-1.955-.964-2.259-1.075-.303-.11-.524-.165-.744.166-.22.33-.855 1.075-1.048 1.296-.193.22-.386.248-.716.083a9.03 9.03 0 0 1-2.656-1.639 9.97 9.97 0 0 1-1.837-2.288c-.193-.33-.02-.51.145-.674.148-.147.33-.386.496-.578.165-.193.22-.33.33-.55.11-.22.056-.413-.028-.578-.083-.166-.744-1.793-1.02-2.455-.27-.646-.543-.558-.744-.568l-.634-.012a1.22 1.22 0 0 0-.882.413 3.7 3.7 0 0 0-1.158 2.757c0 1.626 1.186 3.197 1.351 3.417.166.22 2.332 3.56 5.65 4.994.789.34 1.405.544 1.884.696.792.252 1.513.216 2.083.131.636-.094 1.956-.8 2.231-1.571.276-.772.276-1.434.193-1.571-.083-.138-.303-.22-.634-.386z" />
                                    </svg>
                                    Chat on WhatsApp
                                </a>

                                {qty > 0 && (
                                    <p className="pd-bulk-note">
                                        ?? 100% Advance Required Before Dispatch for Bulk Orders
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="pd-reviews">
                    <div className="pd-reviews-header">
                        <div>
                            <h2>Customer Reviews</h2>
                            <div className="pd-rating-summary">
                                <span className="pd-rating-big">{avgRating}</span>
                                <div className="pd-rating-details">
                                    <Stars rating={parseFloat(avgRating)} size="1.1rem" />
                                    <span className="pd-rating-count">{allReviews.length} reviews</span>
                                </div>
                            </div>
                        </div>
                        <button className="btn btn-outline" onClick={() => setShowReviewModal(true)}>
                            ? Write a Review
                        </button>
                    </div>

                    <div>
                        {allReviews.map((review, idx) => (
                            <div key={idx} className="pd-review-card">
                                <div className="pd-review-top">
                                    <div className="pd-review-avatar">
                                        {review.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="pd-review-meta">
                                        <strong>{review.name}</strong>
                                        <small>{new Date(review.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</small>
                                    </div>
                                    <span className="pd-review-stars">
                                        <Stars rating={review.rating} size="0.9rem" />
                                    </span>
                                </div>
                                <p className="pd-review-text">{review.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {showReviewModal && (
                <ReviewModal
                    onClose={() => setShowReviewModal(false)}
                    onSubmit={handleReviewSubmit}
                />
            )}
        </div>
    );
}
