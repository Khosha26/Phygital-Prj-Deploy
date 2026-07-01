// Plate data transcribed from 6 "TYPICAL FLOOR PLANS" reference composites.
// Pointer numbers (1..4) encode unit position: number N <-> unit-ranges whose
// position digits end in 0N (e.g. "101 TO 2001" = pos 01 -> pointer 1).
window.PLATE_DATA = {

  // AB: BLOCK A & BLOCK B. No floor subtitle shown. Table + gold pointers read clearly.
  // Pointers from the "03_51_45" pointer image. No typeLegend on this plate.
  AB: {
    pair: "AB",
    subtitle: null,
    table: [
      { unitRange: "101 TO 2001", rera: 1547.22 },
      { unitRange: "104 TO 2004", rera: 1547.22 },
      { unitRange: "102 TO 2002", rera: 1545.93 },
      { unitRange: "103 TO 2003", rera: 1545.93 }
    ],
    typeLegend: [],
    layouts: [
      // Left plate = BLOCK B
      { block: "B", positions: { topLeft: 4, topRight: 1, bottomLeft: 3, bottomRight: 2 } },
      // Right plate = BLOCK A
      { block: "A", positions: { topLeft: 2, topRight: 3, bottomLeft: 1, bottomRight: 4 } }
    ],
    perPosition: {
      1: { rera: 1547.22, unitRangeLabel: "101 TO 2001" },
      2: { rera: 1545.93, unitRangeLabel: "102 TO 2002" },
      3: { rera: 1545.93, unitRangeLabel: "103 TO 2003" },
      4: { rera: 1547.22, unitRangeLabel: "104 TO 2004" }
    }
  },

  // EF: BLOCK E & BLOCK F. Subtitle "Second Floor (Residential)".
  // Note: table has 5 rows but 4 pointer positions; rows 3 ("203 - ...") and
  // 4 ("503,803,1203,1703") are both floor-set variants of position 03.
  // perPosition[3] uses the primary 203 range (2233.85); the 503/803/1203/1703
  // exception row is preserved in `table` and listed in perPosition3Alt.
  EF: {
    pair: "EF",
    subtitle: "Second Floor (Residential)",
    table: [
      { unitRange: "201 TO 1901", rera: 2507.26 },
      { unitRange: "202 TO 1902", rera: 2507.26 },
      { unitRange: "203 – 403,603, 703, 903-1103, 1303-1603, 1803, 1903", rera: 2233.85 },
      { unitRange: "503,803,1203,1703", rera: 2464.96 },
      { unitRange: "204 TO 1904", rera: 2459.25 }
    ],
    typeLegend: [
      "Type 1,2 – Same Unit",
      "Type 3 – Same Unit",
      "Type 4 – Same Unit"
    ],
    layouts: [
      // Left plate = BLOCK E
      { block: "E", positions: { topLeft: 2, topRight: 3, bottomLeft: 1, bottomRight: 4 } },
      // Right plate = BLOCK F
      { block: "F", positions: { topLeft: 3, topRight: 2, bottomLeft: 4, bottomRight: 1 } }
    ],
    perPosition: {
      1: { rera: 2507.26, unitRangeLabel: "201 TO 1901" },
      2: { rera: 2507.26, unitRangeLabel: "202 TO 1902" },
      3: { rera: 2233.85, unitRangeLabel: "203 – 403,603, 703, 903-1103, 1303-1603, 1803, 1903" },
      4: { rera: 2459.25, unitRangeLabel: "204 TO 1904" }
    },
    perPosition3Alt: { rera: 2464.96, unitRangeLabel: "503,803,1203,1703" }
  },

  // GH: BLOCK G & BLOCK H. Subtitle "Second Floor (Residential)".
  // Both plates share the same pointer layout. Read clearly.
  GH: {
    pair: "GH",
    subtitle: "Second Floor (Residential)",
    table: [
      { unitRange: "201 TO 1901", rera: 2071.10 },
      { unitRange: "204 TO 1904", rera: 2071.10 },
      { unitRange: "202 TO 1902", rera: 1772.94 },
      { unitRange: "203 TO 1903", rera: 1772.94 }
    ],
    typeLegend: [
      "Type 1,4 – Same Unit",
      "Type 2,3 – Same Unit"
    ],
    layouts: [
      // Left plate = BLOCK G
      { block: "G", positions: { topLeft: 2, topRight: 3, bottomLeft: 1, bottomRight: 4 } },
      // Right plate = BLOCK H
      { block: "H", positions: { topLeft: 2, topRight: 3, bottomLeft: 1, bottomRight: 4 } }
    ],
    perPosition: {
      1: { rera: 2071.10, unitRangeLabel: "201 TO 1901" },
      2: { rera: 1772.94, unitRangeLabel: "202 TO 1902" },
      3: { rera: 1772.94, unitRangeLabel: "203 TO 1903" },
      4: { rera: 2071.10, unitRangeLabel: "204 TO 1904" }
    }
  },

  // IJ: BLOCK I & BLOCK J. Subtitle "Second Floor (Residential)".
  // 2 units per block -> left/right wings. Left plate = BLOCK J, right = BLOCK I.
  IJ: {
    pair: "IJ",
    subtitle: "Second Floor (Residential)",
    table: [
      { unitRange: "201 TO 1901", rera: 2082.73 },
      { unitRange: "202 TO 1902", rera: 1776.17 }
    ],
    typeLegend: [
      "Type 1 – Same Unit",
      "Type 2 – Same Unit"
    ],
    layouts: [
      // Left plate = BLOCK J
      { block: "J", positions: { left: 1, right: 2 } },
      // Right plate = BLOCK I
      { block: "I", positions: { left: 2, right: 1 } }
    ],
    perPosition: {
      1: { rera: 2082.73, unitRangeLabel: "201 TO 1901" },
      2: { rera: 1776.17, unitRangeLabel: "202 TO 1902" }
    }
  },

  // CD: BLOCK C & BLOCK D. Raw plate image, NO table -> rera set to null.
  // 2 units per block, red unit numbers baked at wings. Left plate = BLOCK D,
  // right = BLOCK C. No subtitle/legend in raw image.
  CD: {
    pair: "CD",
    subtitle: null,
    table: [],
    typeLegend: [],
    layouts: [
      // Left plate = BLOCK D
      { block: "D", positions: { left: 1, right: 2 } },
      // Right plate = BLOCK C
      { block: "C", positions: { left: 2, right: 1 } }
    ],
    perPosition: {
      1: { rera: null, unitRangeLabel: null },
      2: { rera: null, unitRangeLabel: null }
    }
  }

};
