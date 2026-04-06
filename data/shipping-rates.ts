export interface ShippingMethod {
  id: string;
  name: string;
  estimatedDays: string;
  price: number;
}

export interface ProvinceShipping {
  name: string;
  code: string;
  methods: ShippingMethod[];
}

export const FREE_SHIPPING_THRESHOLD = 100;

export const PROVINCES: ProvinceShipping[] = [
  {
    name: "Quebec",
    code: "QC",
    methods: [
      { id: "cp-expedited", name: "Canada Post Expedited Parcel", estimatedDays: "2-5 business days", price: 15.79 },
      { id: "cp-priority", name: "Canada Post Priority", estimatedDays: "5-7 business days", price: 20.25 },
      { id: "standard", name: "Standard", estimatedDays: "7-10 business days", price: 25.00 },
    ],
  },
  {
    name: "Ontario",
    code: "ON",
    methods: [
      { id: "cp-expedited", name: "Canada Post Expedited Parcel", estimatedDays: "2-3 business days", price: 15.49 },
      { id: "cp-priority", name: "Canada Post Priority", estimatedDays: "1-2 business days", price: 22.95 },
      { id: "standard", name: "Standard", estimatedDays: "5-10 business days", price: 35.00 },
    ],
  },
  {
    name: "British Columbia",
    code: "BC",
    methods: [
      { id: "cp-expedited", name: "Canada Post Expedited Parcel", estimatedDays: "3-5 business days", price: 21.99 },
      { id: "cp-priority", name: "Canada Post Priority", estimatedDays: "2-3 business days", price: 32.50 },
      { id: "standard", name: "Standard", estimatedDays: "5-10 business days", price: 35.00 },
    ],
  },
  {
    name: "Alberta",
    code: "AB",
    methods: [
      { id: "cp-expedited", name: "Canada Post Expedited Parcel", estimatedDays: "3-4 business days", price: 19.49 },
      { id: "cp-priority", name: "Canada Post Priority", estimatedDays: "2-3 business days", price: 28.95 },
      { id: "standard", name: "Standard", estimatedDays: "5-10 business days", price: 35.00 },
    ],
  },
  {
    name: "Manitoba",
    code: "MB",
    methods: [
      { id: "cp-expedited", name: "Canada Post Expedited Parcel", estimatedDays: "3-4 business days", price: 17.99 },
      { id: "cp-priority", name: "Canada Post Priority", estimatedDays: "2-3 business days", price: 26.50 },
      { id: "standard", name: "Standard", estimatedDays: "5-10 business days", price: 35.00 },
    ],
  },
  {
    name: "Saskatchewan",
    code: "SK",
    methods: [
      { id: "cp-expedited", name: "Canada Post Expedited Parcel", estimatedDays: "3-4 business days", price: 18.49 },
      { id: "cp-priority", name: "Canada Post Priority", estimatedDays: "2-3 business days", price: 27.50 },
      { id: "standard", name: "Standard", estimatedDays: "5-10 business days", price: 35.00 },
    ],
  },
  {
    name: "Nova Scotia",
    code: "NS",
    methods: [
      { id: "cp-expedited", name: "Canada Post Expedited Parcel", estimatedDays: "3-4 business days", price: 16.49 },
      { id: "cp-priority", name: "Canada Post Priority", estimatedDays: "2-3 business days", price: 24.95 },
      { id: "standard", name: "Standard", estimatedDays: "5-10 business days", price: 35.00 },
    ],
  },
  {
    name: "New Brunswick",
    code: "NB",
    methods: [
      { id: "cp-expedited", name: "Canada Post Expedited Parcel", estimatedDays: "3-4 business days", price: 15.99 },
      { id: "cp-priority", name: "Canada Post Priority", estimatedDays: "2-3 business days", price: 23.95 },
      { id: "standard", name: "Standard", estimatedDays: "5-10 business days", price: 35.00 },
    ],
  },
  {
    name: "Prince Edward Island",
    code: "PE",
    methods: [
      { id: "cp-expedited", name: "Canada Post Expedited Parcel", estimatedDays: "3-4 business days", price: 16.99 },
      { id: "cp-priority", name: "Canada Post Priority", estimatedDays: "2-3 business days", price: 25.50 },
      { id: "standard", name: "Standard", estimatedDays: "5-10 business days", price: 35.00 },
    ],
  },
  {
    name: "Newfoundland and Labrador",
    code: "NL",
    methods: [
      { id: "cp-expedited", name: "Canada Post Expedited Parcel", estimatedDays: "3-5 business days", price: 18.99 },
      { id: "cp-priority", name: "Canada Post Priority", estimatedDays: "2-3 business days", price: 28.50 },
      { id: "standard", name: "Standard", estimatedDays: "5-10 business days", price: 35.00 },
    ],
  },
  {
    name: "Northwest Territories",
    code: "NT",
    methods: [
      { id: "cp-expedited", name: "Canada Post Expedited Parcel", estimatedDays: "5-7 business days", price: 28.99 },
      { id: "cp-priority", name: "Canada Post Priority", estimatedDays: "3-5 business days", price: 42.50 },
      { id: "standard", name: "Standard", estimatedDays: "7-14 business days", price: 45.00 },
    ],
  },
  {
    name: "Nunavut",
    code: "NU",
    methods: [
      { id: "cp-expedited", name: "Canada Post Expedited Parcel", estimatedDays: "5-7 business days", price: 32.99 },
      { id: "cp-priority", name: "Canada Post Priority", estimatedDays: "3-5 business days", price: 48.50 },
      { id: "standard", name: "Standard", estimatedDays: "7-14 business days", price: 50.00 },
    ],
  },
  {
    name: "Yukon",
    code: "YT",
    methods: [
      { id: "cp-expedited", name: "Canada Post Expedited Parcel", estimatedDays: "5-7 business days", price: 27.99 },
      { id: "cp-priority", name: "Canada Post Priority", estimatedDays: "3-5 business days", price: 40.50 },
      { id: "standard", name: "Standard", estimatedDays: "7-14 business days", price: 45.00 },
    ],
  },
];

export function getProvinceByCode(code: string): ProvinceShipping | undefined {
  return PROVINCES.find((p) => p.code === code);
}

export function getShippingCost(
  provinceCode: string,
  methodId: string,
  subtotal: number
): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0;
  const province = getProvinceByCode(provinceCode);
  if (!province) return 0;
  const method = province.methods.find((m) => m.id === methodId);
  return method?.price ?? 0;
}
