import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { amount, currency = 'INR', receipt, notes } = await request.json();

        const keyId = process.env.RAZORPAY_KEY_ID;
        const keySecret = process.env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
            return NextResponse.json({ error: 'Razorpay credentials not configured' }, { status: 500 });
        }

        // Create order via Razorpay REST API (no SDK needed)
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // paise
                currency,
                receipt: receipt || `rcpt_${Date.now()}`,
                notes: notes || {},
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Razorpay API error:', data);
            return NextResponse.json({ error: data.error?.description || 'Failed to create Razorpay order' }, { status: response.status });
        }

        return NextResponse.json({ orderId: data.id, amount: data.amount, currency: data.currency });
    } catch (err) {
        console.error('create-order error:', err);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
