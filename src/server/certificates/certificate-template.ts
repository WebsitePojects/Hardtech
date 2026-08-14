/**
 * The certificate artwork, as a pure function from data to SVG.
 *
 * No I/O, no database, no Cloudinary — this module only knows how to draw.
 * That keeps it unit-testable without a connection and means the visual can be
 * reviewed by rendering it in isolation.
 *
 * SVG rather than a PDF library or a headless browser: it is text, so it
 * diffs in review, needs no native binary, and Cloudinary rasterises it to
 * PNG or JPG on delivery via URL transformation. One stored asset serves every
 * download format.
 *
 * Colours are the HardTech brand values from docs/research/01-design-source.md.
 * They are literal here because an SVG document cannot read CSS custom
 * properties from the app — this file is the one legitimate place those hex
 * values are repeated, and they are named so the tie is obvious.
 */

const BRAND = {
  /** --neon, dark theme */
  green: "#4ade80",
  greenDeep: "#16a34a",
  /** page surface ramp */
  ink: "#080d12",
  inkRaised: "#0f1419",
  hairline: "#1e2a36",
  textPrimary: "#e8edf4",
  textMuted: "#8a95a3",
} as const;

export type CertificateFields = {
  /** Full name exactly as it should be printed. */
  recipientName: string;
  programName: string;
  /** Total instruction hours, e.g. "120 hrs". Optional — omitted cleanly. */
  programHours: string | null;
  /** Already formatted for display, e.g. "10 August 2026". */
  completedOn: string;
  /** Human-readable unique code, also encoded in the QR. */
  certificateCode: string;
  /** Absolute URL a scanner lands on to verify authenticity. */
  verifyUrl: string;
  /** QR rendered as SVG `<path d="...">` geometry on a 0..(qrSize) grid. */
  qrPath: string;
  qrModules: number;
};

/** XML-escape. Every interpolated value is user or database data and must not
 *  be able to break out of the document — the SVG equivalent of not building
 *  HTML by concatenation. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * A4 landscape at 96dpi (1123x794) — the standard the print shops around
 * Quezon City will expect, and it downloads cleanly as an image too.
 */
export function renderCertificateSvg(fields: CertificateFields): string {
  const W = 1123;
  const H = 794;

  const name = esc(fields.recipientName);
  const program = esc(fields.programName);
  const hours = fields.programHours ? esc(fields.programHours) : null;
  const completed = esc(fields.completedOn);
  const code = esc(fields.certificateCode);
  const verify = esc(fields.verifyUrl);

  // QR occupies a fixed 118px box; scale the module grid to fit.
  const qrBox = 118;
  const qrScale = qrBox / fields.qrModules;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Certificate of completion for ${name}">
  <defs>
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BRAND.green}" stop-opacity="0.9"/>
      <stop offset="55%" stop-color="${BRAND.greenDeep}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="${BRAND.green}" stop-opacity="0.75"/>
    </linearGradient>
    <radialGradient id="bloom" cx="50%" cy="0%" r="70%">
      <stop offset="0%" stop-color="${BRAND.green}" stop-opacity="0.10"/>
      <stop offset="100%" stop-color="${BRAND.green}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grain" width="28" height="28" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="1" fill="#ffffff" fill-opacity="0.035"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="${BRAND.ink}"/>
  <rect width="${W}" height="${H}" fill="url(#bloom)"/>
  <rect width="${W}" height="${H}" fill="url(#grain)"/>

  <rect x="18" y="18" width="${W - 36}" height="${H - 36}" rx="18"
        fill="${BRAND.inkRaised}" stroke="url(#edge)" stroke-width="2"/>
  <rect x="34" y="34" width="${W - 68}" height="${H - 68}" rx="12"
        fill="none" stroke="${BRAND.hairline}" stroke-width="1"/>

  <g transform="translate(${W / 2}, 118)" text-anchor="middle">
    <text y="0" fill="${BRAND.green}" font-family="Georgia, 'Times New Roman', serif"
          font-size="19" letter-spacing="5.5">HARDTECH IT CORP</text>
    <text y="26" fill="${BRAND.textMuted}" font-family="Helvetica, Arial, sans-serif"
          font-size="12" letter-spacing="2.6">QUEZON CITY, PHILIPPINES</text>
  </g>

  <g transform="translate(${W / 2}, 214)" text-anchor="middle">
    <text y="0" fill="${BRAND.textPrimary}" font-family="Georgia, 'Times New Roman', serif"
          font-size="47" font-weight="bold" letter-spacing="1.5">Certificate of Completion</text>
    <text y="40" fill="${BRAND.textMuted}" font-family="Helvetica, Arial, sans-serif"
          font-size="15">This certifies that</text>
  </g>

  <g transform="translate(${W / 2}, 336)" text-anchor="middle">
    <text y="0" fill="${BRAND.green}" font-family="Georgia, 'Times New Roman', serif"
          font-size="56" font-weight="bold">${name}</text>
    <line x1="-260" y1="26" x2="260" y2="26" stroke="${BRAND.hairline}" stroke-width="1"/>
  </g>

  <g transform="translate(${W / 2}, 408)" text-anchor="middle">
    <text y="0" fill="${BRAND.textMuted}" font-family="Helvetica, Arial, sans-serif" font-size="15">
      has successfully completed the training program
    </text>
    <text y="44" fill="${BRAND.textPrimary}" font-family="Helvetica, Arial, sans-serif"
          font-size="31" font-weight="bold">${program}</text>
    ${hours ? `<text y="74" fill="${BRAND.textMuted}" font-family="Helvetica, Arial, sans-serif" font-size="14">${hours} of hands-on instruction</text>` : ""}
  </g>

  <g transform="translate(96, ${H - 150})">
    <line x1="0" y1="0" x2="248" y2="0" stroke="${BRAND.hairline}" stroke-width="1"/>
    <text y="24" fill="${BRAND.textPrimary}" font-family="Helvetica, Arial, sans-serif"
          font-size="15" font-weight="bold">Mr. Henry Gomata Lopez</text>
    <text y="45" fill="${BRAND.textMuted}" font-family="Helvetica, Arial, sans-serif"
          font-size="12.5">Owner &amp; Lead Trainer</text>
  </g>

  <g transform="translate(${W / 2}, ${H - 150})" text-anchor="middle">
    <line x1="-124" y1="0" x2="124" y2="0" stroke="${BRAND.hairline}" stroke-width="1"/>
    <text y="24" fill="${BRAND.textPrimary}" font-family="Helvetica, Arial, sans-serif"
          font-size="15" font-weight="bold">${completed}</text>
    <text y="45" fill="${BRAND.textMuted}" font-family="Helvetica, Arial, sans-serif"
          font-size="12.5">Date of completion</text>
  </g>

  <g transform="translate(${W - 96 - qrBox}, ${H - 214})">
    <rect x="-11" y="-11" width="${qrBox + 22}" height="${qrBox + 22}" rx="9"
          fill="#ffffff"/>
    <g transform="scale(${qrScale})" shape-rendering="crispEdges">
      <path d="${fields.qrPath}" fill="${BRAND.ink}"/>
    </g>
    <text x="${qrBox / 2}" y="${qrBox + 30}" text-anchor="middle" fill="${BRAND.textMuted}"
          font-family="Helvetica, Arial, sans-serif" font-size="11.5">Scan to verify</text>
  </g>

  <g transform="translate(${W / 2}, ${H - 56})" text-anchor="middle">
    <text y="0" fill="${BRAND.textMuted}" font-family="'Courier New', monospace"
          font-size="12.5" letter-spacing="1.2">${code}</text>
    <text y="20" fill="${BRAND.textMuted}" font-family="Helvetica, Arial, sans-serif"
          font-size="10.5" fill-opacity="0.75">${verify}</text>
  </g>
</svg>`;
}
