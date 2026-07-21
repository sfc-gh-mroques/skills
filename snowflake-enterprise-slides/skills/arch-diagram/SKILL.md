# Architecture Diagram Generator

Generate professional SVG architecture/pipeline diagrams with real product logos, styled connectors, and optional medallion layers. Output is embeddable inline SVG for HTML slides or standalone use.

## Trigger

Use this skill when the user asks for: architecture diagram, pipeline diagram, data flow, schéma d'archi, flow diagram, system diagram, integration diagram.

## Output

- Inline SVG code (no external dependencies except logo URLs from the registry)
- Embeddable inside `<div class="slide-content">` in a deck, or standalone in any HTML
- Vectorial, crisp at any zoom / PDF export resolution

## Logo Registry

Refer to `logo-registry.md` (same directory) for verified product logo URLs and brand colors. Always use `<image href="URL">` with real logos — never draw/invent approximate logos manually.

---

## NODE TEMPLATE

Each product node is a card with rounded corners, logo, title, and description.

```svg
<g transform="translate(X, Y)" filter="url(#ds)">
  <!-- Card background -->
  <rect width="160" height="140" rx="12" fill="white" stroke="#e2e8f0" stroke-width="1.2"/>
  <!-- Product logo (from registry) -->
  <image href="LOGO_URL" x="40" y="16" width="80" height="48" preserveAspectRatio="xMidYMid meet"/>
  <!-- Product name -->
  <text x="80" y="88" text-anchor="middle" font-size="12.5" font-weight="600" fill="#1e293b">Product Name</text>
  <!-- Role / category -->
  <text x="80" y="106" text-anchor="middle" font-size="10.5" fill="#64748b">Role description</text>
  <!-- Detail -->
  <text x="80" y="124" text-anchor="middle" font-size="9.5" fill="#94a3b8">Detail • Sub-detail</text>
</g>
```

**Highlighted node** (e.g. Snowflake as central platform): add `stroke="#29B5E8" stroke-width="2"` on the rect, and use a larger card (220×250) to accommodate internal layers.

---

## CONNECTOR TYPES

### Simple (unidirectional)

```svg
<!-- Solid -->
<path d="M X1 Y1 L X2 Y2" stroke="#94a3b8" stroke-width="1.8" fill="none" marker-end="url(#arrGray)"/>
<!-- Dashed (optional/async) -->
<path d="M X1 Y1 L X2 Y2" stroke="#94a3b8" stroke-width="1.8" fill="none" stroke-dasharray="5,4" marker-end="url(#arrGray)"/>
```

### Bidirectional (double arrows)

Two parallel paths slightly offset, each with its own arrowhead:

```svg
<!-- Forward -->
<path d="M 726 280 C 760 280, 770 320, 810 320" stroke="#0d9488" stroke-width="1.8" fill="none" marker-end="url(#arrTeal)"/>
<!-- Return (offset by ~15px vertically) -->
<path d="M 810 335 C 770 335, 760 295, 726 295" stroke="#0d9488" stroke-width="1.8" fill="none" marker-end="url(#arrTeal)"/>
```

### Labeled connector

Add a pill/badge on the connector midpoint:

```svg
<rect x="MIDX-25" y="MIDY-10" width="50" height="19" rx="9.5" fill="#ecfeff" stroke="#a5f3fc" stroke-width="1"/>
<text x="MIDX" y="MIDY+3" text-anchor="middle" font-size="8.5" fill="#0e7490" font-weight="500">Label</text>
```

### Curved connectors (for fan-out)

Use Bézier curves for non-linear paths:

```svg
<path d="M X1 Y1 C CX1 CY1, CX2 CY2, X2 Y2" stroke="COLOR" stroke-width="1.8" fill="none" marker-end="url(#arr)"/>
```

---

## ARROW MARKERS (include in `<defs>`)

```svg
<defs>
  <filter id="ds" x="-4%" y="-4%" width="108%" height="116%">
    <feDropShadow dx="0" dy="3" stdDeviation="6" flood-opacity="0.07"/>
  </filter>
  <marker id="arrGray" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
    <path d="M0,1 L7,4 L0,7" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
  <marker id="arrBlue" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
    <path d="M0,1 L7,4 L0,7" fill="none" stroke="#29B5E8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
  <marker id="arrTeal" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
    <path d="M0,1 L7,4 L0,7" fill="none" stroke="#0d9488" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
  <marker id="arrAmber" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
    <path d="M0,1 L7,4 L0,7" fill="none" stroke="#d97706" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
  </marker>
  <linearGradient id="snowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stop-color="#29B5E8"/>
    <stop offset="100%" stop-color="#11567F"/>
  </linearGradient>
</defs>
```

Add more colored markers as needed (use brand color from logo-registry).

---

## LAYOUT RULES

### Horizontal Flow (default)

Nodes arranged left-to-right with equal spacing. For N nodes:
- Card width: 160px (standard) or 220px (highlighted central node)
- Horizontal gap between cards: 80-100px (space for connector + label)
- ViewBox width: `sum(card_widths) + (N-1) * gap + 2*padding`
- ViewBox height: `max_card_height + metrics_bar_height + 2*padding`

### Fan-out (1 → N)

When one node connects to multiple outputs (e.g. Snowflake → Power BI + Dataiku):
- Output nodes stacked vertically with ~20px gap
- Use curved Bézier connectors from the source to each target
- Offset the curve control points to avoid overlap:
  - Top path curves upward: `C cx cy-delta, ...`
  - Bottom path curves downward: `C cx cy+delta, ...`

### Sizing reference

| Node count | Recommended viewBox | SVG width |
|---|---|---|
| 3 linear | `0 0 700 350` | 700 |
| 4 linear | `0 0 900 400` | 900 |
| 4 + fan-out | `0 0 1000 500` | 1000 |
| 5+ complex | `0 0 1100 550` | 1050 |

---

## MEDALLION LAYERS (inside Snowflake node)

When showing data layers inside the Snowflake central node, use the correct medallion colors:

```svg
<!-- Bronze -->
<rect width="60" height="48" rx="6" fill="#fef3e2" stroke="#f4a261" stroke-width="1.2"/>
<circle cx="30" cy="18" r="7" fill="#f4a261" opacity="0.3"/>
<text x="30" y="22" text-anchor="middle" font-size="7.5" font-weight="700" fill="#f4a261">B</text>
<text x="30" y="40" text-anchor="middle" font-size="8.5" font-weight="600" fill="#c2710c">Bronze</text>

<!-- Silver -->
<rect width="60" height="48" rx="6" fill="#f4f5f7" stroke="#a8b3c2" stroke-width="1.2"/>
<circle cx="30" cy="18" r="7" fill="#a8b3c2" opacity="0.3"/>
<text x="30" y="22" text-anchor="middle" font-size="7.5" font-weight="700" fill="#6b7a8d">S</text>
<text x="30" y="40" text-anchor="middle" font-size="8.5" font-weight="600" fill="#4a5568">Silver</text>

<!-- Gold -->
<rect width="60" height="48" rx="6" fill="#fefbea" stroke="#d4a017" stroke-width="1.2"/>
<circle cx="30" cy="18" r="7" fill="#d4a017" opacity="0.3"/>
<text x="30" y="22" text-anchor="middle" font-size="7.5" font-weight="700" fill="#d4a017">G</text>
<text x="30" y="40" text-anchor="middle" font-size="8.5" font-weight="600" fill="#92700c">Gold</text>
```

Place them side-by-side (translate x+68 for each) inside the Snowflake card. Only show medallion layers when relevant to the discussion.

---

## FEATURE PILLS (inside Snowflake node)

Small capability badges at the bottom of the Snowflake card:

```svg
<rect width="62" height="20" rx="4" fill="#f0f9ff" stroke="#bae6fd" stroke-width="0.8"/>
<text x="31" y="14" text-anchor="middle" font-size="7.5" fill="#0369a1">Cortex AI</text>
```

Common pills: `Cortex AI`, `Dynamic Tables`, `Marketplace`, `Snowpark`, `Iceberg`, `Streams`, `Tasks`.

---

## BOTTOM METRICS BAR (optional)

A legend + KPI strip at the bottom of the diagram:

```svg
<g transform="translate(0, BOTTOM_Y)">
  <rect x="0" y="0" width="FULL_WIDTH" height="50" rx="8" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  <!-- Legend dots -->
  <circle cx="24" cy="25" r="5" fill="#f4a261"/>
  <text x="38" y="29" font-size="9.5" fill="#374151">Bronze (brut)</text>
  <circle cx="140" cy="25" r="5" fill="#a8b3c2"/>
  <text x="154" y="29" font-size="9.5" fill="#374151">Silver (nettoyé)</text>
  <circle cx="268" cy="25" r="5" fill="#d4a017"/>
  <text x="282" y="29" font-size="9.5" fill="#374151">Gold (business)</text>
  <!-- Separator -->
  <line x1="390" y1="10" x2="390" y2="40" stroke="#e2e8f0" stroke-width="1"/>
  <!-- KPIs -->
  <text x="420" y="20" font-size="9" fill="#94a3b8">Volume</text>
  <text x="420" y="37" font-size="11.5" fill="#1e293b" font-weight="600">VALUE</text>
  <!-- ... more KPIs -->
</g>
```

---

## EMBEDDING IN A DECK

When used inside the `snowflake-enterprise-slides` skill, wrap the SVG in a slide:

```html
<div class="slide" id="sN">
  <div class="slide-content">
    <div class="slide-header">...</div>
    <div class="gradient-title">Architecture Data</div>
    <p class="subtitle">Pipeline description</p>
    <div style="display:flex; justify-content:center; margin-top:24px;">
      <svg viewBox="0 0 W H" width="W" xmlns="http://www.w3.org/2000/svg" ...>
        <!-- diagram content -->
      </svg>
    </div>
  </div>
  <div class="bottom-bar">...</div>
</div>
```

---

## GENERATION PROCESS

1. **Identify nodes** — List all products/systems in the pipeline from user description
2. **Look up logos** — Check `logo-registry.md` for each product
3. **Determine layout** — Linear chain? Fan-out? Hybrid?
4. **Calculate viewBox** — Based on node count + layout type (see sizing table)
5. **Place nodes** — Apply transforms with calculated positions
6. **Draw connectors** — Simple, bidirectional, or labeled based on relationship type
7. **Add Snowflake internals** — Medallion layers and/or feature pills if applicable
8. **Add metrics bar** — If the user provided volume/KPI data
9. **Wrap for context** — Standalone SVG or embedded in slide structure
