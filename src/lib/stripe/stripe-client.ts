import { loadStripe, Stripe } from '@stripe/stripe-js';
import { getStripePublicKey } from './environmentDetector';

let stripePromise: Promise<Stripe | null>;

/**
 * Singleton to ensure only one instance of Stripe is loaded.
 */
export const getStripe = () => {
    if (!stripePromise) {
        const publicKey = getStripePublicKey();
        if (!publicKey) {
            console.warn('Stripe publishable key not found in environment.');
        }
        stripePromise = loadStripe(publicKey || '');
    }
    return stripePromise;
};
