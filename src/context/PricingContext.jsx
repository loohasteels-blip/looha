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
    // Track whether the FIRST snapshot has been delivered so Admin can
    // seed its local state exactly once and not re-seed on every save.
    const [initialPricesLoaded, setInitialPricesLoaded] = useState(false);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, 'pricing'), (snapshot) => {
            const prices = {};
            snapshot.docs.forEach(d => {
                const data = d.data();
                if (data.productSizeId) prices[data.productSizeId] = data.pricePerTon;
            });
            setFirestorePrices(prices);
            setPricingLoaded(true);
            setInitialPricesLoaded(true);
        }, () => {
            console.warn('Pricing: using local fallback prices.');
            setPricingLoaded(true);
            setInitialPricesLoaded(true);
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
            // Build a display-friendly size label from whichever fields the item has.
            // Many data files (msRectData, msSquareData, msFlatData…) don't use `size`
            // and instead use rectSize+thickness, squareSize+thickness, flatWidth+flatThickness, etc.
            // Firestore will throw if any field value is `undefined`.
            const getSizeLabel = (item) => {
                if (item.size !== undefined)                        return String(item.size);
                if (item.rectSize !== undefined)                    return `${item.rectSize} × ${item.thickness}mm`;
                if (item.squareSize !== undefined)                  return `${item.squareSize} × ${item.thickness}mm`;
                if (item.flatWidth !== undefined)                   return `${item.flatWidth} × ${item.flatThickness}mm`;
                if (item.outerDiameter !== undefined)               return `OD ${item.outerDiameter} × ${item.thickness}mm`;
                if (item.nominalBore !== undefined)                 return `NB ${item.nominalBore}`;
                return item.id; // last resort
            };

            const promises = Object.entries(ratesObj).map(([itemId, pricePerTon]) => {
                let categoryId = '';
                let sizeLabel  = itemId; // safe default — never undefined
                Object.entries(products).forEach(([catId, catData]) => {
                    const found = catData.items.find(i => i.id === itemId);
                    if (found) { categoryId = catId; sizeLabel = getSizeLabel(found); }
                });
                // Strip undefined fields: JSON round-trip removes any undefined values
                // so Firestore never rejects the write with "Unsupported field value: undefined"
                const docData = JSON.parse(JSON.stringify({
                    productSizeId: itemId,
                    categoryId:    categoryId || '',
                    size:          sizeLabel  || itemId,
                    pricePerTon:   Number(pricePerTon) || 0,
                    updatedAt:     serverTimestamp(),
                }));
                // serverTimestamp() is lost in JSON round-trip — re-attach it
                docData.updatedAt = serverTimestamp();
                return setDoc(doc(db, 'pricing', itemId), docData);
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
        <PricingContext.Provider value={{ firestorePrices, charges, pricingLoaded, initialPricesLoaded, getPrice, getAllRates, saveRates, saveCharges, firestoreBrandMultipliers, getBrandMultipliers, saveBrandMultipliers }}>
            {children}
        </PricingContext.Provider>
    );
}

export const usePricing = () => useContext(PricingContext);
