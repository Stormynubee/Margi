import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { isOnboarded } from '../src/lib/storage';
import { getStartupRoute } from '../src/lib/onboardingStartup';
import { tokens } from '../src/theme/tokens';
import { MargiLogoMark } from '../src/components/MargiLogo';
import { HudText } from '../src/components/HudText';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);

  useEffect(() => {
    isOnboarded()
      .then((v) => setOnboarded(v))
      .catch(() => setOnboarded(false))
      .finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <View style={styles.container}>
        <View style={styles.glow} />
        <View style={styles.content}>
          <MargiLogoMark size={48} />
          <HudText variant="mono" style={styles.loadingText}>
            INITIALIZING SAFETY CO-PILOT
          </HudText>
          <ActivityIndicator color={tokens.secondary} size="small" style={styles.spinner} />
        </View>
      </View>
    );
  }

  return <Redirect href={getStartupRoute(onboarded) as any} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: tokens.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(0,10,30,0.03)',
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 9,
    letterSpacing: 2,
    color: tokens.primary,
    opacity: 0.8,
    fontWeight: '700',
    marginTop: 8,
  },
  spinner: {
    marginTop: 8,
  },
});

