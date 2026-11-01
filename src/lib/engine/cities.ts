import { PROVINCES } from '@/lib/ziwei/cities';

export interface CityEntry {
  name: string;
  province: string;
  longitude: number;
}

/** 扁平城市索引:城市名 → 条目(含省与经度) */
export const CITY_INDEX: Map<string, CityEntry> = (() => {
  const map = new Map<string, CityEntry>();
  for (const province of PROVINCES) {
    for (const city of province.cities) {
      if (!map.has(city.name)) {
        map.set(city.name, { name: city.name, province: province.name, longitude: city.longitude });
      }
    }
  }
  return map;
})();

export const CITY_LONGITUDE: Map<string, number> = new Map(
  [...CITY_INDEX.entries()].map(([name, entry]) => [name, entry.longitude] as const),
);

export const CITY_LIST: CityEntry[] = [...CITY_INDEX.values()];

export function lookupCity(name: string | undefined): CityEntry | undefined {
  if (!name) return undefined;
  return CITY_INDEX.get(name);
}
