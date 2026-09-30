import type { CardData } from './types';
import { addressLine, digits, webHref } from './links';
import { NETWORK_BY_ID, socialUrl } from './socials';

const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
/** RFC 2426 line folding: 75 octets, continuation lines start with a space. */
const fold = (line: string) => line.match(/.{1,74}/g)!.join('\r\n ');

/** Square JPEG for the contact photo. Keeps the file small and iPhone-friendly. */
async function toBase64Jpeg(src: string, size = 400): Promise<string> {
  if (!src) return '';
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = src;
    });
    const cv = document.createElement('canvas'); cv.width = size; cv.height = size;
    const ctx = cv.getContext('2d')!;
    const s = Math.min(img.naturalWidth, img.naturalHeight);
    const sx = (img.naturalWidth - s) / 2, sy = Math.max(0, (img.naturalHeight - s) * 0.15);
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
    return cv.toDataURL('image/jpeg', 0.85).split(',')[1] ?? '';
  } catch { return ''; }
}

/** Build the .vcf text. Photo is loaded ahead of the tap so Save stays inside the user gesture on iOS. */
export async function buildVCard(d: CardData): Promise<string> {
  const [first, ...rest] = d.fullName.trim().split(/\s+/);
  const last = rest.pop() ?? '';
  const L: string[] = ['BEGIN:VCARD', 'VERSION:3.0', `N:${esc(last)};${esc(first ?? '')};;;${esc(d.credentials)}`, `FN:${esc(d.fullName)}${d.credentials ? ', ' + esc(d.credentials) : ''}`];
  if (d.business) L.push(`ORG:${esc(d.business)}`);
  if (d.jobTitle) L.push(`TITLE:${esc(d.jobTitle)}`);
  if (d.phone) L.push(`TEL;TYPE=WORK,VOICE:+${digits(d.phone).length === 10 ? '1' : ''}${digits(d.phone)}`);
  if (d.whatsapp) L.push(`X-SOCIALPROFILE;TYPE=whatsapp:https://wa.me/${digits(d.whatsapp).length === 10 ? '1' : ''}${digits(d.whatsapp)}`);
  if (d.email) L.push(`EMAIL;TYPE=INTERNET,WORK:${d.email}`);
  if (d.website) L.push(`URL:${webHref(d.website)}`);
  if (d.hasLocation && addressLine(d.address)) {
    const a = d.address;
    L.push(`ADR;TYPE=WORK:;;${esc(a.street)};${esc(a.city)};${esc(a.region)};${esc(a.zip)};${esc(a.country)}`);
  }
  d.socials.forEach((s) => {
    const url = socialUrl(s.network, s.value);
    if (url) L.push(`X-SOCIALPROFILE;TYPE=${NETWORK_BY_ID[s.network]?.label.toLowerCase().replace(/\s+/g, '') ?? 'web'}:${url}`);
  });
  const note = [d.tagline, d.bookingUrl && `Book: ${webHref(d.bookingUrl)}`].filter(Boolean).join(' | ');
  if (note) L.push(`NOTE:${esc(note)}`);
  const photo = await toBase64Jpeg(d.photoUrl);
  if (photo) L.push(fold(`PHOTO;ENCODING=b;TYPE=JPEG:${photo}`));
  L.push('END:VCARD');
  return L.join('\r\n');
}

export function downloadVCard(text: string, name: string) {
  const blob = new Blob([text], { type: 'text/vcard;charset=utf-8' });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = `${name.replace(/\s+/g, '-') || 'contact'}.vcf`;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
}
