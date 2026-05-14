'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrderContext';
import { usePricing } from '../context/PricingContext';
import { products, categories } from '../data/products';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, deleteDoc, doc, getDocs, where } from 'firebase/firestore';
import './Admin.css';

function GSTInvoice({ order, onClose }) {
    const invoiceRef = useRef();
    const [items, setItems] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(true);

    // ── Fetch order items from the separate orderItems collection ─────────────
    useEffect(() => {
        if (!order?.id) return;
        getDocs(query(collection(db, 'orderItems'), where('orderId', '==', order.id)))
            .then(snap => {
                setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            })
            .catch(console.error)
            .finally(() => setItemsLoading(false));
    }, [order?.id]);

    // ── helpers ───────────────────────────────────────────────────────────────
    const orderDate  = order.createdAt ? new Date(order.createdAt) : new Date();
    const dueDate    = new Date(orderDate); dueDate.setDate(dueDate.getDate() + 15);
    const fmt        = d => d.toLocaleDateString('en-IN', { day:'2-digit', month:'2-digit', year:'numeric' });
    const yr         = orderDate.getFullYear();
    const invoiceNo  = `LS/${String(yr).slice(2)}-${String(yr+1).slice(2)}/${(order.orderNumber||order.id||'').substring(0,6).toUpperCase()}`;

    // Fields are stored FLAT in orderItems (not nested under pricing)
    const subtotal   = items.reduce((s,i) => s+(i.subtotal||0)+(i.loadingCharges||0)+(i.transportCharges||0), 0);
    const gstTotal   = items.reduce((s,i) => s+(i.gstAmount||0), 0);
    const cgst       = Math.round(gstTotal/2);
    const sgst       = Math.round(gstTotal/2);
    const grandTotal = order.total || (subtotal + gstTotal);

    const numToWords = n => {
        const a=['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
        const b=['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
        const w=num=>{if(num<20)return a[num];if(num<100)return b[Math.floor(num/10)]+(num%10?' '+a[num%10]:'');if(num<1000)return a[Math.floor(num/100)]+' Hundred'+(num%100?' '+w(num%100):'');if(num<100000)return w(Math.floor(num/1000))+' Thousand'+(num%1000?' '+w(num%1000):'');if(num<10000000)return w(Math.floor(num/100000))+' Lakh'+(num%100000?' '+w(num%100000):'');return w(Math.floor(num/10000000))+' Crore'+(num%10000000?' '+w(num%10000000):'');};
        return w(Math.round(n||0))+' Rupees Only';
    };

    const cell = (extra={}) => ({ border:'1px solid #999', padding:'7px 8px', fontSize:12, ...extra });

    const handlePrint = () => {
        const content = invoiceRef.current.innerHTML;
        const win = window.open('', '_blank', 'width=850,height=1000');
        win.document.write(`
            <html><head><title>Invoice - ${order.id}</title>
            <style>
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { font-family: Arial, sans-serif; padding: 30px; color: #111; font-size: 13px; }
                @media print { body { padding: 15px; } }
            </style></head><body>${content}</body></html>
        `);
        win.document.close();
        setTimeout(() => win.print(), 400);
    };

    return (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
            <div style={{ background:'#fff', borderRadius:12, maxWidth:860, width:'100%', maxHeight:'92vh', overflow:'auto', padding:28 }}>
                {/* toolbar */}
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                    <h3 style={{ margin:0 }}>Invoice Preview</h3>
                    <div style={{ display:'flex', gap:8 }}>
                        <button className="btn btn-primary btn-sm" onClick={handlePrint}>🖨 Print Invoice</button>
                        <button className="btn btn-ghost btn-sm" onClick={onClose}>✕ Close</button>
                    </div>
                </div>

                {/* ── INVOICE BODY ── */}
                <div ref={invoiceRef} style={{ border:'1px solid #ccc', padding:28, fontFamily:'Arial,sans-serif', fontSize:13, color:'#111' }}>

                    {/* HEADER */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'2px solid #000', paddingBottom:12, marginBottom:16 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                            <img src="https://www.looha.in/logo.png" alt="LOOHA" style={{ height:64, width:'auto' }} />
                            <div>
                                <div style={{ fontSize:22, fontWeight:900, letterSpacing:1 }}>LOOHA STEELS</div>
                                <div style={{ fontSize:11, color:'#555', marginTop:2 }}>STEEL &amp; INDUSTRIAL SOLUTIONS</div>
                            </div>
                        </div>
                        <div style={{ fontSize:22, fontWeight:700, letterSpacing:3 }}>INVOICE</div>
                    </div>

                    {/* BILL TO + META */}
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
                        <div style={{ fontSize:12, lineHeight:1.95 }}>
                            <div><strong>Invoice To :</strong></div>
                            <div>{order.userName || order.user?.name || 'Customer Name'}</div>
                            <div>{order.address?.line1 || 'Customer Address'}{order.address?.line2 ? ', '+order.address.line2 : ''}</div>
                            <div>{order.address ? `${order.address.city}, ${order.address.state} - ${order.address.pincode}` : 'City, State - PIN'}</div>
                            <div>Phone: {order.userPhone || order.user?.phone || '0000000000'}</div>
                        </div>
                        <div style={{ fontSize:12, lineHeight:2, textAlign:'right' }}>
                            <div><strong>Invoice No. &nbsp;:</strong> {invoiceNo}</div>
                            <div><strong>Invoice Date :</strong> {fmt(orderDate)}</div>
                            <div><strong>Due Date &nbsp;&nbsp;&nbsp;:</strong> {fmt(dueDate)}</div>
                        </div>
                    </div>

                    {/* ITEMS TABLE */}
                    <table style={{ width:'100%', borderCollapse:'collapse', margin:'12px 0' }}>
                        <thead>
                            <tr style={{ background:'#f0f0f0' }}>
                                {['S.No.','Description','HSN Code','Qty','Unit','Rate','Amount'].map((h,i)=>(
                                    <th key={i} style={{ border:'1px solid #999', padding:'7px 8px', fontSize:12, textAlign: i===1?'left':'center' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {itemsLoading ? (
                                <tr><td colSpan={7} style={{ textAlign:'center', padding:20, color:'#888' }}>Loading items...</td></tr>
                            ) : items.length === 0 ? (
                                <tr><td colSpan={7} style={{ textAlign:'center', padding:20, color:'#888' }}>No items found</td></tr>
                            ) : items.map((item, i) => (
                                <tr key={i}>
                                    <td style={cell({textAlign:'center'})}>{i+1}</td>
                                    <td style={cell()}>{item.categoryName||'Steel'} — {item.size}{item.brand ? ` (${item.brand})` : ''}</td>
                                    <td style={cell({textAlign:'center'})}>7213</td>
                                    <td style={cell({textAlign:'center'})}>{item.quantity}</td>
                                    <td style={cell({textAlign:'center'})}>{item.unit||'Nos'}</td>
                                    <td style={cell({textAlign:'right'})}>₹{(item.pricePerTon||0).toLocaleString()}</td>
                                    <td style={cell({textAlign:'right'})}>₹{((item.subtotal||0)+(item.loadingCharges||0)+(item.transportCharges||0)).toLocaleString()}</td>
                                </tr>
                            ))}
                            {!itemsLoading && items.length > 0 && Array.from({ length: Math.max(0, 5-items.length) }).map((_,i)=>(
                                <tr key={'b'+i}>
                                    {[1,2,3,4,5,6,7].map(j=><td key={j} style={cell()}>&nbsp;</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* TOTALS */}
                    <div style={{ display:'flex', justifyContent:'flex-end' }}>
                        <table style={{ width:260, borderCollapse:'collapse' }}>
                            <tbody>
                                <tr><td style={cell({fontWeight:600})}>Sub Total</td><td style={cell({textAlign:'right'})}>₹{subtotal.toLocaleString()}</td></tr>
                                <tr><td style={cell()}>CGST @ 9%</td><td style={cell({textAlign:'right'})}>₹{cgst.toLocaleString()}</td></tr>
                                <tr><td style={cell()}>SGST @ 9%</td><td style={cell({textAlign:'right'})}>₹{sgst.toLocaleString()}</td></tr>
                                <tr style={{ fontWeight:700, background:'#f0f0f0' }}>
                                    <td style={cell()}>Total</td>
                                    <td style={cell({textAlign:'right'})}>₹{grandTotal.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* AMOUNT IN WORDS */}
                    <div style={{ marginTop:14, fontSize:12, borderTop:'1px solid #ccc', paddingTop:8 }}>
                        <strong>Amount in Words :</strong> {numToWords(grandTotal)}
                    </div>

                    {/* FOOTER */}
                    <div style={{ marginTop:24, borderTop:'2px solid #000', paddingTop:12, fontSize:11, lineHeight:1.9 }}>
                        <div style={{ fontSize:15, fontWeight:900, marginBottom:2 }}>LOOHA STEELS</div>
                        <div><strong>GST Billing Entity : </strong>MBJSTEELS</div>
                        <div><strong>GSTIN : </strong>37GOUPS1032G1ZJ</div>
                        <div>Near Mulapet Gate Centre, Nellore - 524003, Andhra Pradesh</div>
                        <div>📞 8885999718 &nbsp;|&nbsp; ✉ mbjsteels@gmail.com</div>
                        <div style={{ marginTop:8, fontStyle:'italic', color:'#555' }}>This invoice is generated under MBJSTEELS for LOOHA brand operations.</div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Admin() {
    const { isAdmin, isLoggedIn } = useAuth();
    const { orders, updateOrderStatus, ORDER_STATUSES } = useOrders();
    const { getAllRates, charges: firestoreCharges, saveRates, saveCharges, firestoreBrandMultipliers, getBrandMultipliers, saveBrandMultipliers } = usePricing();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [invoiceOrder, setInvoiceOrder] = useState(null);

    // Blog posts state
    const [blogPosts, setBlogPosts] = useState([]);
    const [blogSearch, setBlogSearch] = useState('');
    const [blogFilter, setBlogFilter] = useState('all');
    const [blogDeleteConfirm, setBlogDeleteConfirm] = useState(null);
    const [orderSearch, setOrderSearch] = useState('');
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');
    const [orderPaymentFilter, setOrderPaymentFilter] = useState('all');
    const [userSearch, setUserSearch] = useState('');
    const [lastRatesSaved, setLastRatesSaved] = useState(null);

    // Rates state — initialized from Firestore via PricingContext
    const [rates, setRates] = useState({});
    const [ratesSaved, setRatesSaved] = useState(false);
    // Bulk price per category (just UI — not saved to Firestore directly)
    const [bulkPrices, setBulkPrices] = useState({});
    
    // Brand multipliers state
    const [adminBrandMultipliers, setAdminBrandMultipliers] = useState({});

    // Sync brand multipliers from PricingContext
    useEffect(() => {
        const initialBM = {};
        Object.entries(products).forEach(([catId, catData]) => {
            if (catData.brands) {
                initialBM[catId] = getBrandMultipliers(catId);
            }
        });
        setAdminBrandMultipliers(initialBM);
    }, [firestoreBrandMultipliers, getBrandMultipliers]);

    // Apply a single bulk price to all sizes of one product
    const handleBulkApply = (catId, catData) => {
        const bulk = parseInt(bulkPrices[catId]);
        if (!bulk || bulk <= 0) return;
        const updated = { ...rates };
        catData.items.forEach(item => { updated[item.id] = bulk; });
        setRates(updated);
        // flash feedback
        setBulkPrices(prev => ({ ...prev, [catId]: '' }));
    };

    // Charges state — initialized from Firestore via PricingContext
    const [adminCharges, setAdminCharges] = useState(firestoreCharges);
    const [chargesSaved, setChargesSaved] = useState(false);

    // Sync rates from PricingContext
    useEffect(() => {
        setRates(getAllRates());
    }, [getAllRates]);

    // Sync charges from PricingContext
    useEffect(() => {
        setAdminCharges(firestoreCharges);
    }, [firestoreCharges]);

    // Users from Firestore
    const [users, setUsers] = useState([]);
    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
            setUsers(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsubscribe();
    }, []);

    // Blog posts from Firestore
    useEffect(() => {
        const q = query(collection(db, 'blog_posts'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setBlogPosts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsubscribe();
    }, []);

    const handleDeleteBlogPost = async (postId) => {
        try {
            await deleteDoc(doc(db, 'blog_posts', postId));
            setBlogDeleteConfirm(null);
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Failed to delete post.');
        }
    };

    const filteredBlogPosts = blogPosts.filter(p => {
        const matchSearch = !blogSearch || p.title?.toLowerCase().includes(blogSearch.toLowerCase());
        const matchFilter = blogFilter === 'all' || p.status === blogFilter;
        return matchSearch && matchFilter;
    });

    const formatBlogDate = (ts) => {
        if (!ts) return '—';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    if (!isLoggedIn) return <div className="page container" style={{ textAlign: 'center', paddingTop: 80 }}><h2>Please login</h2><Link href="/login" className="btn btn-primary mt-2">Login</Link></div>;
    if (!isAdmin) return <div className="page container" style={{ textAlign: 'center', paddingTop: 80 }}><h2>Access Denied</h2><p className="text-light mt-1">Admin access required</p><Link href="/" className="btn btn-primary mt-2">Go Home</Link></div>;

    const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const pendingOrders = orders.filter(o => o.statusIndex < 4).length;
    const codOrders = orders.filter(o => o.paymentMethod === 'cod' && o.statusIndex < 4).length;

    const handleSaveRates = async () => {
        const result = await saveRates(rates);
        const result2 = await saveBrandMultipliers(adminBrandMultipliers);
        if (result.success && result2.success) {
            setRatesSaved(true);
            setLastRatesSaved(new Date());
            setTimeout(() => setRatesSaved(false), 2000);
        }
    };

    // Today stats
    const today = new Date().toDateString();
    const todayOrders = orders.filter(o => o.createdAt && new Date(o.createdAt).toDateString() === today);
    const todayRevenue = todayOrders.reduce((s, o) => s + (o.total || 0), 0);

    // Filtered orders
    const filteredOrders = orders.filter(o => {
        const matchSearch = !orderSearch || (o.id + (o.userName||'') + (o.userPhone||'')).toLowerCase().includes(orderSearch.toLowerCase());
        const matchStatus = orderStatusFilter === 'all' || String(o.statusIndex) === orderStatusFilter;
        const matchPayment = orderPaymentFilter === 'all' || o.paymentMethod === orderPaymentFilter;
        return matchSearch && matchStatus && matchPayment;
    });

    // Filtered users
    const filteredUsers = users.filter(u => !userSearch ||
        (u.name+u.email+u.phone+u.company+'').toLowerCase().includes(userSearch.toLowerCase()));

    // CSV Export
    const exportCSV = () => {
        const rows = [['Order ID','Date','Customer','Phone','Payment','Amount','Status']];
        orders.forEach(o => rows.push([o.id, o.createdAt ? new Date(o.createdAt).toLocaleDateString('en-IN') : '', o.userName||'', o.userPhone||'', o.paymentMethod||'', o.total||0, o.status||''  ]));
        const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `looha-orders-${Date.now()}.csv`; a.click();
    };

    const handleSaveCharges = async () => {
        const result = await saveCharges(adminCharges);
        if (result.success) {
            setChargesSaved(true);
            setTimeout(() => setChargesSaved(false), 2000);
        }
    };

    const pendingCount = orders.filter(o => o.statusIndex < 2).length;
    const tabs = [
        { id: 'dashboard', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>, label: 'Dashboard' },
        { id: 'rates', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" /></svg>, label: 'Steel Rates' },
        { id: 'orders', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>, label: 'Orders', badge: pendingCount },
        { id: 'charges', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg>, label: 'Charges' },
        { id: 'users', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"/></svg>, label: 'Users', badge: users.length },
        { id: 'reports', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zm9.75-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.625c0 .621-.504 1.125-1.125 1.125h-2.25A1.125 1.125 0 0112.75 19.875V8.25zm-4.875 4.5c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v7.125c0 .621-.504 1.125-1.125 1.125H9A1.125 1.125 0 017.875 19.875V12.75z"/></svg>, label: 'Reports' },
        { id: 'blog', icon: <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5"/></svg>, label: 'Blog', badge: blogPosts.filter(p => p.status === 'draft').length || 0 },
    ];

    return (
        <div className="page animate-fade-in">
            <div className="container">
                <div className="page-header">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                        <h1>Admin Panel</h1>
                        <Link href="/admin/cms" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"/></svg>
                            Blog CMS
                        </Link>
                    </div>
                </div>

                <div className="admin-layout">
                    <nav className="admin-nav">
                        {tabs.map(tab => (
                            <button key={tab.id} className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)} style={{ position: 'relative' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{tab.icon}{tab.label}</span>
                                {tab.badge > 0 && <span style={{ position:'absolute', top:4, right:4, background: tab.id==='orders' ? '#ef4444' : '#64748b', color:'#fff', borderRadius:'50%', fontSize:'0.65rem', minWidth:16, height:16, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 3px', fontWeight:700 }}>{tab.badge}</span>}
                            </button>
                        ))}
                    </nav>

                    <main className="admin-content">
                        {/* Dashboard */}
                        {activeTab === 'dashboard' && (
                            <div>
                                <h2 style={{ marginBottom: 8 }}>Dashboard Overview</h2>
                                <p style={{ color: 'var(--color-text-light)', fontSize: '0.85rem', marginBottom: 20 }}>Today: <strong>{todayOrders.length} orders</strong> · <strong>₹{todayRevenue.toLocaleString()}</strong> revenue</p>
                                <div className="admin-stats">
                                    <div className="admin-stat-card"><div className="admin-stat-value">{orders.length}</div><div className="admin-stat-label">Total Orders</div></div>
                                    <div className="admin-stat-card"><div className="admin-stat-value">₹{(totalRevenue / 100000).toFixed(1)}L</div><div className="admin-stat-label">Total Revenue</div></div>
                                    <div className="admin-stat-card" style={{ borderTop: '3px solid #ef4444' }}><div className="admin-stat-value" style={{ color:'#ef4444' }}>{pendingOrders}</div><div className="admin-stat-label">Pending Orders</div></div>
                                    <div className="admin-stat-card"><div className="admin-stat-value">{codOrders}</div><div className="admin-stat-label">COD Pending</div></div>
                                </div>
                                <div className="card mt-3">
                                    <div className="card-body">
                                        <h3 style={{ marginBottom: 16 }}>Recent Orders</h3>
                                        {orders.length === 0 ? <p className="text-light">No orders yet</p> : (
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead><tr>
                                                    <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--color-border)' }}>Order No.</th>
                                                    <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--color-border)' }}>Customer</th>
                                                    <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--color-border)' }}>Amount</th>
                                                    <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--color-border)' }}>Status</th>
                                                    <th style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '2px solid var(--color-border)' }}>Invoice</th>
                                                </tr></thead>
                                                <tbody>
                                                    {orders.slice(0, 5).map(order => (
                                                        <tr key={order.id}>
                                                            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
                                                                <strong style={{ color: 'var(--color-primary)' }}>{order.orderNumber || order.id.substring(0, 8)}</strong>
                                                            </td>
                                                            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>{order.userName || 'N/A'}</td>
                                                            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>₹{order.total?.toLocaleString()}</td>
                                                            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}><span className="badge badge-primary">{order.status}</span></td>
                                                            <td style={{ padding: '10px 12px', borderBottom: '1px solid var(--color-border)' }}>
                                                                <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }} onClick={() => setInvoiceOrder(order)}>
                                                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" /></svg>
                                                                    Invoice
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Steel Rates */}
                        {activeTab === 'rates' && (
                            <div>
                                <div style={{ position: 'sticky', top: 0, background: 'var(--color-bg)', zIndex: 10, paddingBottom: 12, paddingTop: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid var(--color-border)' }}>
                                    <div>
                                        <h2 style={{ marginBottom: 2 }}>Update Daily Steel Rates</h2>
                                        {lastRatesSaved && <p style={{ fontSize: '0.75rem', color: 'var(--color-text-light)', margin: 0 }}>Last saved: {lastRatesSaved.toLocaleTimeString('en-IN')}</p>}
                                    </div>
                                    <button className={`btn ${ratesSaved ? 'btn-success' : 'btn-primary'}`} onClick={handleSaveRates}>
                                        {ratesSaved ? '✓ Saved to Cloud!' : '☁️ Save All Rates'}
                                    </button>
                                </div>
                                {Object.entries(products).map(([catId, catData]) => (
                                    <div key={catId} className="card" style={{ marginBottom: 16 }}>
                                        <div className="card-body">

                                            {/* ── Product header + BULK PRICE BAR ── */}
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                                                <h3 style={{ margin: 0 }}>{catData.categoryName}</h3>

                                                {/* Bulk updater */}
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff7ed', border: '1.5px solid #fed7aa', borderRadius: 8, padding: '8px 14px' }}>
                                                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="#E98800" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"/></svg>
                                                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#92400e', whiteSpace: 'nowrap' }}>Set All Sizes:</span>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                        <span style={{ fontSize: '0.85rem', color: '#92400e' }}>₹</span>
                                                        <input
                                                            type="number"
                                                            placeholder="e.g. 70000"
                                                            value={bulkPrices[catId] || ''}
                                                            onChange={e => setBulkPrices(prev => ({ ...prev, [catId]: e.target.value }))}
                                                            onKeyDown={e => e.key === 'Enter' && handleBulkApply(catId, catData)}
                                                            style={{ width: 110, padding: '6px 8px', border: '1px solid #fed7aa', borderRadius: 6, fontSize: '0.88rem', fontWeight: 600, outline: 'none', background: '#fff', fontFamily: 'inherit' }}
                                                        />
                                                        <span style={{ fontSize: '0.7rem', color: '#a16207' }}>/ton</span>
                                                    </div>
                                                    <button
                                                        onClick={() => handleBulkApply(catId, catData)}
                                                        disabled={!bulkPrices[catId]}
                                                        style={{ background: bulkPrices[catId] ? '#E98800' : '#e5e7eb', color: bulkPrices[catId] ? '#fff' : '#9ca3af', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: '0.8rem', fontWeight: 700, cursor: bulkPrices[catId] ? 'pointer' : 'not-allowed', fontFamily: 'inherit', transition: 'background 0.15s', whiteSpace: 'nowrap' }}
                                                    >
                                                        ⚡ Apply All Sizes
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Individual size inputs */}
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                                                {catData.items.map(item => (
                                                    <div key={item.id}>
                                                        <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>{item.size}</label>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <span style={{ fontSize: '0.85rem' }}>₹</span>
                                                            <input type="number" className="input" value={rates[item.id] || ''} onChange={e => setRates({ ...rates, [item.id]: parseInt(e.target.value) || 0 })} style={{ padding: '8px 10px' }} />
                                                            <span style={{ fontSize: '0.7rem', color: 'var(--color-text-light)' }}>/ton</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Brand Multipliers */}
                                            {catData.brands && catData.brands.length > 0 && adminBrandMultipliers[catId] && (
                                                <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px dashed var(--color-border)' }}>
                                                    <h4 style={{ fontSize: '0.85rem', marginBottom: 12, color: 'var(--color-primary)' }}>Brand Price Multipliers (1.00 = base price)</h4>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                                                        {catData.brands.map(brand => (
                                                            <div key={brand}>
                                                                <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: 4 }}>{brand}</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="input"
                                                                    value={adminBrandMultipliers[catId][brand] !== undefined ? adminBrandMultipliers[catId][brand] : ''}
                                                                    onChange={e => {
                                                                        const val = parseFloat(e.target.value);
                                                                        setAdminBrandMultipliers(prev => ({
                                                                            ...prev,
                                                                            [catId]: { ...prev[catId], [brand]: isNaN(val) ? 1.00 : val }
                                                                        }));
                                                                    }}
                                                                    style={{ padding: '6px 8px', fontSize: '0.85rem' }}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Orders Management */}
                        {activeTab === 'orders' && (
                            <div>
                                {/* Header */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                                    <div>
                                        <h2 style={{ margin: 0 }}>Order Management</h2>
                                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{filteredOrders.length} of {orders.length} orders</p>
                                    </div>
                                </div>

                                {/* Filter Bar */}
                                <div className="order-filter-bar">
                                    <input
                                        placeholder="Search by name or order no…"
                                        value={orderSearch}
                                        onChange={e => setOrderSearch(e.target.value)}
                                    />
                                    <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}>
                                        <option value="all">All Status</option>
                                        {ORDER_STATUSES.map((s,i) => <option key={i} value={String(i)}>{s}</option>)}
                                    </select>
                                    <select value={orderPaymentFilter} onChange={e => setOrderPaymentFilter(e.target.value)}>
                                        <option value="all">All Payments</option>
                                        <option value="cod">COD</option>
                                        <option value="online">Online</option>
                                        <option value="rtgs">RTGS</option>
                                    </select>
                                </div>

                                {/* Order Cards */}
                                {filteredOrders.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-light)' }}>
                                        <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth={1.2} style={{ marginBottom: 12 }}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                                        <p>No orders match filters</p>
                                    </div>
                                ) : (
                                    <div className="order-cards">
                                        {filteredOrders.map(order => {
                                            const stripeColor = order.statusIndex === 0 ? '#ef4444'
                                                : order.statusIndex >= 4 ? '#22c55e'
                                                : order.statusIndex >= 2 ? '#f59e0b'
                                                : '#3b82f6';
                                            const payClass = order.paymentMethod === 'online' ? 'pay-online'
                                                : order.paymentMethod === 'rtgs' ? 'pay-rtgs'
                                                : 'pay-cod';
                                            const statusLabel = order.statusIndex === 0 ? 'new'
                                                : order.statusIndex >= 4 ? 'done'
                                                : 'active';

                                            return (
                                                <div key={order.id} className="order-mgmt-card">
                                                    <div className="order-status-stripe" style={{ background: stripeColor }} />
                                                    <div className="order-card-inner">

                                                        {/* ── Left: Customer & Order Info ── */}
                                                        <div>
                                                            <div className="order-meta-row">
                                                                <span className="order-num-pill">
                                                                    {order.orderNumber || '—'}
                                                                </span>
                                                                <span className={`order-status-badge ${statusLabel}`}>
                                                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: stripeColor, display: 'inline-block' }} />
                                                                    {order.status || ORDER_STATUSES[order.statusIndex]}
                                                                </span>
                                                            </div>

                                                            <div className="order-customer-row">
                                                                <span className="order-customer-name">
                                                                    {order.userName || 'Unknown Customer'}
                                                                </span>
                                                                <div className="order-customer-meta">
                                                                    {order.userPhone && (
                                                                        <span>
                                                                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                                                                            {order.userPhone}
                                                                        </span>
                                                                    )}
                                                                    {order.userEmail && (
                                                                        <span>
                                                                            <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                                                                            {order.userEmail}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            <div className="order-amount-row">
                                                                <span className="order-amount">₹{order.total?.toLocaleString('en-IN')}</span>
                                                                <span className={`order-payment-tag ${payClass}`}>
                                                                    {order.paymentMethod?.toUpperCase()}
                                                                </span>
                                                                <span className="order-date-tag">
                                                                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                                                </span>
                                                                {order.totalWeight > 0 && (
                                                                    <span className="order-date-tag">{(order.totalWeight / 1000).toFixed(2)} MT</span>
                                                                )}
                                                            </div>

                                                            {order.paymentMethod === 'cod' && order.statusIndex === 0 && (
                                                                <div className="cod-alert">
                                                                    <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
                                                                    COD — Requires Approval
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* ── Right: Actions ── */}
                                                        <div className="order-actions">
                                                            <div className="order-action-btns">
                                                                {order.userPhone && (
                                                                    <a
                                                                        href={`https://wa.me/91${order.userPhone.replace(/\D/g,'')}`}
                                                                        target="_blank" rel="noreferrer"
                                                                        className="order-icon-btn wa"
                                                                        title="WhatsApp customer"
                                                                    >
                                                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                                                    </a>
                                                                )}
                                                                {order.userPhone && (
                                                                    <a
                                                                        href={`tel:+91${order.userPhone.replace(/\D/g,'')}`}
                                                                        className="order-icon-btn ph"
                                                                        title="Call customer"
                                                                    >
                                                                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>
                                                                    </a>
                                                                )}
                                                                <button
                                                                    className="order-icon-btn inv"
                                                                    onClick={() => setInvoiceOrder(order)}
                                                                    title="Generate Invoice"
                                                                >
                                                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" /></svg>
                                                                </button>
                                                            </div>

                                                            <select
                                                                className="order-status-select"
                                                                value={order.statusIndex}
                                                                onChange={e => updateOrderStatus(order.id, parseInt(e.target.value))}
                                                            >
                                                                {ORDER_STATUSES.map((s, i) => <option key={i} value={i}>{s}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Charges */}
                        {activeTab === 'charges' && (
                            <div>
                                <h2 style={{ marginBottom: 20 }}>Manage Charges</h2>
                                <div className="card" style={{ maxWidth: 500 }}>
                                    <div className="card-body">
                                        <div className="input-group">
                                            <label>Loading Charges (₹ per ton)</label>
                                            <input type="number" className="input" value={adminCharges.loadingPerTon} onChange={e => setAdminCharges({ ...adminCharges, loadingPerTon: parseInt(e.target.value) || 0 })} />
                                        </div>
                                        <div className="input-group">
                                            <label>Transport Charges (₹ per ton)</label>
                                            <input type="number" className="input" value={adminCharges.transportPerTon} onChange={e => setAdminCharges({ ...adminCharges, transportPerTon: parseInt(e.target.value) || 0 })} />
                                        </div>
                                        <div className="input-group">
                                            <label>GST Percentage (%)</label>
                                            <input type="number" className="input" value={adminCharges.gstPercent} onChange={e => setAdminCharges({ ...adminCharges, gstPercent: parseInt(e.target.value) || 0 })} />
                                        </div>
                                        <button className={`btn mt-2 ${chargesSaved ? 'btn-success' : 'btn-primary'}`} onClick={handleSaveCharges}>
                                            {chargesSaved ? '✓ Saved to Cloud!' : '☁️ Save Charges'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Users Management */}
                        {activeTab === 'users' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                                    <h2>User Management</h2>
                                    <input className="input" placeholder="🔍 Search by name / phone / company" value={userSearch} onChange={e => setUserSearch(e.target.value)} style={{ width: 280, padding: '8px 12px' }} />
                                </div>
                                <div className="admin-stats mb-3">
                                    <div className="admin-stat-card"><div className="admin-stat-value">{users.length}</div><div className="admin-stat-label">Total Users</div></div>
                                    <div className="admin-stat-card"><div className="admin-stat-value">{users.filter(u => u.role === 'admin').length}</div><div className="admin-stat-label">Admins</div></div>
                                    <div className="admin-stat-card"><div className="admin-stat-value">{users.filter(u => u.role === 'buyer').length}</div><div className="admin-stat-label">Buyers</div></div>
                                    <div className="admin-stat-card"><div className="admin-stat-value">{orders.length}</div><div className="admin-stat-label">Total Orders</div></div>
                                </div>
                                <div className="card">
                                    <div className="card-body">
                                        {filteredUsers.length === 0 ? <p className="text-light">No users match search</p> : (
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead><tr>
                                                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid var(--color-border)' }}>Name</th>
                                                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid var(--color-border)' }}>Email / Phone</th>
                                                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid var(--color-border)' }}>Company</th>
                                                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid var(--color-border)' }}>GST</th>
                                                    <th style={{ textAlign: 'left', padding: '10px', borderBottom: '2px solid var(--color-border)' }}>Role</th>
                                                </tr></thead>
                                                <tbody>
                                                    {filteredUsers.map(user => (
                                                        <tr key={user.id}>
                                                            <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--color-border)' }}><strong>{user.name || '—'}</strong></td>
                                                            <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--color-border)' }}>
                                                                <div>{user.email || '—'}</div>
                                                                {user.phone && <a href={`tel:+91${user.phone}`} style={{ fontSize: '0.78rem', color: 'var(--color-primary)' }}>{user.phone}</a>}
                                                            </td>
                                                            <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--color-border)' }}>{user.company || '—'}</td>
                                                            <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--color-border)', fontSize: '0.75rem' }}>{user.gst || '—'}</td>
                                                            <td style={{ padding: '12px 10px', borderBottom: '1px solid var(--color-border)' }}>
                                                                <span className={`badge ${user.role === 'admin' ? 'badge-accent' : 'badge-primary'}`}>
                                                                    {user.role === 'admin' ? '⚙ Admin' : '🛒 Buyer'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Blog Management */}
                        {activeTab === 'blog' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                                    <div>
                                        <h2 style={{ marginBottom: 4 }}>Blog Articles</h2>
                                        <p style={{ color: 'var(--color-text-light)', fontSize: '0.82rem', margin: 0 }}>
                                            {blogPosts.filter(p => p.status === 'published').length} published · {blogPosts.filter(p => p.status === 'draft').length} drafts
                                        </p>
                                    </div>
                                    <Link href="/blog/new" className="btn btn-primary btn-sm">✍️ New Article</Link>
                                </div>

                                <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                                    <input
                                        className="input"
                                        placeholder="🔍 Search articles..."
                                        value={blogSearch}
                                        onChange={e => setBlogSearch(e.target.value)}
                                        style={{ flex: 1, minWidth: 180, padding: '8px 12px' }}
                                    />
                                    <select
                                        className="select"
                                        value={blogFilter}
                                        onChange={e => setBlogFilter(e.target.value)}
                                        style={{ padding: '8px 12px' }}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="published">✅ Published</option>
                                        <option value="draft">📝 Drafts</option>
                                    </select>
                                </div>

                                {filteredBlogPosts.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-light)' }}>
                                        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
                                        <p>No articles yet. <Link href="/blog/new" style={{ color: '#E98800', fontWeight: 600 }}>Write your first article →</Link></p>
                                    </div>
                                ) : (
                                    <div className="card">
                                        <div className="card-body" style={{ padding: 0 }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead><tr>
                                                    <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid var(--color-border)', background: 'rgba(248,250,252,0.8)' }}>Title</th>
                                                    <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid var(--color-border)', background: 'rgba(248,250,252,0.8)' }}>Category</th>
                                                    <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid var(--color-border)', background: 'rgba(248,250,252,0.8)' }}>Status</th>
                                                    <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid var(--color-border)', background: 'rgba(248,250,252,0.8)' }}>Date</th>
                                                    <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '2px solid var(--color-border)', background: 'rgba(248,250,252,0.8)' }}>Actions</th>
                                                </tr></thead>
                                                <tbody>
                                                    {filteredBlogPosts.map(post => (
                                                        <tr key={post.id}>
                                                            <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                                                                <strong style={{ display: 'block', marginBottom: 2 }}>{post.title}</strong>
                                                                <span style={{ fontSize: '0.72rem', color: 'var(--color-text-light)' }}>/blog/{post.slug}</span>
                                                            </td>
                                                            <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                                                                {post.category && <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{post.category}</span>}
                                                            </td>
                                                            <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                                                                <span className={`badge ${post.status === 'published' ? 'badge-accent' : ''}`} style={post.status === 'draft' ? { background: '#f1f5f9', color: '#64748B' } : {}}>
                                                                    {post.status === 'published' ? '✅ Published' : '📝 Draft'}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-light)' }}>
                                                                {formatBlogDate(post.publishedAt || post.createdAt)}
                                                            </td>
                                                            <td style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)' }}>
                                                                <div style={{ display: 'flex', gap: 6 }}>
                                                                    <Link href={`/blog/edit/${post.slug}`} className="btn btn-ghost btn-sm" title="Edit" style={{ fontSize: '0.78rem' }}>✏️ Edit</Link>
                                                                    {post.status === 'published' && (
                                                                        <a href={`/blog/${post.slug}`} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ fontSize: '0.78rem' }}>👁️ View</a>
                                                                    )}
                                                                    {blogDeleteConfirm === post.id ? (
                                                                        <>
                                                                            <button className="btn btn-sm" style={{ background: '#ef4444', color: '#fff', fontSize: '0.78rem' }} onClick={() => handleDeleteBlogPost(post.id)}>Confirm Delete</button>
                                                                            <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.78rem' }} onClick={() => setBlogDeleteConfirm(null)}>Cancel</button>
                                                                        </>
                                                                    ) : (
                                                                        <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.78rem', color: '#ef4444' }} onClick={() => setBlogDeleteConfirm(post.id)}>🗑️</button>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Reports */}
                        {activeTab === 'reports' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                    <h2>Sales Reports</h2>
                                    <button className="btn btn-outline btn-sm" onClick={exportCSV} title="Download orders as CSV">📥 Export CSV</button>
                                </div>
                                <div className="admin-stats">
                                    <div className="admin-stat-card"><div className="admin-stat-value">{orders.length}</div><div className="admin-stat-label">Total Orders</div></div>
                                    <div className="admin-stat-card"><div className="admin-stat-value">₹{totalRevenue.toLocaleString()}</div><div className="admin-stat-label">Total Revenue</div></div>
                                    <div className="admin-stat-card"><div className="admin-stat-value">{orders.filter(o => o.statusIndex >= 4).length}</div><div className="admin-stat-label">Delivered</div></div>
                                    <div className="admin-stat-card"><div className="admin-stat-value">{orders.filter(o => o.paymentMethod === 'online').length}</div><div className="admin-stat-label">Online Payments</div></div>
                                </div>
                                {orders.length > 0 && (
                                    <div className="card mt-3">
                                        <div className="card-body">
                                            <h3 style={{ marginBottom: 16 }}>All Orders</h3>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead><tr>
                                                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid var(--color-border)' }}>Order ID</th>
                                                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid var(--color-border)' }}>Date</th>
                                                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid var(--color-border)' }}>Customer</th>
                                                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid var(--color-border)' }}>Payment</th>
                                                    <th style={{ textAlign: 'right', padding: '8px', borderBottom: '2px solid var(--color-border)' }}>Amount</th>
                                                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid var(--color-border)' }}>Status</th>
                                                    <th style={{ textAlign: 'left', padding: '8px', borderBottom: '2px solid var(--color-border)' }}>Invoice</th>
                                                </tr></thead>
                                                <tbody>
                                                    {orders.map(order => (
                                                        <tr key={order.id}>
                                                            <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--color-border)' }}><strong>{order.id.substring(0, 8)}...</strong></td>
                                                            <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--color-border)' }}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : '—'}</td>
                                                            <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--color-border)' }}>{order.userName}</td>
                                                            <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--color-border)' }}>{order.paymentMethod}</td>
                                                            <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--color-border)', textAlign: 'right', fontWeight: 600 }}>₹{order.total?.toLocaleString()}</td>
                                                            <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--color-border)' }}><span className="badge badge-primary">{order.status}</span></td>
                                                            <td style={{ padding: '10px 8px', borderBottom: '1px solid var(--color-border)' }}>
                                                                <button className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem' }} onClick={() => setInvoiceOrder(order)}>📄</button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Invoice Modal */}
            {invoiceOrder && <GSTInvoice order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
        </div>
    );
}
