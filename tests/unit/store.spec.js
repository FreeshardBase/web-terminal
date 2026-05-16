// Tests for the Vuex `handle_websocket_message` action. We drive the real
// store via `store.dispatch(...)` and assert side effects via the http
// client stub: `force_query_profile_data` hits a specific endpoint with
// `?refresh=true`, so its presence in the captured http calls is a
// reliable proxy for "did the action chain dispatch to it".

import store from '@/store';

const FORCE_PROFILE_URL = '/core/protected/management/profile?refresh=true';

describe('handle_websocket_message', () => {
  let httpGet;

  beforeEach(() => {
    httpGet = jest.fn().mockResolvedValue({data: {}});
    // store._vm is the internal Vue instance; store actions use
    // `this._vm.$http`. Stub it so force_query_profile_data is observable
    // and side-effect-free.
    store._vm.$http = {get: httpGet};
  });

  test('dispatches force_query_profile_data on subscription_updated', async () => {
    await store.dispatch('handle_websocket_message', {
      message_type: 'subscription_updated',
    });
    expect(httpGet).toHaveBeenCalledWith(FORCE_PROFILE_URL);
  });

  test('does not refresh profile on terminals_update', async () => {
    await store.dispatch('handle_websocket_message', {
      message_type: 'terminals_update',
      message: [],
    });
    expect(httpGet).not.toHaveBeenCalledWith(FORCE_PROFILE_URL);
    expect(store.state.terminals).toEqual([]);
  });

  test('does not throw on unknown message type', async () => {
    await expect(
      store.dispatch('handle_websocket_message', {
        message_type: 'something_new',
      }),
    ).resolves.not.toThrow();
    expect(httpGet).not.toHaveBeenCalled();
  });
});
