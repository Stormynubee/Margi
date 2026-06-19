import type { IncidentType } from '../types';

export interface UnconsciousDispatchPolicy {
  secondsRemaining: number;
  userDismissed: boolean;
  userConfirmed: boolean;
}

/**
 * Pure state-transition logic for auto-dispatch when victim is unconscious or non-responsive.
 * Bypasses incident selection and triggers an immediate high-severity road accident alert.
 */
export function evaluateUnconsciousDispatch(
  policy: UnconsciousDispatchPolicy
): { autoSosTriggered: boolean; presetIncident?: IncidentType } {
  if (policy.secondsRemaining <= 0 && !policy.userDismissed && !policy.userConfirmed) {
    return {
      autoSosTriggered: true,
      presetIncident: 'road_accident',
    };
  }
  return {
    autoSosTriggered: false,
  };
}
