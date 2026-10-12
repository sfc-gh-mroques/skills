// DOM helpers + the logo assets supplied for the film (embedded as data URIs at build time).
import snowflake from '../assets/snowflake.png';
import snowflakeBlue from '../assets/snowflake_blue.png';
import snowflakeWhite from '../assets/snowflake_white.png';
import bi from '../assets/bi.png';
// Client vertical
import client from '../assets/client.png';
import srcA from '../assets/srcA.png';      // white wordmark recoloured for light plates
import srcB from '../assets/srcB.png';   // trimmed to the mark
import srcC from '../assets/srcC.png';

export const LOGO = { snowflake, snowflakeBlue, snowflakeWhite, bi, client, srcA, srcB, srcC };

/** Create an element. el('div.a.b', {attrs}, ...children | html string) */
export function el(spec, attrs = null, ...kids) {
  const [tag, ...cls] = spec.split('.');
  const e = document.createElement(tag || 'div');
  if (cls.length) e.className = cls.join(' ');
  if (attrs) for (const [k, v] of Object.entries(attrs)) { if (k === 'html') e.innerHTML = v; else if (k === 'text') e.textContent = v; else if (k === 'style') e.style.cssText = v; else e.setAttribute(k, v); }
  for (const k of kids) { if (k == null) continue; e.append(k.nodeType ? k : document.createTextNode(String(k))); }
  return e;
}
export const img = (key, cls = '') => el(`img${cls ? '.' + cls : ''}`, { src: LOGO[key], alt: '', draggable: 'false' });
