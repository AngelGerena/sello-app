/* Small, dependency-free color math: hex/HSL conversion, mixing and WCAG contrast. */

export interface HSL { h: number; s: number; l: number; }

const clamp = (n: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, n));

export function normalizeHex(input: string): string | null {
  let v = input.trim().replace(/^#/, '');
  if (/^[0-9a-f]{3}$/i.test(v)) v = v.split('').map((c) => c + c).join('');
  return /^[0-9a-f]{6}$/i.test(v) ? `#${v.toUpperCase()}` : null;
}

export function hexToRgb(hex: string): [number, number, number] {
  const v = (normalizeHex(hex) ?? '#000000').slice(1);
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16)) as [number, number, number];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((n) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function hexToHsl(hex: string): HSL {
  const [r, g, b] = hexToRgb(hex).map((n) => n / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h *= 60;
  }
  return { h, s: s * 100, l: l * 100 };
}

export function hslToHex({ h, s, l }: HSL): string {
  const S = clamp(s / 100), L = clamp(l / 100);
  const k = (n: number) => (n + ((h % 360) + 360) % 360 / 30) % 12;
  const a = S * Math.min(L, 1 - L);
  const f = (n: number) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return rgbToHex(f(0) * 255, f(8) * 255, f(4) * 255);
}

export const hsl = (h: number, s: number, l: number) => hslToHex({ h, s, l });

/** Mix a toward b by t (0 = a, 1 = b). */
export function mix(a: string, b: string, t: number): string {
  const A = hexToRgb(a), B = hexToRgb(b);
  return rgbToHex(A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t);
}

export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrast(a: string, b: string): number {
  const [x, y] = [luminance(a), luminance(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
}

/** The better of two ink colors on a given fill. */
export function bestInk(fill: string, dark = '#141414', light = '#FFFFFF'): string {
  return contrast(fill, dark) >= contrast(fill, light) ? dark : light;
}

/** Walk lightness until `hex` reaches `target` contrast against `against`. */
export function ensureContrast(hex: string, against: string, target = 4.5): string {
  if (contrast(hex, against) >= target) return hex;
  const base = hexToHsl(hex);
  const goDarker = luminance(against) > 0.35;
  for (let i = 1; i <= 60; i++) {
    const l = clamp((base.l + (goDarker ? -i : i) * 1.5) / 100) * 100;
    const c = hslToHex({ ...base, l });
    if (contrast(c, against) >= target) return c;
  }
  return goDarker ? '#111111' : '#F5F5F5';
}

export function wcagLabel(ratio: number): { label: string; ok: boolean } {
  if (ratio >= 7) return { label: 'AAA', ok: true };
  if (ratio >= 4.5) return { label: 'AA', ok: true };
  if (ratio >= 3) return { label: 'AA large', ok: true };
  return { label: 'Low contrast', ok: false };
}

/** Pull a small palette out of an image (logo upload). Buckets pixels, skips near-white, near-black and transparent. */
export async function extractPalette(src: string, count = 6): Promise<string[]> {
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image(); i.crossOrigin = 'anonymous';
    i.onload = () => res(i); i.onerror = rej; i.src = src;
  });
  const size = 96, cv = document.createElement('canvas');
  cv.width = size; cv.height = size;
  const ctx = cv.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(img, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  const buckets = new Map<string, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
    if (a < 160) continue;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    if (mx > 245 && mn > 235) continue;   // paper white
    if (mx < 14) continue;                // pure black
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const e = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    e.n++; e.r += r; e.g += g; e.b += b; buckets.set(key, e);
  }
  const ranked = [...buckets.values()].sort((a, b) => b.n - a.n).map((e) => rgbToHex(e.r / e.n, e.g / e.n, e.b / e.n));
  const out: string[] = [];
  for (const c of ranked) {
    if (out.every((o) => colorDistance(o, c) > 60)) out.push(c);
    if (out.length >= count) break;
  }
  return out;
}

export function colorDistance(a: string, b: string): number {
  const A = hexToRgb(a), B = hexToRgb(b);
  return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
}
