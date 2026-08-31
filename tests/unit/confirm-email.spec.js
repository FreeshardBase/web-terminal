// The confirmation screen is the one part of the UI an unpaired browser reaches,
// so these tests drive it with no session at all: a stubbed http client, a store
// with only the public metadata, and the token where the mail link puts it —
// the document query string, outside the hash route.

import {createLocalVue, mount} from '@vue/test-utils';
import {BootstrapVue, BootstrapVueIcons} from 'bootstrap-vue';
import ConfirmEmail from '@/views/ConfirmEmail';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(BootstrapVueIcons);

const CONFIRM_URL = '/core/public/users/confirm-email';

function setLocation(search) {
  window.history.replaceState({}, '', `/${search}#/confirm-email`);
}

function mountScreen({post = jest.fn(() => Promise.resolve({status: 204})), isAnonymous = true} = {}) {
  const wrapper = mount(ConfirmEmail, {
    localVue,
    mocks: {
      $http: {post},
      $store: {
        getters: {short_shard_id: 'abc123'},
        state: {meta: {is_anonymous: isAnonymous}},
      },
    },
  });
  return {wrapper, post};
}

// The continue button renders as a link because it carries a router target.
function continueLink(wrapper) {
  return wrapper.find('a.btn').attributes('href');
}

function confirmButton(wrapper) {
  return wrapper.findAll('button').filter(b => b.text() === 'Confirm');
}

beforeEach(() => {
  setLocation('?confirm_email=the-token');
});

test('does not confirm on its own', async () => {
  const {wrapper, post} = mountScreen();
  // Drained rather than asserted on the spot: a confirm one tick after mount
  // would spend the token just as surely as one during it.
  await wrapper.vm.$nextTick();
  await new Promise(setImmediate);
  expect(post).not.toHaveBeenCalled();
  expect(confirmButton(wrapper).length).toBe(1);
});

test('posts the token from the document query string on click', async () => {
  const {wrapper, post} = mountScreen();
  await confirmButton(wrapper).at(0).trigger('click');
  expect(post).toHaveBeenCalledWith(CONFIRM_URL, {token: 'the-token'});
});

test('reports success and says what to do if the link had expired', async () => {
  const {wrapper} = mountScreen();
  await confirmButton(wrapper).at(0).trigger('click');
  await wrapper.vm.$nextTick();
  expect(wrapper.find('.alert-success').exists()).toBe(true);
  expect(wrapper.text()).toContain('valid for one hour');
});

test('drops the token from the URL as soon as the screen opens', () => {
  mountScreen();
  expect(window.location.search).toBe('');
  expect(window.location.hash).toBe('#/confirm-email');
});

test('still confirms with the token it captured, once the URL no longer has it', async () => {
  const {wrapper, post} = mountScreen();
  expect(window.location.search).toBe('');
  await confirmButton(wrapper).at(0).trigger('click');
  expect(post).toHaveBeenCalledWith(CONFIRM_URL, {token: 'the-token'});
});

test('offers a retry when the request fails', async () => {
  const post = jest.fn(() => Promise.reject(new Error('Network Error')));
  const {wrapper} = mountScreen({post});
  await confirmButton(wrapper).at(0).trigger('click');
  await wrapper.vm.$nextTick();
  expect(wrapper.find('.alert-danger').text()).toContain('could not be completed');
  expect(confirmButton(wrapper).length).toBe(1);
});

test('offers a way off the screen in every state', async () => {
  const failing = mountScreen({post: jest.fn(() => Promise.reject(new Error('Network Error')))});
  expect(continueLink(failing.wrapper)).toBeTruthy();
  await confirmButton(failing.wrapper).at(0).trigger('click');
  await failing.wrapper.vm.$nextTick();
  expect(continueLink(failing.wrapper)).toBeTruthy();

  setLocation('');
  const {wrapper} = mountScreen();
  expect(continueLink(wrapper)).toBeTruthy();
});

test('says the link is incomplete when it carries no token', () => {
  setLocation('');
  const {wrapper} = mountScreen();
  expect(wrapper.find('.alert-danger').text()).toContain('incomplete');
  expect(confirmButton(wrapper).length).toBe(0);
});

describe('where it sends the owner afterwards', () => {
  test('an unpaired browser is sent to the public page, not to the app grid', async () => {
    const {wrapper} = mountScreen({isAnonymous: true});
    await confirmButton(wrapper).at(0).trigger('click');
    await wrapper.vm.$nextTick();
    expect(continueLink(wrapper)).toBe('/welcome');
  });

  test('a paired browser is sent to the app grid', async () => {
    const {wrapper} = mountScreen({isAnonymous: false});
    await confirmButton(wrapper).at(0).trigger('click');
    await wrapper.vm.$nextTick();
    expect(continueLink(wrapper)).toBe('/');
  });
});
