import { useEffect, useState } from "react";
import { getSubscription } from "../api/mockApi";
import { ApiError, type Subscription, type SubscriptionItem } from "../api/types";
import { reloadSubscription, simulatedWait, skipShipment } from "./scenarioApi";
import {
  applyCancel,
  applyPause,
  applyReactivate,
  applyResume,
  applySimulatedSkip,
  applySkip,
  buildView,
  type LocalChanges,
} from "./subscriptionView";

export type LoadState =
  | { phase: "loading" }
  | { phase: "failed"; errorStatus: number | null }
  | { phase: "ready"; server: Subscription };

export function useSubscription() {
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [attempt, setAttempt] = useState(0);
  const [changes, setChanges] = useState<LocalChanges>({});

  useEffect(() => {
    let current = true;
    setState({ phase: "loading" });
    getSubscription()
      .then((server) => {
        if (current) setState({ phase: "ready", server });
      })
      .catch((error: unknown) => {
        if (current) setState({ phase: "failed", errorStatus: error instanceof ApiError ? error.status : null });
      });
    return () => {
      current = false;
    };
  }, [attempt]);

  const view = state.phase === "ready" ? buildView(state.server, changes) : null;

  async function skip() {
    if (state.phase !== "ready" || !view) return;
    if (state.server.status !== "active") {
      await simulatedWait();
      setChanges((current) => applySimulatedSkip(current, view));
      return;
    }
    const after = await skipShipment({
      subscriptionId: state.server.id,
      expectedUpdatedAt: state.server.updatedAt,
    });
    setChanges((current) => applySkip(current, view, after));
    setState({ phase: "ready", server: after });
  }

  async function refresh() {
    const server = await reloadSubscription();
    setState({ phase: "ready", server });
    return buildView(server, changes);
  }

  function changeFrequency(days: number) {
    setChanges((current) => ({ ...current, intervalDays: days }));
  }

  function changeProducts(items: SubscriptionItem[], couponPercent: number | null) {
    setChanges((current) => ({ ...current, items, couponPercent: couponPercent ?? current.couponPercent }));
  }

  function applyCoupon(percent: number) {
    setChanges((current) => ({ ...current, couponPercent: percent }));
  }

  function pause(days: number) {
    setChanges((current) => applyPause(current, days));
  }

  function resume() {
    if (state.phase === "ready") setChanges((current) => applyResume(state.server, current));
  }

  function cancel() {
    setChanges((current) => applyCancel(current));
  }

  function reactivate() {
    if (state.phase === "ready") setChanges((current) => applyReactivate(state.server, current));
  }

  return {
    state,
    view,
    retry: () => setAttempt((value) => value + 1),
    skip,
    refresh,
    changeFrequency,
    changeProducts,
    applyCoupon,
    pause,
    resume,
    cancel,
    reactivate,
  };
}
