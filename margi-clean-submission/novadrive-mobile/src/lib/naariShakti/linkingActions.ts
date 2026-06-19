import { Alert } from 'react-native';
import type { UserProfile } from '../types';
import { buildDistressSmsBody, buildLocationShareBody } from './messages';
import { findNearestPoliceStation } from './stations';
import { WOMENS_HELPLINE } from './helplines';
import { executeSms, executeCall } from '../emergency/automationBroker';

/**
 * Sends an emergency SMS via the automationBroker.
 * If SEND_SMS permission is granted → silent background dispatch.
 * Otherwise → opens SMS composer for manual send.
 */
export async function openSmsUrl(phone: string, body: string): Promise<boolean> {
  const ok = await executeSms(phone, body);
  if (!ok) {
    Alert.alert(
      'SMS unavailable',
      'Could not send the message. Copy your location from Quick Help and send manually.'
    );
  }
  return ok;
}

/**
 * Dials an emergency helpline via the automationBroker.
 * If CALL_PHONE permission is granted → direct background call.
 * Otherwise → opens the native dialer.
 */
export async function dialHelpline(phone: string): Promise<void> {
  const ok = await executeCall(phone);
  if (!ok) {
    Alert.alert('Call unavailable', `Unable to dial ${phone} on this device.`);
  }
}

export async function smsNearestStation(
  profile: UserProfile,
  coords: { lat: number; lng: number }
): Promise<void> {
  const station = findNearestPoliceStation(coords.lat, coords.lng);
  const body = buildDistressSmsBody({
    userName: profile.name?.trim() || 'Citizen',
    lat: coords.lat,
    lng: coords.lng,
    stationName: station.name,
  });
  await openSmsUrl(station.phone, body);
}

export async function shareLiveLocation(
  profile: UserProfile,
  coords: { lat: number; lng: number }
): Promise<void> {
  const ice = profile.medical?.primaryContact?.phone?.trim();
  const body = buildLocationShareBody({
    userName: profile.name?.trim() || 'Citizen',
    lat: coords.lat,
    lng: coords.lng,
  });
  if (ice) {
    await openSmsUrl(ice, body);
    return;
  }
  Alert.alert(
    'No ICE contact',
    'Add a primary emergency contact in your Medical Profile to share live location.'
  );
}

export async function dialWomensHelpline(): Promise<void> {
  await dialHelpline(WOMENS_HELPLINE);
}

export function openMapsNavigate(lat: number, lng: number): void {
  const { Linking } = require('expo-linking');
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  Linking.openURL(url).catch(() => {
    Alert.alert('Navigation unavailable', 'Could not open maps on this device.');
  });
}
