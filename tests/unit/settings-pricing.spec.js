import Settings from '@/views/Settings.vue';

// The price preview is a launch blocker (German consumer law: the price must be
// visible before purchase), so the computed props that feed it are tested
// directly. They are plain functions, so no mount/DOM harness is needed.
const {billingEnabled, currentSizePrice, selectedSizePrice, priceDelta} = Settings.computed;

function vm({profile, selectedSize = null}) {
  const self = {
    $store: {state: {profile}},
    resize: {selectedSize},
  };
  // priceDelta reads the other two computed props off `this`.
  self.currentSizePrice = currentSizePrice.call(self);
  self.selectedSizePrice = selectedSizePrice.call(self);
  return self;
}

const TRIAL_S = {vm_size: 's', volume_size_gb: 30, billing_enabled: true};

describe('currentSizePrice', () => {
  test('prices the current size against the shard volume', () => {
    expect(currentSizePrice.call(vm({profile: TRIAL_S}))).toBe(21.78);
  });

  test('is null when the volume size is unknown', () => {
    // The controller rejects subscribe with 422 in this case, so the UI must
    // not invent a price computed against a 0GB volume.
    expect(currentSizePrice.call(vm({profile: {vm_size: 's'}}))).toBeNull();
  });

  test('is null without a profile', () => {
    expect(currentSizePrice.call(vm({profile: null}))).toBeNull();
  });
});

describe('selectedSizePrice', () => {
  test('prices the selected size, not the current one', () => {
    const self = vm({profile: TRIAL_S, selectedSize: 'm'});
    expect(selectedSizePrice.call(self)).toBe(37.49);
  });

  test('is null while no size is selected', () => {
    expect(selectedSizePrice.call(vm({profile: TRIAL_S}))).toBeNull();
  });
});

describe('priceDelta', () => {
  test('is the increase over the current price', () => {
    // m + 30GB (37.49) - s + 30GB (21.78)
    expect(priceDelta.call(vm({profile: TRIAL_S, selectedSize: 'm'}))).toBe(15.71);
  });

  test('is null while no size is selected', () => {
    expect(priceDelta.call(vm({profile: TRIAL_S}))).toBeNull();
  });

  test('is null when the volume size is unknown', () => {
    expect(priceDelta.call(vm({profile: {vm_size: 's'}, selectedSize: 'm'}))).toBeNull();
  });
});

describe('billingEnabled', () => {
  test('true when the profile enables billing', () => {
    expect(billingEnabled.call(vm({profile: TRIAL_S}))).toBe(true);
  });

  test('false without a profile', () => {
    expect(billingEnabled.call(vm({profile: null}))).toBe(false);
  });
});
