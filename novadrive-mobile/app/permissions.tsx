import { type Href, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
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
import {
  checkPermission,
  requestPermission,
  type PermKey,
  type PermStatus,
} from '../src/lib/permissions/permissionGateway';
import { tokens } from '../src/theme/tokens';

// ── Permission definitions ──────────────────────────────────────────────────

interface PermissionDef {
  key: PermKey;
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  criticalFor: string;
  worksWithout: string;
}

const PERMISSIONS: PermissionDef[] = [
  {
    key: 'sms',
    icon: 'sms',
    title: 'Send SMS',
    subtitle: 'Automatically send distress alerts to police & emergency contacts.',
    criticalFor: 'Naari Shakti · Crash Auto-Alert',
    worksWithout: 'Opens SMS composer — you tap send.',
  },
  {
    key: 'call',
    icon: 'call',
    title: 'Make Calls',
    subtitle: 'Place direct emergency calls in the background without you having to dial.',
    criticalFor: 'Crash Auto-Dispatch · SOS Call',
    worksWithout: 'Opens dialer — you press call.',
  },
  {
    key: 'location',
    icon: 'location-on',
    title: 'Precise Location',
    subtitle: 'Required for crash detection, nearest police station, and live route tracking.',
    criticalFor: 'Drive Mode · Emergency Dispatch',
    worksWithout: 'Core drive features are unavailable.',
  },
  {
    key: 'notification',
    icon: 'notifications-active',
    title: 'Notifications',
    subtitle: 'Receive crash alerts, safety check-ins, and officer response confirmations.',
    criticalFor: 'All safety alerts',
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
            toValue: 0.45,
            duration: 420,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 420,
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
  const isRequesting = status === 'requesting';

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
    : isRequesting
    ? 'hourglass-top'
    : 'radio-button-unchecked';

  const statusColor = isGranted
    ? tokens.tertiary
    : isDenied
    ? tokens.error
    : tokens.outlineVariant;

  const borderColor = isGranted
    ? `${tokens.tertiary}40`
    : isDenied
    ? `${tokens.error}25`
    : tokens.outlineVariant;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { borderColor },
        pressed && !isGranted && !isRequesting && styles.cardPressed,
      ]}
      onPress={isGranted || isRequesting ? undefined : onRequest}
      disabled={isGranted || isRequesting}
      accessibilityRole="button"
      accessibilityLabel={`${isGranted ? 'Granted' : 'Request'} ${def.title} permission`}
      accessibilityState={{ disabled: isGranted || isRequesting }}
    >
      {/* Icon with pulse during request */}
      <Animated.View
        style={[styles.iconWrap, { backgroundColor: iconBg, opacity: pulseAnim }]}
      >
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
        {isRequesting && (
          <HudText variant="mono" style={[styles.fallbackNote, { color: tokens.secondary }]}>
            Waiting for system dialog…
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

  // Keep a ref that always has the latest statuses so requestAll never
  // reads from a stale closure.
  const statusRef = useRef<Record<PermKey, PermStatus>>({
    sms: 'idle',
    call: 'idle',
    location: 'idle',
    notification: 'idle',
  });
  const isRunningRef = useRef(false);

  // Pre-check on mount — set any already-granted permissions to 'granted'
  useEffect(() => {
    (async () => {
      const results = await Promise.all(
        PERMISSIONS.map(async (def) => ({
          key: def.key,
          status: await checkPermission(def.key),
        }))
      );
      setStatuses((prev) => {
        const next = { ...prev };
        for (const { key, status } of results) {
          next[key] = status;
        }
        statusRef.current = next;  // keep ref in sync
        return next;
      });
    })();
  }, []);

  const allGranted = PERMISSIONS.every((d) => statuses[d.key] === 'granted');
  const anyGranted = PERMISSIONS.some((d) => statuses[d.key] === 'granted');

  // ── request a single permission (triggers OS system dialog) ──────────────

  const requestSingle = async (key: PermKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);

    // Mark as requesting (shows pulse animation) + update ref
    statusRef.current = { ...statusRef.current, [key]: 'requesting' };
    setStatuses((prev) => ({ ...prev, [key]: 'requesting' }));

    // Call the gateway — this triggers the REAL OS system dialog
    const result = await requestPermission(key);

    // Update ref first, then state
    statusRef.current = { ...statusRef.current, [key]: result };
    setStatuses((prev) => ({ ...prev, [key]: result }));

    if (result === 'granted') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => undefined
      );
    }

    return result;
  };

  // ── Grant all: request each permission sequentially ─────────────────────

  const requestAll = async () => {
    // Prevent double-execution if already running
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => undefined);

    for (const def of PERMISSIONS) {
      // Read from REF (always current) — not from stale statuses closure
      const current = statusRef.current[def.key];

      // Skip if already decided — no point re-asking
      if (current === 'granted' || current === 'denied' || current === 'requesting') continue;

      await requestSingle(def.key);

      // Give Android time to dismiss the dialog before showing the next one
      await new Promise<void>((r) => setTimeout(r, 700));
    }

    isRunningRef.current = false;
  };

  // ── Finish onboarding ────────────────────────────────────────────────────

  const finish = async () => {
    await setOnboarded();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => undefined
    );
    router.replace('/(tabs)/explore' as Href);
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Permissions?',
      'Emergency features will work in manual mode — you will tap to send SMS or call.\n\nYou can grant permissions later in Settings → Permissions.',
      [
        { text: 'Go back', style: 'cancel' },
        { text: 'Skip for now', style: 'default', onPress: finish },
      ]
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <OnboardingShell
      step={4}
      total={4}
      title="Permissions"
      subtitle="Margi uses these permissions to automate emergency response. The app works without them — but acts faster with them."
    >
      {/* Grant all shortcut — only visible while something is still undecided */}
      {!allGranted && (
        <Pressable
          style={({ pressed }) => [styles.grantAllBtn, pressed && styles.grantAllPressed]}
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
            onRequest={() => requestSingle(def.key)}
          />
        ))}
      </View>

      {/* Summary badge */}
      <View style={styles.summaryRow}>
        <MaterialIcons
          name={
            allGranted
              ? 'verified-user'
              : anyGranted
              ? 'security'
              : 'info-outline'
          }
          size={14}
          color={allGranted ? tokens.tertiary : tokens.onSurfaceVariant}
        />
        <HudText
          variant="mono"
          style={[
            styles.summaryText,
            allGranted && { color: tokens.tertiary },
          ]}
        >
          {allGranted
            ? 'Full automation enabled — emergency dispatch is hands-free'
            : anyGranted
            ? 'Partial automation — some features need manual confirmation'
            : 'Manual mode — all features work, with extra taps'}
        </HudText>
      </View>

      {/* CTA */}
      <MargiButton
        label={allGranted ? 'Enter Margi' : 'Continue'}
        onPress={finish}
        large
        style={{ marginTop: 4 }}
      />

      {/* Skip */}
      {!allGranted && (
        <Pressable
          onPress={handleSkip}
          style={styles.skipBtn}
          accessibilityRole="button"
        >
          <HudText variant="mono" style={styles.skipText}>
            Skip — I'll do this later
          </HudText>
        </Pressable>
      )}
    </OnboardingShell>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  grantAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: tokens.primary,
    borderRadius: tokens.radius.button,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 4,
    ...tokens.elevation.floating,
  },
  grantAllPressed: { opacity: 0.88 },
  grantAllText: {
    color: tokens.onPrimary,
    fontFamily: 'PublicSans_700Bold',
  },
  grid: { gap: 10 },
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
  cardPressed: { opacity: 0.87, transform: [{ scale: 0.99 }] },
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
