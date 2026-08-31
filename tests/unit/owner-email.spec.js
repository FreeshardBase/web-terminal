import {
  errorDetail,
  isDeliveryFailure,
  ownerEmailState,
  readConfirmEmailToken,
} from '@/lib/owner-email';

describe('readConfirmEmailToken', () => {
  test('reads the token the controller puts in the mail link', () => {
    expect(readConfirmEmailToken('?confirm_email=abc123')).toBe('abc123');
  });

  test('decodes a percent-encoded token', () => {
    expect(readConfirmEmailToken('?confirm_email=a%2Bb%2Fc')).toBe('a+b/c');
  });

  test('finds the token next to other parameters', () => {
    expect(readConfirmEmailToken('?sub=cancel&confirm_email=abc')).toBe('abc');
  });

  test('is null without the parameter', () => {
    expect(readConfirmEmailToken('?sub=cancel')).toBeNull();
    expect(readConfirmEmailToken('')).toBeNull();
    expect(readConfirmEmailToken(undefined)).toBeNull();
  });

  test('is null for an empty token', () => {
    expect(readConfirmEmailToken('?confirm_email=')).toBeNull();
  });
});

describe('ownerEmailState', () => {
  test('is none without any address', () => {
    expect(ownerEmailState({email: null, pending_email: null})).toBe('none');
    expect(ownerEmailState(null)).toBe('none');
  });

  test('is set for a live address', () => {
    expect(ownerEmailState({email: 'a@b.c', pending_email: null})).toBe('set');
  });

  test('is pending for a candidate, live address or not', () => {
    expect(ownerEmailState({email: null, pending_email: 'a@b.c'})).toBe('pending');
    expect(ownerEmailState({email: 'old@b.c', pending_email: 'new@b.c'})).toBe('pending');
  });
});

describe('isDeliveryFailure', () => {
  test('is true only for 502', () => {
    expect(isDeliveryFailure({response: {status: 502}})).toBe(true);
    expect(isDeliveryFailure({response: {status: 429}})).toBe(false);
    expect(isDeliveryFailure({response: {status: 500}})).toBe(false);
    expect(isDeliveryFailure(new Error('Network Error'))).toBe(false);
  });
});

describe('errorDetail', () => {
  test('prefers the API detail', () => {
    expect(errorDetail({response: {data: {detail: 'nope'}}}, 'fallback')).toBe('nope');
  });

  test('joins the messages of a validation error', () => {
    const error = {response: {data: {detail: [{msg: 'invalid email'}, {msg: 'too long'}]}}};
    expect(errorDetail(error, 'fallback')).toBe('invalid email; too long');
  });

  test('falls back to the transport error when there is no response', () => {
    expect(errorDetail(new Error('Network Error'), 'fallback')).toBe('Network Error');
  });

  test('falls back to the given text when there is nothing else', () => {
    expect(errorDetail({response: {data: ''}}, 'fallback')).toBe('fallback');
  });
});
