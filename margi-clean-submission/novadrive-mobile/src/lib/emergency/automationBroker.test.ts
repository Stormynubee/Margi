import { executeSms, executeCall, hasPermission } from './automationBroker';
import * as Linking from 'expo-linking';
import { PermissionsAndroid } from 'react-native';

jest.mock('expo-linking', () => ({
  openURL: jest.fn().mockResolvedValue(true),
  canOpenURL: jest.fn().mockResolvedValue(true),
}));

// Pure manual mock — avoids jest.requireActual which cannot parse RN's ESM index.js
jest.mock('react-native', () => ({
  Platform: { OS: 'android' },
  PermissionsAndroid: {
    check: jest.fn(),
    request: jest.fn(),
    PERMISSIONS: {
      SEND_SMS: 'android.permission.SEND_SMS',
      CALL_PHONE: 'android.permission.CALL_PHONE',
    },
    RESULTS: {
      GRANTED: 'granted',
    },
  },
}));

describe('automationBroker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hasPermission', () => {
    it('returns false when PermissionsAndroid check returns false', async () => {
      (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
      const res = await hasPermission('android.permission.SEND_SMS');
      expect(res).toBe(false);
    });

    it('returns true when PermissionsAndroid check returns true', async () => {
      (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
      const res = await hasPermission('android.permission.SEND_SMS');
      expect(res).toBe(true);
    });
  });

  describe('executeSms', () => {
    it('falls back to native SMS composer URL if permission is denied', async () => {
      (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
      await executeSms('+91108', 'TEST BODY');
      expect(Linking.openURL).toHaveBeenCalledWith('sms:+91108?body=TEST%20BODY');
    });

    it('bypasses composer and dispatches programmatically if permission is granted', async () => {
      (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
      const res = await executeSms('+91108', 'TEST BODY');
      expect(res).toBe(true);
      expect(Linking.openURL).not.toHaveBeenCalled();
    });
  });

  describe('executeCall', () => {
    it('falls back to native tel dialer URL if permission is denied', async () => {
      (PermissionsAndroid.check as jest.Mock).mockResolvedValue(false);
      await executeCall('+91108');
      expect(Linking.openURL).toHaveBeenCalledWith('tel:+91108');
    });

    it('bypasses dialer and dials programmatically if permission is granted', async () => {
      (PermissionsAndroid.check as jest.Mock).mockResolvedValue(true);
      const res = await executeCall('+91108');
      expect(res).toBe(true);
      expect(Linking.openURL).not.toHaveBeenCalled();
    });
  });
});
