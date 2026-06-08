import {
  centsToEur,
  computeMonthlyPrice,
  formatPrice,
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
