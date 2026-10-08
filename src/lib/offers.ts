import { useEffect, useState } from 'react';
import { IS_DEMO, supabase } from './supabase';

/* The founding offer is configured and enforced in the database (fc_offer_config, fc_claim_founding).
   The website only READS the public status, so the price, the spots left and the terms shown on every screen
   come from one place. If the status can not be read (for example before the migration is applied), the site
   says nothing about the offer rather than promising something it can not confirm. */
export interface Offer { known: boolean; active: boolean; left: number; spots: number; cents: number }
const UNKNOWN: Offer = { known: false, active: false, left: 0, spots: 0, cents: 0 };

let cached: Offer | null = null;
const subs = new Set<(o: Offer) => void>();
const publish = (o: Offer) => { cached = o; subs.forEach((f) => f(o)); };

export function useOffer(): Offer {
  const [o, setO] = useState<Offer>(cached ?? UNKNOWN);
  useEffect(() => {
    subs.add(setO);
    if (!cached) {
      if (IS_DEMO) publish({ known: true, active: true, left: 100, spots: 100, cents: 500 });
      else supabase.rpc('fc_offer_status').then(
        ({ data, error }) => publish(error || !data?.configured ? UNKNOWN : { known: true, active: !!data.active, left: data.left, spots: data.spots, cents: data.price_cents }),
        () => publish(UNKNOWN),
      );
    }
    return () => { subs.delete(setO); };
  }, []);
  return o;
}

/** "$5" from cents. */
export const dollars = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`;
