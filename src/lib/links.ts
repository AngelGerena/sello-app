import type { Address, CardData } from './types';

export const digits = (s: string) => s.replace(/\D/g, '');
export const telHref = (phone: string) => (phone ? `tel:+${digits(phone).length === 10 ? '1' + digits(phone) : digits(phone)}` : '');
export const waHref = (num: string, msg = '') => (num ? `https://wa.me/${digits(num).length === 10 ? '1' + digits(num) : digits(num)}${msg ? `?text=${encodeURIComponent(msg)}` : ''}` : '');
export const addressLine = (a: Address) => [a.street, a.city, [a.region, a.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
export const mapsHref = (a: Address) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine(a))}`;
export const webHref = (u: string) => (!u ? '' : /^https?:\/\//i.test(u) ? u : `https://${u}`);
export const prettyUrl = (u: string) => u.replace(/^https?:\/\//i, '').replace(/^www\./i, '').replace(/\/$/, '');

export function formatPhone(p: string): string {
  const d = digits(p).replace(/^1(?=\d{10}$)/, '');
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : p;
}

export function publicOrigin(): string {
  return (import.meta.env.VITE_PUBLIC_ORIGIN as string | undefined) ?? window.location.origin;
}

export function cardUrl(data: CardData): string {
  return `${publicOrigin()}/${data.slug}`;
}
