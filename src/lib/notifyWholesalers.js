// Client-side wholesaler matching + alert creation utility
// Called after RFQ is submitted to Firestore

import { db } from './firebase';
import {
  collection, query, where, getDocs,
  addDoc, updateDoc, doc, serverTimestamp,
} from 'firebase/firestore';
import { haversineKm } from './distance';

// Geocode a pincode via our server-side API (avoids CORS)
async function geocodePincode(pincode) {
  try {
    const res = await fetch(`/api/geocode?pincode=${pincode}`);
    if (!res.ok) return null;
    return await res.json(); // { lat, lon, display }
  } catch {
    return null;
  }
}

// Cache geocode results in memory during session to avoid repeat calls
const geoCache = {};

async function getCachedGeo(pincode) {
  if (geoCache[pincode]) return geoCache[pincode];
  const result = await geocodePincode(pincode);
  if (result) geoCache[pincode] = result;
  return result;
}

/**
 * Main function — finds the 3 nearest wholesalers within 100km
 * and creates wholesalerAlert documents for each.
 *
 * @param {string} rfqId
 * @param {object} rfq  - { pincode, contractorName, contractorPhone, items, notes }
 * @returns {Array} matched wholesalers with distance info
 */
export async function notifyNearestWholesalers(rfqId, rfq) {
  const MAX_DISTANCE_KM = 100;
  const MAX_WHOLESALERS = 3;

  // 1. Geocode the RFQ pincode
  const rfqGeo = await getCachedGeo(rfq.pincode);
  if (!rfqGeo) {
    console.warn('Could not geocode RFQ pincode:', rfq.pincode);
    return [];
  }

  // 2. Fetch all registered wholesalers from Firestore
  const q = query(collection(db, 'users'), where('role', '==', 'wholesaler'));
  const snap = await getDocs(q);
  const wholesalers = snap.docs.map(d => ({ uid: d.id, ...d.data() }));

  if (!wholesalers.length) return [];

  // 3. Geocode each wholesaler's pincode and calculate distance
  const withDistance = [];
  for (const w of wholesalers) {
    if (!w.pincode) continue;
    const geo = await getCachedGeo(w.pincode);
    if (!geo) continue;
    const km = haversineKm(rfqGeo.lat, rfqGeo.lon, geo.lat, geo.lon);
    if (km <= MAX_DISTANCE_KM) {
      withDistance.push({ ...w, distanceKm: Math.round(km * 10) / 10 });
    }
  }

  // 4. Sort by distance, pick closest 3
  withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
  const nearest = withDistance.slice(0, MAX_WHOLESALERS);

  // 5. Create a wholesalerAlert doc for each
  const alertPromises = nearest.map(w => {
    const waText = encodeURIComponent(
      `Hi ${w.name || 'there'}, a new steel RFQ near your location (${rfq.pincode}) has been posted on Looha.\n\n` +
      `Items: ${rfq.items.map(i => `${i.quantity} ${i.unit} ${i.product} ${i.size}`).join(', ')}\n\n` +
      `View & respond here: https://www.looha.in/wholesaler/quote/${rfqId}\n\nLooha Platform`
    );
    const waLink = w.phone
      ? `https://wa.me/91${w.phone.replace(/\D/g, '').slice(-10)}?text=${waText}`
      : null;

    return addDoc(collection(db, 'wholesalerAlerts'), {
      wholesalerUid: w.uid,
      wholesalerName: w.name || '',
      wholesalerPhone: w.phone || '',
      rfqId,
      rfqPincode: rfq.pincode,
      contractorName: rfq.contractorName || '',
      contractorPhone: rfq.contractorPhone || '',
      items: rfq.items || [],
      notes: rfq.notes || '',
      distanceKm: w.distanceKm,
      status: 'new',       // new | viewed | quoted
      waLink: waLink || '',
      createdAt: serverTimestamp(),
    });
  });

  await Promise.all(alertPromises);

  // 6. Update the RFQ doc with notified wholesalers list
  await updateDoc(doc(db, 'rfqs', rfqId), {
    notifiedWholesalers: nearest.map(w => ({
      uid: w.uid,
      name: w.name || '',
      phone: w.phone || '',
      distanceKm: w.distanceKm,
    })),
    notifiedCount: nearest.length,
    updatedAt: serverTimestamp(),
  });

  return nearest;
}
