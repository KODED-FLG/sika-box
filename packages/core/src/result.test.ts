// B3.1 — Test Result<T, E> pattern
import { describe, it, expect } from 'vitest';
import { Result } from './result';

describe('Result<T, E>', () => {
  describe('Ok', () => {
    it('Result.ok(42).isOk() === true', () => {
      const result = Result.ok(42);
      expect(result.isOk()).toBe(true);
    });

    it('Result.ok(42).isErr() === false', () => {
      const result = Result.ok(42);
      expect(result.isErr()).toBe(false);
    });

    it('unwrap() retourne la valeur', () => {
      const result = Result.ok(42);
      expect(result.unwrap()).toBe(42);
    });

    it('map() transforme la valeur', () => {
      const result = Result.ok(10).map((v) => v * 2);
      expect(result.unwrap()).toBe(20);
    });

    it('flatMap() chaîne les résultats', () => {
      const result = Result.ok(10).flatMap((v) => Result.ok(v + 5));
      expect(result.unwrap()).toBe(15);
    });

    it('getOrElse() retourne la valeur Ok', () => {
      const result = Result.ok(42);
      expect(result.getOrElse(0)).toBe(42);
    });

    it('match() appelle le handler ok', () => {
      const result = Result.ok(42);
      const output = result.match({
        ok: (v) => `value: ${v}`,
        err: (e) => `error: ${e}`,
      });
      expect(output).toBe('value: 42');
    });
  });

  describe('Err', () => {
    it('Result.err("nope").isErr() === true', () => {
      const result = Result.err('nope');
      expect(result.isErr()).toBe(true);
    });

    it('Result.err("nope").isOk() === false', () => {
      const result = Result.err('nope');
      expect(result.isOk()).toBe(false);
    });

    it('unwrap() sur Err lance une erreur', () => {
      const result = Result.err('nope');
      expect(() => result.unwrap()).toThrow();
    });

    it('map() sur Err propage l\'erreur', () => {
      const result = Result.err<number, string>('nope').map((v) => v * 2);
      expect(result.isErr()).toBe(true);
    });

    it('flatMap() sur Err propage l\'erreur', () => {
      const result = Result.err<number, string>('nope').flatMap((v) => Result.ok(v + 5));
      expect(result.isErr()).toBe(true);
    });

    it('getOrElse() retourne la valeur par défaut', () => {
      const result = Result.err<number, string>('nope');
      expect(result.getOrElse(99)).toBe(99);
    });

    it('match() appelle le handler err', () => {
      const result = Result.err('nope');
      const output = result.match({
        ok: (v) => `value: ${v}`,
        err: (e) => `error: ${e}`,
      });
      expect(output).toBe('error: nope');
    });
  });
});
