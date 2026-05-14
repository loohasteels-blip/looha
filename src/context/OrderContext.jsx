'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
    collection, doc, addDoc, deleteDoc, runTransaction,
    query, where, onSnapshot, serverTimestamp, Timestamp, updateDoc,
} from 'firebase/firestore';

const OrderContext = createContext();
const ORDER_STATUSES = ['Payment Confirmed', 'Loading in Progress', 'Dispatched', 'Out for Delivery', 'Delivered'];

export function OrderProvider({ children }) {
    const { user, isAdmin } = useAuth();
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [addressesLoading, setAddressesLoading] = useState(true);

    useEffect(() => {
        if (!user?.uid) { setOrders([]); setOrdersLoading(false); return; }
        const q = isAdmin ? query(collection(db, 'orders')) : query(collection(db, 'orders'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ordersData = snapshot.docs.map(d => {
                const data = d.data();
                return { ...data, id: d.id, createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt };
            });
            ordersData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            setOrders(ordersData);
            setOrdersLoading(false);
        }, (err) => { console.error('Orders listener error:', err); setOrdersLoading(false); });
        return () => unsubscribe();
    }, [user?.uid, isAdmin]);

    useEffect(() => {
        if (!user?.uid) { setAddresses([]); setAddressesLoading(false); return; }
        const q = query(collection(db, 'addresses'), where('userId', '==', user.uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setAddresses(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            setAddressesLoading(false);
        }, (err) => { console.error('Addresses listener error:', err); setAddressesLoading(false); });
        return () => unsubscribe();
    }, [user?.uid]);

    const createOrder = useCallback(async (orderData) => {
        if (!user?.uid) return null;
        try {
            const counterRef = doc(db, 'meta', 'orderCounter');
            let orderNumber = 'L-1001';
            await runTransaction(db, async (tx) => {
                const counterSnap = await tx.get(counterRef);
                const next = counterSnap.exists() ? (counterSnap.data().count || 1000) + 1 : 1001;
                tx.set(counterRef, { count: next });
                orderNumber = `L-${next}`;
            });
            const orderDoc = {
                orderNumber, userId: user.uid,
                userName: orderData.user?.name || user.name || '',
                userEmail: orderData.user?.email || user.email || '',
                userPhone: orderData.user?.phone || user.phone || '',
                address: orderData.address || null, addressId: orderData.address?.id || null,
                paymentMethod: orderData.paymentMethod || 'online',
                status: ORDER_STATUSES[0], statusIndex: 0,
                total: orderData.total || 0,
                totalWeight: orderData.items?.reduce((s, i) => s + (i.pricing?.totalWeightKg || 0), 0) || 0,
                driverName: null, driverPhone: null, driverVehicle: null,
                createdAt: serverTimestamp(),
            };
            const orderRef = await addDoc(collection(db, 'orders'), orderDoc);
            const orderId = orderRef.id;
            if (orderData.items?.length > 0) {
                for (const item of orderData.items) {
                    await addDoc(collection(db, 'orderItems'), {
                        orderId, categoryName: item.categoryName || '', size: item.size || '',
                        quantity: item.quantity || 0, unit: item.unit || 'Nos',
                        pricePerTon: item.pricePerTon || 0,
                        totalWeightKg: item.pricing?.totalWeightKg || 0, subtotal: item.pricing?.subtotal || 0,
                        loadingCharges: item.pricing?.loadingCharges || 0, transportCharges: item.pricing?.transportCharges || 0,
                        gstAmount: item.pricing?.gstAmount || 0, total: item.pricing?.total || 0,
                    });
                }
            }
            await addDoc(collection(db, 'payments'), { orderId, orderNumber, method: orderData.paymentMethod || 'online', amount: orderData.total || 0, status: 'pending', paidAt: null });
            return { id: orderId, orderNumber, ...orderDoc, createdAt: new Date().toISOString(), items: orderData.items };
        } catch (err) { console.error('Create order error:', err); return null; }
    }, [user]);

    const updateOrderStatus = useCallback(async (orderId, statusIndex) => {
        try {
            const updateData = { status: ORDER_STATUSES[statusIndex], statusIndex };
            if (statusIndex >= 2) { updateData.driverName = 'Rajesh Kumar'; updateData.driverPhone = '9876543210'; updateData.driverVehicle = 'TS 09 AB 1234'; }
            await updateDoc(doc(db, 'orders', orderId), updateData);
            const currentOrder = orders.find(o => o.id === orderId);
            await addDoc(collection(db, 'orderStatusLogs'), { orderId, fromStatus: currentOrder?.status || '', toStatus: ORDER_STATUSES[statusIndex], changedBy: user?.uid || '', changedAt: serverTimestamp() });
        } catch (err) { console.error('Update order status error:', err); }
    }, [orders, user]);

    const addAddress = useCallback(async (addr) => {
        if (!user?.uid) return null;
        try {
            const docRef = await addDoc(collection(db, 'addresses'), { userId: user.uid, ...addr, createdAt: serverTimestamp() });
            return { id: docRef.id, ...addr };
        } catch (err) { console.error('Add address error:', err); return null; }
    }, [user]);

    const removeAddress = useCallback(async (id) => {
        try { await deleteDoc(doc(db, 'addresses', id)); } catch (err) { console.error('Remove address error:', err); }
    }, []);

    return (
        <OrderContext.Provider value={{ orders, ordersLoading, createOrder, updateOrderStatus, ORDER_STATUSES, addresses, addressesLoading, addAddress, removeAddress }}>
            {children}
        </OrderContext.Provider>
    );
}

export const useOrders = () => useContext(OrderContext);
