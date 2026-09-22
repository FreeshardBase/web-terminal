import { formatDateTime } from '@/lib/dates';

describe('formatDateTime', () => {
  test('renders the absolute date and time', () => {
    expect(formatDateTime('2026-07-01T13:30:00')).toBe('2026-07-01 13:30');
  });

  test('tells afternoon from morning', () => {
    expect(formatDateTime('2026-07-01T13:30:00'))
        .not.toBe(formatDateTime('2026-07-01T01:30:00'));
  });
});
