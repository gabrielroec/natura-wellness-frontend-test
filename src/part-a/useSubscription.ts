import { useEffect, useState } from "react";
import { getSubscription } from "../api/mockApi";
import { ApiError, type Subscription } from "../api/types";

export type LoadState =
  | { phase: "loading" }
  | { phase: "failed"; errorStatus: number | null }
  | { phase: "ready"; server: Subscription };

export function useSubscription() {
  const [state, setState] = useState<LoadState>({ phase: "loading" });
  const [attempt, setAttempt] = useState(0);

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

  return { state, retry: () => setAttempt((value) => value + 1) };
}
