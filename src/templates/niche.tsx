import {
  Arrow, Btn, Business, CalendarDays, ContactList, Crisis, Dock, Gallery, Highlights, HIcon, Hours, LocationCard, Logo, MapPin,
  Name, Phone, Photo, QrBtn, SaveBtn, ShareBtn, SocialLinks, Title, el, useCard, useContactActions, BrandGlyph, Mail, MessageCircle,
} from './blocks';
import { addressLine, formatPhone, mapsHref, prettyUrl, telHref, webHref } from '../lib/links';
import { NETWORK_BY_ID, socialUrl } from '../lib/socials';

const ext = (href: string) => (/^https?:/.test(href) ? { target: '_blank', rel: 'noopener' } : {});

/* ============================================================ Real Estate: "Keystone" */
export function RealEstate() {
  const { data } = useCard();
  const hero = data.gallery[0];
  return (
    <div className="tpl tpl-re">
      <header className="re__hero">
        {hero ? <img className="re__house" src={hero} alt="Featured property" /> : <div className="re__house re__house--empty" {...el('heroBand')} />}
        <div className="re__shade" />
        <div className="re__brand" {...el('heroBand')}><Logo className="re__logo" /><span>{data.business || 'Your brokerage'}</span></div>
      </header>
      <div className="pad stack re__body">
        <div className="re__agent">
          <Photo className="re__img" />
          <div><Name className="re__name" /><Title /></div>
        </div>
        {data.tagline && <p className="re__tag" {...el('body')}>{data.tagline}</p>}
        <div className="row"><SaveBtn /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        {data.bookingUrl && (
          <a className="re__value" href={webHref(data.bookingUrl)} {...ext(webHref(data.bookingUrl))} {...el('cardBg')}>
            <span className="re__valueic" {...el('iconBg')}><span {...el('icons')}><HIcon name="home" size={24} /></span></span>
            <span><b {...el('body')}>What is my home worth?</b><small {...el('caption')}>Free valuation, no obligation</small></span>
            <span {...el('accentDetail')}><Arrow size={20} /></span>
          </a>
        )}
        <Gallery variant="strip" title="Featured listings" />
        <Highlights variant="chips" />
        <ContactList />
        <SocialLinks variant="icons" title="" />
      </div>
      <Dock />
    </div>
  );
}

/* ============================================================ Photography: "Darkroom" */
export function PhotoLayout() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-ph">
      <header className="ph__top">
        <Logo className="ph__logo" />
        <span className="ph__mark" {...el('caption')}>{data.business || 'Studio'}</span>
      </header>
      <div className="pad stack">
        <h1 className="ph__name" {...el('name')}>{data.fullName || 'Your Name'}</h1>
        <Title className="ph__title" />
      </div>
      <Gallery variant="masonry" max={9} />
      <div className="pad stack">
        {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Book a session</Btn>}
        <div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <div className="ph__portrait"><Photo className="ph__img" /><p {...el('body')}>{data.tagline || 'Behind the lens'}</p></div>
        <Highlights variant="numbered" />
        <SocialLinks variant="text" title="Follow the work" />
        <LocationCard variant="text" />
      </div>
      <Dock />
    </div>
  );
}

/* ============================================================ Food Truck: "Street Menu" */
export function FoodTruck() {
  const { data, actions } = useCard();
  const orderLinks = data.socials.filter((s) => ['ubereats', 'doordash', 'grubhub', 'square', 'cashapp'].includes(s.network));
  return (
    <div className="tpl tpl-ft">
      <header className="ft__sign" {...el('heroBand')}>
        <div className="ft__bulbs" aria-hidden>{Array.from({ length: 14 }, (_, i) => <i key={i} style={{ animationDelay: `${(i % 7) * 0.15}s` }} />)}</div>
        <Logo className="ft__logo" />
        <h1 className="ft__name">{data.business || data.fullName || 'Your Truck'}</h1>
        {data.tagline && <p className="ft__tag">{data.tagline}</p>}
      </header>
      <div className="pad stack">
        <section className="ft__today" {...el('accentDetail')}>
          <span className="ft__live"><i /> Where to find us</span>
          <b>{data.hasLocation && addressLine(data.address) ? addressLine(data.address) : 'Follow us for today\'s spot'}</b>
          {data.hours && <small>{data.hours}</small>}
          <div className="row">
            {data.hasLocation && addressLine(data.address) && <Btn variant="primary" href={mapsHref(data.address)} icon={<MapPin size={17} />}>Directions</Btn>}
            {data.phone && <Btn href={telHref(data.phone)} icon={<Phone size={17} />}>Call</Btn>}
          </div>
        </section>
        <section className="fc-sec">
          <h2 className="ft__h" {...el('name')}>{data.highlightsTitle || 'Menu'}</h2>
          <ul className="ft__menu">
            {data.highlights.map((h) => {
              const [price, ...rest] = h.subtitle.split('·').map((x) => x.trim());
              const hasPrice = /^\$/.test(price ?? '');
              return (
                <li key={h.id} {...el('dividers')}>
                  <span className="ft__item"><b {...el('body')}>{h.title}</b>{(hasPrice ? rest.join(' · ') : h.subtitle) && <small {...el('caption')}>{hasPrice ? rest.join(' · ') : h.subtitle}</small>}</span>
                  {hasPrice && <span className="ft__price" {...el('accentDetail')}>{price}</span>}
                </li>
              );
            })}
          </ul>
        </section>
        {orderLinks.length > 0 && (
          <section className="fc-sec">
            <h2 className="fc-eyebrow" {...el('caption')}>Order ahead</h2>
            <div className="ft__order">{orderLinks.map((s) => (
              <Btn key={s.id} variant="primary" href={socialUrl(s.network, s.value)} icon={<BrandGlyph network={s.network} size={18} />}>{NETWORK_BY_ID[s.network]?.label}</Btn>
            ))}</div>
          </section>
        )}
        <Gallery variant="grid" title="Fresh off the grill" max={6} />
        <div className="row"><SaveBtn /><Btn onClick={actions.share} ariaLabel="Share">Share</Btn><QrBtn iconOnly /></div>
        <SocialLinks variant="pills" title="Follow the truck" />
      </div>
    </div>
  );
}

/* ============================================================ Apparel: "Lookbook" */
export function Apparel() {
  const { data } = useCard();
  const shop = data.socials.find((s) => ['shopify', 'etsy', 'amazon', 'square'].includes(s.network));
  const shopHref = shop ? socialUrl(shop.network, shop.value) : webHref(data.website);
  return (
    <div className="tpl tpl-ap">
      <header className="ap__top">
        <Logo className="ap__logo" />
        <span className="ap__brand" {...el('name')}>{data.business || 'Brand'}</span>
        <span className="ap__season" {...el('accentDetail')}>New drop</span>
      </header>
      <div className="ap__cover">
        {data.gallery[0] ? <img src={data.gallery[0]} alt="Featured look" /> : <Photo className="ap__coverimg" />}
        <span className="ap__stamp" {...el('accentDetail')}>{(data.business || 'Brand').split(' ')[0]}</span>
      </div>
      <div className="pad stack">
        <h1 className="ap__tag" {...el('name')}>{data.tagline || 'Wear the story'}</h1>
        {shopHref && <Btn variant="primary" block href={shopHref} icon={<Arrow size={18} />}>Shop the collection</Btn>}
        <Gallery variant="strip" title="Lookbook" />
        <Highlights variant="swiss" />
        <div className="ap__owner"><Photo className="ap__img" /><div><b {...el('body')}>{data.fullName}</b><Title withCreds={false} /></div></div>
        <div className="row"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <SocialLinks variant="pills" title="" />
        <LocationCard />
      </div>
    </div>
  );
}

/* ============================================================ Mechanic: "Garage" */
export function Mechanic() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-mx">
      <div className="mx__stripe" aria-hidden {...el('accentDetail')} />
      <header className="mx__head">
        <Logo className="mx__logo" />
        <div>
          <h1 className="mx__name" {...el('name')}>{data.business || 'Your Shop'}</h1>
          {data.tagline && <p className="mx__tag" {...el('caption')}>{data.tagline}</p>}
        </div>
      </header>
      <div className="pad stack">
        {data.phone && (
          <a className="mx__call" href={telHref(data.phone)} {...el('btnPrimaryBg')}>
            <span className="mx__callic"><Phone size={26} /></span>
            <span><small>Call the shop</small><b {...el('btnPrimaryText')}>{formatPhone(data.phone)}</b></span>
          </a>
        )}
        <div className="row">
          {data.bookingUrl && <Btn block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Get a quote</Btn>}
          {data.hasLocation && addressLine(data.address) && <Btn block href={mapsHref(data.address)} icon={<MapPin size={18} />}>Directions</Btn>}
        </div>
        <Hours label="Shop hours" className="mx__hours" />
        <section className="fc-sec">
          <h2 className="mx__h" {...el('name')}>{data.highlightsTitle || 'Services'}</h2>
          <div className="mx__svc">{data.highlights.map((h) => (
            <article key={h.id} {...el('cardBg')}>
              <span className="mx__svcic" {...el('icons')}><HIcon name={h.icon} size={22} /></span>
              <b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small>
            </article>))}</div>
        </section>
        <div className="mx__tech"><Photo className="mx__img" /><div><b {...el('body')}>{data.fullName}</b><Title /></div></div>
        <Gallery variant="grid" title="In the bay" max={6} />
        <div className="row"><SaveBtn /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <SocialLinks variant="rows" title="Reviews and more" />
      </div>
    </div>
  );
}

/* ============================================================ Handyman: "Toolbox" */
export function Handyman() {
  const { data } = useCard();
  const acts = useContactActions();
  const text = data.phone ? `sms:+${data.phone.replace(/\D/g, '').length === 10 ? '1' : ''}${data.phone.replace(/\D/g, '')}` : '';
  return (
    <div className="tpl tpl-hm">
      <header className="hm__head" {...el('heroBand')}>
        <div className="hm__id">
          <Photo className="hm__img" />
          <div><h1 className="hm__name">{data.fullName || 'Your Name'}</h1><p className="hm__biz">{data.business}</p></div>
        </div>
        {data.credentials && <span className="hm__badge" {...el('accentDetail')}><HIcon name="shield" size={16} /> {data.credentials}</span>}
      </header>
      <div className="pad stack">
        <div className="hm__cta">
          {data.phone && <Btn variant="primary" href={telHref(data.phone)} icon={<Phone size={19} />}>Call</Btn>}
          {text && <Btn href={text} icon={<MessageCircle size={19} />}>Text me</Btn>}
        </div>
        {data.tagline && <p className="hm__tag" {...el('body')}>{data.tagline}</p>}
        <section className="fc-sec">
          <h2 className="fc-eyebrow" {...el('caption')}>{data.highlightsTitle || 'Jobs I take'}</h2>
          <ul className="hm__list">{data.highlights.map((h) => (
            <li key={h.id} {...el('cardBg')}><span className="hm__check" {...el('iconBg')}><span {...el('icons')}><HIcon name={h.icon} size={18} /></span></span><span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small></span></li>
          ))}</ul>
        </section>
        <Gallery variant="pair" title="Before and after" max={4} />
        {data.hasLocation && addressLine(data.address) && <p className="hm__area" {...el('iconBg')}><MapPin size={16} /> <span {...el('body')}>Serving {data.address.city || 'your area'} and nearby</span></p>}
        <Hours />
        <div className="row"><SaveBtn /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        {acts.find((a) => a.key === 'book') && <Btn block href={acts.find((a) => a.key === 'book')!.href} icon={<CalendarDays size={18} />}>Request an estimate</Btn>}
        <SocialLinks variant="rows" title="Find me on" />
      </div>
      <Dock />
    </div>
  );
}

/* ============================================================ Esthetics: "Glow" */
export function Esthetics() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-es">
      <div className="es__aura" aria-hidden />
      <div className="pad stack center">
        <Logo className="es__logo" />
        <div className="es__ring" {...el('accentDetail')}><Photo className="es__img" /></div>
        <div className="stack-sm center"><Name className="es__name" /><Title className="es__title" /><Business /></div>
        {data.bookingUrl && <Btn variant="primary" block href={webHref(data.bookingUrl)} icon={<CalendarDays size={18} />}>Book your treatment</Btn>}
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <section className="fc-sec full">
          <h2 className="es__h" {...el('name')}>{data.highlightsTitle || 'Treatments'}</h2>
          <ul className="es__menu">{data.highlights.map((h) => (
            <li key={h.id} {...el('dividers')}><b {...el('body')}>{h.title}</b><span className="es__dots" /><span className="es__time" {...el('accentDetail')}>{h.subtitle}</span></li>
          ))}</ul>
        </section>
        <div className="full"><Gallery variant="grid" title="Results" max={6} /></div>
        <div className="full"><Hours /></div>
        <div className="full"><LocationCard variant="map" /></div>
        <div className="full"><SocialLinks variant="icons" title="" /></div>
        <div className="full"><Crisis /></div>
      </div>
      <Dock />
    </div>
  );
}

/* ============================================================ Influencer: "Creator" */
export function Creator() {
  const { data } = useCard();
  const main = data.socials.filter((s) => socialUrl(s.network, s.value)).slice(0, 6);
  return (
    <div className="tpl tpl-cr">
      <div className="cr__glow" aria-hidden />
      <div className="pad stack center">
        <div className="cr__ring"><Photo className="cr__img" /></div>
        <div className="stack-sm center">
          <h1 className="cr__name" {...el('name')}>{data.fullName || 'Your Name'}<span className="cr__verified" {...el('accentDetail')} aria-label="Verified">✓</span></h1>
          {data.tagline && <p className="cr__tag" {...el('caption')}>{data.tagline}</p>}
        </div>
        <div className="cr__links full">{main.map((s) => (
          <Btn key={s.id} variant="primary" block href={socialUrl(s.network, s.value)} icon={<BrandGlyph network={s.network} size={20} />}>{NETWORK_BY_ID[s.network]?.label ?? 'Link'}</Btn>
        ))}</div>
        <div className="full"><Gallery variant="grid" title="Latest" max={6} /></div>
        <div className="full"><Highlights variant="carousel" /></div>
        {data.email && <div className="full"><Btn block href={`mailto:${data.email}?subject=${encodeURIComponent('Collab inquiry')}`} icon={<Mail size={18} />}>Work with me</Btn></div>}
        <div className="row full"><SaveBtn variant="secondary" /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        {data.website && <a className="cr__site" href={webHref(data.website)} target="_blank" rel="noopener" {...el('links')}>{prettyUrl(data.website)}</a>}
      </div>
    </div>
  );
}

/* ============================================================ Retail: "Storefront" */
export function Retail() {
  const { data } = useCard();
  return (
    <div className="tpl tpl-rt">
      <div className="rt__awning" aria-hidden {...el('heroBand')} />
      <header className="rt__head">
        <Logo className="rt__logo" />
        <h1 className="rt__name" {...el('name')}>{data.business || 'Your Shop'}</h1>
        {data.tagline && <p className="rt__tag" {...el('caption')}>{data.tagline}</p>}
        {data.hours && <span className="rt__open" {...el('iconBg')}><span {...el('body')}>{data.hours}</span></span>}
      </header>
      <div className="pad stack">
        <div className="row">
          {data.hasLocation && addressLine(data.address) && <Btn variant="primary" block href={mapsHref(data.address)} icon={<MapPin size={18} />}>Visit the shop</Btn>}
          {data.website && <Btn block href={webHref(data.website)} icon={<Arrow size={18} />}>Shop online</Btn>}
        </div>
        <section className="fc-sec">
          <h2 className="fc-eyebrow" {...el('caption')}>{data.highlightsTitle || 'Shop by category'}</h2>
          <div className="rt__cats">{data.highlights.map((h, i) => (
            <article key={h.id} className={`rt__cat rt__cat--${i % 4}`} {...el('cardBg')}>
              <span {...el('icons')}><HIcon name={h.icon} size={24} /></span><b {...el('body')}>{h.title}</b><small {...el('caption')}>{h.subtitle}</small>
            </article>))}</div>
        </section>
        <Gallery variant="strip" title="In the shop" />
        <div className="rt__owner"><Photo className="rt__img" /><div><b {...el('body')}>{data.fullName}</b><Title /></div></div>
        <div className="row"><SaveBtn /><ShareBtn iconOnly /><QrBtn iconOnly /></div>
        <ContactList />
        <SocialLinks variant="icons" title="" />
      </div>
      <Dock />
    </div>
  );
}
