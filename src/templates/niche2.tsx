import {
  Arrow, Btn, CalendarDays, ContactList, Gallery, HIcon, Hours, LocationCard, Logo, Mail, MapPin, MessageCircle,
  Phone, Photo, QrBtn, SaveBtn, ShareBtn, SocialLinks, Title, el, useCard, BrandGlyph,
} from './blocks';
import { addressLine, formatPhone, mapsHref, telHref, waHref, webHref } from '../lib/links';
import { NETWORK_BY_ID, socialUrl } from '../lib/socials';
import type { CardData } from '../lib/types';

/** "$35 · 45 min" -> { price: "$35", note: "45 min" } */
function priced(sub: string) {
  const [first, ...rest] = sub.split('·').map((x) => x.trim());
  return /^\$/.test(first ?? '') ? { price: first, note: rest.join(' · ') } : { price: '', note: sub };
}
const firstLink = (d: CardData, ids: string[]) => {
  const s = d.socials.find((x) => ids.includes(x.network) && socialUrl(x.network, x.value));
  return s ? { url: socialUrl(s.network, s.value), network: s.network } : null;
};

/* ============================================================ Barbers and Salons: "Chair" */
export function Barber() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-bb">
      <div className="bb__pole" aria-hidden><i /></div>
      <div className="pad stack">
        <header className="bb__head">
          <Logo className="bb__logo" />
          <div>
            <h1 className="bb__name" {...el('name')}>{data.business || data.fullName || 'Your Shop'}</h1>
            {data.tagline && <p className="bb__tag" {...el('caption')}>{data.tagline}</p>}
          </div>
        </header>
        <div className="bb__cta">
          {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={19} />}>Book a chair</Btn>}
          {data.phone && <Btn block href={telHref(data.phone)} icon={<Phone size={18} />}>Call</Btn>}
        </div>
        <section className="fc-sec">
          <h2 className="bb__h" {...el('name')}>{data.highlightsTitle || 'Services'}</h2>
          <ul className="bb__prices">{data.highlights.map((h) => {
            const p = priced(h.subtitle);
            return (
              <li key={h.id} {...el('dividers')}>
                <span className="bb__svc"><b {...el('body')}>{h.title}</b>{p.note && <small {...el('caption')}>{p.note}</small>}</span>
                {p.price && <span className="bb__price" {...el('accentDetail')}>{p.price}</span>}
              </li>);
          })}</ul>
        </section>
        <Gallery variant="grid" title="Fresh cuts" max={6} />
        <Hours />
        <div className="bb__barber"><Photo className="bb__img" /><div><b {...el('body')}>{data.fullName}</b><Title /></div></div>
        <div className="row"><SaveBtn /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <LocationCard />
        <SocialLinks variant="pills" title="" />
      </div>
    </div>
  );
}

/* ============================================================ Churches and Ministries: "Sanctuary" */
export function Church() {
  const { data } = useCard();
  const live = firstLink(data, ['youtube', 'facebook', 'twitch', 'vimeo']);
  const give = firstLink(data, ['paypal', 'cashapp', 'zelle', 'venmo', 'square', 'custom']);
  // Prayer requests go straight to the church's inbox or WhatsApp; nothing is stored on the card.
  const pray = data.email
    ? `mailto:${data.email}?subject=${encodeURIComponent('Prayer request')}`
    : data.whatsapp ? waHref(data.whatsapp, 'Prayer request: ') : '';
  return (
    <div className="tpl tpl-ch">
      <header className="ch__hero" {...el('heroBand')}>
        <span className="ch__rays" aria-hidden />
        <Logo className="ch__logo" />
        <h1 className="ch__name">{data.business || 'Your Church'}</h1>
        {data.tagline && <p className="ch__tag">{data.tagline}</p>}
      </header>
      <div className="pad stack ch__body">
        {(data.hours || (data.hasLocation && addressLine(data.address))) && (
          <section className="ch__times" {...el('cardBg')}>
            <span className="ch__label" {...el('accentDetail')}>Join us</span>
            {data.hours && <b className="ch__when" {...el('name')}>{data.hours}</b>}
            {data.hasLocation && addressLine(data.address) && <small {...el('caption')}>{addressLine(data.address)}</small>}
            {data.hasLocation && addressLine(data.address) && <Btn variant="primary" block href={mapsHref(data.address)} icon={<MapPin size={18} />}>Plan your visit</Btn>}
          </section>
        )}
        <div className="ch__acts">
          {live && <a className="ch__act" href={live.url} target="_blank" rel="noopener" {...el('cardBg')}><span className="ch__live" {...el('icons')}><BrandGlyph network={live.network} size={20} /></span><b {...el('body')}>Watch live</b></a>}
          {give && <a className="ch__act" href={give.url} target="_blank" rel="noopener" {...el('cardBg')}><span {...el('icons')}><HIcon name="heart" size={20} /></span><b {...el('body')}>Give</b></a>}
          {pray && <a className="ch__act" href={pray} {...(/^https?:/.test(pray) ? { target: '_blank', rel: 'noopener' } : {})} {...el('cardBg')}><span {...el('icons')}><MessageCircle size={20} /></span><b {...el('body')}>Prayer request</b></a>}
        </div>
        <div className="ch__pastor"><Photo className="ch__img" /><div><b {...el('body')}>{data.fullName}</b><Title /></div></div>
        <section className="fc-sec">
          <h2 className="ch__h" {...el('name')}>{data.highlightsTitle || 'Ministries'}</h2>
          <div className="ch__mins">{data.highlights.map((h) => (
            <article key={h.id} {...el('cardBg')}><span className="ch__minic" {...el('iconBg')}><span {...el('icons')}><HIcon name={h.icon} size={20} /></span></span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></article>
          ))}</div>
        </section>
        <Gallery variant="strip" title="Our family" />
        <div className="row"><SaveBtn /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <SocialLinks variant="icons" title="" />
      </div>
    </div>
  );
}

/* ============================================================ Fitness and Coaching: "Pulse" */
export function Fitness() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-fx">
      <div className="pad stack center">
        <div className="fx__rings" aria-hidden><i /><i /><i /></div>
        <div className="fx__photo"><Photo className="fx__img" /></div>
        <h1 className="fx__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="fx__title" />
        {data.tagline && <p className="fx__tag" {...el('accentDetail')}>{data.tagline}</p>}
        {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={19} />}>Book a session</Btn>}
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <section className="fc-sec full">
          <h2 className="fx__h" {...el('caption')}>{data.highlightsTitle || 'Programs'}</h2>
          <div className="fx__progs">{data.highlights.map((h, i) => (
            <article key={h.id} {...el('cardBg')}>
              <span className="fx__n" {...el('accentDetail')}>{String(i + 1).padStart(2, '0')}</span>
              <span className="fx__pt"><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span>
              <span {...el('icons')}><Arrow size={20} /></span>
            </article>))}</div>
        </section>
        <div className="full"><Gallery variant="pair" title="Transformations" max={4} /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
        <div className="full"><ContactList /></div>
      </div>
    </div>
  );
}

/* ============================================================ Insurance, Finance, Legal: "Advisor" */
export function Advisor() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-ad">
      <header className="ad__head" {...el('heroBand')}>
        <Logo className="ad__logo" /><span className="ad__biz">{data.business || 'Your firm'}</span>
      </header>
      <div className="pad stack ad__body">
        <div className="ad__card" {...el('cardBg')}>
          <Photo className="ad__img" />
          <div className="ad__id">
            <h1 className="ad__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
            <Title withCreds={false} />
            {data.credentials && <span className="ad__lic" {...el('iconBg')}><span {...el('icons')}><HIcon name="shield" size={14} /></span><span {...el('body')}>{data.credentials}</span></span>}
          </div>
        </div>
        {data.tagline && <p className="ad__tag" {...el('body')}>{data.tagline}</p>}
        <div className="ad__cta">
          {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Book a review</Btn>}
          {data.phone && <Btn block href={telHref(data.phone)} icon={<Phone size={18} />}>{formatPhone(data.phone)}</Btn>}
          {data.email && <Btn block href={`mailto:${data.email}?subject=${encodeURIComponent('Quote request')}`} icon={<Mail size={18} />}>Get a quote</Btn>}
        </div>
        <section className="fc-sec">
          <h2 className="fc-eyebrow" {...el('caption')}>{data.highlightsTitle || 'How I help'}</h2>
          <div className="ad__svcs">{data.highlights.map((h) => (
            <article key={h.id} {...el('cardBg')}>
              <span className="ad__svcic" {...el('icons')}><HIcon name={h.icon} size={20} /></span>
              <span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span>
            </article>))}</div>
        </section>
        <div className="row"><SaveBtn /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <LocationCard />
        <SocialLinks variant="rows" title="Connect" />
      </div>
    </div>
  );
}

/* ============================================================ Restaurants and Cafes: "Bistro" */
export function Bistro() {
  const { data } = useCard();
  const order = firstLink(data, ['ubereats', 'doordash', 'grubhub', 'square', 'shopify']);
  return (
    <div className="tpl tpl-bi">
      <div className="pad stack">
        <section className="bi__menu" {...el('cardBg')}>
          <Logo className="bi__logo" />
          <h1 className="bi__name" {...el('name')}>{data.business || 'Your Restaurant'}</h1>
          {data.tagline && <p className="bi__tag" {...el('caption')}>{data.tagline}</p>}
          <span className="bi__rule" {...el('accentDetail')}><i /><HIcon name="food" size={16} /><i /></span>
          <ul className="bi__items">{data.highlights.map((h) => {
            const p = priced(h.subtitle);
            return (
              <li key={h.id}>
                <span className="bi__row"><b {...el('body')}>{h.title}</b><span className="bi__lead" />{p.price && <span className="bi__price" {...el('accentDetail')}>{p.price}</span>}</span>
                {p.note && <small {...el('caption')}>{p.note}</small>}
              </li>);
          })}</ul>
          {data.hours && <p className="bi__hours" {...el('caption')}>{data.hours}</p>}
        </section>
        <div className="row">
          {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Reserve</Btn>}
          {order ? <Btn block href={order.url} icon={<BrandGlyph network={order.network} size={17} />}>Order online</Btn>
            : data.phone && <Btn block href={telHref(data.phone)} icon={<Phone size={18} />}>Call</Btn>}
        </div>
        <Gallery variant="strip" title="The dining room" />
        <LocationCard variant="map" />
        <div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <SocialLinks variant="icons" title="" />
      </div>
    </div>
  );
}

/* ============================================================ DJs, Events and Music: "Stage" */
export function Stage() {
  const { data, still } = useCard();
  const streams = data.socials.filter((s) => ['spotify', 'soundcloud', 'applemusic', 'youtube', 'twitch', 'kick'].includes(s.network) && socialUrl(s.network, s.value));
  const date = data.bookingUrl ? webHref(data.bookingUrl) : data.email ? `mailto:${data.email}?subject=${encodeURIComponent('Checking your availability')}` : '';
  return (
    <div className={`tpl tpl-st ${still ? 'is-still' : ''}`}>
      <div className="st__eq" aria-hidden>{Array.from({ length: 24 }, (_, i) => <i key={i} style={{ animationDelay: `${(i * 137) % 900}ms`, animationDuration: `${700 + ((i * 53) % 500)}ms` }} />)}</div>
      <div className="pad stack center">
        <div className="st__vinyl" {...el('heroBand')}><span className="st__grooves" /><Photo className="st__img" /></div>
        <h1 className="st__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="st__title" />
        {data.tagline && <p className="st__tag" {...el('accentDetail')}>{data.tagline}</p>}
        {date && <Btn variant="primary" block href={date} icon={<CalendarDays size={19} />}>Check my date</Btn>}
        <div className="st__chips full">{data.highlights.map((h) => <span key={h.id} className="st__chip" {...el('cardBg')}><span {...el('icons')}><HIcon name={h.icon} size={15} /></span><span {...el('body')}>{h.title}</span></span>)}</div>
        {streams.length > 0 && (
          <section className="fc-sec full">
            <h2 className="fc-eyebrow" {...el('caption')}>Listen</h2>
            <div className="st__streams">{streams.map((s) => (
              <Btn key={s.id} block href={socialUrl(s.network, s.value)} icon={<BrandGlyph network={s.network} size={19} />}>{NETWORK_BY_ID[s.network]?.label}</Btn>
            ))}</div>
          </section>
        )}
        <div className="full"><Gallery variant="grid" title="On stage" max={6} /></div>
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="full"><SocialLinks variant="pills" title="" /></div>
      </div>
    </div>
  );
}
