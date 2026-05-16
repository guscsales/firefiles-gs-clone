import { describe, expect, it } from 'vitest';
import { randomId } from '../utils';

describe('randomId', () => {
  it('should return ~24 chars by default', () => {
    const id = randomId();
    expect(id.length).toBe(24);
  });

  it('should return exactly the requested length', () => {
    expect(randomId(8).length).toBe(8);
    expect(randomId(32).length).toBe(32);
    expect(randomId(64).length).toBe(64);
  });

  it('should only contain alphanumeric characters', () => {
    const id = randomId(100);
    expect(id).toMatch(/^[a-z0-9]+$/);
  });

  it('should produce unique values', () => {
    const ids = new Set(Array.from({ length: 20 }, () => randomId()));
    expect(ids.size).toBe(20);
  });
});
