jest.mock('expo-sqlite', () => {
  return {
    openDatabaseAsync: jest.fn(async () => ({
      execAsync: jest.fn(),
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(async () => ({ c: 0 })),
      getAllAsync: jest.fn(async () => []),
    })),
  };
});

import { projectPolylineToViewBox } from './tripRoute';

describe('tripRoute', () => {
  it('projects polyline to SVG path', () => {
    const d = projectPolylineToViewBox(
      [
        { lat: 13.0, lng: 77.0 },
        { lat: 13.1, lng: 77.1 },
      ],
      200,
      120
    );
    expect(d.startsWith('M ')).toBe(true);
    expect(d.includes(' L ')).toBe(true);
  });
});
