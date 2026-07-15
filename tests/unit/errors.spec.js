import { errorMessage } from '@/lib/errors';

describe('errorMessage', () => {
  test('prefers the detail field of an API error response', () => {
    const error = {
      message: 'Request failed with status code 401',
      response: {data: {detail: 'This pairing code has expired.'}},
    };
    expect(errorMessage(error)).toBe('This pairing code has expired.');
  });

  test('falls back to error/message fields of the response body', () => {
    expect(errorMessage({response: {data: {error: 'boom'}}})).toBe('boom');
    expect(errorMessage({response: {data: {message: 'boom'}}})).toBe('boom');
  });

  test('uses a plain-string response body as-is', () => {
    expect(errorMessage({response: {data: 'Bad Gateway'}})).toBe('Bad Gateway');
  });

  test('falls back to the axios message when there is no response', () => {
    expect(errorMessage({message: 'Network Error'})).toBe('Network Error');
  });

  test('handles an error with neither response nor message', () => {
    expect(errorMessage('kaboom')).toBe('kaboom');
  });
});
