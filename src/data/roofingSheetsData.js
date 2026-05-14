// Roofing Sheets — Colour Coated Galvalume (IS 15965)
// Corrugated & trapezoidal profile. Standard sheet sizes. Per Running Foot pricing.
// 1 Running Foot = 0.3048 m | weightPerPiece = weight of 1 running foot of sheet
const roof = (profile, gauge, thickMm, wpm, pricePerKg) => ({
  id: `roof-${profile.replace(/\s/g,'-')}-${String(thickMm).replace('.','_')}`,
  size: `${profile} | ${gauge} Gauge | ${thickMm}mm`,
  sheetSize: profile,
  thickness: thickMm,
  weightPerMeter: wpm,
  weightPerPiece: parseFloat((wpm * 0.3048).toFixed(3)), // weight per 1 running foot
  pricePerTon: pricePerKg * 1000,
  pricePerKg,
  unit: 'Running Ft',
  length: 'Per Running Foot',
});

export const roofingSheetsItems = [
  // ─── Corrugated profile ───────────────────────────────────
  roof('Corrugated',  28, 0.40, 3.14, 125),
  roof('Corrugated',  26, 0.45, 3.53, 120),
  roof('Corrugated',  24, 0.55, 4.32, 117),
  roof('Corrugated',  22, 0.70, 5.49, 113),
  roof('Corrugated',  20, 0.90, 7.07, 110),
  roof('Corrugated',  18, 1.20, 9.42, 107),

  // ─── Tile / Box profile ───────────────────────────────────
  roof('Box Profile', 28, 0.40, 3.20, 126),
  roof('Box Profile', 26, 0.45, 3.60, 121),
  roof('Box Profile', 24, 0.55, 4.40, 118),
  roof('Box Profile', 22, 0.70, 5.60, 114),
  roof('Box Profile', 20, 0.90, 7.20, 111),
  roof('Box Profile', 18, 1.20, 9.60, 108),

  // ─── Trapezoidal (1000mm cover) ───────────────────────────
  roof('Trapezoidal', 26, 0.45, 3.50, 120),
  roof('Trapezoidal', 24, 0.55, 4.30, 117),
  roof('Trapezoidal', 22, 0.70, 5.50, 113),
  roof('Trapezoidal', 20, 0.90, 7.10, 110),
  roof('Trapezoidal', 18, 1.20, 9.45, 107),
];
