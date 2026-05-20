// LOOHA contact configuration
// Single source of truth for WhatsApp and contact details

export const WHATSAPP_PHONE = '918885999718';

export const COMPANY_PHONE = '+91 88859 99718';
export const COMPANY_PHONE_RAW = '8885999718';
export const COMPANY_EMAIL = 'support@looha.in';
export const COMPANY_NAME = 'Looha';
export const COMPANY_LEGAL_NAME = 'Looha Technologies Pvt. Ltd.';
export const COMPANY_ADDRESS = 'Near Mulapet Gate Centre, Nellore, Andhra Pradesh — 524003';
export const COMPANY_CITY = 'Nellore';
export const COMPANY_STATE = 'Andhra Pradesh';
export const COMPANY_PINCODE = '524003';
export const COMPANY_GSTIN = 'YOUR_GSTIN_HERE'; // Update after GST registration
export const COMPANY_WEBSITE = 'https://www.looha.in';

export const MESSAGE_TEMPLATES = {
    generic: (pincode) =>
        `Hi Looha, I want the best price for steel materials.${pincode ? ` My delivery pincode is ${pincode}.` : ''} Please share details. (Nellore)`,

    product: ({ productName, size, qty, pincode }) =>
        `Hi Looha, I want to enquire about ${productName || 'steel products'}.${size ? ` Size: ${size}.` : ''}${qty ? ` Qty: ${qty}.` : ''}${pincode ? ` Delivery Pincode: ${pincode}.` : ''} Please share the best price.`,

    order: (orderId) =>
        `Hi Looha, I need help with my order #${orderId}. Please assist.`,
};
