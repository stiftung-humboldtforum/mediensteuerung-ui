// Gebäudeplan-Stammdaten (Humboldt Forum), extrahiert aus den Original-Druckdaten
// des Leit- und Orientierungssystems. Quelle, Extraktions-Pipeline und Skripte:
// mediensteuerung-dev/gebaeudeplan/ (README dort). Kurzfassung:
// - Plan-Grafik: src/assets/gebaeudeplan.svg (bereinigter Illustrator-Export,
//   alle Etagen als Gruppen mit den IDs unten uebereinander in einem Artboard)
// - Raumnummern + Positionen: aus der InDesign-Stelen-Datei (IDML, Layer
//   "PLAN - Raumziffern"), ueber die Platzierungs-Transformation der verlinkten
//   AI-Datei in SVG-Koordinaten umgerechnet (validiert: 75/75 im Etagen-Band,
//   Raum 216 exakt in der R216-Flaeche des SVG)
// - Namen: aus der Legende der Stelen-PDF; 301-304 ohne Legendeneintrag

export interface PlanFloor {
  id: string // SVG-Gruppen-ID der Etage
  label: string
  // Bounding-Box der Etagen-Gruppe in SVG-Koordinaten (vorab vermessen,
  // erspart getBBox()-Timing beim Einbetten)
  bbox: { x: number; y: number; w: number; h: number }
}

export interface PlanRoom {
  number: string
  floor: string // PlanFloor.id
  x: number // SVG-Koordinaten (Zentrum der Raumziffer im Plan)
  y: number
  name?: string
}

export const PLAN_FLOORS: PlanFloor[] = [
  { id: '_x2D_1', label: 'UG', bbox: { x: 345.99, y: 3581.66, w: 1649.98, h: 709.91 } },
  { id: '_x30_', label: 'EG', bbox: { x: 345.99, y: 2901.34, w: 1625.43, h: 709.91 } },
  { id: '_x31_', label: '1. OG', bbox: { x: 345.01, y: 2220.51, w: 1627.27, h: 710.97 } },
  { id: '_x32_', label: '2. OG', bbox: { x: 345.99, y: 1540.72, w: 1625.43, h: 709.9 } },
  { id: '_x33_', label: '3. OG', bbox: { x: 345.99, y: 860.4, w: 1625.43, h: 709.9 } },
  { id: '_x34_', label: '4. OG', bbox: { x: 346.0, y: 180.08, w: 1625.42, h: 709.91 } },
]

export const PLAN_ROOMS: PlanRoom[] = [
  { number: '-100', floor: '_x2D_1', x: 897.6, y: 4210.8, name: 'Schlosskeller' },
  { number: '000', floor: '_x30_', x: 926.0, y: 3354.3, name: 'Foyer / Kasse' },
  { number: '001', floor: '_x30_', x: 479.1, y: 3288.2, name: 'Saal 1' },
  { number: '002', floor: '_x30_', x: 743.6, y: 3278.7, name: 'Saal 2' },
  { number: '003', floor: '_x30_', x: 1732.0, y: 3126.3, name: 'Saal 3' },
  { number: '004', floor: '_x30_', x: 1086.6, y: 3065.2, name: 'Tourist Info / Förderverein' },
  { number: '005', floor: '_x30_', x: 986.5, y: 3459.2, name: 'Sonderausstellung 2' },
  { number: '006', floor: '_x30_', x: 1133.9, y: 3492.3, name: 'Sonderausstellung 1' },
  { number: '007', floor: '_x30_', x: 675.6, y: 3204.1, name: 'Seminarräume' },
  { number: '008', floor: '_x30_', x: 1486.3, y: 3371.3, name: 'Videopanorama' },
  { number: '009', floor: '_x30_', x: 1581.7, y: 3085.0, name: 'Skulpturensaal' },
  { number: '010', floor: '_x30_', x: 1041.3, y: 3314.6, name: 'Humboldt Ausstellung' },
  { number: '101', floor: '_x31_', x: 954.3, y: 2872.4, name: 'Werkräume' },
  { number: '102', floor: '_x31_', x: 652.0, y: 2551.2, name: 'Humboldt Labor' },
  { number: '103', floor: '_x31_', x: 803.2, y: 2486.9, name: 'Humboldt Labor' },
  { number: '104', floor: '_x31_', x: 915.6, y: 2471.8, name: 'Berlin Ausstellung' },
  { number: '105', floor: '_x31_', x: 880.6, y: 2444.7, name: 'Saal 5 / Berlin Raum' },
  { number: '106', floor: '_x31_', x: 1048.8, y: 2400.0, name: 'Berlin Ausstellung' },
  { number: '107', floor: '_x31_', x: 1205.7, y: 2342.4, name: 'Berlin Ausstellung' },
  { number: '108', floor: '_x31_', x: 1328.5, y: 2294.8, name: 'Berlin Ausstellung' },
  { number: '109', floor: '_x31_', x: 1521.3, y: 2319.4, name: 'Berlin Ausstellung' },
  { number: '110', floor: '_x31_', x: 1675.3, y: 2383.0, name: 'Berlin Ausstellung' },
  { number: '111', floor: '_x31_', x: 1776.4, y: 2477.5, name: 'Berlin Ausstellung' },
  { number: '112', floor: '_x31_', x: 1766.9, y: 2594.6, name: 'Berlin Ausstellung' },
  { number: '113', floor: '_x31_', x: 1672.4, y: 2626.8, name: 'Berlin Ausstellung' },
  { number: '114', floor: '_x31_', x: 1478.2, y: 2696.3, name: 'Berlin Ausstellung' },
  { number: '115', floor: '_x31_', x: 1295.4, y: 2595.6, name: 'Berlin Ausstellung' },
  { number: '116', floor: '_x31_', x: 1086.6, y: 2475.6, name: 'Berlin Ausstellung' },
  { number: '117', floor: '_x31_', x: 1380.5, y: 2744.2, name: 'Berlin Ausstellung' },
  { number: '200', floor: '_x32_', x: 803.2, y: 1809.4, name: 'Einführung' },
  { number: '201', floor: '_x32_', x: 926.0, y: 1779.2, name: 'Temporäre Ausstellung' },
  { number: '202', floor: '_x32_', x: 1048.8, y: 1719.7, name: 'Amerika' },
  { number: '203', floor: '_x32_', x: 1215.1, y: 1662.0, name: 'Temporäre Ausstellung' },
  { number: '204', floor: '_x32_', x: 1322.8, y: 1619.5, name: 'Amerika' },
  { number: '205', floor: '_x32_', x: 1530.7, y: 1644.1, name: 'Amerika' },
  { number: '206', floor: '_x32_', x: 1658.3, y: 1695.1, name: 'Amerika' },
  { number: '207', floor: '_x32_', x: 1585.5, y: 1720.9, name: 'Amerika' },
  { number: '208', floor: '_x32_', x: 1776.4, y: 1783.9, name: 'Amerika' },
  { number: '209', floor: '_x32_', x: 1808.5, y: 1889.8, name: 'Afrika' },
  { number: '210', floor: '_x32_', x: 1672.4, y: 1945.5, name: 'Afrika' },
  { number: '211', floor: '_x32_', x: 1568.5, y: 1977.6, name: 'Temporäre Ausstellung' },
  { number: '212', floor: '_x32_', x: 1372.0, y: 2049.4, name: 'Temporäre Ausstellung' },
  { number: '213', floor: '_x32_', x: 1272.8, y: 2078.7, name: 'Einführung' },
  { number: '214', floor: '_x32_', x: 1116.9, y: 2135.4, name: 'Afrika / Temporäre Ausstellung' },
  { number: '215', floor: '_x32_', x: 1039.4, y: 2067.4, name: 'Ozeanien' },
  { number: '216', floor: '_x32_', x: 892.0, y: 2154.3, name: 'Afrika' },
  { number: '217', floor: '_x32_', x: 719.3, y: 2056.8, name: 'Klänge der Welt / Werkraum' },
  { number: '218', floor: '_x32_', x: 515.9, y: 1946.5, name: 'Ozeanien' },
  { number: '219', floor: '_x32_', x: 668.4, y: 1862.2, name: 'Ozeanien' },
  { number: '220', floor: '_x32_', x: 743.9, y: 1923.0, name: 'Ozeanien' },
  { number: '300', floor: '_x33_', x: 805.0, y: 1132.9, name: 'Einführung / Werkräume' },
  { number: '301', floor: '_x33_', x: 923.6, y: 1096.1 },
  { number: '302', floor: '_x33_', x: 1044.1, y: 1039.4 },
  { number: '303', floor: '_x33_', x: 1200.0, y: 982.7 },
  { number: '304', floor: '_x33_', x: 1322.8, y: 937.3 },
  { number: '305', floor: '_x33_', x: 1530.7, y: 963.8, name: 'Asien' },
  { number: '306', floor: '_x33_', x: 1652.6, y: 1012.9, name: 'Asien' },
  { number: '308', floor: '_x33_', x: 1776.4, y: 1103.6, name: 'Asien' },
  { number: '309', floor: '_x33_', x: 1808.5, y: 1209.4, name: 'Temporäre Ausstellung' },
  { number: '310', floor: '_x33_', x: 1672.4, y: 1266.1, name: 'Asien' },
  { number: '311', floor: '_x33_', x: 1568.5, y: 1297.3, name: 'Asien' },
  { number: '312', floor: '_x33_', x: 1373.9, y: 1370.1, name: 'Temporäre Ausstellung' },
  { number: '313', floor: '_x33_', x: 1272.8, y: 1398.4, name: 'Einführung / Werkräume' },
  { number: '314', floor: '_x33_', x: 1115.9, y: 1457.9, name: 'Asien' },
  { number: '315', floor: '_x33_', x: 1058.3, y: 1385.8, name: 'Asien' },
  { number: '316', floor: '_x33_', x: 897.6, y: 1470.2, name: 'Asien' },
  { number: '317', floor: '_x33_', x: 718.1, y: 1384.6, name: 'Asien' },
  { number: '318', floor: '_x33_', x: 525.0, y: 1273.7, name: 'Asien' },
  { number: '319', floor: '_x33_', x: 668.4, y: 1184.1, name: 'Asien' },
  { number: '320', floor: '_x33_', x: 743.9, y: 1234.8, name: 'Asien' },
  { number: '400', floor: '_x34_', x: 800.3, y: 522.7, name: 'Dachterrasse' },
  { number: 'A', floor: '_x30_', x: 773.9, y: 3167.2, name: 'Garderobe A' },
  { number: 'B', floor: '_x2D_1', x: 600.0, y: 4031.8, name: 'Garderobe B' },
  { number: 'C', floor: '_x30_', x: 1285.0, y: 3454.5, name: 'Garderobe C' },
  { number: 'D', floor: '_x31_', x: 1263.3, y: 2752.4, name: 'Garderobe D' },
]
