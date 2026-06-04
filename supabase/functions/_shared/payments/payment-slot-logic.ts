// Shim: all logic has moved to the application/domain layer.
// Only the public API used by external callers is re-exported here.
export { applySuccessfulPayment } from "../application/payments/apply-payment.ts";
