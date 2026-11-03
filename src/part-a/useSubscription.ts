import { useEffect, useState } from "react";
import { getSubscription } from "../api/mockApi";
import { ApiError, type Subscription } from "../api/types";
import { reloadSubscription, skipShipment } from "./scenarioApi";
import { applySkip, buildView, type LocalChanges } from "./subscriptionView";

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

  return { state, view, retry: () => setAttempt((value) => value + 1), skip, refresh, changeFrequency };
}
