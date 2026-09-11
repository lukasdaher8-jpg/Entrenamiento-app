// Icono propio (SVG generado, no una foto) para representar de forma rápida qué músculo
// trabaja cada ejercicio. Silueta genérica + zona resaltada + texto de equipo — es a propósito
// esquemático, no una ilustración anatómica realista, para evitar cualquier parecido con
// bancos de imágenes comerciales.

const SILHOUETTE = `
  <circle cx="50" cy="16" r="11" />
  <path d="M32,30 Q50,25 68,30 L71,80 Q50,88 29,80 Z" />
  <rect x="12" y="30" width="13" height="56" rx="6.5" />
  <rect x="75" y="30" width="13" height="56" rx="6.5" />
  <rect x="30" y="82" width="16" height="58" rx="8" />
  <rect x="54" y="82" width="16" height="58" rx="8" />
`;

// Cada región: shapes que se pintan sobre la silueta cuando el nombre del grupo muscular
// contiene la palabra clave (comparación en minúsculas, sin acentos).
const REGIONS = [
  { key: 'pecho', shapes: `<ellipse cx="50" cy="44" rx="19" ry="11" />` },
  { key: 'hombro posterior', shapes: `<circle cx="21" cy="33" r="9" /><circle cx="79" cy="33" r="9" />` },
  { key: 'hombro', shapes: `<circle cx="21" cy="33" r="9" /><circle cx="79" cy="33" r="9" />` },
  { key: 'espalda', shapes: `<rect x="30" y="30" width="40" height="32" rx="11" />` },
  { key: 'biceps', shapes: `<rect x="12" y="30" width="13" height="26" rx="6.5" /><rect x="75" y="30" width="13" height="26" rx="6.5" />` },
  { key: 'triceps', shapes: `<rect x="12" y="34" width="13" height="30" rx="6.5" /><rect x="75" y="34" width="13" height="30" rx="6.5" />` },
  { key: 'abdomen', shapes: `<rect x="37" y="58" width="26" height="24" rx="7" />` },
  { key: 'gluteo', shapes: `<rect x="28" y="78" width="44" height="15" rx="7" />` },
  { key: 'cuadriceps', shapes: `<rect x="30" y="84" width="16" height="32" rx="8" /><rect x="54" y="84" width="16" height="32" rx="8" />` },
  { key: 'femoral', shapes: `<rect x="30" y="84" width="16" height="32" rx="8" /><rect x="54" y="84" width="16" height="32" rx="8" />` },
  { key: 'pantorrilla', shapes: `<rect x="30" y="116" width="16" height="24" rx="8" /><rect x="54" y="116" width="16" height="24" rx="8" />` },
  // "Unilateral" es el nombre que usa el catálogo para Búlgara asistida y Prensa unilateral
  // (ambas de pierna); no es un grupo muscular real, así que se mapea aparte a la zona de pierna.
  { key: 'unilateral', shapes: `<rect x="30" y="84" width="16" height="32" rx="8" />` },
];

function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function muscleIconSvg(muscle, equipment, unilateral) {
  const m = stripAccents(muscle);
  let highlights = REGIONS.filter((r) => m.includes(stripAccents(r.key))).map((r) => r.shapes).join('');
  if (!highlights) {
    highlights = `<rect x="28" y="28" width="44" height="60" rx="14" />`; // genérico: todo el torso
  }
  const sideNote = unilateral
    ? `<text x="50" y="148" text-anchor="middle" class="mi-side">un lado a la vez</text>`
    : '';
  return `
    <svg class="muscle-icon" viewBox="0 0 100 152" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${escapeXml(muscle)}">
      <g class="mi-body">${SILHOUETTE}</g>
      <g class="mi-highlight">${highlights}</g>
      ${sideNote}
    </svg>
    <div class="mi-equip">${equipment}</div>
  `;
}

function escapeXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
