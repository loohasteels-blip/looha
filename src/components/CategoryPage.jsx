'use client'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

import { products, categories, calculatePricing } from '../data/products';
import { useCart } from '../context/CartContext';
import { usePricing } from '../context/PricingContext';
import { useState, useMemo, useCallback } from 'react';
import './CategoryPage.css';

// ─── Koray-Style Semantic SEO Data ──────────────────────────────────────────
export const SEO_DATA = {
    'ms-pipes': {
        title: 'MS Pipes Price in Nellore — IS 1239 ERW Mild Steel Pipes | LOOHA',
        description: 'Buy IS 1239 Part-1 & IS 3589 MS ERW pipes in Nellore. Sizes 15mm NB to 200mm NB. Medium & Heavy class. Used in water supply, structural fabrication, scaffolding. Live rates from APL Apollo & Jindal. Call 8885999718.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'MS Pipes — IS 1239 ERW Mild Steel Pipes in Nellore',
            url: 'https://www.looha.in/products/ms-pipes',
            description: 'IS 1239 Part-1 mild steel ERW pipes. 15mm NB to 200mm NB. Medium & Heavy class. APL Apollo, Jindal. Nellore.',
            provider: { '@id': 'https://www.looha.in/#business' },
            breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.looha.in/' },
                { '@type': 'ListItem', position: 2, name: 'MS Pipes', item: 'https://www.looha.in/products/ms-pipes' },
            ]},
        },
    },
    'gp-pipes': {
        title: 'GP Pipes Price Nellore — IS 1239 Galvanised Steel Pipes B & C Class | LOOHA',
        description: 'IS 1239 Part-1 galvanised plain (GP) pipes in Nellore. Class B and Class C. Sizes 15mm to 150mm NB. Hot-dip zinc coating. Used in water supply, agriculture, gas pipelines. Immediate dispatch. Call 8885999718.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'GP Pipes — IS 1239 Galvanised Steel Pipes in Nellore',
            url: 'https://www.looha.in/products/gp-pipes',
            description: 'IS 1239 hot-dip galvanised GP pipes. Class B & C. 15mm–150mm NB. Nellore.',
            provider: { '@id': 'https://www.looha.in/#business' },
            breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.looha.in/' },
                { '@type': 'ListItem', position: 2, name: 'GP Pipes', item: 'https://www.looha.in/products/gp-pipes' },
            ]},
        },
    },
    'ms-flat': {
        title: 'MS Flat Bar Price Nellore — IS 2062 E250 Mild Steel Flat Bars | LOOHA',
        description: 'IS 2062 Grade E250 mild steel flat bars in Nellore. Width 20mm to 200mm, thickness 3mm to 25mm. Hot-rolled finish. Used in hinges, brackets, door frames, machine parts. Per-kg pricing with GST invoice. Same-day dispatch.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'MS Flat Bars — IS 2062 E250 Steel Flats in Nellore',
            url: 'https://www.looha.in/products/ms-flat',
            description: 'IS 2062 E250 hot-rolled MS flat bars. 20mm–200mm width. 3mm–25mm thickness. Nellore.',
            provider: { '@id': 'https://www.looha.in/#business' },
            breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.looha.in/' },
                { '@type': 'ListItem', position: 2, name: 'MS Flat', item: 'https://www.looha.in/products/ms-flat' },
            ]},
        },
    },
    'ms-square-rods': {
        title: 'MS Square Rods Price Nellore — IS 1732 Solid Square Bars 6×6 to 100×100mm | LOOHA',
        description: 'Buy IS 1732 / IS 2062 solid mild steel square bars in Nellore. Sizes 6×6mm to 100×100mm. Weight from 0.283 kg/m to 78.5 kg/m. Used in fabrication, shafts, machine parts, gates, grills. Per-piece pricing at 6m length. GST invoice. Call 8885999718.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'MS Square Rods — IS 1732 Solid Square Bars in Nellore',
            url: 'https://www.looha.in/products/ms-square-rods',
            description: 'IS 1732 / IS 2062 solid MS square bars. 6×6mm to 100×100mm. 6m length. Used in fabrication, shafts, grills. Nellore.',
            provider: { '@id': 'https://www.looha.in/#business' },
            breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.looha.in/' },
                { '@type': 'ListItem', position: 2, name: 'MS Square Rods', item: 'https://www.looha.in/products/ms-square-rods' },
            ]},
        },
    },
    'ms-angle': {
        title: 'MS Angle Price Nellore — IS 2062 Equal Angle Sections 25×25 to 150×150 | LOOHA',
        description: 'IS 2062 Grade E250 hot-rolled equal leg angle sections in Nellore. Sizes 25×25×3mm to 150×150×12mm. SAIL and JSW origin. Used in trusses, towers, roof purlins, structural frames. Weight per metre available.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'MS Angle Sections — IS 2062 Equal Angles in Nellore',
            url: 'https://www.looha.in/products/ms-angle',
            description: 'IS 2062 E250 equal leg angle sections. 25×25×3mm to 150×150×12mm. SAIL, JSW. Nellore.',
            provider: { '@id': 'https://www.looha.in/#business' },
            breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.looha.in/' },
                { '@type': 'ListItem', position: 2, name: 'MS Angle', item: 'https://www.looha.in/products/ms-angle' },
            ]},
        },
    },
    'ms-beams': {
        title: 'MS Beams Price Nellore — ISMB ISWB IS 2062 Structural I-Beams | LOOHA',
        description: 'IS 2062 Grade E250/E350 ISMB and ISWB structural I-beams in Nellore. Sizes ISMB 100 to ISMB 600. Used in industrial sheds, bridges, mezzanine floors, portal frames. SAIL and Vizag Steel supply. GST invoicing on every order.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'MS Beams — ISMB ISWB IS 2062 Structural Beams in Nellore',
            url: 'https://www.looha.in/products/ms-beams',
            description: 'IS 2062 E250/E350 ISMB structural I-beams. ISMB 100–600. SAIL, Vizag Steel. Nellore.',
            provider: { '@id': 'https://www.looha.in/#business' },
            breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.looha.in/' },
                { '@type': 'ListItem', position: 2, name: 'MS Beams', item: 'https://www.looha.in/products/ms-beams' },
            ]},
        },
    },
    'ms-channels': {
        title: 'MS Channel Price Nellore — ISMC IS 2062 Parallel Flange C-Channels | LOOHA',
        description: 'IS 2062 Grade E250 mild steel parallel flange channels (ISMC) in Nellore. Sizes ISMC 75 to ISMC 400. Used in cable trays, industrial frames, conveyor systems, building purlins. SAIL and Vizag Steel. GST invoice on every order.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'MS Channels — ISMC IS 2062 C-Channels in Nellore',
            url: 'https://www.looha.in/products/ms-channels',
            description: 'IS 2062 E250 ISMC C-channels. ISMC 75–400. SAIL, Vizag Steel. Cable trays, purlins. Nellore.',
            provider: { '@id': 'https://www.looha.in/#business' },
            breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.looha.in/' },
                { '@type': 'ListItem', position: 2, name: 'MS Channels', item: 'https://www.looha.in/products/ms-channels' },
            ]},
        },
    },
    'tmt-bars': {
        title: 'TMT Bars Price Today Nellore — Fe 500D IS 1786 TATA Tiscon, Vizag, JSW | LOOHA',
        description: 'Fe 500D and Fe 550D TMT bars in Nellore. IS 1786:2008 certified. Sizes 8mm to 32mm. Brands: TATA Tiscon, Vizag Steel, JSW Neo, Jindal Panther, SAIL. Yield strength ≥500 N/mm². Corrosion-resistant ribbed bars for RCC slabs, columns, footings.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'TMT Bars — Fe 500D IS 1786 Reinforcement Bars in Nellore',
            url: 'https://www.looha.in/products/tmt-bars',
            description: 'Fe 500D IS 1786 TMT bars. 8mm–32mm. TATA Tiscon, Vizag Steel, JSW Neo, Jindal Panther, SAIL. Yield ≥500 N/mm². Nellore.',
            provider: { '@id': 'https://www.looha.in/#business' },
            breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.looha.in/' },
                { '@type': 'ListItem', position: 2, name: 'TMT Bars', item: 'https://www.looha.in/products/tmt-bars' },
            ]},
            mainEntity: {
                '@type': 'ItemList',
                name: 'TMT Bar Brands and Sizes',
                itemListElement: [
                    { '@type': 'ListItem', position: 1, item: { '@type': 'Product', name: 'TATA Tiscon Fe 500D TMT Bar', brand: { '@type': 'Brand', name: 'TATA Tiscon' }, material: 'Fe 500D Thermomechanically Treated Steel IS 1786', offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'INR', seller: { '@id': 'https://www.looha.in/#business' } } } },
                    { '@type': 'ListItem', position: 2, item: { '@type': 'Product', name: 'Vizag Steel Fe 500D TMT Bar', brand: { '@type': 'Brand', name: 'Vizag Steel' }, material: 'Fe 500D TMT IS 1786', offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'INR', seller: { '@id': 'https://www.looha.in/#business' } } } },
                    { '@type': 'ListItem', position: 3, item: { '@type': 'Product', name: 'JSW Neo Steel Fe 500D TMT Bar', brand: { '@type': 'Brand', name: 'JSW Neo Steel' }, material: 'Fe 500D TMT IS 1786', offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'INR', seller: { '@id': 'https://www.looha.in/#business' } } } },
                    { '@type': 'ListItem', position: 4, item: { '@type': 'Product', name: 'Jindal Panther Fe 500D TMT Bar', brand: { '@type': 'Brand', name: 'Jindal Panther' }, material: 'Fe 500D TMT IS 1786', offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'INR', seller: { '@id': 'https://www.looha.in/#business' } } } },
                    { '@type': 'ListItem', position: 5, item: { '@type': 'Product', name: 'SAIL Fe 500D TMT Bar', brand: { '@type': 'Brand', name: 'SAIL' }, material: 'Fe 500D TMT IS 1786', offers: { '@type': 'Offer', availability: 'https://schema.org/InStock', priceCurrency: 'INR', seller: { '@id': 'https://www.looha.in/#business' } } } },
                ],
            },
        },
    },
    'binding-wire': {
        title: 'Binding Wire Price Nellore — 18 Gauge GI Annealed Tying Wire for RCC | LOOHA',
        description: 'Annealed black iron and GI binding wire in Nellore. 18 gauge (1.2mm) and 20 gauge (0.9mm). Used to tie TMT bars in RCC slabs, beams and columns. Sold per coil (26–28 kg). Soft annealed finish for easy hand bending. Daily pricing.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Binding Wire — 18 Gauge GI Annealed Wire in Nellore',
            url: 'https://www.looha.in/products/binding-wire',
            description: 'Annealed GI binding wire. 18 gauge 1.2mm and 20 gauge 0.9mm. Per-coil 26–28 kg. RCC tying. Nellore.',
            provider: { '@id': 'https://www.looha.in/#business' },
            breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.looha.in/' },
                { '@type': 'ListItem', position: 2, name: 'Binding Wire', item: 'https://www.looha.in/products/binding-wire' },
            ]},
        },
    },
    'ms-sheets': {
        title: 'MS Sheet Price Nellore — IS 2062 HR & CR Mild Steel Sheets 1.6mm to 12mm | LOOHA',
        description: 'IS 2062 Grade E250 hot-rolled (HR) and cold-rolled (CR) mild steel sheets in Nellore. Thickness 1.6mm to 12mm. Sheet size 2500×1250mm standard. Used in fabrication, machine guards, containers, agricultural equipment.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'MS Sheets — IS 2062 HR CR Mild Steel Sheets in Nellore',
            url: 'https://www.looha.in/products/ms-sheets',
            description: 'IS 2062 E250 HR and CR mild steel sheets. 1.6mm–12mm thickness. 2500×1250mm. Nellore.',
            provider: { '@id': 'https://www.looha.in/#business' },
            breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.looha.in/' },
                { '@type': 'ListItem', position: 2, name: 'MS Sheets', item: 'https://www.looha.in/products/ms-sheets' },
            ]},
        },
    },
    'gi-sheets': {
        title: 'GI Sheet Price Nellore — IS 277 Galvanised Iron Roofing Sheets 0.45mm–2mm | LOOHA',
        description: 'IS 277 hot-dip galvanised iron plain and corrugated sheets in Nellore. Zinc coating Z100–Z275 g/m². Gauge 30 to 18 (0.45mm–1.6mm). Used in roofing, partitions, poultry sheds, industrial cladding. Tata Bluescope origin. Per-sheet pricing.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'GI Sheets — IS 277 Galvanised Iron Roofing Sheets in Nellore',
            url: 'https://www.looha.in/products/gi-sheets',
            description: 'IS 277 galvanised iron sheets. Z100–Z275 zinc coating. 0.45mm–1.6mm gauge. Tata Bluescope. Nellore.',
            provider: { '@id': 'https://www.looha.in/#business' },
            breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.looha.in/' },
                { '@type': 'ListItem', position: 2, name: 'GI Sheets', item: 'https://www.looha.in/products/gi-sheets' },
            ]},
        },
    },
    'welding-rods': {
        title: 'Welding Rods Price Nellore — AWS E6013 E7018 SMAW Electrodes 2.5mm–4mm | LOOHA',
        description: 'AWS A5.1 SMAW welding electrodes in Nellore. E6013 general purpose and E7018 low hydrogen. Diameter 2.5mm, 3.15mm, 4mm. Tensile strength 60,000–70,000 psi. Brands: D&H Sécheron, Ador Fontech, ESAB India. Per-pack and per-box pricing.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Welding Rods — AWS E6013 E7018 SMAW Electrodes in Nellore',
            url: 'https://www.looha.in/products/welding-rods',
            description: 'AWS A5.1 SMAW electrodes. E6013 and E7018. 2.5mm, 3.15mm, 4mm. D&H Sécheron, Ador, ESAB. Nellore.',
            provider: { '@id': 'https://www.looha.in/#business' },
            breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.looha.in/' },
                { '@type': 'ListItem', position: 2, name: 'Welding Rods', item: 'https://www.looha.in/products/welding-rods' },
            ]},
        },
    },
    'gi-pipes': {
        title: 'GI Pipes Price Nellore — IS 1239 Hot-Dip Galvanised Iron Pipes 15mm–150mm NB | LOOHA',
        description: 'Buy IS 1239 Part-1 hot-dip galvanised iron (GI) pipes in Nellore. Sizes 15 NB to 150 NB. Light, Medium & Heavy class. Zinc coating 60–130 g/m². Used in overhead water tanks, plumbing, irrigation. APL Apollo, Tata, Jindal. Call 8885999718.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'GI Pipes — IS 1239 Hot-Dip Galvanised Iron Pipes in Nellore',
            url: 'https://www.looha.in/products/gi-pipes',
            description: 'IS 1239 hot-dip galvanised iron pipes. 15 NB to 150 NB. Light, Medium, Heavy class. APL Apollo, Tata, Jindal. Nellore.',
            provider: { '@id': 'https://www.looha.in/#business' },
            breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.looha.in/' },
                { '@type': 'ListItem', position: 2, name: 'GI Pipes', item: 'https://www.looha.in/products/gi-pipes' },
            ]},
        },
    },
    'roofing-sheets': {
        title: 'Roofing Sheets Price Nellore — Colour Coated Galvalume IS 15965 Corrugated & Box Profile | LOOHA',
        description: 'Buy IS 15965 colour-coated Galvalume roofing sheets in Nellore. Corrugated, box profile and trapezoidal. Gauge 18–28 (0.40mm–1.2mm). AZ150 Galvalume substrate. Used for factory sheds, warehouses, poultry farms. Tata Bluescope, JSW Colouron+. Call 8885999718.',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Roofing Sheets — IS 15965 Colour Coated Galvalume Sheets in Nellore',
            url: 'https://www.looha.in/products/roofing-sheets',
            description: 'IS 15965 colour-coated Galvalume roofing sheets. Corrugated & box profile. Gauge 18–28. Tata Bluescope, JSW Colouron+. Nellore.',
            provider: { '@id': 'https://www.looha.in/#business' },
            breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.looha.in/' },
                { '@type': 'ListItem', position: 2, name: 'Roofing Sheets', item: 'https://www.looha.in/products/roofing-sheets' },
            ]},
        },
    },
};

// ─── Cascaded Selector (MS Pipes, MS Square, etc.) ─────────────────────────
function PipeSelector({ items, categoryName, charges, getPrice,
    groupKey = 'nb',
    groupLabel = 'Pipe Size (NB)',
    groupFormat = (v) => `${v} NB`,
    quantityLabel = 'Nos',
    // Step-0 pipe-type selector (optional)
    typeOptions = [],
    selectedType = '',
    onTypeChange = null,
}) {
    const { addItem } = useCart();
    const [selectedGroup, setSelectedGroup] = useState('');
    const [selectedThickness, setSelectedThickness] = useState('');
    const [qty, setQty] = useState('');
    const [added, setAdded] = useState(false);

    // Unique primary group values in order
    const groupOptions = useMemo(() => [...new Set(items.map(i => i[groupKey]))], [items, groupKey]);

    // Secondary info (OD for pipes — not shown for square)
    const selectedOD = useMemo(() => {
        if (!selectedGroup || groupKey !== 'nb') return null;
        return items.find(i => i[groupKey] === selectedGroup)?.od;
    }, [selectedGroup, items, groupKey]);

    // Thicknesses for selected group
    const thicknessOptions = useMemo(() => {
        if (!selectedGroup) return [];
        return items.filter(i => i[groupKey] === selectedGroup).map(i => i.thickness);
    }, [selectedGroup, items, groupKey]);

    // Selected item
    const selectedItem = useMemo(() => {
        if (!selectedGroup || !selectedThickness) return null;
        const item = items.find(i => i[groupKey] === selectedGroup && i.thickness === parseFloat(selectedThickness));
        if (!item) return null;
        return { ...item, pricePerTon: getPrice(item.id, item.pricePerTon) };
    }, [selectedGroup, selectedThickness, items, getPrice, groupKey]);

    const pricing = selectedItem && qty > 0 ? calculatePricing(selectedItem, parseInt(qty), charges) : null;

    const handleGroupChange = (val) => {
        // nb and flatWidth are stored as numbers — must parse; squareSize is a string
        const numericGroupKeys = ['nb', 'flatWidth'];
        setSelectedGroup(numericGroupKeys.includes(groupKey) ? Number(val) : val);
        setSelectedThickness('');
        setQty('');
        setAdded(false);
    };

    const handleAddToCart = () => {
        if (!selectedItem || !qty) return;
        addItem({ ...selectedItem, categoryName }, parseInt(qty));
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="pipe-selector-wrapper">
            <div className="pipe-selector-card">
                <h3 className="pipe-selector-title">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Select Specification
                </h3>

                <div className={`pipe-selector-grid ${
                    selectedOD
                        ? 'pipe-selector-grid-5'
                        : (typeOptions.length === 0 ? 'pipe-selector-grid-3' : '')
                }`}>

                    {/* Step 0: Pipe Type — only shown when typeOptions provided */}
                    {onTypeChange && typeOptions.length > 0 && (
                        <div className="pipe-select-group">
                            <label className="pipe-select-label">
                                <span className="step-badge">0</span> Pipe Type
                            </label>
                            <select
                                className="pipe-select"
                                value={selectedType}
                                onChange={e => onTypeChange(e.target.value)}
                            >
                                {typeOptions.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Step 1: Primary Group */}
                    <div className="pipe-select-group">
                        <label className="pipe-select-label">
                            <span className="step-badge">1</span> {groupLabel}
                        </label>
                        <select className="pipe-select" value={selectedGroup} onChange={e => handleGroupChange(e.target.value)}>
                            <option value="">— Select Size —</option>
                            {groupOptions.map(v => (
                                <option key={v} value={v}>{groupFormat(v)}</option>
                            ))}
                        </select>
                    </div>

                    {/* OD auto-fill — only for pipes */}
                    {selectedOD && (
                        <div className="pipe-select-group">
                            <label className="pipe-select-label">OD (mm)</label>
                            <div className="pipe-readonly-field">{selectedOD} mm</div>
                        </div>
                    )}

                    {/* Step 2: Thickness */}
                    <div className="pipe-select-group">
                        <label className="pipe-select-label">
                            <span className="step-badge">2</span> Thickness (mm)
                        </label>
                        <select className="pipe-select" value={selectedThickness}
                            onChange={e => { setSelectedThickness(e.target.value); setQty(''); setAdded(false); }}
                            disabled={!selectedGroup}>
                            <option value="">— Select Thickness —</option>
                            {thicknessOptions.map(t => (
                                <option key={t} value={t}>{t} mm</option>
                            ))}
                        </select>
                    </div>

                    {/* Step 3: Quantity */}
                    <div className="pipe-select-group">
                        <label className="pipe-select-label">
                            <span className="step-badge">3</span> Quantity ({quantityLabel})
                        </label>
                        <input type="number" min="1" placeholder="Enter quantity"
                            className="pipe-select" value={qty}
                            onChange={e => { setQty(e.target.value); setAdded(false); }}
                            disabled={!selectedThickness} />
                    </div>
                </div>

                {/* Result Panel */}
                {selectedItem && (
                    <div className="pipe-result-panel">
                        <div className="pipe-result-row">
                            {selectedItem.weightPerMeter ? (
                                <>
                                    <div className="pipe-result-item">
                                        <span className="pipe-result-label">Weight / Mtr</span>
                                        <span className="pipe-result-value">{selectedItem.weightPerMeter} kg</span>
                                    </div>
                                    <div className="pipe-result-item">
                                        <span className="pipe-result-label">Weight / Piece (6m)</span>
                                        <span className="pipe-result-value">{selectedItem.weightPerPiece} kg</span>
                                    </div>
                                </>
                            ) : (
                                <div className="pipe-result-item">
                                    <span className="pipe-result-label">Weight / Sheet</span>
                                    <span className="pipe-result-value">{selectedItem.weightPerPiece} kg</span>
                                </div>
                            )}
                            <div className="pipe-result-item">
                                <span className="pipe-result-label">Price / {quantityLabel === 'Running Ft' ? 'Foot' : 'Ton'}</span>
                                <span className="pipe-result-value accent">
                                    {quantityLabel === 'Running Ft'
                                        ? `₹${Math.round(selectedItem.pricePerTon / 1000 * selectedItem.weightPerPiece).toLocaleString()}`
                                        : `₹${selectedItem.pricePerTon.toLocaleString()}`
                                    }
                                </span>
                            </div>
                            {pricing && (
                                <>
                                    <div className="pipe-result-item">
                                        <span className="pipe-result-label">Total Weight</span>
                                        <span className="pipe-result-value">{pricing.totalWeightKg} kg ({pricing.totalWeightTons} T)</span>
                                    </div>
                                    <div className="pipe-result-item highlight">
                                        <span className="pipe-result-label">Est. Total (incl. GST)</span>
                                        <span className="pipe-result-value accent-lg">₹{pricing.total.toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                        </div>
                        <button className={`btn btn-lg btn-block mt-2 ${added ? 'btn-success' : 'btn-primary'}`}
                            onClick={handleAddToCart} disabled={!qty || parseInt(qty) < 1}>
                            {added ? '✓ Added to Cart' : 'Add to Cart'}
                        </button>
                    </div>
                )}

                {!selectedGroup && (
                    <div className="pipe-selector-hint">← Select size to get started</div>
                )}
            </div>

            {/* Reference Table */}
            {selectedGroup && (
                <div className="pipe-reference-table">
                    <h4>All thicknesses for {groupFormat(selectedGroup)}{selectedOD ? ` (OD ${selectedOD}mm)` : ''}</h4>
                    <table className="products-table compact-table">
                        <thead>
                            <tr>
                                <th>Thickness (mm)</th>
                                <th>Weight/Mtr (kg)</th>
                                <th>Weight/Piece 6m (kg)</th>
                                <th>Price/Ton (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.filter(i => i[groupKey] === selectedGroup).map(item => (
                                <tr key={item.id}
                                    className={selectedThickness == item.thickness ? 'row-selected' : ''}
                                    onClick={() => setSelectedThickness(String(item.thickness))}
                                    style={{ cursor: 'pointer' }}>
                                    <td><strong>{item.thickness} mm</strong></td>
                                    <td>{item.weightPerMeter}</td>
                                    <td>{item.weightPerPiece}</td>
                                    <td className="text-accent">₹{getPrice(item.id, item.pricePerTon).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                <p className="pipe-table-hint">Click any row to select that thickness above</p>
                </div>
            )}
        </div>
    );
}


// ─── Single-Dimension Selector (TMT Bars, Solid Square Bars, etc.) ─────────
function SingleSizeSelector({ items, categoryName, charges, getPrice }) {
    const { addItem } = useCart();
    const [selectedId, setSelectedId] = useState('');
    const [qty, setQty] = useState('');
    const [added, setAdded] = useState(false);

    const selectedItem = useMemo(() => {
        if (!selectedId) return null;
        const item = items.find(i => i.id === selectedId);
        if (!item) return null;
        return { ...item, pricePerTon: getPrice(item.id, item.pricePerTon) };
    }, [selectedId, items, getPrice]);

    const pricing = selectedItem && qty > 0 ? calculatePricing(selectedItem, parseInt(qty), charges) : null;

    const handleAdd = () => {
        if (!selectedItem || !qty) return;
        addItem({ ...selectedItem, categoryName }, parseInt(qty));
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="pipe-selector-wrapper">
            <div className="pipe-selector-card">
                <h3 className="pipe-selector-title">⚙️ Select Specification</h3>

                <div className="pipe-selector-grid pipe-selector-grid-3">
                    {/* Step 1: Select Size */}
                    <div className="pipe-select-group">
                        <label className="pipe-select-label">
                            <span className="step-badge">1</span> Size (mm)
                        </label>
                        <select className="pipe-select" value={selectedId}
                            onChange={e => { setSelectedId(e.target.value); setQty(''); setAdded(false); }}>
                            <option value="">— Select Size —</option>
                            {items.map(item => (
                                <option key={item.id} value={item.id}>{item.size}</option>
                            ))}
                        </select>
                    </div>

                    {/* Auto-fill: Weight/Mtr */}
                    <div className="pipe-select-group">
                        <label className="pipe-select-label">Weight / Mtr (kg)</label>
                        <div className="pipe-readonly-field">
                            {selectedItem ? `${selectedItem.weightPerMeter} kg` : '—'}
                        </div>
                    </div>

                    {/* Step 2: Quantity */}
                    <div className="pipe-select-group">
                        <label className="pipe-select-label">
                            <span className="step-badge">2</span> Quantity (Nos)
                        </label>
                        <input type="number" min="1" placeholder="Enter quantity"
                            className="pipe-select" value={qty}
                            onChange={e => { setQty(e.target.value); setAdded(false); }}
                            disabled={!selectedId} />
                    </div>
                </div>

                {/* Result Panel */}
                {selectedItem && (
                    <div className="pipe-result-panel">
                        <div className="pipe-result-row">
                            <div className="pipe-result-item">
                                <span className="pipe-result-label">Length</span>
                                <span className="pipe-result-value">{selectedItem.length}</span>
                            </div>
                            <div className="pipe-result-item">
                                <span className="pipe-result-label">Weight / Piece</span>
                                <span className="pipe-result-value">{selectedItem.weightPerPiece} kg</span>
                            </div>
                            <div className="pipe-result-item">
                                <span className="pipe-result-label">Price / Ton</span>
                                <span className="pipe-result-value accent">₹{selectedItem.pricePerTon.toLocaleString()}</span>
                            </div>
                            {pricing && (
                                <>
                                    <div className="pipe-result-item">
                                        <span className="pipe-result-label">Total Weight</span>
                                        <span className="pipe-result-value">{pricing.totalWeightKg} kg ({pricing.totalWeightTons} T)</span>
                                    </div>
                                    <div className="pipe-result-item highlight">
                                        <span className="pipe-result-label">Est. Total (incl. GST)</span>
                                        <span className="pipe-result-value accent-lg">₹{pricing.total.toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                        </div>
                        <button className={`btn btn-lg btn-block mt-2 ${added ? 'btn-success' : 'btn-primary'}`}
                            onClick={handleAdd} disabled={!qty || parseInt(qty) < 1}>
                            {added ? '✓ Added to Cart!' : '🛒 Add to Cart'}
                        </button>
                    </div>
                )}

                {!selectedId && (
                    <div className="pipe-selector-hint">← Select size to get started</div>
                )}
            </div>

            {/* Reference Table — all sizes at a glance */}
            <div className="pipe-reference-table">
                <h4>All {categoryName} Sizes</h4>
                <table className="products-table compact-table">
                    <thead>
                        <tr>
                            <th>Size</th>
                            <th>Weight/Mtr (kg)</th>
                            <th>Weight/Piece {items[0]?.length ? `(${items[0].length})` : ''} (kg)</th>
                            <th>Price/Ton (₹)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map(item => (
                            <tr key={item.id}
                                className={selectedId === item.id ? 'row-selected' : ''}
                                onClick={() => setSelectedId(item.id)}
                                style={{ cursor: 'pointer' }}>
                                <td><strong>{item.size}</strong></td>
                                <td>{item.weightPerMeter}</td>
                                <td>{item.weightPerPiece}</td>
                                <td className="text-accent">&#8377;{getPrice(item.id, item.pricePerTon).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <p className="pipe-table-hint">Click any row to select that size above</p>
            </div>
        </div>
    );
}

// ─── Pipe Type Tabs config (ms-pipes / gp-pipes pages) ─────────────────────
// Both MS Pipes and GP Pipes are round pipes (IS 1239) with NB/OD/thickness structure.
// Square and Rectangular hollow sections are MS-only and appear as extra tabs on the
// ms-pipes page only.
const PIPE_TYPE_TABS = [
    { value: 'round',  label: 'Round Pipes',        groupKey: 'nb',       groupLabel: 'Pipe Size (NB)',    groupFormat: v => `${v} NB` },
    { value: 'square', label: 'Square Tubes',        catId: 'ms-square-hollow', groupKey: 'size',     groupLabel: 'Tube Size (mm)',    groupFormat: v => v },
    { value: 'rect',   label: 'Rectangular Tubes',   catId: 'ms-rect-hollow',   groupKey: 'rectSize', groupLabel: 'Tube Size (mm)',    groupFormat: v => v },
];
// GP Pipes show only the Round tab (no Square/Rect hollow sections for galvanized)
const GP_PIPE_TYPE_TABS = [
    { value: 'round',  label: 'Round Pipes',        groupKey: 'nb',       groupLabel: 'Pipe Size (NB)',    groupFormat: v => `${v} NB` },
];

// ─── Roofing Sheets Selector ──────────────────────────────────────────────
// Per-foot pricing: Jindal/Apollo = ₹140/ft base at 0.5mm
// Width is ALWAYS 3.5 ft (standard). Customer enters length + no. of sheets.
const ROOFING_BASE_PRICE_PER_FOOT = 140;
const ROOFING_SHEET_WIDTH_FT      = 3.5; // fixed standard width

function RoofingSheetsSelector({ selectedBrand, getBrandMultipliers, charges, categoryName }) {
    const { addItem } = useCart();
    const [sheetLength, setSheetLength] = useState(''); // length in ft (number)
    const [qty, setQty]                 = useState(''); // no. of sheets
    const [added, setAdded]             = useState(false);

    const multipliers    = getBrandMultipliers('roofing-sheets');
    const multiplier     = (selectedBrand && multipliers[selectedBrand]) || 1.0;
    const pricePerFoot   = Math.round(ROOFING_BASE_PRICE_PER_FOOT * multiplier);

    const lengthNum      = parseFloat(sheetLength) || 0;
    const qtyNum         = parseInt(qty) || 0;
    const totalRunningFt = lengthNum * qtyNum;          // total running feet across all sheets
    const pricePerSheet  = Math.round(lengthNum * pricePerFoot); // cost of one sheet
    const subtotal       = totalRunningFt * pricePerFoot;
    const gstPct         = charges?.gst ?? 18;
    const gstAmt         = Math.round(subtotal * gstPct / 100);
    const total          = subtotal + gstAmt;

    const handleAdd = () => {
        if (qtyNum < 1 || lengthNum <= 0) return;
        addItem({
            id: `roofing-${(selectedBrand || 'std').replace(/\s+/g, '-')}-0.5mm`,
            size: `${lengthNum}×${ROOFING_SHEET_WIDTH_FT} ft | 0.5mm`,
            weightPerPiece: 1.076 * lengthNum, // approx kg per sheet
            pricePerTon: Math.round(pricePerFoot / 1.076 * 1000),
            unit: 'Sheets',
            length: `${lengthNum} ft`,
            categoryName,
        }, qtyNum);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <div className="pipe-selector-wrapper">
            <div className="pipe-selector-card">
                <h3 className="pipe-selector-title">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    Select Specification
                </h3>

                <div className="pipe-selector-grid pipe-selector-grid-3">
                    {/* Step 1: Sheet Length — number input (width is fixed 3.5 ft) */}
                    <div className="pipe-select-group">
                        <label className="pipe-select-label">
                            <span className="step-badge">1</span> Sheet Size (ft)
                        </label>
                        <input
                            type="number"
                            min="1"
                            step="0.5"
                            placeholder="e.g. 10×3.5 ft, 12×3.5 ft"
                            className="pipe-select"
                            value={sheetLength}
                            onChange={e => { setSheetLength(e.target.value); setAdded(false); }}
                        />
                        <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                            Width: 3.5 ft (standard fixed)
                        </span>
                    </div>

                    {/* Step 2: Thickness — fixed 0.5mm */}
                    <div className="pipe-select-group">
                        <label className="pipe-select-label">
                            <span className="step-badge">2</span> Thickness (mm)
                        </label>
                        <div className="pipe-readonly-field" style={{ background: 'var(--color-surface)', fontWeight: 700, color: 'var(--color-primary)' }}>
                            0.5 mm &nbsp;<span style={{ fontSize: '0.75rem', fontWeight: 400, color: '#64748b' }}>(Standard)</span>
                        </div>
                    </div>

                    {/* Step 3: No. of Sheets */}
                    <div className="pipe-select-group">
                        <label className="pipe-select-label">
                            <span className="step-badge">3</span> No. of Sheets
                        </label>
                        <input
                            type="number" min="1" placeholder="Enter no. of sheets"
                            className="pipe-select"
                            value={qty}
                            onChange={e => { setQty(e.target.value); setAdded(false); }}
                        />
                    </div>
                </div>

                {/* Result Panel */}
                <div className="pipe-result-panel">
                    <div className="pipe-result-row">
                        <div className="pipe-result-item">
                            <span className="pipe-result-label">Rate / Running Foot</span>
                            <span className="pipe-result-value accent">₹{pricePerFoot.toLocaleString()}</span>
                        </div>
                        {lengthNum > 0 && (
                            <div className="pipe-result-item">
                                <span className="pipe-result-label">Rate / Sheet ({lengthNum} ft)</span>
                                <span className="pipe-result-value accent">₹{pricePerSheet.toLocaleString()}</span>
                            </div>
                        )}
                        {qtyNum > 0 && lengthNum > 0 && (
                            <>
                                <div className="pipe-result-item">
                                    <span className="pipe-result-label">Total Running Ft ({qtyNum} sheets × {lengthNum} ft)</span>
                                    <span className="pipe-result-value">{totalRunningFt} ft</span>
                                </div>
                                <div className="pipe-result-item">
                                    <span className="pipe-result-label">Subtotal</span>
                                    <span className="pipe-result-value">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="pipe-result-item">
                                    <span className="pipe-result-label">GST ({gstPct}%)</span>
                                    <span className="pipe-result-value">₹{gstAmt.toLocaleString()}</span>
                                </div>
                                <div className="pipe-result-item highlight">
                                    <span className="pipe-result-label">Est. Total (incl. GST)</span>
                                    <span className="pipe-result-value accent-lg">₹{total.toLocaleString()}</span>
                                </div>
                            </>
                        )}
                    </div>
                    <button
                        className={`btn btn-lg btn-block mt-2 ${added ? 'btn-success' : 'btn-primary'}`}
                        onClick={handleAdd}
                        disabled={qtyNum < 1 || lengthNum <= 0}
                    >
                        {added ? '✓ Added to Cart' : 'Add to Cart'}
                    </button>
                </div>

                {(!sheetLength || !qty) && (
                    <div className="pipe-selector-hint">← Enter sheet length and quantity above</div>
                )}
            </div>
        </div>
    );
}

// ─── Main Category Page ───────────────────────────────────────────────────────
export default function CategoryPage() {
    const { slug } = useParams();
    const router = useRouter();
    const seo = SEO_DATA[slug] || null;
    const categoryData = products[slug];
    const category = categories.find(c => c.id === slug);
    const { addItem } = useCart();
    const { getPrice, charges, getBrandMultipliers } = usePricing();
    const [quantities, setQuantities] = useState({});
    const [addedFeedback, setAddedFeedback] = useState(null);

    // ── Pipe-type state (only active for ms-pipes / gp-pipes) ──────────────
    const isPipeCategory = slug === 'ms-pipes' || slug === 'gp-pipes';
    // GP Pipes = round only; MS Pipes = round + square + rect hollow sections
    // Note: module-level constant is PIPE_TYPE_TABS (MS); GP_PIPE_TYPE_TABS is GP-only
    const activeTabSet = slug === 'gp-pipes' ? GP_PIPE_TYPE_TABS : PIPE_TYPE_TABS;
    const [pipeType, setPipeType] = useState('round');
    const activePipeTab = isPipeCategory
        ? (activeTabSet.find(t => t.value === pipeType) || activeTabSet[0])
        : null;

    // Brand selection — default to first brand if available
    const hasBrands = categoryData?.brands?.length > 0;
    const [selectedBrand, setSelectedBrand] = useState(
        hasBrands ? categoryData.brands[0] : null
    );

    // Brand-adjusted price getter
    const getBrandPrice = useCallback((itemId, basePrice) => {
        const firebasePrice = getPrice(itemId, basePrice);
        const multipliers = getBrandMultipliers(slug);
        const multiplier = (selectedBrand && multipliers[selectedBrand]) || 1.0;
        return Math.round(firebasePrice * multiplier);
    }, [getPrice, selectedBrand, slug, getBrandMultipliers]);

    const handleBrandSelect = (brand) => {
        setSelectedBrand(brand);
        setQuantities({}); // reset quantities when brand changes
    };

    // Cascaded selector config — resolves from active pipe tab OR auto-detect from items
    const CASCADED_CONFIGS = [
        { key: 'nb',        label: 'Pipe Size (NB)',    format: v => `${v} NB` },
        { key: 'flatWidth', label: 'Flat Width (mm)',   format: v => `${v}mm`  },
        { key: 'sheetSize', label: 'Sheet Size (ft)',   format: v => `${v} ft` },
        { key: 'rectSize',  label: 'Rect. Size (mm)',   format: v => v          },
        { key: 'angleSize', label: 'Angle Size (mm)',   format: v => `${v}mm`  },
        { key: 'size',      label: 'Size (mm)',         format: v => v          }, // ms-square hollow sections
    ];

    // For pipe-type pages, use the tab's catId to get items; otherwise use current slug's categoryData
    const activeCatData = activePipeTab?.catId ? products[activePipeTab.catId] : categoryData;
    const activeCatDataForBrands = categoryData; // brand bar always uses the url slug

    const baseItems = activeCatData?.items ?? [];
    const cascadedCfg  = activePipeTab
        ? { key: activePipeTab.groupKey, label: activePipeTab.groupLabel, format: activePipeTab.groupFormat }
        : CASCADED_CONFIGS.find(c => baseItems[0]?.[c.key] !== undefined && baseItems[0]?.thickness !== undefined);
    const isCascaded   = !!cascadedCfg;
    const isSingleSelect = !isCascaded && baseItems[0]?.weightPerMeter !== undefined;
    const groupKey     = cascadedCfg?.key    ?? 'size';
    const groupLabel   = cascadedCfg?.label  ?? 'Size';
    const groupFormat  = cascadedCfg?.format ?? (v => v);

    const pricedItems = baseItems.map(item => ({
        ...item,
        pricePerTon: getBrandPrice(item.id, item.pricePerTon),
    }));

    if (!categoryData || !category) {
        return (
            <div className="page container" style={{ textAlign: 'center', paddingTop: 80 }}>
                <h2>Category not found</h2>
                <Link href="/" className="btn btn-primary mt-2">Back to Home</Link>
            </div>
        );
    }

    const handleQuantityChange = (itemId, value) => {
        const num = parseInt(value) || 0;
        setQuantities(prev => ({ ...prev, [itemId]: num }));
    };

    const handleAddToCart = (item) => {
        const qty = quantities[item.id] || 1;
        addItem({ ...item, categoryName: categoryData.categoryName }, qty);
        setAddedFeedback(item.id);
        setTimeout(() => setAddedFeedback(null), 1500);
    };

    return (
        <div className="page animate-fade-in">
            <div className="container">
                <div className="breadcrumb">
                    <Link href="/">Home</Link>
                    <span className="sep">›</span>
                    <span>{category.name}</span>
                </div>

                <div className="page-header">
                    <h1>{category.name}</h1>
                    <p className="text-light">{category.description}</p>
                </div>

                {/* Brand selector */}
                {hasBrands && (
                    <div className="brand-selector-bar">
                        <span className="brand-selector-label">Brand:</span>
                        <div className="brand-pills">
                            {categoryData.brands.map((b) => {
                                const multipliers = getBrandMultipliers(slug);
                                const multiplier = multipliers[b];
                                const isActive = selectedBrand === b;
                                const priceDiff = multiplier ? ((multiplier - 1) * 100).toFixed(0) : null;
                                return (
                                    <button
                                        key={b}
                                        className={`brand-pill ${isActive ? 'brand-pill-active' : ''}`}
                                        onClick={() => handleBrandSelect(b)}
                                    >
                                        {b}
                                        {multiplier && multiplier !== 1 && (
                                            <span className={`brand-pill-diff ${multiplier > 1 ? 'diff-up' : 'diff-down'}`}>
                                                {multiplier > 1 ? `+${priceDiff}%` : `${priceDiff}%`}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {selectedBrand && (
                            <span className="brand-selected-note">
                                Showing prices for <strong>{selectedBrand}</strong>
                            </span>
                        )}
                    </div>
                )}

                {/* ── Roofing Sheets — simplified per-foot form ── */}
                {slug === 'roofing-sheets' ? (
                    <RoofingSheetsSelector
                        selectedBrand={selectedBrand}
                        getBrandMultipliers={getBrandMultipliers}
                        charges={charges}
                        categoryName={categoryData.categoryName}
                    />
                ) : isCascaded ? (
                    <PipeSelector
                        key={pipeType}   /* re-mount to reset selections when type changes */
                        items={pricedItems}
                        categoryName={activeCatData?.categoryName || categoryData.categoryName}
                        charges={charges}
                        getPrice={getBrandPrice}
                        groupKey={groupKey}
                        groupLabel={groupLabel}
                        groupFormat={groupFormat}
                        quantityLabel={slug === 'roofing-sheets' ? 'Running Ft' : 'Nos'}
                        /* Step-0 pipe type props — only for pipe pages */
                        typeOptions={isPipeCategory ? activeTabSet.map(t => ({ value: t.value, label: t.label })) : []}
                        selectedType={pipeType}
                        onTypeChange={isPipeCategory ? (val) => { setPipeType(val); } : null}
                    />
                ) : isSingleSelect ? (
                    <SingleSizeSelector
                        items={pricedItems}
                        categoryName={categoryData.categoryName}
                        charges={charges}
                        getPrice={getBrandPrice}
                    />
                ) : (
                    <>
                        {/* Standard flat table for non-pipe categories */}
                        <div className="products-table-wrapper">
                            <table className="products-table">
                                <thead>
                                    <tr>
                                        <th>Size</th>
                                        <th>Length</th>
                                        {pricedItems[0]?.weightPerMeter && <th>Weight/Mtr (kg)</th>}
                                        <th>Weight/Piece (kg)</th>
                                        <th>Price/Ton (₹)</th>
                                        <th>Quantity</th>
                                        <th>Est. Amount</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pricedItems.map(item => {
                                        const qty = quantities[item.id] || 0;
                                        const pricing = qty > 0 ? calculatePricing(item, qty, charges) : null;
                                        return (
                                            <tr key={item.id}>
                                                <td><strong>{item.size}</strong></td>
                                                <td>{item.packetsPerBox ? `1 box / ${item.packetsPerBox} packets` : item.length}</td>
                                                {item.weightPerMeter && <td>{item.weightPerMeter}</td>}
                                                {!item.priceOnRequest && <td>{item.weightPerPiece} kg</td>}
                                                <td className="text-accent font-bold">
                                                    {item.priceOnRequest
                                                        ? <span style={{color:'#888',fontSize:'0.85em'}}>Contact for Price</span>
                                                        : item.pricePerBox
                                                            ? `₹${item.pricePerBox.toLocaleString()}/box`
                                                            : `₹${item.pricePerTon.toLocaleString()}/ton`}
                                                </td>
                                                <td>
                                                    <div className="qty-input-wrap">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            placeholder="0"
                                                            value={quantities[item.id] || ''}
                                                            onChange={e => handleQuantityChange(item.id, e.target.value)}
                                                            className="qty-input"
                                                        />
                                                        <span className="qty-unit">{item.unit}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    {qty > 0 && !item.priceOnRequest ? (
                                                        item.pricePerBox ? (
                                                            <div className="est-amount">
                                                                <div className="est-weight">{qty * item.weightPerPiece}kg total</div>
                                                                <div className="est-total font-bold">₹{(qty * item.pricePerBox).toLocaleString()}</div>
                                                                <div className="est-note">excl. GST</div>
                                                            </div>
                                                        ) : pricing ? (
                                                            <div className="est-amount">
                                                                <div className="est-weight">{pricing.totalWeightKg}kg ({pricing.totalWeightTons}T)</div>
                                                                <div className="est-total font-bold">₹{pricing.total.toLocaleString()}</div>
                                                                <div className="est-note">incl. GST &amp; charges</div>
                                                            </div>
                                                        ) : null
                                                    ) : <span className="text-lighter">Enter qty</span>}
                                                </td>
                                                <td>
                                                    <button
                                                        className={`btn btn-sm ${addedFeedback === item.id ? 'btn-success' : 'btn-primary'}`}
                                                        onClick={() => handleAddToCart(item)}
                                                        disabled={!quantities[item.id]}
                                                    >
                                                        {addedFeedback === item.id ? '✓ Added' : 'Add to Cart'}
                                                    </button>
                                                    <Link href={`/product/${item.id}`} className="btn btn-ghost btn-sm" style={{ fontSize: '0.75rem', marginTop: 4, display: 'block' }}>
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="products-cards hide-desktop">
                            {pricedItems.map(item => {
                                const qty = quantities[item.id] || 0;
                                const pricing = qty > 0 ? calculatePricing(item, qty, charges) : null;
                                return (
                                    <div key={item.id} className="product-card-mobile">
                                        <div className="pcm-header">
                                            <div>
                                                <h4>{item.size}</h4>
                                                <span className="text-light">
                                                    {item.packetsPerBox
                                                        ? `1 box / ${item.packetsPerBox} packets`
                                                        : `${item.length} | ${item.weightPerPiece}kg/piece`}
                                                </span>
                                            </div>
                                            <div className="pcm-price">
                                                {item.pricePerBox
                                                    ? <>₹{item.pricePerBox.toLocaleString()}<small>/box</small></>
                                                    : <>₹{item.pricePerTon.toLocaleString()}<small>/ton</small></>}
                                            </div>
                                        </div>
                                        <div className="pcm-body">
                                            <div className="qty-input-wrap">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="Qty"
                                                    value={quantities[item.id] || ''}
                                                    onChange={e => handleQuantityChange(item.id, e.target.value)}
                                                    className="qty-input"
                                                />
                                                <span className="qty-unit">{item.unit}</span>
                                            </div>
                                            {qty > 0 && (
                                                <div className="pcm-estimate">
                                                    <span>{item.pricePerBox ? `${qty * item.weightPerPiece}kg` : `${pricing?.totalWeightKg}kg`}</span>
                                                    <strong>₹{item.pricePerBox ? (qty * item.pricePerBox).toLocaleString() : pricing?.total.toLocaleString()}</strong>
                                                </div>
                                            )}
                                        </div>
                                        <button
                                            className={`btn btn-block btn-sm ${addedFeedback === item.id ? 'btn-success' : 'btn-primary'}`}
                                            onClick={() => handleAddToCart(item)}
                                            disabled={!quantities[item.id]}
                                        >
                                            {addedFeedback === item.id ? '✓ Added' : 'Add to Cart'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}