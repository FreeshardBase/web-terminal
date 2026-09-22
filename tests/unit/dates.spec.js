import { formatDate } from '@/lib/dates';

describe('formatDate', () => {
  test('renders the calendar day the charge falls on', () => {
    expect(formatDate('2026-07-01T13:30:00')).toBe('2026-07-01');
  });

  test('carries no clock time, which the billing line does not need', () => {
    expect(formatDate('2026-07-01T13:30:00'))
        .toBe(formatDate('2026-07-01T01:30:00'));
  });
});
