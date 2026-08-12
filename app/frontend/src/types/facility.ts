export interface Facility {
  id: string;
  name: string;

  county: string;
  subCounty: string;
  ward: string;

  facilityType: string;
  kephLevel: string;

  services: string[];

  latitude?: number;
  longitude?: number;

  beds?: number;

  recommendationScore?: number;
  distanceKm?: number;
}
