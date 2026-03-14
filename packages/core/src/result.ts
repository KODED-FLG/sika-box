// @sikabox/core — Result<T, E> pattern (B4.1)
// Inspiré du type Result de Rust

export type Result<T, E> = Ok<T, E> | Err<T, E>;

export class Ok<T, E> {
  readonly value: T;
  readonly _tag = 'Ok' as const;

  constructor(value: T) {
    this.value = value;
  }

  isOk(): this is Ok<T, E> {
    return true;
  }

  isErr(): this is Err<T, E> {
    return false;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    return new Ok(fn(this.value));
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    return fn(this.value);
  }

  unwrap(): T {
    return this.value;
  }

  getOrElse(_defaultValue: T): T {
    return this.value;
  }

  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return handlers.ok(this.value);
  }
}

export class Err<T, E> {
  readonly error: E;
  readonly _tag = 'Err' as const;

  constructor(error: E) {
    this.error = error;
  }

  isOk(): this is Ok<T, E> {
    return false;
  }

  isErr(): this is Err<T, E> {
    return true;
  }

  map<U>(_fn: (value: T) => U): Result<U, E> {
    return new Err(this.error);
  }

  flatMap<U>(_fn: (value: T) => Result<U, E>): Result<U, E> {
    return new Err(this.error);
  }

  unwrap(): T {
    throw new Error(`Called unwrap() on Err: ${JSON.stringify(this.error)}`);
  }

  getOrElse(defaultValue: T): T {
    return defaultValue;
  }

  match<U>(handlers: { ok: (value: T) => U; err: (error: E) => U }): U {
    return handlers.err(this.error);
  }
}

export const Result = {
  ok<T, E = never>(value: T): Result<T, E> {
    return new Ok(value);
  },
  err<T = never, E = unknown>(error: E): Result<T, E> {
    return new Err(error);
  },
};
