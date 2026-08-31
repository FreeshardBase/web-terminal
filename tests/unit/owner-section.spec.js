// Mounts the real card against a stubbed http client. The states in the issue
// differ only in what the card offers the owner, so every test asserts on the
// rendered controls or on the request that reached the stub.

import {createLocalVue, mount} from '@vue/test-utils';
import {BootstrapVue, BootstrapVueIcons} from 'bootstrap-vue';
import OwnerSection from '@/components/OwnerSection';

const localVue = createLocalVue();
localVue.use(BootstrapVue);
localVue.use(BootstrapVueIcons);

const USER_URL = '/core/protected/users/me';
const SETTINGS_URL = '/core/protected/settings';

function userRow(overrides) {
  return {
    id: 1,
    username: 'owner',
    display_name: 'Ada',
    email: null,
    pending_email: null,
    role: 'owner',
    ...overrides,
  };
}

// The owner row as the 502 path leaves it: no candidate when the card loads,
// the stored one on every read after the failed PATCH.
function readsThenStores() {
  let reads = 0;
  return jest.fn(url => {
    if (url !== USER_URL) return Promise.resolve({data: {email_enabled: true}});
    reads += 1;
    return Promise.resolve({
      data: reads === 1 ? userRow() : userRow({pending_email: 'ada@example.com'}),
    });
  });
}

function httpError(status, data) {
  const error = new Error(`Request failed with status code ${status}`);
  error.response = {status, data: data === undefined ? {} : data};
  return error;
}

async function mountSection({user = userRow(), emailEnabled = true, http = {}} = {}) {
  const client = {
    get: jest.fn(url => {
      if (url === USER_URL) return Promise.resolve({data: user});
      if (url === SETTINGS_URL) return Promise.resolve({data: {email_enabled: emailEnabled}});
      return Promise.reject(httpError(404, {detail: `no route for ${url}`}));
    }),
    patch: jest.fn(() => Promise.resolve({data: user})),
    post: jest.fn(() => Promise.resolve({status: 204})),
    delete: jest.fn(() => Promise.resolve({status: 204})),
    ...http,
  };
  const wrapper = mount(OwnerSection, {localVue, mocks: {$http: client}});
  // BootstrapVue installs $bvToast read-only, so it is spied on rather than mocked.
  const toastSpy = jest.spyOn(wrapper.vm.$bvToast, 'toast').mockImplementation(() => {});
  const toasts = {
    get length() {
      return toastSpy.mock.calls.length;
    },
    at(index) {
      const [message, options] = toastSpy.mock.calls[index];
      return {message, ...options};
    },
  };
  await flush();
  return {wrapper, client, toasts};
}

// Two ticks: the mounted hook awaits the two GETs before it renders.
async function flush() {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
}

// Rendered text with its line wrapping collapsed, so assertions can quote a
// whole sentence out of the template.
function text(wrapper) {
  return wrapper.text().replace(/\s+/g, ' ');
}

function buttonWithText(wrapper, label) {
  return wrapper.findAll('button').filter(b => b.text() === label);
}

async function editField(wrapper, title, value) {
  const field = wrapper.findAllComponents({name: 'EditableText'})
      .filter(f => f.props('title') === title).at(0);
  field.vm.startEditing();
  await wrapper.vm.$nextTick();
  field.vm.editMode.editedValue = value;
  await field.vm.confirmEditing();
  await flush();
  return field;
}

describe('loading', () => {
  test('shows a warning when the owner row cannot be read', async () => {
    const {wrapper} = await mountSection({
      http: {get: jest.fn(() => Promise.reject(httpError(500)))},
    });
    expect(text(wrapper)).toContain('could not be loaded');
    expect(wrapper.findAllComponents({name: 'EditableText'}).length).toBe(0);
  });

  test('shows name and email from the owner row, not from the profile', async () => {
    const {wrapper} = await mountSection({
      user: userRow({display_name: 'Ada', email: 'ada@example.com'}),
    });
    expect(text(wrapper)).toContain('Ada');
    expect(text(wrapper)).toContain('ada@example.com');
  });
});

describe('no address', () => {
  test('prompts for an address instead of reporting a problem', async () => {
    const {wrapper} = await mountSection();
    expect(text(wrapper)).toContain('No address yet');
    expect(wrapper.find('.alert-danger').exists()).toBe(false);
    expect(buttonWithText(wrapper, 'Send again').length).toBe(0);
  });
});

describe('editing', () => {
  test('writes the name through immediately', async () => {
    const {wrapper, client} = await mountSection();
    await editField(wrapper, 'Name', 'Grace');
    expect(client.patch).toHaveBeenCalledWith(USER_URL, {display_name: 'Grace'});
  });

  test('refuses an empty name instead of sending it', async () => {
    const {wrapper, client, toasts} = await mountSection();
    await editField(wrapper, 'Name', '   ');
    expect(client.patch).not.toHaveBeenCalled();
    expect(toasts.at(0).variant).toBe('danger');
  });

  test('sends the address and shows it as pending, not as live', async () => {
    const pending = userRow({pending_email: 'ada@example.com'});
    const {wrapper, client} = await mountSection({
      http: {patch: jest.fn(() => Promise.resolve({data: pending}))},
    });
    await editField(wrapper, 'Email', 'ada@example.com');
    expect(client.patch).toHaveBeenCalledWith(USER_URL, {email: 'ada@example.com'});
    expect(text(wrapper)).toContain('waiting for confirmation');
    expect(buttonWithText(wrapper, 'Send again').length).toBe(1);
  });

  test('clears the address with an explicit null', async () => {
    const {wrapper, client} = await mountSection({
      user: userRow({email: 'ada@example.com'}),
    });
    await editField(wrapper, 'Email', '');
    expect(client.patch).toHaveBeenCalledWith(USER_URL, {email: null});
  });

  test('reports a real save failure as one', async () => {
    const {wrapper, toasts} = await mountSection({
      http: {patch: jest.fn(() => Promise.reject(httpError(422, {detail: [{msg: 'invalid email'}]})))},
    });
    await editField(wrapper, 'Email', 'nope');
    expect(toasts.at(0).title).toBe('Could not save the address');
    expect(toasts.at(0).message).toBe('invalid email');
    expect(text(wrapper)).toContain('No address yet');
  });
});

describe('delivery failure', () => {
  test('a 502 is reported as saved-but-not-sent, with a way to retry', async () => {
    const {wrapper, toasts} = await mountSection({
      http: {
        get: readsThenStores(),
        patch: jest.fn(() => Promise.reject(httpError(502, {detail: 'no controller'}))),
      },
    });
    await editField(wrapper, 'Email', 'ada@example.com');

    expect(toasts.at(0).title).toBe('Confirmation email not sent');
    expect(toasts.at(0).message).toContain('address was saved');
    expect(toasts.at(0).message).not.toContain('could not save');
    expect(text(wrapper)).toContain('ada@example.com');
    expect(text(wrapper)).toContain('could not be sent');
    expect(buttonWithText(wrapper, 'Send again').length).toBe(1);
  });

  test('shows the stored candidate even when re-reading the owner row fails', async () => {
    let reads = 0;
    const get = jest.fn(url => {
      if (url !== USER_URL) return Promise.resolve({data: {email_enabled: true}});
      reads += 1;
      return reads === 1 ? Promise.resolve({data: userRow()}) : Promise.reject(httpError(500));
    });
    const {wrapper} = await mountSection({
      http: {get, patch: jest.fn(() => Promise.reject(httpError(502, {detail: 'no controller'})))},
    });
    await editField(wrapper, 'Email', 'ada@example.com');
    expect(text(wrapper)).toContain('ada@example.com');
    expect(buttonWithText(wrapper, 'Send again').length).toBe(1);
  });
});

describe('pending address', () => {
  const pending = userRow({email: 'old@example.com', pending_email: 'new@example.com'});

  test('shows the live address next to the candidate', async () => {
    const {wrapper} = await mountSection({user: pending});
    expect(text(wrapper)).toContain('old@example.com');
    expect(text(wrapper)).toContain('new@example.com');
  });

  test('resend asks the shard to send the link again', async () => {
    const {wrapper, client} = await mountSection({user: pending});
    await buttonWithText(wrapper, 'Send again').at(0).trigger('click');
    await flush();
    expect(client.post).toHaveBeenCalledWith(`${USER_URL}/email/resend`);
  });

  test('cancel discards the candidate and keeps the live address', async () => {
    const {wrapper, client} = await mountSection({user: pending});
    await buttonWithText(wrapper, 'Cancel').at(0).trigger('click');
    await flush();
    expect(client.delete).toHaveBeenCalledWith(`${USER_URL}/email/pending`);
    expect(text(wrapper)).not.toContain('new@example.com');
    expect(text(wrapper)).toContain('old@example.com');
  });
});

describe('a shard that cannot send email', () => {
  test('offers no resend control', async () => {
    const {wrapper} = await mountSection({
      user: userRow({pending_email: 'new@example.com'}),
      emailEnabled: false,
    });
    expect(buttonWithText(wrapper, 'Send again').length).toBe(0);
    expect(buttonWithText(wrapper, 'Cancel').length).toBe(1);
  });

  test('says the address is taken without a confirmation step', async () => {
    const {wrapper} = await mountSection({
      user: userRow({email: 'ada@example.com'}),
      emailEnabled: false,
    });
    expect(text(wrapper)).toContain('no confirmation step');
  });
});

describe('recovering from a delivery failure', () => {
  test('resend clears the not-sent warning', async () => {
    const {wrapper} = await mountSection({
      http: {
        get: readsThenStores(),
        patch: jest.fn(() => Promise.reject(httpError(502, {detail: 'no controller'}))),
      },
    });
    await editField(wrapper, 'Email', 'ada@example.com');
    expect(text(wrapper)).toContain('could not be sent');

    await buttonWithText(wrapper, 'Send again').at(0).trigger('click');
    await flush();
    expect(text(wrapper)).not.toContain('could not be sent');
    expect(text(wrapper)).toContain('waiting for confirmation');
  });

  test('a failed resend leaves the warning up', async () => {
    const {wrapper, toasts} = await mountSection({
      http: {
        get: readsThenStores(),
        patch: jest.fn(() => Promise.reject(httpError(502, {detail: 'no controller'}))),
        post: jest.fn(() => Promise.reject(httpError(502, {detail: 'still no controller'}))),
      },
    });
    await editField(wrapper, 'Email', 'ada@example.com');
    await buttonWithText(wrapper, 'Send again').at(0).trigger('click');
    await flush();
    expect(toasts.at(1).title).toBe('Could not send the confirmation email');
    expect(text(wrapper)).toContain('could not be sent');
    expect(buttonWithText(wrapper, 'Send again').at(0).attributes('disabled')).toBeUndefined();
  });

  test('a proxy 502 with no API detail is a save failure, not a stored candidate', async () => {
    const {wrapper, toasts} = await mountSection({
      http: {
        get: readsThenStores(),
        patch: jest.fn(() => Promise.reject(httpError(502, 'Bad Gateway'))),
      },
    });
    await editField(wrapper, 'Email', 'ada@example.com');
    expect(toasts.at(0).title).toBe('Could not save the address');
    expect(text(wrapper)).not.toContain('waiting for confirmation');
    expect(text(wrapper)).toContain('No address yet');
  });
});

describe('an address that is set', () => {
  test('is shown plainly, with nothing left to confirm', async () => {
    const {wrapper} = await mountSection({user: userRow({email: 'ada@example.com'})});
    expect(text(wrapper)).toContain('ada@example.com');
    expect(text(wrapper)).not.toContain('No address yet');
    expect(text(wrapper)).not.toContain('waiting for confirmation');
    expect(text(wrapper)).not.toContain('cannot send email');
    expect(buttonWithText(wrapper, 'Send again').length).toBe(0);
    expect(buttonWithText(wrapper, 'Cancel').length).toBe(0);
  });
});

describe('a shard that cannot send email, writing an address', () => {
  test('takes the address live with no pending step and no resend', async () => {
    const saved = userRow({email: 'ada@example.com'});
    const {wrapper, toasts} = await mountSection({
      emailEnabled: false,
      http: {patch: jest.fn(() => Promise.resolve({data: saved}))},
    });
    await editField(wrapper, 'Email', 'ada@example.com');
    expect(toasts.at(0).message).toBe('Address saved');
    expect(text(wrapper)).toContain('ada@example.com');
    expect(text(wrapper)).not.toContain('waiting for confirmation');
    expect(buttonWithText(wrapper, 'Send again').length).toBe(0);
  });

  test('does not promise mail it cannot send while no address is set', async () => {
    const {wrapper} = await mountSection({emailEnabled: false});
    expect(text(wrapper)).toContain('No address yet');
    expect(text(wrapper)).not.toContain('storage warnings');
    expect(text(wrapper)).toContain('cannot send email');
  });
});

describe('a partial load', () => {
  test('keeps the name editable when only the settings read fails', async () => {
    const get = jest.fn(url => url === USER_URL
        ? Promise.resolve({data: userRow({email: 'ada@example.com'})})
        : Promise.reject(httpError(500)));
    const {wrapper} = await mountSection({http: {get}});
    expect(text(wrapper)).not.toContain('could not be loaded');
    expect(wrapper.findAllComponents({name: 'EditableText'}).length).toBe(2);
  });
});
