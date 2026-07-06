import { describe, it, expect } from 'vitest';
import { resolveApiBaseUrl } from '../services/api';

describe('resolveApiBaseUrl', () => {
  it('uses a relative /api base URL in production when no override is supplied', () => {
    expect(resolveApiBaseUrl({ PROD: true, VITE_API_BASE_URL: '' })).toBe('/api');
  });

  it('appends /api to an explicit backend host URL', () => {
    expect(resolveApiBaseUrl({ PROD: true, VITE_API_BASE_URL: 'https://backend.example.com' })).toBe('https://backend.example.com/api');
  });
});
