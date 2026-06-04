export function requireEnv(key: string): string {
  const value = Deno.env.get(key);
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export function getEnv(key: string, fallback = ""): string {
  return Deno.env.get(key) ?? fallback;
}
