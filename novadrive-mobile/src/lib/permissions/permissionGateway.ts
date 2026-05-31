/**
 * permissionGateway.ts
 *
 * Unified permission request layer for Margi.
 *
 * Routes each permission key to the correct Expo SDK or Android API:
 *   - location    → expo-location (requestForegroundPermissionsAsync)
 *   - notification → expo-notifications (requestPermissionsAsync)
 *   - sms         → PermissionsAndroid.request (SEND_SMS)
 *   - call        → PermissionsAndroid.request (CALL_PHONE)
 *
 * This is the ONLY file in the app that should call permission APIs.
 * All consumers (permissionsScreen, automationBroker) import from here.
 */

import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { PermissionsAndroid, Platform } from 'react-native';

// ── Types ─────────────────────────────────────────────────────────────────────

export type PermKey = 'sms' | 'call' | 'location' | 'notification';
export type PermStatus = 'idle' | 'granted' | 'denied' | 'requesting';

// ── Dialog copy (shown in the Android system dialog) ─────────────────────────

const DIALOG_COPY: Record<'sms' | 'call', { title: string; message: string }> = {
  sms: {
    title: 'Margi — Send SMS',
    message:
      'Allows Margi to automatically send distress alerts to police and your emergency contacts without any extra taps.',
  },
  call: {
    title: 'Margi — Make Calls',
    message:
      'Allows Margi to place direct emergency calls in the background when a crash or distress signal is detected.',
  },
};

// ── checkPermission ───────────────────────────────────────────────────────────

/**
 * Non-blocking status check. Returns current permission state without
 * triggering any system dialog.
 */
export async function checkPermission(key: PermKey): Promise<PermStatus> {
  try {
    switch (key) {
      case 'location': {
        const { status } = await Location.getForegroundPermissionsAsync();
        return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'idle';
      }

      case 'notification': {
        const { status } = await Notifications.getPermissionsAsync();
        return status === 'granted' ? 'granted' : status === 'denied' ? 'denied' : 'idle';
      }

      case 'sms': {
        if (Platform.OS !== 'android') return 'granted';
        const ok = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.SEND_SMS);
        return ok ? 'granted' : 'idle';
      }

      case 'call': {
        if (Platform.OS !== 'android') return 'granted';
        const ok = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CALL_PHONE);
        return ok ? 'granted' : 'idle';
      }
    }
  } catch {
    return 'idle';
  }
}

// ── requestPermission ─────────────────────────────────────────────────────────

/**
 * Triggers the native OS permission dialog for the given key.
 * Returns the final status after the user interacts with the dialog.
 *
 * - location    → expo-location (triggers the proper Android/iOS location dialog)
 * - notification → expo-notifications (triggers notification permission dialog)
 * - sms / call  → PermissionsAndroid.request (triggers Android dangerous-permission dialog)
 *   NOTE: These only work in a dev client build or signed APK — NOT in Expo Go,
 *   which does not include SEND_SMS / CALL_PHONE in its manifest.
 */
export async function requestPermission(key: PermKey): Promise<PermStatus> {
  // iOS / non-Android: no runtime permission for SMS/CALL needed
  if (Platform.OS !== 'android' && (key === 'sms' || key === 'call')) {
    return 'granted';
  }

  try {
    switch (key) {
      case 'location': {
        const { status } = await Location.requestForegroundPermissionsAsync();
        return status === 'granted' ? 'granted' : 'denied';
      }

      case 'notification': {
        const { status } = await Notifications.requestPermissionsAsync();
        return status === 'granted' ? 'granted' : 'denied';
      }

      case 'sms': {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SEND_SMS,
          DIALOG_COPY.sms
        );
        return result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
      }

      case 'call': {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CALL_PHONE,
          DIALOG_COPY.call
        );
        return result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
      }
    }
  } catch {
    return 'denied';
  }
}
