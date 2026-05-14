import { SEO_DATA } from '../../../components/CategoryPage';
import CategoryPageComponent from '../../../components/CategoryPage';

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const seo = SEO_DATA?.[slug];
    if (!seo) {
        return {
            title: `${slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} Price in Nellore | LOOHA`,
            description: `Buy ${slug.replace(/-/g, ' ')} in Nellore at wholesale prices. Live rates, GST invoice, fast delivery. Call 8885999718.`,
        };
    }
    return {
        title: seo.title,
        description: seo.description,
        alternates: {
            canonical: `https://www.looha.in/products/${slug}`,
        },
        openGraph: {
            title: seo.title,
            description: seo.description,
            url: `https://www.looha.in/products/${slug}`,
            type: 'website',
        },
    };
}

export default function CategoryPage() {
    return <CategoryPageComponent />;
}
