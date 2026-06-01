import { render, act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initialize with null user and load from localStorage if exists', () => {
    const mockUser = { id: 1, username: 'testuser', role: 'GURU' };
    localStorage.setItem('educonnect_user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
  });

  it('should login successfully for admin', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    let loginPromise;
    act(() => {
      loginPromise = result.current.login('admin', 'admin');
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    const user = await loginPromise;
    expect(user.role).toBe('KEPALA_SEKOLAH');
    expect(result.current.user.role).toBe('KEPALA_SEKOLAH');
    expect(localStorage.getItem('educonnect_user')).toContain('KEPALA_SEKOLAH');
  });

  it('should fail login with wrong credentials', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    let loginPromise;
    act(() => {
      loginPromise = result.current.login('wrong', 'wrong');
    });

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    await expect(loginPromise).rejects.toThrow('Username atau password salah!');
    expect(result.current.user).toBeNull();
  });

  it('should logout and clear localStorage', async () => {
    const mockUser = { id: 1, username: 'testuser', role: 'GURU' };
    localStorage.setItem('educonnect_user', JSON.stringify(mockUser));

    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(localStorage.getItem('educonnect_user')).toBeNull();
  });
});
