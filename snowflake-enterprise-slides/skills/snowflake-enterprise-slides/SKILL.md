# Snowflake Enterprise Slides

Generate premium-quality enterprise HTML presentation decks with Snowflake branding. Output is a single self-contained HTML file with all slides, a shared CSS design system (class-based), built-in navigation, and adaptive viewport scaling. Visuals rival professional design tools.

## Trigger

Use this skill when the user asks to create a presentation, slides, a deck, or when they mention "enterprise slides", "Snowflake slides", "snowflake-enterprise-slides", or "presentation".

## Output

- **Single HTML file** containing all slides with built-in navigation (arrows, dots, keyboard)
- Self-contained (shared CSS design system + logos embedded as base64, no external dependencies except Google Fonts)
- Opens directly in any browser at full quality
- Navigation: prev/next arrows, clickable dots, keyboard (ArrowLeft, ArrowRight, Space)

## CRITICAL ARCHITECTURE RULE

**ONE shared `<style>` block at the top of the file** defines the entire design system via reusable CSS classes. Slide content uses these classes — NOT inline styles for layout/dimensions.

**NEVER** duplicate `<style>` blocks inside slides. If using sub-agents to generate slides, they must produce ONLY HTML that uses the shared classes. They must NEVER include their own `<style>` blocks or override `.slide` dimensions.

**WHY**: Sub-agents that inject their own CSS will override the deck's `.slide { width:100%; height:100% }` rule with wrong dimensions (e.g. 1280x720), making all slides appear empty or broken.

---

## SUB-SKILL REFERENCES

When generating slides, read the appropriate sub-skill for specialized content:

### Architecture / Pipeline / Data Flow slides
→ Read `skills/arch-diagram/SKILL.md` and `skills/arch-diagram/logo-registry.md`

Use when: the slide shows a data pipeline, system architecture, integration flow, or any diagram with product logos and connectors. The arch-diagram skill provides:
- Real product logos from a verified registry (SVG URLs for ~25 products)
- Node templates, connector types (simple, bidirectional, labeled)
- Layout rules for horizontal flows and fan-out patterns
- Medallion layers (Bronze/Silver/Gold) for Snowflake internals

### Choosing HTML patterns for content slides
→ Read `skills/slide-patterns/SKILL.md`

Use when: you need the HTML template for a specific visual component. Pick the pattern that best fits the content type. Available patterns include:
- Header bar, footer banner, bottom bar (mandatory on every slide)
- KPI cards, timelines, feature lists, icon grids
- Panels with colored headers, blue-tinted panels
- Flow diagrams (simple), colored bullet lists
- 3-column architecture layout (simple — use arch-diagram for complex)

---

## DESIGN SYSTEM

### Brand Colors

```css
:root {
  /* Primary */
  --sf-blue: #29B5E8;
  --sf-dark-blue: #11567F;
  --sf-navy: #0d2233;
  /* Gradients */
  --sf-gradient-start: #1a237e;
  --sf-gradient-end: #29B5E8;
  --sf-purple: #6366f1;
  /* Text */
  --sf-text-dark: #1a1a2e;
  --sf-text-gray: #64748b;
  /* Surface */
  --sf-bg-light: #f8fafc;
  --sf-border: #e2e8f0;
  --sf-card-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
}
```

### Typography

- **Headings**: `'Montserrat', sans-serif` — weight 700/800/900
- **Body**: `'Inter', -apple-system, sans-serif` — weight 300–700
- **Google Fonts import**: Always include `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">`

### Title Styles

- **Main title**: Montserrat 900, 40–48px, color `var(--sf-text-dark)`, letter-spacing -1px
- **Gradient subtitle**: Same font, but with:
  ```css
  background: linear-gradient(135deg, var(--sf-gradient-start), var(--sf-gradient-end));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  ```

### Canvas & Scaling — Single-file deck structure

All slides go in ONE HTML file. Each slide is a `<div class="slide">` inside a `.deck` container. Only the `.active` slide is visible. **Dimensions are set via CSS classes, NOT inline styles on slide divs.**

```html
<body>
<div class="deck">

  <div class="slide active" id="s1">
    <div class="slide-content">
      <!-- slide 1 content using design system classes -->
    </div>
    <div class="bottom-bar">...</div>
  </div>
  <div class="slide" id="s2">
    <div class="slide-content">
      <!-- slide 2 content using design system classes -->
    </div>
    <div class="bottom-bar">...</div>
  </div>
  <!-- ... more slides ... -->

</div>

<!-- Navigation bar (frosted glass) -->
<div class="nav" style="position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(13,34,51,0.9);backdrop-filter:blur(12px);border:1px solid rgba(41,181,232,0.25);border-radius:40px;padding:8px 18px;display:flex;align-items:center;gap:8px;z-index:100;">
  <div class="nav-arrow" onclick="go(cur-1)" style="width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;cursor:pointer;color:rgba(255,255,255,0.5);font-size:13px;">◀</div>
  <!-- One .nav-dot per slide -->
  <div class="nav-dot active" onclick="go(0)" style="width:8px;height:8px;border-radius:50%;background:#29B5E8;cursor:pointer;"></div>
  <div class="nav-dot" onclick="go(1)" style="width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,0.2);cursor:pointer;"></div>
  <span style="font-size:11px;color:rgba(255,255,255,0.5);margin:0 6px;"><span id="cur-num">1</span> / N</span>
  <div class="nav-arrow" onclick="go(cur+1)" style="...">▶</div>
</div>

<script>
const slides=document.querySelectorAll('.slide'),dots=document.querySelectorAll('.nav-dot');
let cur=0;
function go(n){
  if(n<0)n=slides.length-1;if(n>=slides.length)n=0;
  slides[cur].classList.remove('active');dots[cur].classList.remove('active');
  cur=n;
  slides[cur].classList.add('active');dots[cur].classList.add('active');
  document.getElementById('cur-num').textContent=cur+1;
}
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key===' ')go(cur+1);if(e.key==='ArrowLeft')go(cur-1);});
const CANVAS_W=1440,CANVAS_H=810;
function scaleSlide(){const s=Math.min(window.innerWidth/CANVAS_W,window.innerHeight/CANVAS_H);document.querySelector('.deck').style.transform=`translate(-50%,-50%) scale(${s})`;}
scaleSlide();window.addEventListener('resize',scaleSlide);
</script>
</body>
```

### Required CSS Design System (in the single `<style>` block)

```css
/* === CORE LAYOUT === */
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Inter', sans-serif; background: #0f172a; display: flex; align-items: center; justify-content: center; min-height: 100vh; overflow: hidden; }
.deck { width: 1440px; height: 810px; position: absolute; top: 50%; left: 50%; background: var(--sf-bg); box-shadow: 0 25px 80px rgba(0,0,0,0.3); overflow: hidden; transform-origin: center center; }
.slide { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; pointer-events: none; transition: opacity 0.4s ease; background: var(--sf-bg); }
.slide.active { opacity: 1; pointer-events: all; }
.slide-content { position: relative; z-index: 1; width: 100%; height: 100%; padding: 48px 64px 100px; }

/* === TYPOGRAPHY === */
.gradient-title { font-family: 'Montserrat', sans-serif; font-weight: 900; font-size: 36px; background: linear-gradient(135deg, #1a237e, #29B5E8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; line-height: 1.2; margin-bottom: 8px; }
.gradient-title.large { font-size: 44px; }
.subtitle { font-size: 16px; color: var(--sf-text-gray); font-weight: 400; margin-bottom: 32px; }

/* === CARDS === */
.card { border: 1.5px solid var(--sf-border); border-radius: 12px; padding: 24px; background: #fff; }
.card:hover { box-shadow: 0 4px 20px rgba(41,181,232,0.08); }

/* === GRIDS === */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
.grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
.grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; }

/* === KPI CARDS === */
.kpi-card { border: 1.5px solid var(--sf-border); border-radius: 12px; padding: 20px; text-align: center; }
.kpi-value { font-family: 'Montserrat', sans-serif; font-weight: 900; font-size: 32px; background: linear-gradient(135deg, #1a237e, #29B5E8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.kpi-label { font-size: 12px; color: var(--sf-text-gray); margin-top: 4px; font-weight: 500; }

/* === HEADER === */
.slide-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
.slide-header .logo { height: 28px; }
.slide-header .badge { font-size: 11px; font-weight: 600; color: var(--sf-dark-blue); background: rgba(41,181,232,0.08); padding: 4px 12px; border-radius: 20px; border: 1px solid rgba(41,181,232,0.2); }

/* === FOOTER BANNER === */
.footer-banner { background: linear-gradient(135deg, #0d2233, #11567F); border-radius: 12px; position: absolute; bottom: 36px; left: 64px; right: 64px; padding: 14px 24px; display: flex; align-items: center; justify-content: space-between; color: #fff; font-size: 13px; }

/* === BOTTOM BAR === */
.bottom-bar { position: absolute; bottom: 0; left: 0; right: 0; height: 28px; border-top: 1px solid var(--sf-border); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; font-size: 11px; color: var(--sf-text-gray); background: #fafbfc; }

/* === ICON === */
.icon-circle { width: 44px; height: 44px; border-radius: 50%; background: rgba(41,181,232,0.08); display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.icon-circle svg { width: 22px; height: 22px; stroke: var(--sf-dark-blue); fill: none; stroke-width: 1.5; }

/* === NAVIGATION === */
.nav { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: rgba(255,255,255,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(226,232,240,0.8); border-radius: 40px; padding: 8px 20px; display: flex; align-items: center; gap: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.1); z-index: 9999; opacity: 0; transition: opacity 0.3s ease; }
.nav:hover { opacity: 1; }
.nav-dot { width: 8px; height: 8px; border-radius: 50%; background: #cbd5e1; cursor: pointer; transition: all 0.3s; }
.nav-dot.active { background: var(--sf-blue); width: 24px; border-radius: 4px; }
```

**IMPORTANT**: This CSS block goes ONCE at the top. Slides only use these classes + minimal inline styles for content-specific tweaks.

---

## SLIDE TYPES

When generating a full deck, create these slides in order (adjust per content):

1. **Cover** — Title + gradient subtitle + value prop banner
2. **Context / Enjeux** — Icon grid or bullet cards showing the business challenge
3. **Solution Overview** — Two-panel layout (capabilities vs. results)
4. **Architecture** — SVG diagram (→ use `arch-diagram` sub-skill)
5. **KPIs / Metrics** — KPI cards grid (3 columns)
6. **Timeline / Roadmap** — Horizontal process steps
7. **Use Cases / Details** — Feature list or comparison table
8. **Closing / CTA** — Footer banner dominant, contact info

---

## ICON SYSTEM

Use SVG outline icons (stroke-based, no fill). Common icons from the Lucide/Feather set:

- **Data/DB**: `<path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>`
- **Search**: `<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>`
- **Chart**: `<path d="M18 20V10M12 20V4M6 20v-6"/>`
- **Check**: `<path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>`
- **Clock**: `<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>`
- **Dollar**: `<path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>`
- **Shield**: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`
- **Users**: `<path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/>`
- **Zap/Lightning**: `<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>`
- **Layers**: `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>`
- **Globe**: `<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/>`
- **Truck**: `<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>`

Always use `viewBox="0 0 24 24"`, `fill="none"`, `stroke-width="1.5"`, `stroke-linecap="round"`, `stroke-linejoin="round"`.

---

## VISUAL RULES (MANDATORY)

1. **White background** — Slides are always white, never dark
2. **Minimal decoration** — Only dotted patterns and subtle radial gradients as texture, never heavy backgrounds
3. **Professional density** — Pack information densely but with consistent spacing (12px/16px/20px/24px rhythm)
4. **Gradient text sparingly** — Only on main titles and large metrics, never on body text
5. **Icon colors** — Purple (`#7c3aed`) for capability icons, blue (`#29B5E8`) for result/metric icons
6. **Panel headers** — Always use the dark gradient (`#1a237e → #11567F` for left, `#29B5E8 → #11567F` for right)
7. **No shadows on cards** — Use border only (`1.5px solid #e2e8f0`)
8. **Footer banner always present** — The dark navy bar with key message is the visual signature
9. **Bottom bar always present** — Copyright + confidentiality notice
10. **All text in French** unless explicitly asked otherwise

---

## GENERATION INSTRUCTIONS

When asked to create a presentation:

1. Identify the topic, client name, and key messages from the user prompt
2. Plan 6–17 slides using the Slide Types sequence above
3. **Read sub-skills as needed**:
   - For architecture/pipeline slides → read `skills/arch-diagram/SKILL.md` + `logo-registry.md`
   - For choosing HTML patterns → read `skills/slide-patterns/SKILL.md`
4. **Generate ONE single HTML file** with all slides. Structure:
   - `<head>` with Google Fonts + ONE `<style>` block (the full design system above)
   - `<body>` with `<div class="deck">` containing all `<div class="slide">` elements
   - Navigation bar HTML after the deck div
   - `<script>` with navigation logic
5. Every slide MUST include: slide-header, content area (using design system classes), footer-banner, bottom-bar
6. Every slide div MUST be `<div class="slide" id="sN">` with NO inline styles on the slide div itself
7. Content inside slides uses the shared CSS classes (`.card`, `.grid-2`, `.kpi-card`, etc.) + minimal inline for spacing
8. Include the Google Fonts link ONCE in `<head>`
9. Use semantic SVG icons relevant to the content (don't reuse the same icon everywhere)
10. Adapt the layout pattern to the content type (don't force every slide into the same template)
11. The overall look must feel like a premium consulting deck from a tier-1 firm

### PDF Export

After generating the HTML deck, inform the user they can export to PDF:
- Open the HTML file in a browser (Chrome recommended)
- Press `Cmd+P` (macOS) or `Ctrl+P` (Windows/Linux)
- Set "Destination" to "Save as PDF"
- Set paper size to **Custom: 1440×810 px** (or landscape A4 for closest fit)
- Set margins to **None**
- Each slide prints as a separate page (the `@media print` styles handle this)

**Hyperlinks are preserved**: All `<a href="...">` links in the HTML remain clickable in the exported PDF. Chrome's "Save as PDF" keeps them as active hyperlinks. Use standard `<a>` tags for any link that should be clickable in the final PDF (emails, URLs, internal anchors).

**SVG images with external URLs** (like logos from `arch-diagram/logo-registry.md`) are resolved at render time — they appear correctly in the PDF as long as the browser has network access when printing.

Add this print CSS inside the `<style>` block:
```css
@media print {
  body { background: white; }
  .deck { position: static; transform: none !important; box-shadow: none; }
  .slide { position: relative; width: 1440px; height: 810px; opacity: 1 !important; pointer-events: all; page-break-after: always; page-break-inside: avoid; }
  .nav { display: none !important; }
}
```

### If using sub-agents for large decks (>10 slides):
- Write the skeleton (head + style + deck open + nav + script) first
- Sub-agents write ONLY the inner HTML of each slide (between `<div class="slide" id="sN">` and `</div>`)
- Sub-agents must NOT include `<style>`, `<head>`, or ANY CSS
- Sub-agents must NOT set width/height on the `.slide` div
- Assemble by concatenating skeleton + all slide contents + closing tags

---

## QUALITY CHECKLIST

Before delivering the deck, verify:
- [ ] **ONE single `<style>` block** in the entire file (no duplicates)
- [ ] `.slide` divs have NO inline style attributes (dimensions come from CSS)
- [ ] Canvas is exactly 1440×810 (set via `.deck` class)
- [ ] Scaling script is present
- [ ] Google Fonts loaded ONCE (Montserrat + Inter)
- [ ] Each slide has: slide-header with Snowflake logo, footer-banner, bottom-bar
- [ ] Gradient text on main titles only
- [ ] All icons are SVG outline (no emoji, no text-based icons)
- [ ] Colors match the design system variables exactly
- [ ] Information density is high but readable
- [ ] No external file dependencies (logos embedded as base64)
- [ ] Navigation works (arrows, dots, keyboard)
- [ ] Architecture slides use real product logos from `arch-diagram/logo-registry.md`
