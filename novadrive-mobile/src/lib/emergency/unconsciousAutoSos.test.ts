import { evaluateUnconsciousDispatch } from './unconsciousAutoSos';

describe('evaluateUnconsciousDispatch', () => {
  it('triggers auto-SOS with road_accident preset when countdown reaches 0 and user has not responded', () => {
    const result = evaluateUnconsciousDispatch({
      secondsRemaining: 0,
      userDismissed: false,
      userConfirmed: false,
    });
    expect(result.autoSosTriggered).toBe(true);
    expect(result.presetIncident).toBe('road_accident');
  });

  it('does not trigger auto-SOS if seconds remain on the countdown', () => {
    const result = evaluateUnconsciousDispatch({
      secondsRemaining: 5,
      userDismissed: false,
      userConfirmed: false,
    });
    expect(result.autoSosTriggered).toBe(false);
    expect(result.presetIncident).toBeUndefined();
  });

  it('does not trigger auto-SOS if user has already explicitly dismissed the alert', () => {
    const result = evaluateUnconsciousDispatch({
      secondsRemaining: 0,
      userDismissed: true,
      userConfirmed: false,
    });
    expect(result.autoSosTriggered).toBe(false);
  });

  it('does not trigger auto-SOS if user has already confirmed they need help (they are conscious)', () => {
    const result = evaluateUnconsciousDispatch({
      secondsRemaining: 0,
      userDismissed: false,
      userConfirmed: true,
    });
    expect(result.autoSosTriggered).toBe(false);
  });
});
