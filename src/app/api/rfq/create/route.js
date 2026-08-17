import { db } from '../../../../lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req) {
  try {
    const body = await req.json();
    const { contractorUid, contractorName, contractorPhone, pincode, items, notes } = body;

    if (!contractorUid || !pincode || !items?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const rfqRef = db.collection('rfqs').doc();
    const rfqData = {
      id: rfqRef.id,
      contractorUid,
      contractorName: contractorName || '',
      contractorPhone: contractorPhone || '',
      pincode,
      items,
      notes: notes || '',
      status: 'pending', // pending | quoted | accepted | closed
      quotesCount: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };

    await rfqRef.set(rfqData);

    return Response.json({ success: true, rfqId: rfqRef.id });
  } catch (err) {
    console.error('rfq/create error:', err);
    return Response.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
