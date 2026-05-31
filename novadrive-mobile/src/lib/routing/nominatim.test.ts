jest.mock('expo-sqlite', () => {
  return {
    openDatabaseAsync: jest.fn(async () => ({
      execAsync: jest.fn(),
      runAsync: jest.fn(),
      getFirstAsync: jest.fn(async () => { throw new Error("Mock DB Error"); }),
      getAllAsync: jest.fn(async () => { throw new Error("Mock DB Error"); }),
    })),
  };
});

import { fetchLocationSuggestions } from './nominatim';

describe('fetchLocationSuggestions', () => {
  it('returns empty list for short queries (<3 chars)', async () => {
    const suggestions = await fetchLocationSuggestions('Pu');
    expect(suggestions).toEqual([]);
  });

  it('fetches and parses suggestions successfully', async () => {
    const mockResponse = [
      { lat: '18.5308', lon: '73.8475', display_name: 'Shivajinagar, Pune, Maharashtra' },
      { lat: '18.4575', lon: '73.8657', display_name: 'Katraj, Pune, Maharashtra' },
    ];
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const suggestions = await fetchLocationSuggestions('Pune', mockFetch);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('q=Pune'),
      expect.any(Object)
    );
    expect(suggestions).toHaveLength(2);
    expect(suggestions[0]).toEqual({
      lat: 18.5308,
      lng: 73.8475,
      displayName: 'Shivajinagar, Pune, Maharashtra',
    });
  });

  it('falls back to offline pre-seeded database when network failure occurs', async () => {
    const mockFetch = jest.fn().mockRejectedValue(new Error('Network Error'));
    const suggestions = await fetchLocationSuggestions('Pune', mockFetch);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].displayName).toContain('Pune');
  });

  it('falls back to offline pre-seeded database when network returns zero results', async () => {
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    });
    const suggestions = await fetchLocationSuggestions('Chennai', mockFetch);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].displayName).toContain('Chennai');
  });
});
