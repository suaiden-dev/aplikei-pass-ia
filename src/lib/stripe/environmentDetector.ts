/**
 * Detects the current environment based on the window location.
 * Used to switch between Stripe Test/Staging/Prod keys.
 */
export const getEnvironment = (): 'prod' | 'staging' | 'test' => {
    const host = window.location.hostname;

    if (host === 'localhost' || host === '127.0.0.1') {
        return 'test';
    }

    if (host.includes('netlify.app') && host.includes('staging')) {
        return 'staging';
    }

    if (host.includes('aplikei.com')) {
        return 'prod';
    }

    return 'test'; // Default to test
};

export const getStripePublicKey = () => {
    const env = getEnvironment();

    // These should be in .env but here's the logic
    if (env === 'prod') return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_PROD;
    if (env === 'staging') return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_STAGING;
    return import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY_TEST;
};
