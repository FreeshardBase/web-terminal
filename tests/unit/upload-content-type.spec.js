// Regression test for the multipart upload bug (issue #32).
//
// `$http` is an axios instance created in main.js with a default
// `Content-Type: application/json`. Sending a FormData body under that default
// makes axios serialize the FormData to a JSON string, so the browser never
// sets a `multipart/form-data; boundary=...` header, the backend sees no file
// part, and returns 422.
//
// The upload methods clear the per-request Content-Type so axios keeps the raw
// FormData and the browser sets the multipart boundary itself. The first two
// tests drive the real component methods and assert on the config they hand to
// `$http`, so deleting the override from the source fails them. The third test
// pins the axios behavior that makes `undefined` the correct value to send.
import Public from '@/views/Public.vue';
import Apps from '@/views/Apps.vue';

describe('multipart uploads clear the JSON Content-Type', () => {
  test('Public.uploadAvatar sends FormData with Content-Type cleared', async () => {
    const put = jest.fn().mockResolvedValue({});
    const ctx = {$http: {put}, refreshAvatar: jest.fn()};

    await Public.methods.uploadAvatar.call(ctx, {
      value: 'avatar-bytes',
      doneCallback: jest.fn(),
    });

    expect(put).toHaveBeenCalledTimes(1);
    const [url, body, config] = put.mock.calls[0];
    expect(url).toBe('/core/protected/identities/default/avatar');
    expect(body).toBeInstanceOf(FormData);
    expect(config).toBeDefined();
    expect(config.headers['Content-Type']).toBeUndefined();
  });

  test('Apps.uploadCustomApp posts each file with Content-Type cleared', async () => {
    const post = jest.fn().mockResolvedValue({});
    const ctx = {
      customAppFiles: ['app-a', 'app-b'],
      $http: {post},
      $bvModal: {hide: jest.fn()},
      refresh: jest.fn(),
    };

    await Apps.methods.uploadCustomApp.call(ctx);

    expect(post).toHaveBeenCalledTimes(2);
    for (const [url, body, config] of post.mock.calls) {
      expect(url).toBe('/core/protected/apps');
      expect(body).toBeInstanceOf(FormData);
      expect(config).toBeDefined();
      expect(config.headers['Content-Type']).toBeUndefined();
    }
  });

  // Pins why `undefined` is the right value: run a FormData body through an
  // instance shaped like main.js and confirm clearing the Content-Type leaves
  // the body as FormData, whereas the JSON default alone serializes it to a
  // string. Jest 26 ignores axios' `exports` map and would load its ESM entry,
  // which it cannot transform, so require the CJS build explicitly.
  test('clearing Content-Type keeps the FormData body; the default serializes it', async () => {
    const axios = require('axios/dist/node/axios.cjs');
    let seen;
    const http = axios.create({headers: {'Content-type': 'application/json'}});
    http.defaults.adapter = async (config) => {
      seen = config.data;
      return {data: {}, status: 200, statusText: 'OK', headers: {}, config};
    };

    const cleared = new FormData();
    cleared.append('file', 'bytes');
    await http.put('/x', cleared, {headers: {'Content-Type': undefined}});
    expect(seen).toBeInstanceOf(FormData);

    const defaulted = new FormData();
    defaulted.append('file', 'bytes');
    await http.put('/x', defaulted);
    expect(typeof seen).toBe('string');
  });
});
