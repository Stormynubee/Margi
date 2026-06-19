/**
 * Pure helper function to determine startup redirect target based on onboarding state.
 */
export function getStartupRoute(onboarded: boolean): string {
  return onboarded ? '/(tabs)/explore' : '/splash';
}
