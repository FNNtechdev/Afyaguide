import { Facility } from "../types/facility";

export const mockFacilities: Facility[] = [
  {
    id: "facility-001",
    name: "AfyaCare Hospital",
    county: "Nairobi",
    subCounty: "Westlands",
    ward: "Parklands",
    facilityType: "Hospital",
    kephLevel: "Level 4",
    services: [
      "Maternity",
      "Laboratory",
      "Outpatient services",
      "Emergency services",
      "Pharmacy",
    ],
    latitude: -1.2636,
    longitude: 36.8045,
    beds: 120,
  },

  {
    id: "facility-002",
    name: "Hope Medical Centre",
    county: "Kiambu",
    subCounty: "Thika West",
    ward: "Township",
    facilityType: "Medical Centre",
    kephLevel: "Level 3",
    services: [
      "Laboratory",
      "Outpatient services",
      "Maternity",
      "Immunization",
    ],
    latitude: -1.0333,
    longitude: 37.0693,
    beds: 60,
  },

  {
    id: "facility-003",
    name: "Kirinyaga Community Hospital",
    county: "Kirinyaga",
    subCounty: "Kirinyaga Central",
    ward: "Kerugoya",
    facilityType: "Hospital",
    kephLevel: "Level 4",
    services: [
      "Maternity",
      "Laboratory",
      "Emergency services",
      "Inpatient care",
      "Pharmacy",
    ],
    latitude: -0.4989,
    longitude: 37.2803,
    beds: 100,
  },

  {
    id: "facility-004",
    name: "Nakuru Family Health Centre",
    county: "Nakuru",
    subCounty: "Naivasha",
    ward: "Naivasha East",
    facilityType: "Health Centre",
    kephLevel: "Level 3",
    services: [
      "Maternity",
      "Outpatient services",
      "Immunization",
      "Laboratory",
    ],
    latitude: -0.7172,
    longitude: 36.4310,
    beds: 45,
  },

  {
    id: "facility-005",
    name: "Mombasa Coast Medical Centre",
    county: "Mombasa",
    subCounty: "Mvita",
    ward: "Tononoka",
    facilityType: "Medical Centre",
    kephLevel: "Level 3",
    services: [
      "Dental",
      "Eye care",
      "Laboratory",
      "Outpatient services",
      "Pharmacy",
    ],
    latitude: -4.0435,
    longitude: 39.6682,
    beds: 70,
  },
];

export default mockFacilities;
