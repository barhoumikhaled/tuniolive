
import ProductDetail from "@/components/product-details";

// Product data - in a real app this would come from a database
const products = {
  "tuniolive-1l-evoo": {
    id: "tuniolive-1l-evoo",
    name: "TuniOlive Extra Virgin Olive Oil – 1 L Bottle",
    origin: "Bouhajla, Kairouan, Tunisie",
    flavor: "Robust & Peppery",
    price: 45,
    originalPrice: 55,
    badge: "Best Seller",
    rating: 4.9,
    reviewCount: 127,
    description: `Born in the sun-kissed groves of Bouhajla, this extra virgin olive oil captures the bold, natural
spirit of Tunisia.Hand - picked and cold- pressed within hours, our 1 L bottle delivers freshness,
  depth, and a peppery finish that elevates every dish — from rustic bread dips to gourmet
pastas.
`,
    images: [
      "/tuniolive-1l/tuniolive-1l-main.jpeg",
      "/tuniolive-1l/tuniolive-1l-750ml-3l.jpeg",
      "/tuniolive-1l/tuniolive-ambiance.jpeg",
    ],
    specifications: {
      volume: "1L",
      acidity: "< 0.5%",
      harvest: "2025 Season",
      extraction: "First Cold Pressed",
      certification: "Organic",
      storage: "Cool, Dark place, Glass bottle"
    },
    tastingNotes: [
      "Soft and smooth, medium fruitiness.",
      "Rich, fruity body with hints of artichoke",
      "Mild peppery finish, easy to pair with many dishes.",
      "Perfect for finishing dishes and salads",
      "More robust and intense."
    ],
    features: [
      { name: "Cold-Pressed Excellence", value: "Extracted below 27 °C to preserve full flavor and nutrition." },
      { name: "Single Origin", value: "Grown exclusively in Kairouan, Tunisia." },
      { name: "Rich in Polyphenols", value: "A natural antioxidant powerhouse." },
      { name: " Authentic Taste", value: "Smooth slightly peppery, with hints of artichoke and almond." },
      { name: "Glass Bottle Packaging", value: "UV-protected for freshness and sustainability." }
    ]
    // awards: [
    //   { name: "Gold Medal", event: "International Olive Oil Competition 2024" },
    //   { name: "Best in Class", event: "Tuscany Olive Oil Awards 2024" }
    // ]
  },
  "tuniolive-750ml-evoo": {
    id: "tuniolive-750ml-evoo",
    name: "TuniOlive Extra Virgin Olive Oil – 750 mL Bottle",
    origin: "Bouhajla, Kairouan, Tunisie",
    flavor: "Robust & Peppery",
    price: 45,
    originalPrice: 55,
    badge: "Best Seller",
    rating: 4.9,
    reviewCount: 127,
    description: `Our 750 mL format is perfect for daily cooking or gifting. Every drop embodies generations of
care — olives nurtured under Tunisian sun, pressed the traditional way, and bottled at peak
freshness.Taste the golden balance between fruitiness and a subtle bite.
`,
    images: [
      "/tuniolive-750-ml/tuniolive-750-ml-main.jpeg",
      // "/tuniolive-750-ml/tuniolive-1l-750-ml-main-1.jpeg",
      "/tuniolive-750-ml/tuniolive-750-ml-olive.jpeg",
      "/tuniolive-750-ml/tuniolive-3l-1l-750-ml-2.jpeg",
      // "/tuniolive-750-ml/tuniolive-750-ml-wood.jpeg",
      // "/tuniolive-750-ml/tuniolive-750-ml-wood-1.jpeg",
    ],
    specifications: {
      volume: "500ml",
      acidity: "< 0.5%",
      harvest: "December 2025",
      extraction: "First Cold Pressed",
      certification: "Organic",
      storage: "Cool, dark place"
    },
    tastingNotes: [
      "Soft and smooth, medium fruitiness.",
      "Rich, fruity body with hints of artichoke",
      "Mild peppery finish, easy to pair with many dishes.",
      "Perfect for finishing dishes and salads",
      "More robust and intense."
    ],
    features: [
      { name: "Cold-Pressed Excellence", value: "Extracted below 27 °C to preserve full flavor and nutrition." },
      { name: "Single Origin", value: "Grown exclusively in Kairouan, Tunisia." },
      { name: "Rich in Polyphenols", value: "A natural antioxidant powerhouse." },
      { name: " Authentic Taste", value: "Smooth slightly peppery, with hints of artichoke and almond." },
      { name: "Glass Bottle Packaging", value: "UV-protected for freshness and sustainability." }
    ]
    // awards: [
    //   { name: "Gold Medal", event: "International Olive Oil Competition 2024" },
    //   { name: "Best in Class", event: "Tuscany Olive Oil Awards 2024" }
    // ]
  },
  "tuniolive-3l-evoo": {
    id: "tuniolive-3l-evoo",
    name: "TuniOlive Extra Virgin Olive Oil – 3L Tinc",
    origin: "Bouhajla, Kairouan, Tunisie",
    flavor: "Robust & Peppery",
    price: 45,
    originalPrice: 55,
    badge: "Best Seller",
    rating: 4.9,
    reviewCount: 127,
    description: `Our 3 L tin delivers both convenience and value without compromise. Designed for families,
restaurants, and chefs who appreciate quality and consistency, it offers the same golden
richness and authentic Tunisian character — in a format that lasts.
`,
    images: [
      "/tuniolive-3l/tuniolive-3l-main.jpeg",
      "/tuniolive-3l/tuniolive-1l-750ml-3l.jpeg",
    ],
    specifications: {
      volume: "3 L",
      acidity: "< 0.5%",
      harvest: "December 2025",
      extraction: "First Cold Pressed",
      certification: "Organic",
      storage: "Cool, dark place"
    },
    tastingNotes: [
      "Soft and smooth, medium fruitiness.",
      "Rich, fruity body with hints of artichoke",
      "Mild peppery finish, easy to pair with many dishes.",
      "Perfect for finishing dishes and salads",
      "More robust and intense."
    ],
    features: [
      { name: "Bulk, But Premium", value: "Larger format, same farm-to-table quality." },
      { name: "Ideal for Restaurants & Families", value: " Economical and eco-friendly packaging." },
      { name: "Cold-Pressed Excellence", value: "Extracted below 27 °C to preserve full flavor and nutrition." },
      { name: "Single Origin", value: "Grown exclusively in Kairouan, Tunisia." },
      { name: "Rich in Polyphenols", value: "A natural antioxidant powerhouse." },
      { name: " Authentic Taste", value: "Smooth slightly peppery, with hints of artichoke and almond." },
      { name: "Glass Bottle Packaging", value: "UV-protected for freshness and sustainability." }
    ]
    // awards: [
    //   { name: "Gold Medal", event: "International Olive Oil Competition 2024" },
    //   { name: "Best in Class", event: "Tuscany Olive Oil Awards 2024" }
    // ]
  }
};

// Sample reviews data
const reviews = [
  {
    id: 1,
    name: "Maria Rodriguez",
    rating: 5,
    date: "January 15, 2025",
    comment: "Absolutely exceptional quality! The flavor is rich and complex, exactly what I expect from premium Italian olive oil. Will definitely order again.",
    verified: true
  },
  {
    id: 2,
    name: "Chef Antonio",
    rating: 5,
    date: "January 10, 2025",
    comment: "I use this in my restaurant and customers always ask about the olive oil. The peppery finish is perfect for finishing dishes.",
    verified: true
  },
  {
    id: 3,
    name: "Sarah Chen",
    rating: 4,
    date: "January 5, 2025",
    comment: "Great quality and fast shipping. The packaging was excellent and the oil arrived in perfect condition.",
    verified: true
  }
];

interface ProductDetailPageProps {
}


export default async function ProductDetailPage(
  {
    params
  }: {
    params: Promise<{ id: string }>
  }) {

  const { id } = await params
  const product = products[id as keyof typeof products];
  const relatedProducts = Object.values(products).filter(p => p.id !== product.id).slice(0, 2);
  return (<ProductDetail params={ {
    product: product,
    products: relatedProducts
  } } />)
 
}