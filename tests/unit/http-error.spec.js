import {errorDetail} from '@/lib/http-error';

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
