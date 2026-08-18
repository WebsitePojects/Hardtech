import { readFile } from "node:fs/promises";
import path from "node:path";

import QRCode from "qrcode";

import { renderCertificateSvg, type CertificateFields } from "./certificate-template";
import { DEFAULT_USER_TIMEZONE, normalizeIanaTimeZone } from "@/server/timezone";

/**
 * Turns certificate data into the finished SVG bytes.
 *
 * Sits between the pure template (no I/O) and the storage layer (all I/O).
 * It owns two things the template deliberately does not: generating the QR
 * geometry, and formatting values for print.
 */

/**
 * Where a scanner lands. Public and unauthenticated by design — anyone holding
 * the paper must be able to check it without an account.
 *
 * This MUST be absolute. A relative path encodes fine into a QR image and is
 * completely useless once printed, because a phone camera has no origin to
 * resolve it against — a silent failure discovered only after the paper is in
 * someone's hands.
 *
 * Resolution order keeps deployment zero-config: an explicit
 * NEXT_PUBLIC_SITE_URL wins, otherwise Vercel's own VERCEL_URL (set
 * automatically on every deployment, without a scheme), otherwise localhost
 * for development.
 */
export function certificateOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;

  return "http://localhost:3000";
}

export function verificationUrl(certificateCode: string): string {
  return `${certificateOrigin()}/verify/${encodeURIComponent(certificateCode)}`;
}

/**
 * QR as SVG path geometry rather than a data-URI image.
 *
 * A nested raster inside an SVG would blur when Cloudinary rasterises the
 * certificate at print resolution. Path geometry scales losslessly to any
 * output size.
 *
 * Error-correction level Q tolerates roughly 25% damage, which is the right
 * choice for something that gets printed, folded and photographed.
 */
async function qrGeometry(text: string): Promise<{ path: string; modules: number }> {
  const qr = QRCode.create(text, { errorCorrectionLevel: "Q" });
  const size = qr.modules.size;
  const data = qr.modules.data;

  // One rect per dark module, emitted as a single path so the SVG stays small.
  const parts: string[] = [];
  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (data[row * size + col]) parts.push(`M${col} ${row}h1v1h-1z`);
    }
  }
  return { path: parts.join(""), modules: size };
}

async function hardtechLogoDataUri(): Promise<string | null> {
  try {
    const logoPath = path.join(process.cwd(), "public", "images", "brand", "hardtech-logo.png");
    const bytes = await readFile(logoPath);
    return `data:image/png;base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Print format: "10 August 2026". Explicit locale so a server in another
 *  region cannot silently reorder day and month on a legal document. */
export function formatCompletionDate(
  date: Date,
  timeZone: string = DEFAULT_USER_TIMEZONE,
): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: normalizeIanaTimeZone(timeZone),
  }).format(date);
}

export type CertificateRenderInput = {
  recipientName: string;
  programName: string;
  programHours: number | null;
  completedAt: Date;
  traineeTimeZone?: string | null;
  certificateCode: string;
};

/** The finished document, ready to hand to the storage layer. */
export async function renderCertificate(
  input: CertificateRenderInput,
): Promise<{ svg: string; bytes: Buffer; verifyUrl: string }> {
  const verifyUrl = verificationUrl(input.certificateCode);
  const [qr, logoDataUri] = await Promise.all([
    qrGeometry(verifyUrl),
    hardtechLogoDataUri(),
  ]);
  const traineeTimeZone = normalizeIanaTimeZone(input.traineeTimeZone);

  const fields: CertificateFields = {
    recipientName: input.recipientName,
    programName: input.programName,
    programHours: input.programHours === null ? null : `${input.programHours} hrs`,
    completedOn: formatCompletionDate(input.completedAt, traineeTimeZone),
    certificateCode: input.certificateCode,
    verifyUrl,
    logoDataUri,
    qrPath: qr.path,
    qrModules: qr.modules,
  };

  const svg = renderCertificateSvg(fields);
  return { svg, bytes: Buffer.from(svg, "utf8"), verifyUrl };
}
