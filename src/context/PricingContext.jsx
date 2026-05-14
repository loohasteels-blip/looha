'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import {
    collection, doc, getDoc, setDoc, onSnapshot, serverTimestamp,
} from 'firebase/firestore';
import { products, charges as defaultCharges } from '../data/products';

const PricingContext = createContext();

export function PricingProvider({ children }) {
    const [firestorePrices, setFirestorePrices] = useState({});
    const [charges, setCharges] = useState(defaultCharges);
    const [firestoreBrandMultipliers, setFirestoreBrandMultipliers] = useState({});
    const [pricingLoaded, setPricingLoaded] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'pricing'), (snapshot) => {
            const prices = {};
            snapshot.docs.forEach(d => {
                const data = d.data();
                if (data.productSizeId) prices[data.productSizeId] = data.pricePerTon;
            });
            setFirestorePrices(prices);
            setPricingLoaded(true);
        }, () => {
            console.warn('Pricing: using local fallback prices.');
            setPricingLoaded(true);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'settings', 'charges'), (snapshot) => {
            if (snapshot.exists()) setCharges({ ...defaultCharges, ...snapshot.data() });
        }, () => console.warn('Charges: using local defaults.'));
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(doc(db, 'settings', 'brandMultipliers'), (snapshot) => {
            if (snapshot.exists()) setFirestoreBrandMultipliers(snapshot.data());
        }, () => console.warn('Brands: using local defaults.'));
        return () => unsubscribe();
    }, []);

    const getPrice = useCallback((itemId, defaultPrice) => {
        return firestorePrices[itemId] !== undefined ? firestorePrices[itemId] : defaultPrice;
    }, [firestorePrices]);

    const getAllRates = useCallback(() => {
        const rates = {};
        Object.entries(products).forEach(([, catData]) => {
            catData.items.forEach(item => {
                rates[item.id] = firestorePrices[item.id] !== undefined ? firestorePrices[item.id] : item.pricePerTon;
            });
        });
        return rates;
    }, [firestorePrices]);

    const getBrandMultipliers = useCallback((categoryId) => {
        const defaultMultipliers = products[categoryId]?.brandPriceMultiplier || {};
        const overrides = firestoreBrandMultipliers[categoryId] || {};
        return { ...defaultMultipliers, ...overrides };
    }, [firestoreBrandMultipliers]);

    const saveRates = useCallback(async (ratesObj) => {
        try {
            const promises = Object.entries(ratesObj).map(([itemId, pricePerTon]) => {
                let categoryId = '', size = '';
                Object.entries(products).forEach(([catId, catData]) => {
                    const found = catData.items.find(i => i.id === itemId);
                    if (found) { categoryId = catId; size = found.size; }
                });
                return setDoc(doc(db, 'pricing', itemId), { productSizeId: itemId, categoryId, size, pricePerTon: Number(pricePerTon), updatedAt: serverTimestamp() });
            });
            await Promise.all(promises);
            return { success: true };
        } catch (err) { return { success: false, message: err.message }; }
    }, []);

    const saveCharges = useCallback(async (chargesObj) => {
        try {
            await setDoc(doc(db, 'settings', 'charges'), {
                loadingPerTon: Number(chargesObj.loadingPerTon),
                transportPerTon: Number(chargesObj.transportPerTon),
                gstPercent: Number(chargesObj.gstPercent),
                updatedAt: serverTimestamp(),
            });
            return { success: true };
        } catch (err) { return { success: false, message: err.message }; }
    }, []);

    const saveBrandMultipliers = useCallback(async (multipliersObj) => {
        try {
            await setDoc(doc(db, 'settings', 'brandMultipliers'), multipliersObj);
            return { success: true };
        } catch (err) { return { success: false, message: err.message }; }
    }, []);

    return (
        <PricingContext.Provider value={{ firestorePrices, charges, pricingLoaded, getPrice, getAllRates, saveRates, saveCharges, firestoreBrandMultipliers, getBrandMultipliers, saveBrandMultipliers }}>
            {children}
        </PricingContext.Provider>
    );
}

export const usePricing = () => useContext(PricingContext);
