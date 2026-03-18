// Allows TypeScript to accept Deno-style URL imports (e.g. https://esm.sh/...)
// without resolving them locally. The actual resolution happens at Deno runtime.
declare module "https://*";
