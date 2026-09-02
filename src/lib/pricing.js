// Pricing helper — mirrors landing-page/src/components/Pricing.astro.
// Used by the Subscription card to compute the Subscribe / Reactivate
// button label. Active / Grace states render the controller-supplied
// `price_cents` directly so existing subscribers stay grandfathered.

export const VM_PRICING_EUR = {
  xs: 5.50,
  s: 11.00,
  m: 19.80,
  l: 51.00,
  xl: 102.00,
};

export const DISK_PRICE_PER_GB_EUR = 0.04;
export const MARGIN_MULTIPLIER = 1.5;
export const VAT_MULTIPLIER = 1.19;

export function computeMonthlyPrice(vmSize, volumeSizeGb) {
  if (!vmSize) return null;
  const vmCost = VM_PRICING_EUR[vmSize];
  if (vmCost === undefined) return null;
  if (!Number.isFinite(volumeSizeGb)) return null;
  const total =
    (vmCost + volumeSizeGb * DISK_PRICE_PER_GB_EUR) *
    MARGIN_MULTIPLIER *
    VAT_MULTIPLIER;
  return Math.round(total * 100) / 100;
}

export function formatPrice(amount) {
  if (amount == null) return '€—';
  return `€${amount.toFixed(2)}`;
}

export function centsToEur(cents) {
  if (cents == null) return null;
  return Math.round(cents) / 100;
}

// VAT share of a gross price (gross already includes 19% VAT), in euros.
export function vatAmountEur(grossCents) {
  if (grossCents == null) return null;
  const net = Math.round(grossCents / VAT_MULTIPLIER);
  return (grossCents - net) / 100;
}

// Gross monthly price in integer cents, recomputed from the controller's published
// `components` block. Mirrors `compute_price` in the controller's
// `freeshard_controller/service/pricing.py`, whose arithmetic it must reproduce
// exactly: each component to euro before combining, then half-up rounding
// (Math.round, not toFixed and not banker's rounding).
export function grossPriceCentsFromComponents(components, vmSize, volumeSizeGb) {
  if (!components || !Array.isArray(components.net_prices)) return null;
  if (!Number.isFinite(volumeSizeGb)) return null;
  if (!Number.isFinite(components.disk_net_price_cents_per_gb)) return null;
  if (!Number.isFinite(components.vat_rate)) return null;
  const entry = components.net_prices.find((p) => p.vm_size === vmSize);
  if (!entry || !Number.isFinite(entry.net_price_cents)) return null;
  const netEur =
    entry.net_price_cents / 100 +
    volumeSizeGb * (components.disk_net_price_cents_per_gb / 100);
  const grossEur = netEur * (1 + components.vat_rate);
  return Math.round(grossEur * 100);
}
