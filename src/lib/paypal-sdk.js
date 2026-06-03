let sdkPromise = null;

export function loadPaypalSdk(clientId) {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&vault=true&intent=subscription`;
    script.setAttribute('data-paypal-sdk', '');
    script.onload = () => resolve(window.paypal);
    script.onerror = () => { sdkPromise = null; reject(new Error('PayPal SDK failed to load')); };
    document.head.appendChild(script);
  });
  return sdkPromise;
}
