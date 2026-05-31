/**
 * TDD tests for permissionGateway.ts
 *
 * Tests the logic that decides WHICH API to call for each permission type
 * and verifies correct status mapping from each API's result format.
 *
 * RED phase: all these tests will fail until permissionGateway.ts is created.
 */

// ── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
}));

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: { OS: 'android', Version: 33 },
  PermissionsAndroid: {
    check: jest.fn(),
    request: jest.fn(),
    PERMISSIONS: {
      SEND_SMS: 'android.permission.SEND_SMS',
      CALL_PHONE: 'android.permission.CALL_PHONE',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
      NEVER_ASK_AGAIN: 'never_ask_again',
    },
  },
}));

import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { PermissionsAndroid } from 'react-native';
import {
  checkPermission,
  requestPermission,
  type PermKey,
} from './permissionGateway';

// ── checkPermission ───────────────────────────────────────────────────────────

describe('checkPermission', () => {
  beforeEach(() => jest.clearAllMocks());

  it('checks location via expo-location and returns granted', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    const result = await checkPermission('location');
    expect(result).toBe('granted');
    expect(Location.getForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('checks location via expo-location and returns denied', async () => {
    (Location.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });
    const result = await checkPermission('location');
    expect(result).toBe('denied');
  });

  it('checks notification via expo-notifications and returns granted', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    const result = await checkPermission('notification');
    expect(result).toBe('granted');
    expect(Notifications.getPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('checks notification via expo-notifications and returns undetermined', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'undetermined',
    });
    const result = await checkPermission('notification');
    expect(result).toBe('idle');
  });

  it('checks SMS via PermissionsAndroid and returns granted', async () => {
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
    const result = await checkPermission('sms');
    expect(result).toBe('granted');
    expect(PermissionsAndroid.check).toHaveBeenCalledWith(
      'android.permission.SEND_SMS'
    );
  });

  it('checks SMS via PermissionsAndroid and returns idle when not granted', async () => {
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
    const result = await checkPermission('sms');
    expect(result).toBe('idle');
  });

  it('checks call via PermissionsAndroid and returns granted', async () => {
    (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
    const result = await checkPermission('call');
    expect(result).toBe('granted');
    expect(PermissionsAndroid.check).toHaveBeenCalledWith(
      'android.permission.CALL_PHONE'
    );
  });
});

// ── requestPermission ─────────────────────────────────────────────────────────

describe('requestPermission', () => {
  beforeEach(() => jest.clearAllMocks());

  it('requests location via expo-location and returns granted', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(
      { status: 'granted' }
    );
    const result = await requestPermission('location');
    expect(result).toBe('granted');
    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('requests location via expo-location and returns denied', async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue(
      { status: 'denied' }
    );
    const result = await requestPermission('location');
    expect(result).toBe('denied');
  });

  it('requests notification via expo-notifications and returns granted', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });
    const result = await requestPermission('notification');
    expect(result).toBe('granted');
    expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1);
  });

  it('requests notification via expo-notifications and returns denied', async () => {
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });
    const result = await requestPermission('notification');
    expect(result).toBe('denied');
  });

  it('requests SMS via PermissionsAndroid.request and returns granted', async () => {
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('granted');
    const result = await requestPermission('sms');
    expect(result).toBe('granted');
    expect(PermissionsAndroid.request).toHaveBeenCalledWith(
      'android.permission.SEND_SMS',
      expect.objectContaining({ title: expect.any(String) })
    );
  });

  it('requests SMS via PermissionsAndroid.request and returns denied', async () => {
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('denied');
    const result = await requestPermission('sms');
    expect(result).toBe('denied');
  });

  it('requests SMS via PermissionsAndroid.request and returns denied for never_ask_again', async () => {
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue(
      'never_ask_again'
    );
    const result = await requestPermission('sms');
    expect(result).toBe('denied');
  });

  it('requests call via PermissionsAndroid.request and returns granted', async () => {
    (PermissionsAndroid.request as jest.Mock).mockResolvedValue('granted');
    const result = await requestPermission('call');
    expect(result).toBe('granted');
    expect(PermissionsAndroid.request).toHaveBeenCalledWith(
      'android.permission.CALL_PHONE',
      expect.objectContaining({ title: expect.any(String) })
    );
  });

  it('returns granted on iOS for any permission (no runtime dialog needed)', async () => {
    jest.resetModules();
    jest.doMock('react-native', () => ({
      Platform: { OS: 'ios', Version: 17 },
      PermissionsAndroid: {},
    }));
    // Dynamic require after mock override
    const { requestPermission: req } = await import('./permissionGateway');
    const result = await req('sms' as PermKey);
    expect(result).toBe('granted');
  });
});
