import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Dices, Check, Palette, UserPlus, QrCode, Smartphone, Layers, Type, ArrowRight, Minus, Plus } from 'lucide-react';
import type { Card } from '../lib/types';
import { sampleCard } from '../lib/seed';
import { deriveTokens, randomButton, randomSeeds, FONT_PAIRS } from '../lib/theme';
import { TEMPLATES } from '../templates';
import { ALL_DESIGNS, NICHES, NICHE_GROUPS, applyDesign, sampleFor } from '../lib/niches';
import Brand from '../components/Brand';
import { APP_NAME, FOUNDING, PLANS, STUDIO, STUDIO_CONTACT, TEAM, clampCards, teamTotal } from '../lib/plans';
import { sfx } from '../lib/sfx';
import CardRenderer from '../components/CardRenderer';

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
  const base = useMemo(() => sampleCard(), []);
  const showcase = useMemo(() => SHOWCASE.map((t) => ALL_DESIGNS.find((x) => x.design.template === t)).filter(Boolean) as typeof ALL_DESIGNS, []);
  const [i, setI] = useState(0);
  const [rolled, setRolled] = useState<Card | null>(null);
  const [rolls, setRolls] = useState(0);
  const [yearly, setYearly] = useState(false);
  const [cardsRaw, setCardsRaw] = useState(String(TEAM.initial));   // Business: how many cards (typed text, clamped on use)
  const cards = clampCards(parseInt(cardsRaw, 10));

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
        <nav aria-label="Main">
          <button type="button" className="mx-navlink" onClick={() => jump('niches')}>Niches</button>
          <button type="button" className="mx-navlink" onClick={() => jump('layouts')}>Designs</button>
          <button type="button" className="mx-navlink" onClick={() => jump('pricing')}>Pricing</button>
          <button type="button" className="mx-navlink" onClick={() => jump('studio')}>Studio</button>
          <Link to="/login" className="mx-navlink">Sign in</Link>
          <Link to="/signup" className="mx-btn mx-btn--pink mx-btn--sm">Start free</Link>
        </nav>
      </header>

      {/* ---------------------------------------------------------------- hero */}
      <section className="mx-hero">
        <div className="mx-hero__copy">
          <span className="mx-sticker mx-sticker--orange s1">107 designs</span>
          <h1 className="mx-mega">Make <span className="pink">your</span> mark.</h1>
          <p className="mx-lede">Digital business cards that look like <b>your</b> brand, down to the last button. Barbers, salons, DJs, realtors, churches: pick your niche and walk out with a card people actually save.</p>
          <div className="mx-ctas">
            <Link to="/signup" className="mx-btn mx-btn--pink mx-btn--lg">Build your card free <ArrowRight size={20} /></Link>
            <button type="button" className="mx-btn mx-btn--ghost mx-btn--lg" onClick={roll}><Dices size={20} /> Roll a random look</button>
          </div>
          <ul className="mx-ticks">
            <li><Check size={16} /> No app to download</li>
            <li><Check size={16} /> Tap, scan or text it</li>
            <li><Check size={16} /> Saves to any phone in one tap</li>
          </ul>
        </div>

        <div className="mx-hero__stage">
          <span className="mx-sun" aria-hidden />
          <span className="mx-sticker mx-sticker--cyan s2">NFC ready</span>
          <span className="mx-sticker mx-sticker--pink s3">No app needed</span>
          <div className="mx-phone" key={rolled ? `r${rolls}` : `s${i}`}>
            <div className="mx-phone__screen"><CardRenderer card={heroCard} mode={heroMode} sound={false} /></div>
          </div>
          <button type="button" className="mx-dice" onClick={roll} aria-label="Roll a random look"><Dices size={28} /></button>
          <p className="mx-caption">
            {rolled
              ? <>Roll {rolls}: <b>{TEMPLATES.find((t) => t.id === rolled.template)?.name}</b> layout. <button type="button" className="mx-link" onClick={() => setRolled(null)}>Back to the showcase</button></>
              : <>Now showing <b>{cur.design.name}</b> for {cur.niche.name.toLowerCase()}</>}
          </p>
        </div>
      </section>

      <Ticker tone="pink" items={['107 designs', '30 niches', 'Tap', 'Save', 'Share', 'NFC and QR', 'Made in Florida']} />

      {/* ---------------------------------------------------------------- features */}
      <section className="mx-feats" aria-label="What you get">
        <h2 className="mx-h2">Loud where it counts. <span className="cyan">Easy</span> everywhere else.</h2>
        <div className="mx-feats__grid">
          {[
            { icon: Layers, t: '107 designs', d: 'Neon signs, straight razors, turntables, passports, wax seals. Pro members get new drops every other month.', c: 'pink' },
            { icon: Palette, t: 'Recolor anything', d: 'Tap any part of your card to change its color. Contrast is checked live so it stays readable.', c: 'cyan' },
            { icon: Smartphone, t: 'Buttons that pop', d: 'Ten styles, eight shapes and eight finishes, tuned for light and dark mode.', c: 'orange' },
            { icon: Type, t: 'Your brand kit', d: 'Pull colors from your logo, paste hex codes from Canva, or upload your own fonts.', c: 'cyan' },
            { icon: UserPlus, t: 'One-tap save', d: 'Adds your photo, numbers, address and links straight into their contacts.', c: 'orange' },
            { icon: QrCode, t: 'QR and NFC', d: 'Print it, stick it, tap it. The same link works everywhere.', c: 'pink' },
          ].map((f) => (
            <article key={f.t} className={`mx-tile mx-tile--${f.c}`}>
              <span className="mx-tile__ic"><f.icon size={26} strokeWidth={2} /></span>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- niche directory */}
      <section className="mx-dir" id="niches" aria-labelledby="dir-h">
        <div className="mx-dir__in">
          <header className="mx-dir__head">
            <p className="mx-eyebrow">{NICHES.length} niches · {TEMPLATES.length} designs</p>
            <h2 id="dir-h" className="mx-dir__h">Find your niche</h2>
            <p className="mx-dir__sub">Every niche comes with designs, sample services and suggested links made for that line of work.</p>
          </header>
          <div className="mx-dir__cols">
            {NICHE_GROUPS.map((g) => {
              const items = NICHES.filter((n) => n.group === g);
              if (!items.length) return null;
              return (
                <div key={g} className="mx-dir__col">
                  <h3>{g}</h3>
                  <ul>
                    {items.map((n) => (
                      <li key={n.id}>
                        <Link to="/signup" className="mx-dir__item">
                          <span className="mx-dir__name">{n.name}</span>
                          <span className="mx-dir__count" aria-label={`${n.designs.length} designs`}>{n.designs.length}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="mx-dir__foot">
            <button type="button" className="mx-btn mx-btn--pink" onClick={() => jump('layouts')}>See all designs <ArrowRight size={18} /></button>
            <span>Don't see yours? Start with a classic layout and make it your own.</span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- designs strip */}
      <section className="mx-layouts" id="layouts">
        <h2 className="mx-h2">Swipe the <span className="pink">wall</span> of designs.</h2>
        <div className="mx-strip">
          {[...TEMPLATES].filter((t) => !HIDE_ON_LANDING.has(t.id)).sort((a, b) => Number(Boolean(b.niche)) - Number(Boolean(a.niche))).map((t) => {
            const hit = ALL_DESIGNS.find((x) => x.design.template === t.id);
            return (
              <figure key={t.id}>
                <div className="mx-mini"><div className="mx-miniscale">
                  {hit
                    ? <CardRenderer card={applyDesign(sampleFor(base, hit.niche), hit.niche, hit.design)} mode={hit.design.mode} sound={false} />
                    : <CardRenderer card={{ ...base, template: t.id }} mode="light" sound={false} />}
                </div></div>
                <figcaption><b>{hit?.design.name ?? t.name}</b><small>{hit ? hit.niche.name : t.bestFor}</small></figcaption>
              </figure>
            );
          })}
        </div>
      </section>

      <Ticker tone="cyan" items={['Barbershops', 'Nail spas', 'Salons', 'Massage', 'DJs', 'Weddings', 'Realtors', 'Churches', 'Tech']} />

      {/* ---------------------------------------------------------------- pricing */}
      <section className="mx-pricing" id="pricing">
        <h2 className="mx-h2 mx-h2--dark">Start free. <span className="pinkdeep">Go loud</span> for $8.</h2>
        <div className="mx-bill" role="radiogroup" aria-label="Billing">
          <button type="button" role="radio" aria-checked={!yearly} className={!yearly ? 'on' : ''} onClick={() => setYearly(false)}>Monthly</button>
          <button type="button" role="radio" aria-checked={yearly} className={yearly ? 'on' : ''} onClick={() => setYearly(true)}>Yearly <span>Save up to 25%</span></button>
        </div>
        <div className="mx-plans">
          {PLANS.map((p) => {
            const featured = !!p.featured;
            const perCard = !!p.perCard;
            const shown = p.price === 0 ? 0 : yearly ? Math.round((p.yearly / 12) * 100) / 100 : p.price;
            const total = teamTotal(cards, yearly);
            return (
              <article key={p.id} className={`mx-plan ${featured ? 'is-featured' : ''}`}>
                {featured && <span className="mx-sticker mx-sticker--orange s4">Most popular</span>}
                <h3>{p.name}</h3>
                <p className="mx-price"><b>${shown % 1 ? shown.toFixed(2) : shown}</b><span>/{p.price === 0 ? 'forever' : perCard ? 'card a month' : 'month'}</span></p>
                <p className="mx-billnote">{p.price === 0 ? 'No card needed' : yearly ? (perCard ? `Billed $${p.yearly} per card a year` : `Billed $${p.yearly} a year`) : 'Billed monthly, cancel anytime'}</p>
                <p className="mx-pitch">{p.pitch}</p>
                {perCard && (
                  <div className="mx-seats">
                    <span id="seats-l">How many cards?</span>
                    <div className="mx-seats__ctl" role="group" aria-labelledby="seats-l">
                      <button type="button" aria-label="Fewer cards" disabled={cards <= TEAM.min} onClick={() => setCardsRaw(String(clampCards(cards - 1)))}><Minus size={18} /></button>
                      <input type="number" inputMode="numeric" min={TEAM.min} max={TEAM.max} value={cardsRaw} aria-label="Number of cards"
                        onChange={(e) => setCardsRaw(e.target.value)} onBlur={() => setCardsRaw(String(cards))} />
                      <button type="button" aria-label="More cards" disabled={cards >= TEAM.max} onClick={() => setCardsRaw(String(clampCards(cards + 1)))}><Plus size={18} /></button>
                    </div>
                    <p className="mx-seats__total" aria-live="polite">
                      <b>${total.toLocaleString()}</b> {yearly ? `a year (about $${Math.round(total / 12).toLocaleString()} a month)` : 'a month'} for {cards} cards
                    </p>
                  </div>
                )}
                <ul>{p.features.map((f) => <li key={f}><Check size={16} /> {f}</li>)}</ul>
                <Link to={p.price === 0 ? '/signup' : `/signup?plan=${p.id}&billing=${yearly ? 'year' : 'month'}${perCard ? `&cards=${cards}` : ''}`} className={`mx-btn ${featured ? 'mx-btn--navy' : 'mx-btn--pink'}`}>{p.price === 0 ? 'Start free' : `Choose ${p.name}`}</Link>
              </article>
            );
          })}
        </div>
        <p className="mx-founding"><b>Founding members</b> The first {FOUNDING.spots} Pro subscribers lock in ${FOUNDING.price} a month for life.</p>
      </section>

      {/* ---------------------------------------------------------------- studio */}
      <section className="mx-studio" id="studio" aria-labelledby="studio-h">
        <div className="mx-studio__in">
          <header className="mx-studio__head">
            <p className="mx-eyebrow">Sello Studio by Finesse Media</p>
            <h2 id="studio-h" className="mx-dir__h">Want me to build it for you?</h2>
            <p className="mx-dir__sub">I'm a creative director and photographer. I design your card, shoot your portrait and hand you the tap products. Your card lives on Sello, so you can still edit it anytime.</p>
          </header>
          <div className="mx-studio__grid">
            {STUDIO.map((s) => (
              <article key={s.id} className="mx-studio__card">
                <h3>{s.name}</h3>
                <p className="mx-studio__from">from <b>${s.from}</b>{'per' in s ? ` per ${s.per}` : ''}</p>
                <p>{s.blurb}</p>
              </article>
            ))}
          </div>
          <div className="mx-dir__foot">
            <a className="mx-btn mx-btn--pink" href={STUDIO_CONTACT.whatsapp} target="_blank" rel="noopener">Book a free consult <ArrowRight size={18} /></a>
            <a className="mx-studio__mail" href={STUDIO_CONTACT.email}>or email angel@finessemedia.pro</a>
            <span>Studio cards need Sello Pro or Business. Prices are starting points; every project is quoted.</span>
          </div>
        </div>
      </section>

      <footer className="mx-foot">
        <Brand tone="dark" />
        <span>{APP_NAME} by Finesse Media LLC, Deltona, Florida</span>
        <a href="https://www.finessemedia.pro">finessemedia.pro</a>
      </footer>
    </div>
  );
}
