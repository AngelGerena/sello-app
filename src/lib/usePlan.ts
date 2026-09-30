import { useEffect, useState } from 'react';
import { DEMO_PLAN_KEY, store } from './store';
import type { PlanId } from './plans';
import { IS_DEMO } from './supabase';

let cached: PlanId | null = null;
const listeners = new Set<(p: PlanId) => void>();

/** The signed-in owner's plan, fetched once and shared by every screen. */
export function usePlan(): { plan: PlanId; ready: boolean } {
  const [plan, setPlan] = useState<PlanId>(cached ?? 'free');
  const [ready, setReady] = useState(cached !== null);
  useEffect(() => {
    listeners.add(setPlan);
    if (cached === null) store.myPlan().then((p) => { cached = p; listeners.forEach((f) => f(p)); setReady(true); }).catch(() => setReady(true));
    return () => { listeners.delete(setPlan); };
  }, []);
  return { plan, ready };
}

/** Demo only: switch plans to try the gating. */
export function setDemoPlan(p: PlanId) {
  if (!IS_DEMO) return;
  try { localStorage.setItem(DEMO_PLAN_KEY, p); } catch { /* storage blocked */ }
  cached = p;
  listeners.forEach((f) => f(p));
}

/** Call after a real upgrade so screens refresh without a reload. */
export function refreshPlan() { cached = null; store.myPlan().then((p) => { cached = p; listeners.forEach((f) => f(p)); }); }
