import { z } from "zod";

// ============================================
// Validation schemas — shared client + server
// ============================================

export const uuidSchema = z.string().uuid("ID inválido");

export const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
});

export const moduloSchema = z.object({
  numero_semana: z.coerce.number().int().min(1).max(999),
  titulo: z.string().min(1).max(200),
  subtitulo: z.string().max(500).default(""),
  descricao: z.string().max(5000).default(""),
  cor_destaque: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#EC4899"),
  banner_url: z.string().url().max(2000).nullable().optional(),
  ordem: z.coerce.number().int().min(0).max(999),
  tipo: z.enum(["main", "bonus", "locked"]).default("main"),
  unlock_after_days: z.coerce.number().int().min(0).max(365).default(0),
  titulo_i18n: z.record(z.string().max(200)).default({}),
  subtitulo_i18n: z.record(z.string().max(500)).default({}),
  descricao_i18n: z.record(z.string().max(5000)).default({}),
  sales_copy: z.string().max(2000).nullable().optional(),
  price_display: z.string().max(50).nullable().optional(),
  checkout_url: z.string().url().max(2000).nullable().optional(),
  cta_text: z.string().max(100).nullable().optional(),
  cover_image: z.string().url().max(2000).nullable().optional(),
});

export const aulaSchema = z.object({
  modulo_id: z.string().uuid(),
  titulo: z.string().min(1).max(200),
  descricao: z.string().max(5000).default(""),
  tipo: z.enum(["video", "pdf", "audio", "link", "checklist", "texto"]),
  conteudo_url: z.string().max(2000).nullable().optional(),
  duracao_min: z.coerce.number().int().min(0).max(600).nullable().optional(),
  ordem: z.coerce.number().int().min(0).max(999),
  unlock_after_days: z.coerce.number().int().min(0).max(365).default(0),
  titulo_i18n: z.record(z.string().max(200)).default({}),
  descricao_i18n: z.record(z.string().max(5000)).default({}),
});

export const webhookPurchaseSchema = z.object({
  email: z.string().email().max(255),
  module_id: z.string().uuid(),
  transaction_id: z.string().max(255).optional(),
});

export const profileUpdateSchema = z.object({
  nome: z.string().min(2).max(80),
});

export const passwordSchema = z.object({
  password: z.string().min(6).max(128),
});

// ============================================
// Upload validation
// ============================================

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_DOCUMENT_TYPES = new Set([
  "application/pdf",
  "audio/mpeg",
  "audio/mp4",
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Magic bytes for real MIME detection
const MAGIC_BYTES: Record<string, number[]> = {
  "image/jpeg": [0xff, 0xd8, 0xff],
  "image/png": [0x89, 0x50, 0x4e, 0x47],
  "image/webp": [0x52, 0x49, 0x46, 0x46], // RIFF
  "application/pdf": [0x25, 0x50, 0x44, 0x46], // %PDF
};

export function validateUpload(file: File): { valid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: "Fichier trop volumineux (max 10 Mo)" };
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type) && !ALLOWED_DOCUMENT_TYPES.has(file.type)) {
    return { valid: false, error: `Type non autorisé: ${file.type}` };
  }

  // Block SVG (XSS vector)
  if (file.type.includes("svg") || file.name.toLowerCase().endsWith(".svg")) {
    return { valid: false, error: "Les fichiers SVG ne sont pas autorisés" };
  }

  return { valid: true };
}

export async function validateMagicBytes(file: File): Promise<boolean> {
  const buffer = await file.slice(0, 8).arrayBuffer();
  const bytes = new Uint8Array(buffer);

  for (const [, magic] of Object.entries(MAGIC_BYTES)) {
    if (magic.every((b, i) => bytes[i] === b)) return true;
  }

  // PDF and audio types may have different signatures — allow if mime matches
  if (ALLOWED_DOCUMENT_TYPES.has(file.type)) return true;

  return false;
}

/**
 * Sanitize a filename for storage — remove path traversal and special chars.
 */
export function sanitizeFilename(name: string): string {
  return name
    .replace(/\.\./g, "")
    .replace(/[/\\]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100);
}

// ============================================
// Sanitize text — strip HTML tags from user input
// ============================================

export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

// ============================================
// Rate limiting helpers (simple in-memory for dev, use Upstash in prod)
// ============================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  entry.count++;
  const allowed = entry.count <= maxRequests;
  return {
    allowed,
    remaining: Math.max(0, maxRequests - entry.count),
    resetAt: entry.resetAt,
  };
}
