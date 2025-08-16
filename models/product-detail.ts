export default interface ProductDetail {
  id: string
  name: string
  origin: string
  flavor: string
  price: number
  originalPrice: number
  rating?: string
  reviewCount?: string
  description: string
  images: Array<string>
  badge: string
  specification: Specification
  tastingNotes: Array<string>
}

interface Specification{
  volume: string
  acidity: string
  harvest: string
  extraction: string
  certification?: string
  storage: string
}