import { categories } from '../data/products';

const BASE_URL = 'https://www.looha.in';

export default function sitemap() {
    const now = new Date().toISOString();

    // Static pages
    const staticRoutes = [
        { url: BASE_URL,                       lastModified: now, changeFrequency: 'daily',   priority: 1.0 },
        { url: `${BASE_URL}/about`,            lastModified: now, changeFrequency: 'monthly',  priority: 0.7 },
        { url: `${BASE_URL}/brands`,           lastModified: now, changeFrequency: 'weekly',   priority: 0.8 },
        { url: `${BASE_URL}/blog`,             lastModified: now, changeFrequency: 'weekly',   priority: 0.7 },
        { url: `${BASE_URL}/support`,          lastModified: now, changeFrequency: 'monthly',  priority: 0.5 },
        { url: `${BASE_URL}/contact`,          lastModified: now, changeFrequency: 'monthly',  priority: 0.5 },
        { url: `${BASE_URL}/shipping-policy`,  lastModified: now, changeFrequency: 'yearly',   priority: 0.3 },
        { url: `${BASE_URL}/terms`,            lastModified: now, changeFrequency: 'yearly',   priority: 0.3 },
        { url: `${BASE_URL}/refund`,           lastModified: now, changeFrequency: 'yearly',   priority: 0.3 },
        { url: `${BASE_URL}/privacy`,          lastModified: now, changeFrequency: 'yearly',   priority: 0.3 },
        { url: `${BASE_URL}/payment-policy`,   lastModified: now, changeFrequency: 'yearly',   priority: 0.3 },
    ];

    // Dynamic product category pages — highest SEO priority
    const categoryRoutes = categories.map(cat => ({
        url: `${BASE_URL}/products/${cat.id}`,
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.95,
    }));

    return [...staticRoutes, ...categoryRoutes];
}
