import {
  centsToEur,
  computeMonthlyPrice,
  formatPrice,
  grossPriceCentsFromComponents,
  vatAmountEur,
} from '@/lib/pricing';

describe('computeMonthlyPrice', () => {
  // (11.00 + 30*0.04) * 1.5 * 1.19 = 21.78
  test('s + 30GB => 21.78', () => {
    expect(computeMonthlyPrice('s', 30)).toBe(21.78);
  });

  // (5.50 + 20*0.04) * 1.5 * 1.19 = 11.25
  test('xs + 20GB => 11.25', () => {
    expect(computeMonthlyPrice('xs', 20)).toBe(11.25);
  });

  // (102.00 + 400*0.04) * 1.5 * 1.19 = 210.63
  test('xl + 400GB => 210.63', () => {
    expect(computeMonthlyPrice('xl', 400)).toBe(210.63);
  });

  // (19.80 + 250*0.04) * 1.5 * 1.19 = 53.19
  test('m + 250GB => 53.19', () => {
    expect(computeMonthlyPrice('m', 250)).toBe(53.19);
  });

  test('missing vmSize => null', () => {
    expect(computeMonthlyPrice(undefined, 30)).toBeNull();
  });

  test('missing volumeSizeGb => null', () => {
    expect(computeMonthlyPrice('s', undefined)).toBeNull();
  });

  test('unknown vmSize => null', () => {
    expect(computeMonthlyPrice('unknown', 30)).toBeNull();
  });
});

describe('formatPrice', () => {
  test('formats a number with 2 decimals', () => {
    expect(formatPrice(21.3)).toBe('€21.30');
  });

  test('returns dash for null', () => {
    expect(formatPrice(null)).toBe('€—');
  });
});

describe('centsToEur', () => {
  test('converts cents to euros', () => {
    expect(centsToEur(2130)).toBe(21.30);
  });
});

describe('vatAmountEur', () => {
  // VAT share of a gross price: gross - round(gross/1.19)
  test('s + 30GB gross 2178c => 3.48', () => {
    expect(vatAmountEur(2178)).toBe(3.48);
  });
  test('m + 100GB gross 4248c => 6.78', () => {
    expect(vatAmountEur(4248)).toBe(6.78);
  });
  test('xl + 400GB gross 21063c => 33.63', () => {
    expect(vatAmountEur(21063)).toBe(33.63);
  });
  test('null => null', () => {
    expect(vatAmountEur(null)).toBeNull();
  });
});

describe('grossPriceCentsFromComponents', () => {
  // The block GET /api/shards/self/prices embeds as `components`.
  const components = {
    currency: 'EUR',
    net_prices: [
      {vm_size: 'xs', net_price_cents: 825},
      {vm_size: 's', net_price_cents: 1650},
      {vm_size: 'm', net_price_cents: 2970},
      {vm_size: 'l', net_price_cents: 7650},
      {vm_size: 'xl', net_price_cents: 15300},
    ],
    disk_net_price_cents_per_gb: 6,
    vat_rate: 0.19,
  };

  test('s + 30GB => 2178 cents', () => {
    expect(grossPriceCentsFromComponents(components, 's', 30)).toBe(2178);
  });

  test('xs + 30GB => 1196 cents', () => {
    expect(grossPriceCentsFromComponents(components, 'xs', 30)).toBe(1196);
  });

  test('xl + 400GB => 21063 cents', () => {
    expect(grossPriceCentsFromComponents(components, 'xl', 400)).toBe(21063);
  });

  // Half-cent result: half-up gives 3749, banker's rounding would give 3748.
  test('s + 250GB rounds half-up to 3749 cents', () => {
    expect(grossPriceCentsFromComponents(components, 's', 250)).toBe(3749);
  });

  // Grouping: cents-first arithmetic yields 19100 here, euro-first 19099.
  test('m + 2180GB groups in euro and yields 19099 cents', () => {
    expect(grossPriceCentsFromComponents(components, 'm', 2180)).toBe(19099);
  });

  test('matches centsToEur/formatPrice for display', () => {
    const cents = grossPriceCentsFromComponents(components, 's', 30);
    expect(formatPrice(centsToEur(cents))).toBe('\u20ac21.78');
  });

  test('unknown vm size => null', () => {
    expect(grossPriceCentsFromComponents(components, 'xxl', 30)).toBeNull();
  });

  test('missing components => null', () => {
    expect(grossPriceCentsFromComponents(null, 's', 30)).toBeNull();
  });

  test('missing disk size => null', () => {
    expect(grossPriceCentsFromComponents(components, 's', undefined)).toBeNull();
  });
});
