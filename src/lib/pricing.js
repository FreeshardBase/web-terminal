// Pricing helper — mirrors landing-page/src/components/Pricing.astro.
// Used by the Subscription card to preview the monthly price of a size
// before the buyer is sent to PayPal. Active / Grace states render the
// controller-supplied `price_cents` directly so existing subscribers stay
// grandfathered.

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

export function formatPriceDelta(amount) {
  if (amount == null) return '€—';
  const sign = amount < 0 ? '-' : '+';
  return `${sign}${formatPrice(Math.abs(amount))}`;
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
