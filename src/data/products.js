// Product categories and data for LOOHA Technologies
import { msPipesItems } from './msPipesData.js';
import { msFlatItems } from './msFlatData.js';
import { msSheetsItems } from './msSheetsData.js';
import { giSheetsItems } from './giSheetsData.js';
import { gpPipesItems } from './gpPipesData.js';
import { msAngleItems } from './msAngleData.js';
import { giPipesItems } from './giPipesData.js';
import { roofingSheetsItems } from './roofingSheetsData.js';
import { msSquareRodsItems } from './msSquareRodsData.js';
import { msSquareItems } from './msSquareData.js';
import { msRectItems } from './msRectData.js';
export const categories = [
  {
    id: 'ms-pipes',
    name: 'MS Pipes',
    image: '/products/ms-pipes.webp',
    description: 'Mild steel pipes for industrial and construction use',
    icon: '🔧',
  },
  {
    id: 'gp-pipes',
    name: 'GP Pipes',
    image: '/products/gp-pipes.webp',
    description: 'Galvanized plain pipes for plumbing and construction',
    icon: '🚰',
  },
  {
    id: 'ms-flat',
    name: 'MS Flat',
    image: '/products/ms-flat.webp',
    description: 'Mild steel flat bars for structural and fabrication use',
    icon: '▬',
  },
  {
    id: 'ms-square-rods',
    name: 'MS Square Rods',
    image: '/products/ms-square-rods.webp',
    description: 'IS 1732 solid mild steel square bars from 6×6mm to 100×100mm',
    icon: '◼',
  },
  {
    id: 'ms-angle',
    name: 'MS Angle',
    image: '/products/ms-angle.webp',
    description: 'Mild steel angle sections for structural work',
    icon: '📐',
  },
  {
    id: 'ms-beams',
    name: 'MS Beams',
    image: '/products/ms-beams.webp',
    description: 'Structural steel beams (ISMB/ISJB) for construction',
    icon: '🏗️',
  },
  {
    id: 'ms-channels',
    name: 'MS Channels',
    image: '/products/ms-channels.webp',
    description: 'Mild steel channel sections for fabrication',
    icon: '〒',
  },
  {
    id: 'tmt-bars',
    name: 'TMT Bars',
    image: '/products/tmt-bars.webp',
    description: 'High-strength TMT steel bars for RCC construction',
    icon: '🔩',
  },
  {
    id: 'binding-wire',
    name: 'Binding Wire',
    image: '/products/binding-wire.webp',
    description: 'GI binding wire for construction tying',
    icon: '🪢',
  },
  {
    id: 'ms-sheets',
    name: 'MS Sheets',
    image: '/products/ms-sheets.webp',
    description: 'HR/CR mild steel sheets for fabrication',
    icon: '📄',
  },
  {
    id: 'gi-sheets',
    name: 'GI Sheets',
    image: '/products/gi-sheets.webp',
    description: 'Galvanized iron sheets for roofing and cladding',
    icon: '🛡️',
  },
  {
    id: 'welding-rods',
    name: 'Welding Rods',
    image: '/products/welding-rods.webp',
    description: 'Welding electrodes for industrial and fabrication use',
    icon: '⚡',
  },
  {
    id: 'gi-pipes',
    name: 'GI Pipes',
    image: '/products/gi-pipes.webp',
    description: 'IS 1239 hot-dip galvanised iron pipes for water supply & plumbing',
    icon: '🚿',
  },
  {
    id: 'roofing-sheets',
    name: 'Roofing Sheets',
    image: '/products/roofing-sheets.webp',
    description: 'Colour-coated Galvalume roofing sheets for sheds & industrial buildings',
    icon: '🏠',
  },
];

// TMT Bar weight formula: (d^2 / 162) * length(m) in kg per piece
// Standard length = 12 meters
const TMT_LENGTH = 12;
const tmtWeightPerPiece = (diameter) => parseFloat(((diameter * diameter / 162) * TMT_LENGTH).toFixed(2));

export const products = {
  'tmt-bars': {
    categoryId: 'tmt-bars',
    categoryName: 'TMT Bars',
    brands: ['Tirumala', 'PFI', 'JSW Neosteel', 'Vizag Steels', 'TATA'],
    brandPriceMultiplier: {
      'Tirumala':    1.00,
      'PFI':         1.02,
      'JSW Neosteel':1.05,
      'Vizag Steels':1.03,
      'TATA':        1.07,
    },
    items: [
      { id: 'tmt-6',  size: '6mm',  weightPerMeter: 0.222,  weightPerPiece: parseFloat((0.222  * 12).toFixed(3)), pricePerTon: 52000, unit: 'Nos', length: '12m' },
      { id: 'tmt-8',  size: '8mm',  weightPerMeter: 0.395,  weightPerPiece: parseFloat((0.395  * 12).toFixed(3)), pricePerTon: 51500, unit: 'Nos', length: '12m' },
      { id: 'tmt-10', size: '10mm', weightPerMeter: 0.617,  weightPerPiece: parseFloat((0.617  * 12).toFixed(3)), pricePerTon: 51000, unit: 'Nos', length: '12m' },
      { id: 'tmt-12', size: '12mm', weightPerMeter: 0.889,  weightPerPiece: parseFloat((0.889  * 12).toFixed(3)), pricePerTon: 50800, unit: 'Nos', length: '12m' },
      { id: 'tmt-16', size: '16mm', weightPerMeter: 1.580,  weightPerPiece: parseFloat((1.580  * 12).toFixed(3)), pricePerTon: 50500, unit: 'Nos', length: '12m' },
      { id: 'tmt-20', size: '20mm', weightPerMeter: 2.469,  weightPerPiece: parseFloat((2.469  * 12).toFixed(3)), pricePerTon: 50200, unit: 'Nos', length: '12m' },
      { id: 'tmt-25', size: '25mm', weightPerMeter: 3.858,  weightPerPiece: parseFloat((3.858  * 12).toFixed(3)), pricePerTon: 50000, unit: 'Nos', length: '12m' },
      { id: 'tmt-28', size: '28mm', weightPerMeter: 4.840,  weightPerPiece: parseFloat((4.840  * 12).toFixed(3)), pricePerTon: 49900, unit: 'Nos', length: '12m' },
      { id: 'tmt-32', size: '32mm', weightPerMeter: 6.321,  weightPerPiece: parseFloat((6.321  * 12).toFixed(3)), pricePerTon: 49800, unit: 'Nos', length: '12m' },
      { id: 'tmt-36', size: '36mm', weightPerMeter: 8.000,  weightPerPiece: parseFloat((8.000  * 12).toFixed(3)), pricePerTon: 49700, unit: 'Nos', length: '12m' },
      { id: 'tmt-40', size: '40mm', weightPerMeter: 9.877,  weightPerPiece: parseFloat((9.877  * 12).toFixed(3)), pricePerTon: 49600, unit: 'Nos', length: '12m' },
      { id: 'tmt-50', size: '50mm', weightPerMeter: 15.432, weightPerPiece: parseFloat((15.432 * 12).toFixed(3)), pricePerTon: 49500, unit: 'Nos', length: '12m' },
    ],
  },
  'binding-wire': {
    categoryId: 'binding-wire',
    categoryName: 'Binding Wire',
    brands: [],
    pricingModel: 'per-box',   // custom: ₹ per box, not per ton
    items: [
      { id: 'bw-20g', size: '20 Gauge', weightPerPiece: 25, pricePerBox: 2600, pricePerTon: 104000, unit: 'Boxes', length: 'Standard' },
    ],
  },
  'ms-pipes': {
    categoryId: 'ms-pipes',
    categoryName: 'MS Pipes',
    brands: ['Hariom', 'MPL', 'Surya Prakash', 'Apollo', 'JSW', 'Jindal', 'TATA'],
    brandPriceMultiplier: {
      'Hariom':       1.000,  // ₹75,000 — base
      'MPL':          1.013,  // ₹76,000
      'Surya Prakash':1.120,  // ₹84,000
      'Apollo':       1.133,  // ₹85,000
      'JSW':          1.133,  // ₹85,000
      'Jindal':       1.133,  // ₹85,000
      'TATA':         1.200,  // ₹90,000
    },
    items: msPipesItems,
  },
  // ── Hidden entries used by Pipe Type tabs (not in category nav) ──
  'ms-square-hollow': {
    categoryId: 'ms-square-hollow',
    categoryName: 'MS Square Tubes',
    brands: ['Hariom', 'MPL', 'Surya Prakash', 'Apollo', 'JSW', 'Jindal', 'TATA'],
    brandPriceMultiplier: {
      'Hariom':       1.000,
      'MPL':          1.013,
      'Surya Prakash':1.120,
      'Apollo':       1.133,
      'JSW':          1.133,
      'Jindal':       1.133,
      'TATA':         1.200,
    },
    items: msSquareItems,
  },
  'ms-rect-hollow': {
    categoryId: 'ms-rect-hollow',
    categoryName: 'MS Rectangular Tubes',
    brands: ['Hariom', 'MPL', 'Surya Prakash', 'Apollo', 'JSW', 'Jindal', 'TATA'],
    brandPriceMultiplier: {
      'Hariom':       1.000,
      'MPL':          1.013,
      'Surya Prakash':1.120,
      'Apollo':       1.133,
      'JSW':          1.133,
      'Jindal':       1.133,
      'TATA':         1.200,
    },
    items: msRectItems,
  },
  'ms-flat': {
    categoryId: 'ms-flat',
    categoryName: 'MS Flat',
    brands: [],
    items: msFlatItems,
  },
  'ms-square-rods': {
    categoryId: 'ms-square-rods',
    categoryName: 'MS Square Rods',
    brands: [],
    items: msSquareRodsItems,
  },
  'ms-angle': {
    categoryId: 'ms-angle',
    categoryName: 'MS Angle',
    brands: ['Rolling', 'SAIL', 'Vizag Steel'],
    brandPriceMultiplier: {
      'Rolling':     1.000,  // ₹67,000 — base
      'SAIL':        1.075,  // ₹72,000
      'Vizag Steel': 1.075,  // ₹72,000
    },
    items: msAngleItems,
  },
  'ms-beams': {
    categoryId: 'ms-beams',
    categoryName: 'MS Beams',
    brands: ['Rolling', 'SAIL', 'Vizag Steel'],
    brandPriceMultiplier: {
      'Rolling':     1.000,  // ₹67,000 — base
      'SAIL':        1.075,  // ₹72,000
      'Vizag Steel': 1.075,  // ₹72,000
    },
    items: [
      { id: 'msb-100x75',  size: '100x75',  weightPerMeter: 8.0,   weightPerPiece: parseFloat((8.0   * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msb-125x70',  size: '125x70',  weightPerMeter: 11.9,  weightPerPiece: parseFloat((11.9  * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msb-150x80',  size: '150x80',  weightPerMeter: 14.9,  weightPerPiece: parseFloat((14.9  * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msb-175x85',  size: '175x85',  weightPerMeter: 19.3,  weightPerPiece: parseFloat((19.3  * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msb-200x100', size: '200x100', weightPerMeter: 25.4,  weightPerPiece: parseFloat((25.4  * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msb-250x125', size: '250x125', weightPerMeter: 37.3,  weightPerPiece: parseFloat((37.3  * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msb-300x140', size: '300x140', weightPerMeter: 44.2,  weightPerPiece: parseFloat((44.2  * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msb-350x140', size: '350x140', weightPerMeter: 49.7,  weightPerPiece: parseFloat((49.7  * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msb-400x140', size: '400x140', weightPerMeter: 61.5,  weightPerPiece: parseFloat((61.5  * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msb-450x150', size: '450x150', weightPerMeter: 72.4,  weightPerPiece: parseFloat((72.4  * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msb-500x180', size: '500x180', weightPerMeter: 86.9,  weightPerPiece: parseFloat((86.9  * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msb-600x210', size: '600x210', weightPerMeter: 122.6, weightPerPiece: parseFloat((122.6 * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
    ],
  },
  'ms-channels': {
    categoryId: 'ms-channels',
    categoryName: 'MS Channels',
    brands: ['Rolling', 'SAIL', 'Vizag Steel'],
    brandPriceMultiplier: {
      'Rolling':     1.000,  // ₹67,000 — base
      'SAIL':        1.075,  // ₹72,000
      'Vizag Steel': 1.075,  // ₹72,000
    },
    items: [
      { id: 'msc-75x40',  size: '75x40',   weightPerMeter: 7.14,  weightPerPiece: parseFloat((7.14  * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msc-100x50', size: '100x50',  weightPerMeter: 9.56,  weightPerPiece: parseFloat((9.56  * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msc-125x65', size: '125x65',  weightPerMeter: 13.10, weightPerPiece: parseFloat((13.10 * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msc-150x75', size: '150x75',  weightPerMeter: 16.80, weightPerPiece: parseFloat((16.80 * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msc-175x75', size: '175x75',  weightPerMeter: 19.60, weightPerPiece: parseFloat((19.60 * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msc-200x75', size: '200x75',  weightPerMeter: 22.30, weightPerPiece: parseFloat((22.30 * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msc-250x82', size: '250x82',  weightPerMeter: 34.20, weightPerPiece: parseFloat((34.20 * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msc-300x90', size: '300x90',  weightPerMeter: 36.30, weightPerPiece: parseFloat((36.30 * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
      { id: 'msc-400x100',size: '400x100', weightPerMeter: 50.10, weightPerPiece: parseFloat((50.10 * 6).toFixed(3)), pricePerTon: 67000, unit: 'Nos', length: '6m' },
    ],
  },
  'ms-sheets': {
    categoryId: 'ms-sheets',
    categoryName: 'MS Sheets',
    brands: ['TATA', 'SAIL', 'JSW'],
    brandPriceMultiplier: {
      'TATA': 1.000,  // ₹85,000 — same rate all brands
      'SAIL': 1.000,  // ₹85,000
      'JSW':  1.000,  // ₹85,000
    },
    items: msSheetsItems,
  },
  'gi-sheets': {
    categoryId: 'gi-sheets',
    categoryName: 'GI Sheets',
    brands: ['JSW', 'SAIL', 'TATA'],
    brandPriceMultiplier: {
      'JSW':  1.000,  // ₹1,05,000 — base
      'SAIL': 1.000,  // ₹1,05,000
      'TATA': 1.019,  // ₹1,07,000
    },
    items: giSheetsItems,
  },
  'gp-pipes': {
    categoryId: 'gp-pipes',
    categoryName: 'GP Pipes',
    brands: ['Hariom', 'Zenith', 'Surya Prakash', 'Jindal', 'Apollo', 'TATA'],
    brandPriceMultiplier: {
      'Hariom':       1.000,  // ₹1,05,000 — base
      'Zenith':       1.000,  // ₹1,05,000
      'Surya Prakash':1.000,  // ₹1,05,000
      'Jindal':       1.019,  // ₹1,07,000
      'Apollo':       1.019,  // ₹1,07,000
      'TATA':         1.048,  // ₹1,10,000
    },
    items: gpPipesItems,
  },
  'gi-pipes': {
    categoryId: 'gi-pipes',
    categoryName: 'GI Pipes',
    brands: ['APL Apollo', 'Tata Pipes', 'Jindal', 'Surya'],
    brandPriceMultiplier: {
      'APL Apollo': 1.05,
      'Tata Pipes': 1.07,
      'Jindal':     1.03,
      'Surya':      0.98,
    },
    items: giPipesItems,
  },
  'roofing-sheets': {
    categoryId: 'roofing-sheets',
    categoryName: 'Roofing Sheets',
    brands: ['Jindal', 'Apollo', 'JSW Pragathi', 'JSW ColouronPlus', 'TATA'],
    brandPriceMultiplier: {
      'Jindal':         1.000,  // ₹140/ft — base
      'Apollo':         1.000,  // ₹140/ft
      'JSW Pragathi':   1.071,  // ₹150/ft
      'JSW ColouronPlus':1.250, // ₹175/ft
      'TATA':           1.357,  // ₹190/ft
    },
    items: roofingSheetsItems,
  },
  'welding-rods': {
    categoryId: 'welding-rods',
    categoryName: 'Welding Rods',
    brands: ['Mangalam'],
    pricingModel: 'per-box',
    items: [
      { id: 'wr-315', size: '3.15mm × 350mm', weightPerPiece: 5,  pricePerBox: 2600, pricePerTon: 0, unit: 'Boxes', length: '350mm', packetsPerBox: 8 },
      { id: 'wr-4',   size: '4mm × 450mm',    weightPerPiece: 9,  pricePerBox: 3200, pricePerTon: 0, unit: 'Boxes', length: '450mm', packetsPerBox: 8 },
      { id: 'wr-5',   size: '5mm × 450mm',    weightPerPiece: 12, pricePerBox: 3600, pricePerTon: 0, unit: 'Boxes', length: '450mm', packetsPerBox: 8 },
    ],
  },
};

// Charges
export const charges = {
  loadingPerTon: 500,
  transportPerTon: 1500,
  gstPercent: 18,
};

// Top Selling Brands
export const topBrands = [
  { id: 'vizag', name: 'Vizag Steel', logo: '/images/brands/vizag.svg' },
  { id: 'tata', name: 'TATA Tiscon', logo: '/images/brands/tata.svg' },
  { id: 'sail', name: 'SAIL', logo: '/images/brands/sail.svg' },
  { id: 'jsw', name: 'JSW Neo', logo: '/images/brands/jsw.svg' },
  { id: 'jindal', name: 'Jindal Panther', logo: '/images/brands/jindal.svg' },
  { id: 'apl', name: 'APL Apollo', logo: '/images/brands/apl.svg' },
  { id: 'surya', name: 'Surya Roshni', logo: '/images/brands/surya.svg' },
  { id: 'essar', name: 'Essar Steel', logo: '/images/brands/essar.svg' },
];

// Product groups for homepage sections
export const productGroups = {
  construction: {
    title: 'Buy TMT Bars for Construction',
    slug: 'construction',
    items: [
      { id: 'tmt-bars', name: 'TMT Bars', image: '/images/categories/tmt-bars.svg', description: 'Fe 500, Fe 550D TMT Bars' },
      { id: 'binding-wire', name: 'Binding Wire', image: '/images/categories/binding-wire.svg', description: 'GI Binding Wire' },
    ],
  },
  fabrication: {
    title: 'Buy Fabrication Steel',
    slug: 'fabrication',
    items: [
      { id: 'ms-pipes', name: 'MS Pipes & Tubes', image: '/images/categories/ms-pipes.svg', description: 'Round, Square, Rectangular' },
      { id: 'ms-beams', name: 'MS Beams', image: '/images/categories/ms-beams.svg', description: 'ISMB / ISJB Beams' },
      { id: 'ms-channels', name: 'MS Channels', image: '/images/categories/ms-channels.svg', description: 'ISMC / ISJC Channels' },
      { id: 'ms-sheets', name: 'MS Sheets', image: '/images/categories/ms-sheets.svg', description: 'HR / CR Sheets' },
    ],
  },
  special: {
    title: 'Buy Special Steel',
    slug: 'special',
    items: [
      { id: 'gi-gp-sheets', name: 'GI / GP Sheets', image: '/images/categories/gi-gp-sheets.svg', description: 'Galvanized Sheets' },
      { id: 'gp-pipes', name: 'GP Pipes & Tubes', image: '/images/categories/gp-pipes.svg', description: 'Galvanized Plain Pipes' },
      { id: 'gi-pipes', name: 'GI Pipes & Tubes', image: '/images/categories/gi-pipes.svg', description: 'Galvanized Iron Pipes' },
    ],
  },
};

// Helper to calculate pricing
export function calculatePricing(item, quantity, customCharges) {
  const ch = customCharges || charges;
  const totalWeight = (item.weightPerPiece * quantity) / 1000; // in tons
  const subtotal = totalWeight * item.pricePerTon;
  const loading = totalWeight * ch.loadingPerTon;
  const transport = totalWeight * ch.transportPerTon;
  const beforeGst = subtotal + loading + transport;
  const gst = beforeGst * (ch.gstPercent / 100);
  const total = beforeGst + gst;

  return {
    quantity,
    weightPerPiece: item.weightPerPiece,
    totalWeightKg: parseFloat((item.weightPerPiece * quantity).toFixed(2)),
    totalWeightTons: parseFloat(totalWeight.toFixed(3)),
    pricePerTon: item.pricePerTon,
    subtotal: Math.round(subtotal),
    loadingCharges: Math.round(loading),
    transportCharges: Math.round(transport),
    gstPercent: ch.gstPercent,
    gstAmount: Math.round(gst),
    total: Math.round(total),
  };
}
