import {
  centsToEur,
  computeMonthlyPrice,
  formatPrice,
} from '@/lib/pricing';

describe('computeMonthlyPrice', () => {
  // (11.00 + 30*0.04 + 3.00) * 1.5 = 22.80
  test('s + 30GB => 22.80', () => {
    expect(computeMonthlyPrice('s', 30)).toBe(22.80);
  });

  // (5.50 + 20*0.04 + 3.00) * 1.5 = 13.95
  test('xs + 20GB => 13.95', () => {
    expect(computeMonthlyPrice('xs', 20)).toBe(13.95);
  });

  // (102.00 + 400*0.04 + 3.00) * 1.5 = 181.50
  test('xl + 400GB => 181.50', () => {
    expect(computeMonthlyPrice('xl', 400)).toBe(181.50);
  });

  // (19.80 + 250*0.04 + 3.00) * 1.5 = 49.20
  test('m + 250GB => 49.20', () => {
    expect(computeMonthlyPrice('m', 250)).toBe(49.20);
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
