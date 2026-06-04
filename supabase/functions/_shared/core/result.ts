export type Ok<T> = { ok: true; value: T };
export type Err = { ok: false; error: string; code?: string };
export type Result<T> = Ok<T> | Err;

export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

export function err(error: string, code?: string): Err {
  return { ok: false, error, code };
}

export function isOk<T>(result: Result<T>): result is Ok<T> {
  return result.ok;
}

export function isErr<T>(result: Result<T>): result is Err {
  return !result.ok;
}
