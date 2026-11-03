import { getSubscription, skipNextShipment } from "../api/mockApi";
import { ApiError, type Subscription } from "../api/types";
import { addDays } from "../utils/dates";

// Failures the mock API can't produce from the URL, so they can be tested by hand:
//   &skipError=400|404|500         the skip is rejected with that status
//   &reloadError=500               reloading after a 409 fails (use with &conflict=always)
//   &changedTo=paused|cancelled    the status changed elsewhere (use with &conflict=always)

const params = new URLSearchParams(window.location.search);
const skipError = Number(params.get("skipError"));
const reloadError = Number(params.get("reloadError"));
const changedTo = params.get("changedTo");

const SIMULATED_WAIT_MS = 800;
const PAUSE_DAYS = 30;

export function simulatedWait() {
  return new Promise((resolve) => setTimeout(resolve, SIMULATED_WAIT_MS));
}

export async function skipShipment(request: Parameters<typeof skipNextShipment>[0]) {
  if (!skipError) return skipNextShipment(request);
  await simulatedWait();
  throw new ApiError(skipError, "Simulated failure");
}

export async function reloadSubscription(): Promise<Subscription> {
  const server = await getSubscription();
  if (reloadError) throw new ApiError(reloadError, "Simulated failure");

  const now = new Date().toISOString();
  const inactive = { ...server, nextChargeAt: null, nextChargeTotalCents: null };
  if (changedTo === "paused") return { ...inactive, status: "paused", pausedUntil: addDays(now, PAUSE_DAYS) };
  if (changedTo === "cancelled") return { ...inactive, status: "cancelled", cancelledAt: now };
  return server;
}
