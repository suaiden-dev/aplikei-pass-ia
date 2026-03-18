/**
 * Minimal Deno type shim to resolve "Cannot find name 'Deno'" in environments 
 * that are not natively Deno-aware (like standard TypeScript compiler).
 */
declare namespace Deno {
  export interface ServeOptions {
    port?: number;
    hostname?: string;
    onListen?: (params: { hostname: string; port: number }) => void;
    onError?: (error: unknown) => Response | Promise<Response>;
  }

  export function serve(
    handler: (request: Request, info: unknown) => Response | Promise<Response>,
    options?: ServeOptions
  ): void;
  
  export function serve(
    options: ServeOptions & { handler: (request: Request, info: unknown) => Response | Promise<Response> }
  ): void;

  export const env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  };
}
