# Slide Patterns Catalogue

Reusable HTML patterns for enterprise slide decks. Each pattern is copy-paste ready and uses the shared CSS design system classes from the main `snowflake-enterprise-slides` skill.

## Trigger

This skill is a reference catalogue. Read it when you need the HTML template for a specific visual component inside a slide deck. Pick the pattern that best matches the content type.

---

## MANDATORY PATTERNS

These patterns appear in most decks. Use them as building blocks.

### 1. Logo Embedding (base64)

The official Snowflake logo files are bundled with the main skill:
- `snowflake_logo_blue.png` — for white/light backgrounds
- `snowflake_logo_white.png` — for dark backgrounds

**MANDATORY**: NEVER draw/invent an SVG for the Snowflake logo. ALWAYS use the real PNG files.

**How to embed** (after generating HTML):
```bash
B64=$(base64 -i ~/.snowflake/cortex/plugins/snowflake-enterprise-slides/skills/snowflake-enterprise-slides/snowflake_logo_blue.png | tr -d '\n')
sed -i '' "s|src=\"snowflake_logo_blue.png\"|src=\"data:image/png;base64,${B64}\"|g" output.html
```

**In HTML**:
```html
<img src="snowflake_logo_blue.png" alt="Snowflake" style="height:28px;">
```

**Logo sizes**: Header: 28px · Footer/bottom: 16px · Cover: 40px

---

### 2. Header Bar

Always present. Shows brand + partner context.

```html
<div class="header" style="padding:36px 56px 0; display:flex; align-items:center; gap:12px;">
  <div style="display:flex; align-items:center; gap:8px;">
    <img src="snowflake_logo_blue.png" alt="Snowflake" style="height:28px;">
  </div>
  <span style="font-size:14px; color:#cbd5e1;">+</span>
  <span style="font-size:13px; font-weight:600; color:#6366f1; letter-spacing:0.5px;">Partner Name</span>
</div>
```

---

### 3. Subtitle Banner

Light gray rounded bar with icon + text. Use after the title block.

```html
<div style="margin:20px 56px 0; background:#f8fafc; border-radius:8px; padding:12px 20px; display:flex; align-items:center; gap:12px;">
  <div style="width:32px; height:32px; background:linear-gradient(135deg,#1a237e,#29B5E8); border-radius:8px; display:flex; align-items:center; justify-content:center;">
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="white" stroke-width="2"><!-- icon --></svg>
  </div>
  <span style="font-size:14px; font-weight:500; color:#1a1a2e;">Key message or value proposition here.</span>
</div>
```

---

### 4. Panel with Colored Header

Content sections (left/right in grids).

```html
<div style="border:1.5px solid #e2e8f0; border-radius:12px; overflow:hidden;">
  <div style="background:linear-gradient(135deg,#1a237e,#11567F); padding:12px 20px;">
    <h3 style="font-size:12px; font-weight:700; color:white; letter-spacing:1.5px; text-transform:uppercase; margin:0;">Section Title</h3>
  </div>
  <div style="padding:20px;">
    <!-- content -->
  </div>
</div>
```

---

### 5. Icon Grid (5 columns)

Icons in outlined circles with labels below.

```html
<div style="display:grid; grid-template-columns:repeat(5,1fr); gap:12px;">
  <div style="text-align:center; display:flex; flex-direction:column; align-items:center; gap:6px;">
    <div style="width:44px; height:44px; border:1.5px solid #e2e8f0; border-radius:50%; display:flex; align-items:center; justify-content:center;">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#7c3aed" stroke-width="1.5"><!-- path --></svg>
    </div>
    <span style="font-size:9px; font-weight:600; color:#1a1a2e; text-transform:uppercase; letter-spacing:0.3px;">Label</span>
  </div>
  <!-- repeat -->
</div>
```

---

### 6. Feature List (vertical stack)

Icon in rounded square + title + description.

```html
<div style="display:flex; flex-direction:column; gap:14px; padding:16px 20px;">
  <div style="display:flex; align-items:flex-start; gap:12px;">
    <div style="width:36px; height:36px; border:1.5px solid #e2e8f0; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#29B5E8" stroke-width="1.5"><!-- icon --></svg>
    </div>
    <div>
      <h4 style="font-size:12px; font-weight:700; color:#29B5E8; margin:0 0 2px; text-transform:uppercase; letter-spacing:0.3px;">Metric or Title</h4>
      <p style="font-size:11px; color:#64748b; margin:0; line-height:1.3;">Description text</p>
    </div>
  </div>
</div>
```

---

### 7. Footer Banner (dark)

Full-width dark banner near the bottom. The visual signature of the deck.

```html
<div style="position:absolute; bottom:40px; left:56px; right:56px; background:linear-gradient(135deg,#0d2233,#11567F); border-radius:12px; padding:16px 24px; display:flex; align-items:center; gap:16px;">
  <div style="width:40px; height:40px; background:rgba(41,181,232,0.15); border-radius:50%; display:flex; align-items:center; justify-content:center;">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#29B5E8" stroke-width="1.5"><!-- icon --></svg>
  </div>
  <div>
    <h4 style="font-size:13px; font-weight:700; color:white; margin:0 0 2px;">KEY STATEMENT IN CAPS</h4>
    <p style="font-size:12px; font-weight:500; color:#29B5E8; margin:0;">Supporting detail in brand blue.</p>
  </div>
</div>
```

---

### 8. Bottom Bar (copyright)

```html
<div style="position:absolute; bottom:0; left:0; right:0; height:32px; display:flex; align-items:center; justify-content:space-between; padding:0 56px; background:white; border-top:1px solid #e2e8f0;">
  <img src="snowflake_logo_blue.png" alt="Snowflake" style="height:16px;opacity:0.6;">
  <span style="font-size:9px; color:#94a3b8;">© 2026 Snowflake Inc. All Rights Reserved</span>
  <span style="font-size:8px; color:#94a3b8; font-style:italic;">Confidentiel — Client</span>
</div>
```

---

### 9. KPI Cards (horizontal)

Large metric cards for data-heavy slides.

```html
<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:20px; padding:20px 56px;">
  <div style="border:1.5px solid #e2e8f0; border-radius:12px; padding:24px; text-align:center;">
    <div style="font-family:'Montserrat',sans-serif; font-weight:900; font-size:36px; background:linear-gradient(135deg,#1a237e,#29B5E8); -webkit-background-clip:text; -webkit-text-fill-color:transparent;">-18%</div>
    <div style="font-size:13px; font-weight:600; color:#1a1a2e; margin-top:8px;">Kilomètres parcourus</div>
    <div style="font-size:11px; color:#64748b; margin-top:4px;">Vs. méthode manuelle</div>
  </div>
</div>
```

---

### 10. Timeline / Process (horizontal steps)

```html
<div style="display:flex; align-items:flex-start; gap:0; padding:20px 56px;">
  <div style="flex:1; text-align:center; position:relative;">
    <div style="width:48px; height:48px; margin:0 auto; background:linear-gradient(135deg,#1a237e,#29B5E8); border-radius:50%; display:flex; align-items:center; justify-content:center;">
      <span style="font-size:18px; font-weight:700; color:white;">1</span>
    </div>
    <h4 style="font-size:12px; font-weight:700; color:#1a1a2e; margin:12px 0 4px;">Step Title</h4>
    <p style="font-size:11px; color:#64748b; max-width:160px; margin:0 auto;">Step description</p>
    <!-- connector line to next -->
    <div style="position:absolute; top:24px; right:0; width:50%; height:2px; background:#e2e8f0;"></div>
  </div>
</div>
```

---

### 11. Dotted Pattern Decorations

Add visual texture as background:

```css
background-image: radial-gradient(circle, rgba(41,181,232,0.12) 1px, transparent 1px);
background-size: 16px 16px;
```

---

## OPTIONAL PATTERNS

Use when the content naturally calls for it. Mix and match freely.

### A. Flow Diagram (Boxes + Arrows)

For simple process/pipeline (not architecture — use `arch-diagram` skill for complex diagrams with logos).

```html
<div style="display:flex; align-items:center; gap:0; padding:20px 56px;">
  <div style="flex:1; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:16px 20px; text-align:center;">
    <div style="font-size:11px; font-weight:700; color:#1a1a2e; text-transform:uppercase; letter-spacing:0.5px;">Source</div>
    <div style="font-size:10px; color:#64748b; margin-top:4px;">Description courte</div>
  </div>
  <div style="padding:0 8px; font-size:18px; color:#29B5E8; font-weight:700;">→</div>
  <div style="flex:1; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:16px 20px; text-align:center;">
    <div style="font-size:11px; font-weight:700; color:#1a1a2e; text-transform:uppercase; letter-spacing:0.5px;">Traitement</div>
    <div style="font-size:10px; color:#64748b; margin-top:4px;">Description courte</div>
  </div>
  <div style="padding:0 8px; font-size:18px; color:#29B5E8; font-weight:700;">→</div>
  <div style="flex:1; background:#f8fafc; border:1.5px solid #e2e8f0; border-radius:10px; padding:16px 20px; text-align:center;">
    <div style="font-size:11px; font-weight:700; color:#1a1a2e; text-transform:uppercase; letter-spacing:0.5px;">Résultat</div>
    <div style="font-size:10px; color:#64748b; margin-top:4px;">Description courte</div>
  </div>
</div>
```

Variants: vertical flow (`flex-direction:column` with `↓`), 4-5 nodes, mixed icon+text nodes.

---

### B. Dashed Circle Icons

Softer, more elegant icon containers.

```html
<div style="width:56px; height:56px; border:2px dashed #29B5E8; border-radius:50%; display:flex; align-items:center; justify-content:center;">
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#29B5E8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><!-- icon --></svg>
</div>
```

---

### C. Blue-Tinted Panel

Light blue background for grouping related content (use sparingly, 1-2 per slide max).

```html
<div style="background:rgba(41,181,232,0.04); border:1px solid rgba(41,181,232,0.15); border-radius:12px; padding:24px;">
  <div style="font-size:11px; font-weight:700; color:#29B5E8; text-transform:uppercase; letter-spacing:1px; margin-bottom:12px;">Section Label</div>
  <!-- content inside -->
</div>
```

---

### D. Section Label (Uppercase Tag)

Small uppercase category tag above a title.

```html
<div style="font-size:10px; font-weight:700; color:#29B5E8; text-transform:uppercase; letter-spacing:1.5px; margin-bottom:8px;">CATÉGORIE</div>
```

Variants: gray (`color:#94a3b8`), purple (`color:#6366f1`), with left border (`border-left:3px solid #29B5E8; padding-left:10px`).

---

### E. Dark Title with Category Tag

Alternative to gradient-title — more corporate, grounded feel.

```html
<div style="padding:36px 56px 0;">
  <span style="display:inline-block; font-size:10px; font-weight:700; color:#29B5E8; text-transform:uppercase; letter-spacing:1.5px; background:rgba(41,181,232,0.08); padding:4px 10px; border-radius:4px; margin-bottom:12px;">Architecture</span>
  <h2 style="font-family:'Montserrat',sans-serif; font-weight:900; font-size:32px; color:#1a1a2e; margin:0;">Titre principal de la slide</h2>
</div>
```

---

### F. Colored Bullet List

Bulleted list with colored dot indicators.

```html
<div style="display:flex; flex-direction:column; gap:10px;">
  <div style="display:flex; align-items:flex-start; gap:10px;">
    <div style="width:8px; height:8px; border-radius:50%; background:#29B5E8; margin-top:5px; flex-shrink:0;"></div>
    <span style="font-size:13px; color:#1a1a2e; line-height:1.4;">Premier point avec texte descriptif</span>
  </div>
  <div style="display:flex; align-items:flex-start; gap:10px;">
    <div style="width:8px; height:8px; border-radius:50%; background:#6366f1; margin-top:5px; flex-shrink:0;"></div>
    <span style="font-size:13px; color:#1a1a2e; line-height:1.4;">Deuxième point avec texte descriptif</span>
  </div>
  <div style="display:flex; align-items:flex-start; gap:10px;">
    <div style="width:8px; height:8px; border-radius:50%; background:#10b981; margin-top:5px; flex-shrink:0;"></div>
    <span style="font-size:13px; color:#1a1a2e; line-height:1.4;">Troisième point avec texte descriptif</span>
  </div>
</div>
```

Color palette: blue `#29B5E8`, purple `#6366f1`, green `#10b981`, amber `#f59e0b`.

---

### G. 3-Column Architecture Layout (Sources → Core → Outputs)

For simple "inputs → processing → outputs" view. For complex diagrams with logos, use the `arch-diagram` skill instead.

```html
<div style="display:grid; grid-template-columns:1fr auto 1.5fr auto 1fr; gap:0; align-items:stretch; padding:20px 56px;">
  <!-- Left column: Sources -->
  <div style="display:flex; flex-direction:column; gap:8px;">
    <div style="font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Sources</div>
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; font-size:11px; font-weight:600; color:#1a1a2e;">ERP / SAP</div>
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; font-size:11px; font-weight:600; color:#1a1a2e;">IoT Capteurs</div>
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; font-size:11px; font-weight:600; color:#1a1a2e;">API Partenaires</div>
  </div>
  <!-- Arrow -->
  <div style="display:flex; align-items:center; justify-content:center; font-size:24px; color:#29B5E8; padding:0 12px;">→</div>
  <!-- Center: Core platform -->
  <div style="background:rgba(41,181,232,0.04); border:2px solid rgba(41,181,232,0.2); border-radius:12px; padding:20px; text-align:center;">
    <div style="font-size:10px; font-weight:700; color:#29B5E8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Plateforme</div>
    <div style="font-family:'Montserrat',sans-serif; font-weight:800; font-size:18px; color:#1a1a2e;">Snowflake Data Cloud</div>
    <div style="font-size:11px; color:#64748b; margin-top:8px;">Stockage · Compute · Gouvernance</div>
  </div>
  <!-- Arrow -->
  <div style="display:flex; align-items:center; justify-content:center; font-size:24px; color:#29B5E8; padding:0 12px;">→</div>
  <!-- Right column: Outputs -->
  <div style="display:flex; flex-direction:column; gap:8px;">
    <div style="font-size:10px; font-weight:700; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px;">Outputs</div>
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; font-size:11px; font-weight:600; color:#1a1a2e;">Dashboards</div>
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; font-size:11px; font-weight:600; color:#1a1a2e;">ML Models</div>
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; font-size:11px; font-weight:600; color:#1a1a2e;">Data Products</div>
  </div>
</div>
```
