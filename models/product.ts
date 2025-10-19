export interface Feature {
  name: string;
  value: string;
}

export interface Specifications {
  volume: string;
  acidity: string;
  harvest: string;
  extraction: string;
  certification: string;
  storage: string;
}

export interface Product {
  id: string;
  name: string;
  origin: string;
  flavor: string;
  price: number;
  originalPrice?: number;
  badge?: string;
  rating: number;
  reviewCount: number;
  description: string;
  images: string[];
  specifications: Specifications;
  tastingNotes: string[];
  features: Feature[];
}
