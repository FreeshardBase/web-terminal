// Regression test for the multipart upload bug (issue #32).
//
// `$http` is an axios instance created in main.js with a default
// `Content-Type: application/json`. When a FormData body is sent under that
// default, axios' transformRequest serializes the FormData to a JSON string
// and the browser never sets a `multipart/form-data; boundary=...` header, so
// the backend sees no file part and returns 422.
//
// The upload calls override the per-request Content-Type to `undefined`, which
// drops the JSON default and lets axios keep the raw FormData (the browser then
// sets the multipart boundary). We assert on the body reaching the adapter:
// with the override it stays a FormData instance; without it, it would be a
// serialized string.
// Jest 26 ignores the package `exports` map and would load axios' ESM entry,
// which it cannot transform; require the CJS build explicitly.
import axios from 'axios/dist/node/axios.cjs';

// Mirror the instance configured in main.js.
function makeHttp(adapter) {
  const http = axios.create({headers: {'Content-type': 'application/json'}});
  http.defaults.adapter = adapter;
  return http;
}

describe('multipart upload Content-Type override', () => {
  let seen;
  let http;

  beforeEach(() => {
    seen = null;
    http = makeHttp(async (config) => {
      seen = config.data;
      return {data: {}, status: 200, statusText: 'OK', headers: {}, config};
    });
  });

  test('avatar PUT keeps FormData body when Content-Type is cleared', async () => {
    const formData = new FormData();
    formData.append('file', 'avatar-bytes');
    await http.put('/core/protected/identities/default/avatar', formData, {
      headers: {'Content-Type': undefined},
    });
    expect(seen).toBeInstanceOf(FormData);
  });

  test('custom app POST keeps FormData body when Content-Type is cleared', async () => {
    const formData = new FormData();
    formData.append('file', 'app-bytes');
    await http.post('/core/protected/apps', formData, {
      headers: {'Content-Type': undefined},
    });
    expect(seen).toBeInstanceOf(FormData);
  });

  test('regression: the JSON default alone serializes FormData to a string', async () => {
    const formData = new FormData();
    formData.append('file', 'avatar-bytes');
    await http.put('/core/protected/identities/default/avatar', formData);
    expect(typeof seen).toBe('string');
    expect(seen).not.toBeInstanceOf(FormData);
  });
});
