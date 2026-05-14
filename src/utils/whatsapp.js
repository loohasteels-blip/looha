import { WHATSAPP_PHONE, MESSAGE_TEMPLATES } from '../config/contact';

/**
 * Build a WhatsApp click-to-chat URL.
 * @param {object} opts
 * @param {string} [opts.productName] - Product name for context
 * @param {string} [opts.size] - Selected size
 * @param {string|number} [opts.qty] - Quantity entered
 * @param {string} [opts.pincode] - Delivery pincode
 * @returns {string} WhatsApp URL
 */
export function buildWhatsAppUrl({ productName, size, qty, pincode } = {}) {
    const hasProduct = productName || size || qty;
    const message = hasProduct
        ? MESSAGE_TEMPLATES.product({ productName, size, qty, pincode })
        : MESSAGE_TEMPLATES.generic(pincode);

    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Build a WhatsApp URL for order-related queries.
 * @param {string} orderId
 * @returns {string} WhatsApp URL
 */
export function buildOrderWhatsAppUrl(orderId) {
    const message = MESSAGE_TEMPLATES.order(orderId);
    return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}
