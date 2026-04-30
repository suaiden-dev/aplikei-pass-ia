/**
 * Returns the start path for a customer initiating a service.
 * Always routes through /checkout/:slug so payment is captured first.
 * The CheckoutPage handles creating the process after payment confirmation.
 */
export function getCustomerProcessStartPath(slug: string) {
  return `/checkout/${slug}`;
}
