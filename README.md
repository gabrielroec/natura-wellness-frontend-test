# Natura Wellness frontend test

Natura Wellness is a fictional brand made up for this test. The full brief is in `INSTRUCTIONS.md`.

**Live link:** https://natura-wellness-frontend-test-six.vercel.app

```
npm install
npm run dev
npm test
```

- **Part A:** `src/part-a/SubscriptionCard.tsx`, "Manage my subscription". It's the default route.
- **Part B:** `src/part-b/BuyBox.tsx`, the purchase box from `public/reference/buy-box.png`. Open `/?part=b`.

## Test cases

Fixture dates are relative to today, so the dates on screen change from day to day. The extra parameters in the second half of the table are mine. They stay on in production so each failure can be opened directly.

| Case | Link |
| --- | --- |
| Active, skip always succeeds | [`?fixture=active&conflict=never`](https://natura-wellness-frontend-test-six.vercel.app/?part=a&fixture=active&conflict=never) |
| Active, random conflict (about 1 in 3, from the mock API) | [`?fixture=active`](https://natura-wellness-frontend-test-six.vercel.app/?part=a&fixture=active) |
| Skip always conflicts (409) | [`&conflict=always`](https://natura-wellness-frontend-test-six.vercel.app/?part=a&fixture=active&conflict=always) |
| Paused | [`?fixture=paused`](https://natura-wellness-frontend-test-six.vercel.app/?part=a&fixture=paused) |
| Cancelled | [`?fixture=cancelled`](https://natura-wellness-frontend-test-six.vercel.app/?part=a&fixture=cancelled) |
| Page fails to load | [`?fixture=error`](https://natura-wellness-frontend-test-six.vercel.app/?part=a&fixture=error) |
| Subscription not found | [`?fixture=nope`](https://natura-wellness-frontend-test-six.vercel.app/?part=a&fixture=nope) |
| Skip rejected (`400`, `404` or `500`) | [`&skipError=500`](https://natura-wellness-frontend-test-six.vercel.app/?part=a&fixture=active&conflict=never&skipError=500) |
| Reload fails after a 409 | [`&reloadError=500`](https://natura-wellness-frontend-test-six.vercel.app/?part=a&fixture=active&conflict=always&reloadError=500) |
| Paused elsewhere during a skip | [`&changedTo=paused`](https://natura-wellness-frontend-test-six.vercel.app/?part=a&fixture=active&conflict=always&changedTo=paused) |
| Cancelled elsewhere during a skip | [`&changedTo=cancelled`](https://natura-wellness-frontend-test-six.vercel.app/?part=a&fixture=active&conflict=always&changedTo=cancelled) |
| Part B | [`?part=b`](https://natura-wellness-frontend-test-six.vercel.app/?part=b) |

## Part A decisions

Only reading and skipping exist in the mock API. Everything else is simulated in local state and is lost on reload, which the brief allows. Local changes live apart from the API data and are merged in `buildView`, so an API response never erases them.

**Skip**

- A confirmation sheet shows the current date, the new date and the amount, because accidental skips create support tickets.
- After a 409, the page reloads the latest data and asks again. It never retries on its own.
- A repeated 409 keeps "Try again" and adds a contact support form. The form is simulated, because the brief gives no support channel.
- There's no undo, because the API has none. Each customer gets one skip, then a note replaces the button and points to support.

**Cancel: 4 taps, and no trap**

Open, pick a reason, "Continue to cancel", confirm. A reason is required, and every reason leads to an offer. "Continue to cancel" is always a full-size button, visible without scrolling on phones from 320×640 up, with no guilt copy. The offer is deliberately more colorful than the button, which trades equal prominence for conversion.

| Reason (share of cancellations) | Active | Paused |
| --- | --- | --- |
| Too much product left (38%) | Skip, or deliver every 60 days | Deliver every 60 days |
| Costs too much (24%) | Reduce quantity, or pause; choosing pause shows a 10% coupon with "Pause anyway" | 10% coupon, or reduce quantity |
| Trying a different product (15%) | Swap a product | Swap a product |
| Didn't see results (12%) | Try another product, with 5% off | Same |
| Other (11%) | Optional text, then try another product with 5% off | Same |

- "Didn't see results" promises nothing about results.
- Offers that can't apply disappear: no skip once it's used, 90 days if already on 60, no "reduce" when every quantity is 1. If none remain, active subscriptions get pause and paused ones get the 10% coupon.
- Cancelling removes any coupon, and the confirmation says so.
- Reactivating shows the date and amount first. The next charge is today plus the interval, and a new skip becomes available.

**Coupons are my assumption, not part of the brief.** There's one at a time, it applies to the next charge only, and there's no code to enter. The page shows the discount and what the customer pays afterwards. The 5% only applies if a product is really swapped.

**Other actions**

- **Pause:** 30, 60 or 90 days, then it returns on its own. Resuming shows the date and amount first, using the original date if it's still ahead, otherwise today plus the interval.
- **Frequency:** 30, 60 or 90 days. The next charge date doesn't move.
- **Products:** swap and change quantity, with a minimum of 1 and the new total shown before saving.
- **Paused page:** can change frequency, products and quantity, resume or cancel. It offers no skip.

**Traps in the mock API**

- A double click would send two skips and cause a false 409, so the button locks while one is running.
- After any conflict the old `updatedAt` always fails, so the page reloads before asking again.
- Per-line discounts add up to $101.88 but the API total is $101.87, so per-line prices stay undiscounted and the page shows the API total.
- "In 6 days" counts calendar days. Dividing by 24 hours would say 5.
- The multivitamin has no image, so it gets a lettered placeholder.

## Part B

Pixel comparison against the reference at 1200px: 98.42% of pixels identical, and none differ by more than 8 levels outside text and icons. Choosing an option, frequency or quantity updates the total and the fine print. Frequency doesn't change the price, because the reference has no rule for that.

## How it was checked

The browser and pixel scripts were kept out of this repo, on purpose, so it holds only the app and its logic tests. They used real mouse and keyboard events in Chrome.

| Check | Result |
| --- | --- |
| `npm test` (Vitest, logic only) | 50 tests pass |
| Random action sequences compared against an independent model (6 runs, 108 actions) | 1,711 checks, 0 failures; the same test caught two faults injected on purpose |
| 13 widths from 320px to 1600px | 247 screen states, no sideways scrolling or overflow |
| Accessibility: Chrome's accessibility tree, keyboard order, focus trap and rings, AA contrast, 44px targets, reduced motion | 291 checks; the only 2 flags were text labels of form fields counted as targets, which is a false positive |
| The live link, with no login | 24 of 24 checks, 0 console errors |
| Part B unchanged while Part A was built | 0 pixels differ, on the live link too |

**Not tested:** a real screen reader (only the accessibility tree that one would read), real phones, and browsers other than Chrome.

## Left out, and known limits

- No adding or removing products and no order bump, because a customer who is leaving doesn't want to spend more.
- The "Other" text and the support form go nowhere, because there's no API for them.
- A swap only compares SKUs. The catalog doesn't list what's inside the bundle, so Vitamin D plus the bundle is allowed.
- There's no maximum quantity; the only rule is a minimum of 1.
- After a skip, a 30-day pause can end before the moved charge date, so "you'll be charged then" is imprecise in that one case.
- For 400 ms after a sheet changes step, taps are ignored so a double tap can't confirm something by accident. A very fast second tap has to be repeated.
- In Part B, four texts are under AA contrast and some targets are under 44px. They match the reference, which I was asked to reproduce.
