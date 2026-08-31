// The confirmation screen is the one part of the UI an unpaired browser reaches,
// so these tests drive it with no session at all: a stubbed http client, a store
// with only the public metadata, and the token where the mail link puts it —
// the document query string, outside the hash route.

import {createLocalVue, mount, RouterLinkStub} from '@vue/test-utils';
import {BootstrapVue, BootstrapVueIcons} from 'bootstrap-vue';
import ConfirmEmail from '@/views/ConfirmEmail';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(BootstrapVueIcons);

const CONFIRM_URL = '/core/public/users/confirm-email';

function setLocation(search) {
  window.history.replaceState({}, '', `/${search}#/confirm-email`);
}

function mountScreen({post = jest.fn(() => Promise.resolve({status: 204}))} = {}) {
  const wrapper = mount(ConfirmEmail, {
    localVue,
    stubs: {RouterLink: RouterLinkStub},
    mocks: {
      $http: {post},
      $store: {getters: {short_shard_id: 'abc123'}},
    },
  });
  return {wrapper, post};
}

function confirmButton(wrapper) {
  return wrapper.findAll('button').filter(b => b.text() === 'Confirm');
}

beforeEach(() => {
  setLocation('?confirm_email=the-token');
});

test('does not confirm on its own', () => {
  const {wrapper, post} = mountScreen();
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

test('drops the spent token from the URL after confirming', async () => {
  const {wrapper} = mountScreen();
  await confirmButton(wrapper).at(0).trigger('click');
  await wrapper.vm.$nextTick();
  expect(window.location.search).toBe('');
  expect(window.location.hash).toBe('#/confirm-email');
});

test('offers a retry when the request fails', async () => {
  const post = jest.fn(() => Promise.reject(new Error('Network Error')));
  const {wrapper} = mountScreen({post});
  await confirmButton(wrapper).at(0).trigger('click');
  await wrapper.vm.$nextTick();
  expect(wrapper.find('.alert-danger').text()).toContain('could not be completed');
  expect(confirmButton(wrapper).length).toBe(1);
  expect(window.location.search).toBe('?confirm_email=the-token');
});

test('says the link is incomplete when it carries no token', () => {
  setLocation('');
  const {wrapper} = mountScreen();
  expect(wrapper.find('.alert-danger').text()).toContain('incomplete');
  expect(confirmButton(wrapper).length).toBe(0);
});
