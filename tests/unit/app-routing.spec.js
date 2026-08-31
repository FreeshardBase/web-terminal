// The entry decision in App.vue: a confirmation link has to reach its screen
// even on a browser that was never paired with this shard, which is exactly the
// case the anonymous redirect to /welcome would otherwise swallow.

import {createLocalVue, shallowMount} from '@vue/test-utils';
import VueRouter from 'vue-router';
import App from '@/App';
import routes from '@/router';

const localVue = createLocalVue();
localVue.use(VueRouter);

function fakeStore(isAnonymous) {
  return {
    dispatch: jest.fn(() => Promise.resolve()),
    commit: jest.fn(),
    state: {
      meta: {is_anonymous: isAnonymous},
      websocket: {disconnectedSince: null},
    },
  };
}

async function mountApp({search, isAnonymous}) {
  window.history.replaceState({}, '', `/${search}`);
  const router = new VueRouter({routes: routes.options.routes});
  const wrapper = shallowMount(App, {
    localVue,
    router,
    mocks: {$store: fakeStore(isAnonymous)},
  });
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
  return wrapper;
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

test('an unpaired browser opening a confirmation link lands on the confirm screen', async () => {
  const wrapper = await mountApp({search: '?confirm_email=the-token', isAnonymous: true});
  expect(wrapper.vm.$route.name).toBe('ConfirmEmail');
});

test('a paired browser opening a confirmation link lands there too', async () => {
  const wrapper = await mountApp({search: '?confirm_email=the-token', isAnonymous: false});
  expect(wrapper.vm.$route.name).toBe('ConfirmEmail');
});

test('an unpaired browser without a confirmation link still goes to the public page', async () => {
  const wrapper = await mountApp({search: '', isAnonymous: true});
  expect(wrapper.vm.$route.name).toBe('Welcome');
});

test('a paired browser without a confirmation link is left where it is', async () => {
  const wrapper = await mountApp({search: '', isAnonymous: false});
  expect(wrapper.vm.$route.name).toBe('Shard');
});

test('reloading on the confirm screen with the token still in the URL finishes loading', async () => {
  // $router.replace to the route it is already on rejects with NavigationDuplicated,
  // and that rejection would escape beforeMount and strand the loading splash.
  window.history.replaceState({}, '', '/?confirm_email=the-token#/confirm-email');
  const router = new VueRouter({routes: routes.options.routes});
  await router.replace('/confirm-email').catch(() => {});
  const wrapper = shallowMount(App, {
    localVue,
    router,
    mocks: {$store: fakeStore(true)},
  });
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
  expect(wrapper.vm.$route.name).toBe('ConfirmEmail');
  expect(wrapper.vm.loading).toBe(false);
});
