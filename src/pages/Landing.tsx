import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dices, Check, Palette, UserPlus, QrCode, Smartphone, Layers, Type, ArrowRight, MessageCircle } from 'lucide-react';
import type { Card } from '../lib/types';
import { sampleCard } from '../lib/seed';
import { deriveTokens, randomButton, randomSeeds, FONT_PAIRS } from '../lib/theme';
import { TEMPLATES } from '../templates';
import { ALL_DESIGNS, NICHES, applyDesign, sampleFor } from '../lib/niches';
import Brand from '../components/Brand';
import heroLogo from '../assets/okunami-wordmark.png';
import { APP_NAME, PLANS, STUDIO, STUDIO_CONTACT } from '../lib/plans';
import { sfx } from '../lib/sfx';
import { decorative } from '../lib/a11y';
import { DESIGN_COUNT, NICHE_COUNT, designsLabel } from '../lib/counts';
import { HAS_LEGAL, LEGAL } from '../lib/legal';
import { dollars, useOffer } from '../lib/offers';
import CardRenderer from '../components/CardRenderer';
import { rich, useT } from '../lib/i18n';
import LangToggle from '../components/LangToggle';

/* In-page jumps use scrollIntoView, not #hash links: the demo build routes by hash. */
const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
const reduced = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/** Designs left out of the landing page only. They still exist in the app and on existing cards. */
const HIDE_ON_LANDING = new Set<string>(['terminal', 'inbox']);

/** The hero phone cycles through these showpiece designs until someone rolls the dice. */
const SHOWCASE = ['neonsign', 'velvet', 'turntable', 'passport', 'polish', 'synthwave', 'signature', 'lotus', 'nowserving'];

function Ticker({ items, tone }: { items: string[]; tone: 'pink' | 'cyan' | 'orange' }) {
  const line = items.join('  ✶  ');
  return (
    <div className={`mx-ticker mx-ticker--${tone}`} aria-hidden>
      <span>{line}  ✶  {line}  ✶  </span>
    </div>
  );
}

export default function Landing() {
  const designsLabelT = (n: number) => designsLabel(n, lang);
  const { t, lang } = useT();
  const offer = useOffer();
  const base = useMemo(() => sampleCard(), []);
  const showcase = useMemo(() => SHOWCASE.map((t) => ALL_DESIGNS.find((x) => x.design.template === t)).filter(Boolean) as typeof ALL_DESIGNS, []);
  /* Four rows of the marquee: every fourth niche per row, so each row mixes categories. */
  const nicheRows = useMemo(() => [0, 1, 2, 3].map((r) => NICHES.filter((_, k) => k % 4 === r)), []);
  const [i, setI] = useState(0);
  const [rolled, setRolled] = useState<Card | null>(null);
  const [rolls, setRolls] = useState(0);
  const [yearly, setYearly] = useState(false);

  useEffect(() => {
    if (rolled || reduced()) return;
    const t = window.setInterval(() => setI((n) => (n + 1) % showcase.length), 3200);
    return () => window.clearInterval(t);
  }, [rolled, showcase.length]);

  const cur = showcase[i];
  const heroCard = rolled ?? applyDesign(sampleFor(base, cur.niche), cur.niche, cur.design);
  const heroMode = rolled ? 'light' : cur.design.mode;

  const roll = () => {
    sfx('dice');
    const s = randomSeeds();
    const pair = FONT_PAIRS[Math.floor(Math.random() * FONT_PAIRS.length)];
    const pick = ALL_DESIGNS[Math.floor(Math.random() * ALL_DESIGNS.length)];
    const c = applyDesign(sampleFor(base, pick.niche), pick.niche, pick.design);
    setRolled({ ...c, theme: { ...c.theme, tokens: deriveTokens(s), button: randomButton(), fonts: { display: pair.display, body: pair.body } } });
    setRolls((n) => n + 1);
  };

  return (
    <div className="mx">
      {/* ---------------------------------------------------------------- nav */}
      <header className="mx-nav">
        <Brand tone="dark" />
        <nav aria-label={t("Main")}><LangToggle tone="dark" />{rich(t("<x1>Niches</x1><x2>Designs</x2><x3>Pricing</x3><x4>Studio</x4><x5>Sign in</x5><x6>Start free</x6>"), { x1: (c) => <button type="button" className="mx-navlink" onClick={() => jump('niches')}>{c}</button>, x2: (c) => <button type="button" className="mx-navlink" onClick={() => jump('layouts')}>{c}</button>, x3: (c) => <button type="button" className="mx-navlink" onClick={() => jump('pricing')}>{c}</button>, x4: (c) => <button type="button" className="mx-navlink" onClick={() => jump('studio')}>{c}</button>, x5: (c) => <Link to="/login" className="mx-navlink">{c}</Link>, x6: (c) => <Link to="/signup" className="mx-btn mx-btn--pink mx-btn--sm">{c}</Link> })}</nav>
      </header>

      {/* ---------------------------------------------------------------- hero */}
      <section className="mx-hero">
        <div className="mx-hero__copy">
          <img src={heroLogo} alt="" aria-hidden className="mx-hero__logo mx-hero__logo--m" />
          <span className="mx-sticker mx-sticker--orange s1">{designsLabelT(DESIGN_COUNT)}</span>
          <h1 className="mx-mega">{rich(t("Make <x1>your</x1> mark."), { x1: (c) => <span className="pink">{c}</span> })}</h1>
          <p className="mx-lede">{rich(t("Digital business cards that look like <b>your</b> brand, down to the last button. Barbers, salons, DJs, realtors, churches: pick your niche and walk out with a card people actually save."), { b: (c) => <b>{c}</b> })}</p>
          <div className="mx-ctas">
            <Link to="/signup" className="mx-btn mx-btn--pink mx-btn--lg">{t("Build your card free")} <ArrowRight size={20} /></Link>
            <button type="button" className="mx-btn mx-btn--ghost mx-btn--lg" onClick={roll}><Dices size={20} /> {t("Roll a random look")}</button>
          </div>
          <ul className="mx-ticks">
            <li><Check size={16} /> {t("No app to download")}</li>
            <li><Check size={16} /> {t("Tap, scan or text it")}</li>
            <li><Check size={16} /> {t("Saves to any phone in one tap")}</li>
          </ul>
        </div>

        <div className="mx-hero__stage">
          <img src={heroLogo} alt="" aria-hidden className="mx-hero__logo" />
          <span className="mx-sun" aria-hidden />
          <span className="mx-sticker mx-sticker--cyan s2">{t("NFC ready")}</span>
          <span className="mx-sticker mx-sticker--pink s3">{t("No app needed")}</span>
          <div className="mx-phone" key={rolled ? `r${rolls}` : `s${i}`}>
            <div className="mx-phone__screen" {...decorative}><CardRenderer card={heroCard} mode={heroMode} sound={false} /></div>
          </div>
          <button type="button" className="mx-dice" onClick={roll} aria-label={t("Roll a random look")}><Dices size={28} /></button>
          <p className="mx-caption">
            {rolled
              ? <>{rich(t("Roll {rolls}: <b>{name}</b> layout. <x2>Open this demo</x2> <x3>Back to the showcase</x3>", { rolls, name: TEMPLATES.find((t) => t.id === rolled.template)?.name }), { b: (c) => <b>{c}</b>, x2: (c) => <Link className="mx-link" to={`/demo/${rolled.template}`}>{c}</Link>, x3: (c) => <button type="button" className="mx-link" onClick={() => setRolled(null)}>{c}</button> })}</>
              : <>Now showing <b>{cur.design.name}</b> for {cur.niche.name.toLowerCase()}. <Link className="mx-link" to={`/demo/${cur.design.template}`}>{rich(t("Open this demo<x1> of the {name} design</x1>", { name: cur.design.name }), { x1: (c) => <span className="sr">{c}</span> })}</Link></>}
          </p>
        </div>
      </section>

      <Ticker tone="pink" items={[designsLabelT(DESIGN_COUNT), t('{n} niches', { n: NICHE_COUNT }), t('Tap'), t('Save'), t('Share'), t('NFC and QR'), t('Made in Florida')]} />

      {/* ---------------------------------------------------------------- features */}
      <section className="mx-feats" aria-label={t("What you get")}>
        <h2 className="mx-h2">{rich(t("Loud where it counts. <x1>Easy</x1> everywhere else."), { x1: (c) => <span className="cyan">{c}</span> })}</h2>
        <div className="mx-feats__grid">
          {[
            { icon: Layers, t: 'N designs', d: 'Neon signs, straight razors, turntables, passports, wax seals. Pro members get new drops every other month.', c: 'pink' },
            { icon: Palette, t: 'Recolor anything', d: 'Tap any part of your card to change its color. Contrast is checked live so it stays readable.', c: 'cyan' },
            { icon: Smartphone, t: 'Buttons that pop', d: 'Ten styles, eight shapes and eight finishes, tuned for light and dark mode.', c: 'orange' },
            { icon: Type, t: 'Your brand kit', d: 'Pull colors from your logo, paste hex codes from Canva, or upload your own fonts.', c: 'cyan' },
            { icon: UserPlus, t: 'One-tap save', d: 'Adds your photo, numbers, address and links straight into their contacts.', c: 'orange' },
            { icon: QrCode, t: 'QR and NFC', d: 'Print it, stick it, tap it. The same link works everywhere.', c: 'pink' },
          ].map((f) => (
            <article key={f.t} className={`mx-tile mx-tile--${f.c}`}>
              <span className="mx-tile__ic"><f.icon size={26} strokeWidth={2} /></span>
              <h3>{f.t === 'N designs' ? designsLabelT(DESIGN_COUNT) : t(f.t)}</h3>
              <p>{t(f.d)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- niche marquee */}
      <section className="mx-nm" id="niches" aria-labelledby="dir-h">
        <div className="mx-nm__rows" aria-hidden>
          {nicheRows.map((row, r) => (
            <div key={r} className={`mx-nm__row mx-nm__row--${r % 2 ? 'line mx-nm__row--rev' : 'fill'}`}>
              <span className="mx-nm__track" style={{ animationDelay: `-${r * 19}s`, animationDuration: `${84 + r * 12}s` }}>
                {[...row, ...row].map((n, k) => <span key={k}>{t(n.name)}<i>/</i></span>)}
              </span>
            </div>
          ))}
        </div>
        <div className="mx-nm__panel">
          {rich(t("<x1>{NICHE_COUNT} niches · {v}</x1><x2>Find your niche</x2><x3>If you have a line of work, we have a card for it.</x3>", { NICHE_COUNT, v: designsLabelT(DESIGN_COUNT) }), { x1: (c) => <p className="mx-eyebrow">{c}</p>, x2: (c) => <h2 id="dir-h" className="mx-nm__h">{c}</h2>, x3: (c) => <p className="mx-nm__sub">{c}</p> })}
          <button type="button" className="mx-btn mx-btn--pink mx-btn--lg" onClick={() => jump('layouts')}>{t("See all designs")} <ArrowRight size={20} /></button>
        </div>
        <p className="sr">{NICHES.map((n) => t(n.name)).join(', ')}</p>
      </section>

      {/* ---------------------------------------------------------------- designs strip */}
      <section className="mx-layouts" id="layouts">
        <h2 className="mx-h2">{rich(t("Swipe the <x1>wall</x1> of designs."), { x1: (c) => <span className="pink">{c}</span> })}</h2>
        <div className="mx-strip" role="region" aria-label={t("Design gallery. Scrolls sideways. Each design has an Open demo link.")} tabIndex={0}>
          {[...TEMPLATES].filter((t) => !HIDE_ON_LANDING.has(t.id)).sort((a, b) => Number(Boolean(b.niche)) - Number(Boolean(a.niche))).map((tpl) => {
            const hit = ALL_DESIGNS.find((x) => x.design.template === tpl.id);
            return (
              <figure key={tpl.id}>
                <div className="mx-mini" {...decorative}><div className="mx-miniscale">
                  {hit
                    ? <CardRenderer card={applyDesign(sampleFor(base, hit.niche), hit.niche, hit.design)} mode={hit.design.mode} sound={false} />
                    : <CardRenderer card={{ ...base, template: tpl.id }} mode="light" sound={false} />}
                </div></div>
                <figcaption>
                  <b>{hit?.design.name ?? tpl.name}</b><small>{hit ? hit.niche.name : tpl.bestFor}</small>
                  <Link className="mx-demo" to={`/demo/${tpl.id}`}>{t("Open demo")}<span className="sr">{t(" of the {v} design", { v: hit?.design.name ?? tpl.name })}</span> <ArrowRight size={14} aria-hidden /></Link>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <Ticker tone="cyan" items={[t('Barbershops'), t('Nail spas'), t('Salons'), t('Massage'), t('DJs'), t('Weddings'), t('Realtors'), t('Churches'), t('Tech')]} />

      {/* ---------------------------------------------------------------- two ways to get a card */}
      <section className="mx-paths" id="paths" aria-labelledby="paths-h">
        <div className="mx-paths__in">
          <h2 id="paths-h" className="mx-dir__h">{t("Two ways to get your card")}</h2>
          <div className="mx-paths__grid">
            <article className="mx-path">
              <p className="mx-eyebrow">{t("Make it yourself")}</p>
              <h3>{t("OKUNAMI")}</h3>
              <p>{t("Build your own card in about five minutes, and change it whenever you like.")}</p>
              <ul>
                <li><Check size={16} aria-hidden /> {t("Start free, no credit card")}</li>
                <li><Check size={16} aria-hidden /> {t("Pro is $8 a month, Pro Plus is $16 and Business is $41.")}</li>
                <li><Check size={16} aria-hidden /> {t("You edit it yourself, any time")}</li>
              </ul>
              <Link to="/signup" className="mx-btn mx-btn--pink">{t("Start free")} <ArrowRight size={18} aria-hidden /></Link>
            </article>
            <article className="mx-path mx-path--studio">
              <p className="mx-eyebrow">{t("Done for you")}</p>
              <h3>{t("OKUNAMI Studio")}</h3>
              <p>{t("I design and set up your card for you, starting with a free consult.")}</p>
              <ul>
                <li><Check size={16} aria-hidden /> {t("One-time setup from $249")}</li>
                <li><Check size={16} aria-hidden /> {t("Plus a OKUNAMI Pro, Pro Plus or Business subscription, which every Studio card needs")}</li>
                <li><Check size={16} aria-hidden /> {t("I handle the design, copy and setup")}</li>
              </ul>
              <button type="button" className="mx-btn mx-btn--ghost" onClick={() => jump('studio')}>{t("See what Studio includes")} <ArrowRight size={18} aria-hidden /></button>
            </article>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- pricing */}
      <section className="mx-pricing" id="pricing">
        <h2 className="mx-h2 mx-h2--dark">{rich(t("Start free. <x1>Go loud</x1> for $8."), { x1: (c) => <span className="pinkdeep">{c}</span> })}</h2>
        <div className="mx-bill" role="radiogroup" aria-label={t("Billing")}>
          <button type="button" role="radio" aria-checked={!yearly} className={!yearly ? 'on' : ''} onClick={() => setYearly(false)}>{t("Monthly")}</button>
          <button type="button" role="radio" aria-checked={yearly} className={yearly ? 'on' : ''} onClick={() => setYearly(true)}>{rich(t("Yearly <x1>Save up to 22%</x1>"), { x1: (c) => <span>{c}</span> })}</button>
        </div>
        <div className="mx-plans">
          {PLANS.map((p) => {
            const featured = !!p.featured;
            const shown = p.price === 0 ? 0 : yearly ? Math.round((p.yearly / 12) * 100) / 100 : p.price;
            return (
              <article key={p.id} className={`mx-plan ${featured ? 'is-featured' : ''}`}>
                {featured && <span className="mx-sticker mx-sticker--orange s4">{t("Most popular")}</span>}
                <h3>{t(p.name)}</h3>
                <p className="mx-price"><b>${shown % 1 ? shown.toFixed(2) : shown}</b><span>/{p.price === 0 ? t('forever') : t('month')}</span></p>
                <p className="mx-billnote">{p.price === 0 ? t('No card needed') : yearly ? t('Billed ${y} a year', { y: p.yearly }) : t('Billed monthly, cancel anytime')}</p>
                {p.id === 'pro' && offer.known && offer.active && (
                  <p className="mx-offernote">{yearly ? t("Founding price is for monthly billing only.") : t("Founding price {price} while spots last ({left} left)", { price: dollars(offer.cents), left: offer.left })}</p>
                )}
                <p className="mx-pitch">{t(p.pitch)}</p>
                <ul>{p.features.map((f) => <li key={f}><Check size={16} /> {t(f, { designs: DESIGN_COUNT })}</li>)}</ul>
                <Link to={p.price === 0 ? '/signup' : `/signup?plan=${p.id}&billing=${yearly ? 'year' : 'month'}`} className={`mx-btn ${featured ? 'mx-btn--navy' : 'mx-btn--pink'}`}>{p.price === 0 ? t('Start free') : t('Choose {name}', { name: t(p.name) })}</Link>
              </article>
            );
          })}
        </div>
        {offer.known && offer.active && (
          <p className="mx-founding">{rich(t("<b>Founding offer.</b> The first {spots} Pro customers pay {price} a month instead of {base}. {left} spots left. Pro monthly only, one per person. The price lasts while your subscription stays active. If you cancel, it ends and is not offered again.", { spots: offer.spots, price: dollars(offer.cents), base: dollars(PLANS[1].price * 100), left: offer.left }), { b: (c) => <b>{c}</b> })}</p>
        )}
      </section>

      {/* ---------------------------------------------------------------- studio */}
      <section className="mx-studio" id="studio" aria-labelledby="studio-h">
        <div className="mx-studio__in">
          <header className="mx-studio__head">{rich(t("<x1>OKUNAMI Studio by Finesse Media</x1><x2>Want me to build it for you?</x2><x3>I'm a creative director and photographer. I design your card, shoot your portrait and hand you the tap products.</x3>"), { x1: (c) => <p className="mx-eyebrow">{c}</p>, x2: (c) => <h2 id="studio-h" className="mx-dir__h">{c}</h2>, x3: (c) => <p className="mx-dir__sub">{c}</p> })}</header>

          <div className="mx-studio__two">
            <section className="mx-studio__box" aria-labelledby="pay-h">
              <h3 id="pay-h">{t("What you pay")}</h3>
              <dl>
                <div>{rich(t("<x1>Studio setup</x1><x2>One time. From ${from} for a Signature card. Every project is quoted.</x2>", { from: STUDIO[0].from }), { x1: (c) => <dt>{c}</dt>, x2: (c) => <dd>{c}</dd> })}</div>
                <div>{rich(t("<x1>OKUNAMI subscription</x1><x2>Required for every Studio card: Pro at ${price} a month, Pro Plus at ${price2} a month, or Business at ${price3} a month.</x2>", { price: PLANS[1].price, price2: PLANS[2].price, price3: PLANS[3].price }), { x1: (c) => <dt>{c}</dt>, x2: (c) => <dd>{c}</dd> })}</div>
              </dl>
            </section>
            <section className="mx-studio__box" aria-labelledby="how-h">
              <h3 id="how-h">{t("How it works")}</h3>
              <ol>
                <li>{rich(t("<b>Request a free consult.</b> Tell me about your business."), { b: (c) => <b>{c}</b> })}</li>
                <li>{rich(t("<b>I build a private preview.</b> You review it before you pay."), { b: (c) => <b>{c}</b> })}</li>
                <li>{rich(t("<b>You approve it and pay through Stripe.</b>"), { b: (c) => <b>{c}</b> })}</li>
                <li>{rich(t("<b>I set up your live address by hand.</b> It is an address on finessemedia.pro that I provide. Connecting your own custom domain yourself is not available yet."), { b: (c) => <b>{c}</b> })}</li>
              </ol>
            </section>
          </div>

          <div className="mx-studio__grid">
            {STUDIO.map((s) => (
              <article key={s.id} className="mx-studio__card">
                <h3>{t(s.name)}</h3>
                <p className="mx-studio__from">{rich(t("from <b>${from}</b>{v}", { from: s.from, v: 'per' in s ? ' ' + t('per person') : '' }), { b: (c) => <b>{c}</b> })}</p>
                <p>{t(s.blurb)}</p>
                <ul>{s.includes.map((x) => <li key={x}><Check size={14} aria-hidden /> {t(x)}</li>)}</ul>
                {'cardPackage' in s && <small>{t("Needs a OKUNAMI Pro, Pro Plus or Business subscription.")}</small>}
              </article>
            ))}
          </div>
          <div className="mx-dir__foot">
            <a className="mx-btn mx-btn--pink" href={STUDIO_CONTACT.whatsapp} target="_blank" rel="noopener"><MessageCircle size={18} aria-hidden /> {t("Request a free consult on WhatsApp")}</a>
            <a className="mx-studio__mail" href={STUDIO_CONTACT.email}>{t("or email angel@finessemedia.pro")}</a>
            <span>{t("The button opens a WhatsApp chat with me. Prices are starting points; every project is quoted.")}</span>
          </div>
        </div>
      </section>

      <footer className="mx-foot">
        <Brand tone="dark" />
        <span>{t("{APP_NAME} by Finesse Media LLC, Deltona, Florida", { APP_NAME })}</span>
        <span className="mx-foot__links">
          {HAS_LEGAL && <>{rich(t("<x1>Terms</x1><x2>Privacy</x2>"), { x1: (c) => <a href={LEGAL.termsUrl!} target="_blank" rel="noopener">{c}</a>, x2: (c) => <a href={LEGAL.privacyUrl!} target="_blank" rel="noopener">{c}</a> })}</>}
          <a href="https://www.finessemedia.pro">{t("finessemedia.pro")}</a>
        </span>
      </footer>
    </div>
  );
}
