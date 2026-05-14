import { Suspense } from 'react';
import OrderTrackingComponent from '../../components/OrderTracking';

export const metadata = {
  title: 'My Orders — Looha Steel',
  description: 'Track and manage your steel orders from Looha, Nellore.',
};

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', textAlign: 'center' }}>Loading orders...</div>}>
      <OrderTrackingComponent />
    </Suspense>
  );
}
