import { type Href, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { OnboardingShell } from '../src/components/OnboardingShell';
import { HudText } from '../src/components/HudText';
import { MargiButton } from '../src/components/MargiButton';
import { setOnboarded } from '../src/lib/storage';
import { tokens } from '../src/theme/tokens';

// ── Permission definitions ──────────────────────────────────────────────────

type PermKey = 'sms' | 'call' | 'location' | 'notification';
type PermStatus = 'idle' | 'granted' | 'denied' | 'requesting';

interface PermissionDef {
  key: PermKey;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  criticalFor: string;
  androidPermission?: string;
  worksWithout: string;
}

const PERMISSIONS: PermissionDef[] = [
  {
    key: 'sms',
    icon: 'sms',
    title: 'Send SMS',
    subtitle: 'Automatically send distress alerts to police & emergency contacts.',
    criticalFor: 'Naari Shakti · Crash Auto-Alert',
    androidPermission: PermissionsAndroid.PERMISSIONS.SEND_SMS,
    worksWithout: 'Opens SMS composer — you tap send.',
  },
  {
    key: 'call',
    icon: 'call',
    title: 'Make Calls',
    subtitle: 'Place direct emergency calls in the background without you having to dial.',
    criticalFor: 'Crash Auto-Dispatch · SOS Call',
    androidPermission: PermissionsAndroid.PERMISSIONS.CALL_PHONE,
    worksWithout: 'Opens dialer — you press call.',
  },
  {
    key: 'location',
    icon: 'location-on',
    title: 'Precise Location',
    subtitle: 'Required for crash detection, nearest police station, and live route tracking.',
    criticalFor: 'Drive Mode · Emergency Dispatch',
    androidPermission: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    worksWithout: 'Core drive features are unavailable.',
  },
  {
    key: 'notification',
    icon: 'notifications-active',
    title: 'Notifications',
    subtitle: 'Receive crash alerts, safety check-ins, and officer response confirmations.',
    criticalFor: 'All safety alerts',
    androidPermission:
      Platform.Version >= 33
        ? PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        : undefined,
    worksWithout: 'Alerts only appear in-app.',
  },
];

// ── PermissionCard ──────────────────────────────────────────────────────────

function PermissionCard({
  def,
  status,
  onRequest,
}: {
  def: PermissionDef;
  status: PermStatus;
  onRequest: () => void;
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === 'requesting') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 450,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 450,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status, pulseAnim]);

  const isGranted = status === 'granted';
  const isDenied = status === 'denied';

  const iconBg = isGranted
    ? tokens.tertiaryContainer
    : isDenied
    ? tokens.errorContainer
    : tokens.primaryContainer;

  const iconColor = isGranted
    ? tokens.tertiary
    : isDenied
    ? tokens.error
    : tokens.primary;

  const statusIcon: keyof typeof MaterialIcons.glyphMap = isGranted
    ? 'check-circle'
    : isDenied
    ? 'cancel'
    : 'radio-button-unchecked';

  const statusColor = isGranted
    ? tokens.tertiary
    : isDenied
    ? tokens.error
    : tokens.outlineVariant;

  const borderColor = isGranted
    ? `${tokens.tertiary}33`
    : isDenied
    ? `${tokens.error}22`
    : tokens.outlineVariant;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { borderColor },
        pressed && !isGranted && styles.cardPressed,
      ]}
      onPress={isGranted ? undefined : onRequest}
      disabled={isGranted || status === 'requesting'}
      accessibilityRole="button"
      accessibilityLabel={`Request ${def.title} permission`}
    >
      {/* Icon + status dot */}
      <Animated.View style={[styles.iconWrap, { backgroundColor: iconBg }, { opacity: pulseAnim }]}>
        <MaterialIcons name={def.icon} size={22} color={iconColor} />
      </Animated.View>

      {/* Text block */}
      <View style={styles.cardText}>
        <View style={styles.cardTitleRow}>
          <HudText variant="bodyMd" style={[styles.cardTitle, { color: tokens.primary }]}>
            {def.title}
          </HudText>
          <MaterialIcons name={statusIcon} size={16} color={statusColor} />
        </View>
        <HudText variant="bodySm" style={styles.cardSub}>
          {def.subtitle}
        </HudText>
        <View style={styles.tagRow}>
          <MaterialIcons name="shield" size={11} color={tokens.secondary} />
          <HudText variant="mono" style={styles.tag}>
            {def.criticalFor}
          </HudText>
        </View>
        {(isDenied || status === 'idle') && (
          <HudText variant="mono" style={styles.fallbackNote}>
            Without: {def.worksWithout}
          </HudText>
        )}
      </View>
    </Pressable>
  );
}

// ── Main Screen ─────────────────────────────────────────────────────────────

export default function PermissionsScreen() {
  const [statuses, setStatuses] = useState<Record<PermKey, PermStatus>>({
    sms: 'idle',
    call: 'idle',
    location: 'idle',
    notification: 'idle',
  });

  const allGranted = Object.values(statuses).every((s) => s === 'granted');
  const anyGranted = Object.values(statuses).some((s) => s === 'granted');

  const requestSingle = async (def: PermissionDef) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);

    // iOS or no Android permission string → skip silently (treat as granted for flow)
    if (Platform.OS !== 'android' || !def.androidPermission) {
      setStatuses((prev) => ({ ...prev, [def.key]: 'granted' }));
      return;
    }

    setStatuses((prev) => ({ ...prev, [def.key]: 'requesting' }));

    try {
      const result = await PermissionsAndroid.request(def.androidPermission, {
        title: `Margi — ${def.title}`,
        message: def.subtitle,
        buttonPositive: 'Allow',
        buttonNegative: 'Skip',
      });

      const granted = result === PermissionsAndroid.RESULTS.GRANTED;
      setStatuses((prev) => ({
        ...prev,
        [def.key]: granted ? 'granted' : 'denied',
      }));

      if (granted) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
          () => undefined
        );
      }
    } catch {
      setStatuses((prev) => ({ ...prev, [def.key]: 'denied' }));
    }
  };

  const requestAll = async () => {
    for (const def of PERMISSIONS) {
      if (statuses[def.key] !== 'granted') {
        await requestSingle(def);
        // Small delay between requests so the user sees each dialog
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  };

  const finish = async () => {
    await setOnboarded();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
    router.replace('/(tabs)/explore' as Href);
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Permissions?',
      'Emergency features will work in manual mode — you will tap to send SMS or call. You can grant permissions later in Settings.',
      [
        { text: 'Go back', style: 'cancel' },
        {
          text: 'Skip for now',
          style: 'default',
          onPress: finish,
        },
      ]
    );
  };

  return (
    <OnboardingShell
      step={4}
      total={4}
      title="Permissions"
      subtitle="Margi uses these permissions to automate emergency response. The app works without them — but acts faster with them."
    >
      {/* Grant all shortcut */}
      {!allGranted && (
        <Pressable
          style={({ pressed }) => [styles.grantAllBtn, pressed && styles.cardPressed]}
          onPress={requestAll}
          accessibilityRole="button"
          accessibilityLabel="Grant all permissions at once"
        >
          <MaterialIcons name="security" size={16} color={tokens.onPrimary} />
          <HudText variant="bodyMd" style={styles.grantAllText}>
            Grant all at once
          </HudText>
        </Pressable>
      )}

      {/* Bento grid of permission cards */}
      <View style={styles.grid}>
        {PERMISSIONS.map((def) => (
          <PermissionCard
            key={def.key}
            def={def}
            status={statuses[def.key]}
            onRequest={() => requestSingle(def)}
          />
        ))}
      </View>

      {/* Status summary */}
      <View style={styles.summaryRow}>
        <MaterialIcons
          name={allGranted ? 'verified-user' : anyGranted ? 'security' : 'info-outline'}
          size={14}
          color={allGranted ? tokens.tertiary : tokens.onSurfaceVariant}
        />
        <HudText variant="mono" style={[styles.summaryText, allGranted && { color: tokens.tertiary }]}>
          {allGranted
            ? 'Full automation enabled — emergency dispatch is hands-free'
            : anyGranted
            ? 'Partial automation — some features need manual confirmation'
            : 'Manual mode — all features work, with extra taps'}
        </HudText>
      </View>

      {/* Primary CTA */}
      <MargiButton
        label={allGranted ? 'Enter Margi' : 'Continue'}
        onPress={finish}
        large
        style={{ marginTop: 4 }}
      />

      {/* Skip link */}
      {!allGranted && (
        <Pressable onPress={handleSkip} style={styles.skipBtn} accessibilityRole="button">
          <HudText variant="mono" style={styles.skipText}>
            Skip — I'll do this later
          </HudText>
        </Pressable>
      )}
    </OnboardingShell>
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  grantAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: tokens.primary,
    borderRadius: tokens.radius.button,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 4,
    ...tokens.elevation.floating,
  },
  grantAllText: {
    color: tokens.onPrimary,
    fontFamily: 'PublicSans_700Bold',
  },
  grid: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    backgroundColor: tokens.surface,
    borderRadius: tokens.radius.card,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    ...tokens.elevation.card,
  },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.99 }] },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: tokens.radius.iconWrap,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardText: { flex: 1, gap: 4 },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: { fontFamily: 'PublicSans_700Bold', fontSize: 14 },
  cardSub: { color: tokens.onSurfaceVariant, lineHeight: 18 },
  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  tag: {
    fontSize: 9,
    color: tokens.secondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fallbackNote: {
    fontSize: 9,
    color: tokens.outline,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: 4,
    marginTop: 4,
  },
  summaryText: {
    flex: 1,
    color: tokens.onSurfaceVariant,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  skipBtn: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 2,
  },
  skipText: {
    color: tokens.outline,
    fontSize: 11,
    letterSpacing: 0.4,
  },
});
