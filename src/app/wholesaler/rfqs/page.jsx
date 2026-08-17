'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '../../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../../context/AuthContext';
import './wholesaler-rfqs.css';

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconPin = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);
const IconArrow = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const IconBox = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
  </svg>
);
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default function WholesalerRFQsPage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn || !user?.uid) return;
    const q = query(
      collection(db, 'wholesalerAlerts'),
      where('wholesalerUid', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, snap => {
      setAlerts(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, [isLoggedIn, user]);

  async function markViewed(alertId) {
    await updateDoc(doc(db, 'wholesalerAlerts', alertId), { status: 'viewed' });
  }

  function handleRespond(alert) {
    markViewed(alert.id);
    router.push(`/wholesaler/quote/${alert.rfqId}`);
  }

  function timeAgo(ts) {
    if (!ts?.seconds) return 'Just now';
    const diff = Math.floor((Date.now() / 1000) - ts.seconds);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }

  if (!isLoggedIn) {
    return (
      <div className="wrfq-auth">
        <h2>Please log in to view your RFQ alerts</h2>
        <a href="/login" className="wrfq-login-btn">Log In</a>
      </div>
    );
  }

  return (
    <div className="wrfq-page">
      <div className="wrfq-header">
        <div className="wrfq-header-inner">
          <div className="wrfq-header-title">
            <IconBell />
            <div>
              <h1>RFQ Alerts</h1>
              <p>Steel requirements near your location — respond to win the order</p>
            </div>
          </div>
          {alerts.filter(a => a.status === 'new').length > 0 && (
            <span className="wrfq-new-badge">
              {alerts.filter(a => a.status === 'new').length} New
            </span>
          )}
        </div>
      </div>

      <div className="wrfq-container">
        {loading ? (
          <div className="wrfq-loading"><div className="wrfq-loader" /></div>
        ) : alerts.length === 0 ? (
          <div className="wrfq-empty">
            <div className="wrfq-empty-icon"><IconBell /></div>
            <h3>No RFQ alerts yet</h3>
            <p>When contractors post requirements near your location, they will appear here.</p>
          </div>
        ) : (
          <div className="wrfq-list">
            {alerts.map(alert => (
              <div key={alert.id} className={`wrfq-card ${alert.status === 'new' ? 'wrfq-card-new' : ''}`}>
                {alert.status === 'new' && <div className="wrfq-new-dot" />}

                <div className="wrfq-card-top">
                  <div className="wrfq-card-left">
                    <div className="wrfq-card-id">RFQ #{alert.rfqId?.slice(0, 8).toUpperCase()}</div>
                    <div className="wrfq-card-meta">
                      <span><IconPin /> {alert.rfqPincode}</span>
                      <span><IconBox /> {alert.items?.length} item(s)</span>
                      <span><IconClock /> {timeAgo(alert.createdAt)}</span>
                      <span className="wrfq-dist">{alert.distanceKm} km from you</span>
                    </div>
                  </div>
                  <div className={`wrfq-status wrfq-status-${alert.status}`}>
                    {alert.status === 'new' ? 'New' : alert.status === 'quoted' ? 'Quoted' : 'Viewed'}
                  </div>
                </div>

                <div className="wrfq-items">
                  {alert.items?.slice(0, 4).map((item, i) => (
                    <span key={i} className="wrfq-item-tag">
                      {item.product} {item.size} — {item.quantity} {item.unit}
                    </span>
                  ))}
                  {alert.items?.length > 4 && (
                    <span className="wrfq-item-more">+{alert.items.length - 4} more</span>
                  )}
                </div>

                {alert.notes && (
                  <p className="wrfq-notes">{alert.notes}</p>
                )}

                <div className="wrfq-card-actions">
                  {alert.contractorPhone && (
                    <a
                      className="wrfq-wa-btn"
                      href={`https://wa.me/91${alert.contractorPhone.replace(/\D/g,'').slice(-10)}?text=${encodeURIComponent(`Hi ${alert.contractorName || ''}, I saw your RFQ on Looha for ${alert.rfqPincode}. I can supply the required steel. Please share details.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.554 4.122 1.523 5.855L0 24l6.335-1.507A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.877 9.877 0 0 1-5.031-1.378l-.361-.214-3.741.981.999-3.648-.235-.374A9.865 9.865 0 0 1 2.118 12C2.118 6.53 6.53 2.118 12 2.118c5.468 0 9.882 4.412 9.882 9.882 0 5.469-4.414 9.882-9.882 9.882z"/></svg>
                      WhatsApp Contractor
                    </a>
                  )}
                  <button className="wrfq-respond-btn" onClick={() => handleRespond(alert)}>
                    Submit My Quote <IconArrow />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
