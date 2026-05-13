import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAdminMode } from '../useAdminMode';

vi.mock('../utils/core', () => ({
  getActiveStoreSlug: vi.fn(() => 'test-slug'),
}));

vi.mock('../../supabase', () => ({
  supabase: {
    rpc: vi.fn(async (fnName: string, args: { target_slug: string; input_pin: string }) => {
      if (fnName === 'verify_admin_access') {
        if (args.input_pin === '1234') {
          return { data: true, error: null };
        }
        return { data: false, error: null };
      }
      return { data: null, error: { message: 'Not found' } };
    }),
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
  },
}));

// Mock getActiveStoreSlug
vi.mock('../utils/core', () => ({
  getActiveStoreSlug: vi.fn(() => 'test-slug'),
}));

describe('useAdminMode (Security & Workflow Tests)', () => {
  it('should start with non-admin mode', () => {
    const { result } = renderHook(() => useAdminMode());
    expect(result.current.isAdmin).toBe(false);
  });

  it('should successfully verify a correct PIN (mocked success)', async () => {
    const { result } = renderHook(() => useAdminMode());

    let isSuccess = false;
    await act(async () => {
      isSuccess = await result.current.verifyPinWithServer('1234');
    });

    expect(isSuccess).toBe(true);
  });

  it('should fail verification with empty or invalid PIN (mocked scenario)', async () => {
    const { result } = renderHook(() => useAdminMode());

    let isSuccess = true;
    await act(async () => {
      isSuccess = await result.current.verifyPinWithServer('');
    });

    expect(isSuccess).toBe(false);
  });

  it('should confirm admin status after onPinSuccess', () => {
    const { result } = renderHook(() => useAdminMode());

    act(() => {
      result.current.onPinSuccess();
    });

    expect(result.current.isAdmin).toBe(true);
  });
});
