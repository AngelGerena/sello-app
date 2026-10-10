import { useEffect, useState } from 'react';
import { DEMO_PLAN_KEY, DEMO_SEATS_KEY, store } from './store';
import { TEAM, type PlanId } from './plans';
import { IS_DEMO } from './supabase';

interface PlanInfo { plan: PlanId; seats: number | null }
let cached: PlanInfo | null = null;
const listeners = new Set<(p: PlanInfo) => void>();
const publish = (p: PlanInfo) => { cached = p; listeners.forEach((f) => f(p)); };

/** The signed-in owner's plan (and, for Business, how many cards they pay for), fetched once and shared by every screen. */
export function usePlan(): { plan: PlanId; seats: number | null; ready: boolean } {
  const [info, setInfo] = useState<PlanInfo>(cached ?? { plan: 'free', seats: null });
  const [ready, setReady] = useState(cached !== null);
  useEffect(() => {
    listeners.add(setInfo);
    if (cached === null) store.myPlanDetail().then((p) => { publish(p); setReady(true); }).catch(() => setReady(true));
    return () => { listeners.delete(setInfo); };
  }, []);
  return { plan: info.plan, seats: info.seats, ready };
}

/** Demo only: switch plans to try the gating. */
export function setDemoPlan(p: PlanId, seats = TEAM.initial) {
  if (!IS_DEMO) return;
  try { localStorage.setItem(DEMO_PLAN_KEY, p); localStorage.setItem(DEMO_SEATS_KEY, String(seats)); } catch { /* storage blocked */ }
  publish({ plan: p, seats: p === 'team' ? seats : null });
}

/** Call after a real upgrade so screens refresh without a reload. */
export function refreshPlan() { cached = null; store.myPlanDetail().then(publish); }
