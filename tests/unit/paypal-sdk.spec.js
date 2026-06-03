import { loadPaypalSdk } from '@/lib/paypal-sdk';

describe('loadPaypalSdk', () => {
  beforeEach(() => { document.head.innerHTML = ''; window.paypal = undefined; });

  it('injects the SDK script once with the client id + subscription intent', async () => {
    const p = loadPaypalSdk('CID');
    const script = document.querySelector('script[data-paypal-sdk]');
    expect(script).not.toBeNull();
    expect(script.src).toContain('client-id=CID');
    expect(script.src).toContain('intent=subscription');
    window.paypal = {};
    script.onload();
    await expect(p).resolves.toBe(window.paypal);
    await loadPaypalSdk('CID');
    expect(document.querySelectorAll('script[data-paypal-sdk]').length).toBe(1);
  });
});
