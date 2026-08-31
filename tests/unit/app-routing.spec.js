// The entry decision in App.vue: a confirmation link has to reach its screen
// even on a browser that was never paired with this shard, which is exactly the
// case the anonymous redirect to /welcome would otherwise swallow.

import {createLocalVue, shallowMount} from '@vue/test-utils';
import VueRouter from 'vue-router';
import App from '@/App';
import router from '@/router';

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

// A fresh router per test, over the real route table: the shared instance
// would carry the previous test's route.
function freshRouter() {
  return new VueRouter({routes: router.options.routes});
}

async function mountApp({search, isAnonymous, startAt}) {
  window.history.replaceState({}, '', `/${search}`);
  const routerInstance = freshRouter();
  if (startAt) await routerInstance.replace(startAt).catch(() => {});
  const wrapper = shallowMount(App, {
    localVue,
    router: routerInstance,
    mocks: {$store: fakeStore(isAnonymous)},
  });
  // beforeMount awaits its data loads, then the navigation it may decide on.
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();
  return wrapper;
}

beforeEach(() => {
  // beforeMount installs two setIntervals that would outlive the test.
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
  const wrapper = await mountApp({search: '', isAnonymous: false, startAt: '/settings'});
  expect(wrapper.vm.$route.name).toBe('Settings');
});

test('reloading on the confirm screen with the token still in the URL finishes loading', async () => {
  // $router.replace to the route it is already on rejects with NavigationDuplicated,
  // and that rejection would escape beforeMount and strand the loading splash.
  const wrapper = await mountApp({
    search: '?confirm_email=the-token#/confirm-email',
    isAnonymous: true,
    startAt: '/confirm-email',
  });
  expect(wrapper.vm.$route.name).toBe('ConfirmEmail');
  expect(wrapper.vm.loading).toBe(false);
});
