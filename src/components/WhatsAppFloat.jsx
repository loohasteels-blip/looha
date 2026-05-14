'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import './WhatsAppFloat.css';

function buildWhatsAppUrl() {
    const phone = '918885999718';
    const message = encodeURIComponent('Hello! I would like to enquire about steel products.');
    return `https://wa.me/${phone}?text=${message}`;
}

export default function WhatsAppFloat() {
    const url = buildWhatsAppUrl();
    return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="wa-float" aria-label="Chat on WhatsApp" title="Chat on WhatsApp">
            <svg viewBox="0 0 32 32" width="28" height="28" fill="#fff">
                <path d="M16.004 2.667A13.24 13.24 0 0 0 2.76 15.91a13.17 13.17 0 0 0 1.76 6.59L2.667 29.333l7.04-1.84a13.24 13.24 0 0 0 6.3 1.6h.005A13.24 13.24 0 0 0 16.004 2.667zm0 24.266a10.96 10.96 0 0 1-5.59-1.528l-.4-.238-4.16 1.09 1.11-4.053-.26-.415a10.93 10.93 0 0 1-1.68-5.84A10.99 10.99 0 0 1 16.004 4.96 10.99 10.99 0 0 1 27 15.95a11 11 0 0 1-10.996 10.983zm6.03-8.227c-.33-.166-1.955-.964-2.259-1.075-.303-.11-.524-.165-.744.166-.22.33-.855 1.075-1.048 1.296-.193.22-.386.248-.716.083a9.03 9.03 0 0 1-2.656-1.639 9.97 9.97 0 0 1-1.837-2.288c-.193-.33-.02-.51.145-.674.148-.147.33-.386.496-.578.165-.193.22-.33.33-.55.11-.22.056-.413-.028-.578-.083-.166-.744-1.793-1.02-2.455-.27-.646-.543-.558-.744-.568l-.634-.012a1.22 1.22 0 0 0-.882.413 3.7 3.7 0 0 0-1.158 2.757c0 1.626 1.186 3.197 1.351 3.417.166.22 2.332 3.56 5.65 4.994.789.34 1.405.544 1.884.696.792.252 1.513.216 2.083.131.636-.094 1.956-.8 2.231-1.571.276-.772.276-1.434.193-1.571-.083-.138-.303-.22-.634-.386z" />
            </svg>
        </a>
    );
}
