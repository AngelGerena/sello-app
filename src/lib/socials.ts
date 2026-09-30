import {
  siInstagram, siFacebook, siTiktok, siYoutube, siX, siThreads, siPinterest, siSnapchat, siWhatsapp, siTelegram,
  siGoogle, siGooglemaps, siYelp, siNextdoor, siSpotify, siApplepodcasts, siApplemusic, siSoundcloud, siTwitch,
  siDiscord, siBehance, siDribbble, siGithub, siEtsy, siCashapp, siVenmo, siPaypal, siLinktree, siSubstack,
  siMedium, siVimeo, siReddit, siBluesky, siTumblr, siZelle, siCalendly, siAmazon, siLinkedin, siTripadvisor,
  siAirbnb, siUbereats, siDoordash, siGrubhub, siShopify, siSquare, siMessenger, siSignal, siMastodon, siKick,
  siRumble, siPatreon, siKofi, siBuymeacoffee, siZillow, siHouzz, siThumbtack,
} from 'simple-icons';

export interface Network {
  id: string;
  label: string;
  group: 'Social' | 'Messaging' | 'Reviews' | 'Video and audio' | 'Shop and pay' | 'Portfolio' | 'Other';
  path?: string;        // simple-icons SVG path (24x24), brand glyph
  hex?: string;         // brand color
  placeholder: string;
  /** Turn a handle into a URL. Full URLs always pass through. */
  url: (v: string) => string;
}

const h = (v: string) => v.trim().replace(/^@/, '');
const base = (prefix: string) => (v: string) => (/^https?:\/\//i.test(v.trim()) ? v.trim() : prefix + h(v));
const direct = (v: string) => (/^https?:\/\//i.test(v.trim()) ? v.trim() : `https://${v.trim()}`);
const si = (x: { path: string; hex: string }) => ({ path: x.path, hex: `#${x.hex}` });

export const NETWORKS: Network[] = [
  { id: 'instagram', label: 'Instagram', group: 'Social', ...si(siInstagram), placeholder: '@yourbusiness', url: base('https://instagram.com/') },
  { id: 'facebook',  label: 'Facebook',  group: 'Social', ...si(siFacebook),  placeholder: 'yourpage or full link', url: base('https://facebook.com/') },
  { id: 'tiktok',    label: 'TikTok',    group: 'Social', ...si(siTiktok),    placeholder: '@yourbusiness', url: (v) => (/^https?:/i.test(v) ? v : `https://tiktok.com/@${h(v)}`) },
  { id: 'x',         label: 'X',         group: 'Social', ...si(siX),         placeholder: '@handle', url: base('https://x.com/') },
  { id: 'threads',   label: 'Threads',   group: 'Social', ...si(siThreads),   placeholder: '@handle', url: (v) => (/^https?:/i.test(v) ? v : `https://threads.net/@${h(v)}`) },
  { id: 'linkedin',  label: 'LinkedIn',  group: 'Social', ...si(siLinkedin),  placeholder: 'linkedin.com/in/you', url: direct },
  { id: 'pinterest', label: 'Pinterest', group: 'Social', ...si(siPinterest), placeholder: 'handle', url: base('https://pinterest.com/') },
  { id: 'snapchat',  label: 'Snapchat',  group: 'Social', ...si(siSnapchat),  placeholder: 'username', url: base('https://snapchat.com/add/') },
  { id: 'bluesky',   label: 'Bluesky',   group: 'Social', ...si(siBluesky),   placeholder: 'you.bsky.social', url: base('https://bsky.app/profile/') },
  { id: 'reddit',    label: 'Reddit',    group: 'Social', ...si(siReddit),    placeholder: 'u/username', url: (v) => (/^https?:/i.test(v) ? v : `https://reddit.com/${h(v).replace(/^\/?/, '')}`) },
  { id: 'tumblr',    label: 'Tumblr',    group: 'Social', ...si(siTumblr),    placeholder: 'blogname', url: (v) => (/^https?:/i.test(v) ? v : `https://${h(v)}.tumblr.com`) },
  { id: 'mastodon',  label: 'Mastodon',  group: 'Social', ...si(siMastodon),  placeholder: 'full profile link', url: direct },
  { id: 'nextdoor',  label: 'Nextdoor',  group: 'Social', ...si(siNextdoor),  placeholder: 'business page link', url: direct },

  { id: 'whatsapp',  label: 'WhatsApp channel', group: 'Messaging', ...si(siWhatsapp), placeholder: 'channel link', url: direct },
  { id: 'messenger', label: 'Messenger', group: 'Messaging', ...si(siMessenger), placeholder: 'm.me/yourpage', url: direct },
  { id: 'telegram',  label: 'Telegram',  group: 'Messaging', ...si(siTelegram),  placeholder: '@username', url: base('https://t.me/') },
  { id: 'signal',    label: 'Signal',    group: 'Messaging', ...si(siSignal),    placeholder: 'signal.me link', url: direct },
  { id: 'discord',   label: 'Discord',   group: 'Messaging', ...si(siDiscord),   placeholder: 'invite link', url: direct },

  { id: 'google',    label: 'Google reviews', group: 'Reviews', ...si(siGoogle), placeholder: 'your review link', url: direct },
  { id: 'googlemaps',label: 'Google Maps',    group: 'Reviews', ...si(siGooglemaps), placeholder: 'maps link', url: direct },
  { id: 'yelp',      label: 'Yelp',       group: 'Reviews', ...si(siYelp),       placeholder: 'yelp.com/biz/...', url: direct },
  { id: 'tripadvisor', label: 'Tripadvisor', group: 'Reviews', ...si(siTripadvisor), placeholder: 'listing link', url: direct },
  { id: 'thumbtack', label: 'Thumbtack',  group: 'Reviews', ...si(siThumbtack),  placeholder: 'profile link', url: direct },
  { id: 'houzz',     label: 'Houzz',      group: 'Reviews', ...si(siHouzz),      placeholder: 'profile link', url: direct },
  { id: 'zillow',    label: 'Zillow',     group: 'Reviews', ...si(siZillow),     placeholder: 'agent profile link', url: direct },
  { id: 'airbnb',    label: 'Airbnb',     group: 'Reviews', ...si(siAirbnb),     placeholder: 'listing link', url: direct },

  { id: 'youtube',   label: 'YouTube',    group: 'Video and audio', ...si(siYoutube), placeholder: '@channel', url: (v) => (/^https?:/i.test(v) ? v : `https://youtube.com/@${h(v)}`) },
  { id: 'vimeo',     label: 'Vimeo',      group: 'Video and audio', ...si(siVimeo), placeholder: 'username', url: base('https://vimeo.com/') },
  { id: 'twitch',    label: 'Twitch',     group: 'Video and audio', ...si(siTwitch), placeholder: 'channel', url: base('https://twitch.tv/') },
  { id: 'kick',      label: 'Kick',       group: 'Video and audio', ...si(siKick), placeholder: 'channel', url: base('https://kick.com/') },
  { id: 'rumble',    label: 'Rumble',     group: 'Video and audio', ...si(siRumble), placeholder: 'channel link', url: direct },
  { id: 'spotify',   label: 'Spotify',    group: 'Video and audio', ...si(siSpotify), placeholder: 'artist or podcast link', url: direct },
  { id: 'applepodcasts', label: 'Apple Podcasts', group: 'Video and audio', ...si(siApplepodcasts), placeholder: 'podcast link', url: direct },
  { id: 'applemusic', label: 'Apple Music', group: 'Video and audio', ...si(siApplemusic), placeholder: 'artist link', url: direct },
  { id: 'soundcloud', label: 'SoundCloud', group: 'Video and audio', ...si(siSoundcloud), placeholder: 'username', url: base('https://soundcloud.com/') },

  { id: 'shopify',   label: 'Online store', group: 'Shop and pay', ...si(siShopify), placeholder: 'store link', url: direct },
  { id: 'etsy',      label: 'Etsy',       group: 'Shop and pay', ...si(siEtsy),  placeholder: 'shop name', url: base('https://etsy.com/shop/') },
  { id: 'amazon',    label: 'Amazon store', group: 'Shop and pay', ...si(siAmazon), placeholder: 'storefront link', url: direct },
  { id: 'square',    label: 'Square',     group: 'Shop and pay', ...si(siSquare), placeholder: 'square.site link', url: direct },
  { id: 'ubereats',  label: 'Uber Eats',  group: 'Shop and pay', ...si(siUbereats), placeholder: 'restaurant link', url: direct },
  { id: 'doordash',  label: 'DoorDash',   group: 'Shop and pay', ...si(siDoordash), placeholder: 'store link', url: direct },
  { id: 'grubhub',   label: 'Grubhub',    group: 'Shop and pay', ...si(siGrubhub), placeholder: 'restaurant link', url: direct },
  { id: 'cashapp',   label: 'Cash App',   group: 'Shop and pay', ...si(siCashapp), placeholder: '$cashtag', url: (v) => (/^https?:/i.test(v) ? v : `https://cash.app/$${h(v).replace(/^\$/, '')}`) },
  { id: 'venmo',     label: 'Venmo',      group: 'Shop and pay', ...si(siVenmo),  placeholder: '@username', url: base('https://venmo.com/u/') },
  { id: 'paypal',    label: 'PayPal',     group: 'Shop and pay', ...si(siPaypal), placeholder: 'paypal.me/you', url: direct },
  { id: 'zelle',     label: 'Zelle',      group: 'Shop and pay', ...si(siZelle),  placeholder: 'enrollment link', url: direct },
  { id: 'patreon',   label: 'Patreon',    group: 'Shop and pay', ...si(siPatreon), placeholder: 'creator name', url: base('https://patreon.com/') },
  { id: 'kofi',      label: 'Ko-fi',      group: 'Shop and pay', ...si(siKofi),   placeholder: 'username', url: base('https://ko-fi.com/') },
  { id: 'buymeacoffee', label: 'Buy Me a Coffee', group: 'Shop and pay', ...si(siBuymeacoffee), placeholder: 'username', url: base('https://buymeacoffee.com/') },

  { id: 'behance',   label: 'Behance',    group: 'Portfolio', ...si(siBehance),  placeholder: 'username', url: base('https://behance.net/') },
  { id: 'dribbble',  label: 'Dribbble',   group: 'Portfolio', ...si(siDribbble), placeholder: 'username', url: base('https://dribbble.com/') },
  { id: 'github',    label: 'GitHub',     group: 'Portfolio', ...si(siGithub),   placeholder: 'username', url: base('https://github.com/') },
  { id: 'substack',  label: 'Substack',   group: 'Portfolio', ...si(siSubstack), placeholder: 'publication link', url: direct },
  { id: 'medium',    label: 'Medium',     group: 'Portfolio', ...si(siMedium),   placeholder: '@username', url: (v) => (/^https?:/i.test(v) ? v : `https://medium.com/@${h(v)}`) },
  { id: 'linktree',  label: 'Linktree',   group: 'Portfolio', ...si(siLinktree), placeholder: 'username', url: base('https://linktr.ee/') },
  { id: 'calendly',  label: 'Calendly',   group: 'Portfolio', ...si(siCalendly), placeholder: 'calendly.com/you', url: direct },

  { id: 'custom',    label: 'Custom link', group: 'Other', placeholder: 'https://', url: direct },
];

export const NETWORK_BY_ID = Object.fromEntries(NETWORKS.map((n) => [n.id, n])) as Record<string, Network>;
export const NETWORK_GROUPS = ['Social', 'Messaging', 'Reviews', 'Video and audio', 'Shop and pay', 'Portfolio', 'Other'] as const;

export function socialUrl(network: string, value: string): string {
  const n = NETWORK_BY_ID[network];
  if (!value.trim()) return '';
  return n ? n.url(value) : direct(value);
}
