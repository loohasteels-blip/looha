import './globals.css';
import './app.css';
import { Inter, Sora } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider } from '../context/CartContext';
import { OrderProvider } from '../context/OrderContext';
import { PricingProvider } from '../context/PricingContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const sora = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' });

export const metadata = {
  title: 'Wholesale Steel Supplier in Nellore | TMT Bars, MS Pipes & Structural Steel — Looha',
  description: 'Wholesale steel supplier in Nellore stocking TMT Bars, MS Pipes, MS Beams, MS Channels, and GI Sheets from TATA Tiscon, Vizag Steel, JSW, Jindal, and SAIL. Serving contractors, builders, and fabricators near Mulapet Gate, Nellore – 524003. Bulk orders accepted.',
  keywords: 'steel supplier Nellore, TMT bars Nellore, wholesale steel Nellore, MS pipes Nellore, TATA Tiscon dealer Nellore, construction steel Nellore',
  authors: [{ name: 'Looha Technologies' }],
  robots: 'index, follow',
  alternates: { canonical: 'https://www.looha.in/' },
  openGraph: {
    type: 'website',
    url: 'https://www.looha.in/',
    title: 'Wholesale Steel Supplier in Nellore | TMT Bars, MS Pipes & Structural Steel — Looha',
    description: 'Wholesale steel supplier in Nellore stocking TMT Bars, MS Pipes, MS Beams, MS Channels, and GI Sheets from TATA Tiscon, Vizag Steel, JSW, Jindal, and SAIL. Serving contractors, builders, and fabricators near Mulapet Gate, Nellore – 524003.',
    images: [{ url: 'https://www.looha.in/og-image.png', width: 1200, height: 630 }],
    siteName: 'Looha',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wholesale Steel Supplier in Nellore | TMT Bars, MS Pipes — Looha',
    description: 'Wholesale steel from TATA Tiscon, JSW, Vizag, Jindal & SAIL. Bulk orders. Near Mulapet Gate, Nellore. Call: 8885999718.',
    images: ['https://www.looha.in/og-image.png'],
  },
  other: {
    'geo.region': 'IN-AP',
    'geo.placename': 'Nellore, Andhra Pradesh',
    'geo.position': '14.4426;79.9865',
    'ICBM': '14.4426, 79.9865',
  },
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'LocalBusiness',
      '@id': 'https://www.looha.in/#business',
      name: 'Looha',
      legalName: 'Looha Technologies Pvt. Ltd.',
      alternateName: ['Looha Technologies', 'Looha Steel', 'Looha Nellore'],
      description: 'Looha is Nellore\'s transparent, no-credit digital steel distribution platform supplying TMT Bars, MS Pipes, MS Beams, MS Channels, GI Sheets from TATA Tiscon, Vizag Steel, JSW, Jindal Panther, and SAIL.',
      url: 'https://www.looha.in',
      telephone: '+918885999718',
      email: 'support@looha.in',
      foundingDate: '2026',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Near Mulapet Gate Centre',
        addressLocality: 'Nellore',
        addressRegion: 'Andhra Pradesh',
        postalCode: '524003',
        addressCountry: 'IN',
      },
      geo: { '@type': 'GeoCoordinates', latitude: 14.4426, longitude: 79.9865 },
      areaServed: [{ '@type': 'City', name: 'Nellore' }, { '@type': 'State', name: 'Andhra Pradesh' }],
      openingHoursSpecification: [{ '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '19:00' }],
      priceRange: '₹₹',
      paymentAccepted: 'Cash, Online Transfer, UPI',
      currenciesAccepted: 'INR',
      brand: [
        { '@type': 'Brand', name: 'TATA Tiscon' },
        { '@type': 'Brand', name: 'Vizag Steel' },
        { '@type': 'Brand', name: 'JSW Neo' },
        { '@type': 'Brand', name: 'Jindal Panther' },
        { '@type': 'Brand', name: 'SAIL' },
        { '@type': 'Brand', name: 'APL Apollo' },
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://www.looha.in/#website',
      name: 'Looha',
      url: 'https://www.looha.in',
      description: 'Digital steel distribution platform for Nellore and Andhra Pradesh',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: 'https://www.looha.in/products/{search_term_string}' },
        'query-input': 'required name=search_term_string',
      },
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#0A1F44" />
      </head>
      <body>
        <AuthProvider>
          <PricingProvider>
            <CartProvider>
              <OrderProvider>
                <Header />
                <main>{children}</main>
                <Footer />
                <WhatsAppFloat />
              </OrderProvider>
            </CartProvider>
          </PricingProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
