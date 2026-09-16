# GAP-06 Spec — Billing webhook + checkout fake → real

## Problem (audit F24)

1. `processStripeWebhook`: `catch {}` menelan `BAD_SIGNATURE` → event dengan
   signature invalid tetap diproses (auth bypass).
2. HMAC dihitung dari `JSON.stringify(event)` (re-serialisasi), bukan raw
   body — tak kompatibel dengan skema tanda Stripe (`t=…,v1=…` atas payload
   mentah).
3. Tanpa `STRIPE_WEBHOOK_SECRET`: verifikasi dilewati diam-diam.
4. Klaim "duplicate guard" tanpa dedup: replay event → audit rows ganda
   (state upsert idempoten, audit tidak).
5. `createCheckoutSession`: stub `cs_${Date.now()}` + `Math.random`,
   checkoutUrl fabrikasi kembali ke successUrl — fake success tanpa Stripe.

## Decision

- Webhook: fail-closed. Secret hilang → 503 BILLING_NOT_CONFIGURED.
  Header hilang → 401 BILLING_SIGNATURE_MISSING. Signature salah → 400
  BILLING_BAD_SIGNATURE. Tanpa catch-swallow.
- Dedup: reuse `withIdempotency` (scope `stripe.webhook`, key `event.id`)
  dalam `db.transaction` — replay mengembalikan respons tersimpan, tanpa
  re-eksekusi dan tanpa audit ganda.
- Checkout: panggil Stripe Checkout Sessions API asli via `fetch`
  (form-encoded, tanpa dependensi baru). Tanpa `STRIPE_SECRET_KEY` atau price
  ID → 503 jujur, tanpa URL palsu, tanpa upsert TRIALING.
- Route webhook: `req.text()` (raw body) → service; parse JSON di service
  agar HMAC atas byte yang ditandatangani.

## Env baru (.env.example)

STRIPE_WEBHOOK_SECRET, STRIPE_SECRET_KEY,
STRIPE_PRICE_GROWTH, STRIPE_PRICE_ENTERPRISE.

## Tests (integration.test.ts)

- valid signature → subscription_updated + 1 audit; replay → replayed, audit tetap 1.
- bad signature → 400, tanpa mutasi.
- missing header → 401. missing secret → 503.
- checkout tanpa key → 503, tanpa upsert TRIALING, tanpa URL `cs_`.

## Runtime

curl dev :3145 webhook (tanpa secret → 503 fail-closed) + checkout POST
(→ 503 jujur); console bersih.
