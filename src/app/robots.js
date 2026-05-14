export default function robots() {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/dashboard/',
                    '/checkout/',
                    '/payment/',
                    '/orders/',
                    '/admin/',
                    '/login',
                    '/register',
                ],
            },
        ],
        sitemap: 'https://www.looha.in/sitemap.xml',
        host: 'https://www.looha.in',
    };
}
