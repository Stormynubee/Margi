import { ReactNode } from 'react';

/**
 * ScreenEnter wraps children to handle native-only transition syncs.
 * All Reanimated UI-thread entering animations have been bypassed to achieve
 * instantaneous tap-to-render mount times and eliminate visual stutters.
 */
export function ScreenEnter({
  children,
}: {
  children: ReactNode;
  variant?: 'slide' | 'fade';
  delay?: number;
}) {
  return <>{children}</>;
}
