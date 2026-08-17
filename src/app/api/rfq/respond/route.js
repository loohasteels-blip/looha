import { db } from '../../../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req) {
  try {
    const body = await req.json();
    const { rfqId, wholesalerUid, wholesalerName, wholesalerGST, wholesalerPhone, prices, freightPerTon, deliveryDays, validDays, notes } = body;

    if (!rfqId || !wholesalerUid || !prices?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const quoteRef = db.collection('rfqs').doc(rfqId).collection('quotes').doc(wholesalerUid);
    const quoteData = {
      wholesalerUid,
      wholesalerName: wholesalerName || '',
      wholesalerGST: wholesalerGST || '',
      wholesalerPhone: wholesalerPhone || '',
      prices,            // array: [{ product, size, pricePerTon, quantity }]
      freightPerTon: freightPerTon || 0,
      deliveryDays: deliveryDays || 3,
      validDays: validDays || 3,
      notes: notes || '',
      submittedAt: FieldValue.serverTimestamp(),
    };

    await quoteRef.set(quoteData);

    // Increment quote count on parent RFQ
    await db.collection('rfqs').doc(rfqId).update({
      quotesCount: FieldValue.increment(1),
      status: 'quoted',
      updatedAt: FieldValue.serverTimestamp(),
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error('rfq/respond error:', err);
    return Response.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
