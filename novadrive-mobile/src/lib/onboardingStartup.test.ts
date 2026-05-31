import { getStartupRoute } from './onboardingStartup';

describe('getStartupRoute', () => {
  it('returns /splash when the user is NOT onboarded (e.g. new phone)', () => {
    expect(getStartupRoute(false)).toBe('/splash');
  });

  it('returns /(tabs)/explore when the user IS onboarded', () => {
    expect(getStartupRoute(true)).toBe('/(tabs)/explore');
  });
});
