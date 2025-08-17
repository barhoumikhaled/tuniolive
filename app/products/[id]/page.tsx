import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Separator } from "../../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import {
  Leaf,
  Star,
  Shield,
  Truck,
  ArrowLeft,
  Heart,
  Share2,
  Plus,
  Minus,
  CheckCircle,
  Award,
  MapPin
} from "lucide-react";
import Link from "next/link";
import { ImageZoom } from "@/components/image-zoom";

// Product data - in a real app this would come from a database
const products = {
  "tuniolive-1l-evoo": {
    id: "tuniolive-1l-evoo",
    name: "Tuni Olive 1L EVOO",
    origin: "Bouhajla, Kairouan, Tunisie",
    flavor: "Robust & Peppery",
    price: 45,
    originalPrice: 55,
    badge: "Best Seller",
    rating: 4.9,
    reviewCount: 127,
    description: "Tunisian olive oils express a rich Mediterranean character, ranging from the soft, fruity Sehli Chemlali with notes of almond and green apple, to the bold and peppery Chetoui, marked by herbs and artichoke. Smooth in texture with a clean, lingering finish, they balance fruitiness, gentle bitterness, and a pleasant peppery kick — a sign of freshness and healthful polyphenols. Ideal for salads, couscous, grilled fish, meats, and as a finishing touch to elevate any dish.",
    images: [
      "https://images.unsplash.com/photo-1644604088797-a55fcf880d51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGJvdHRsZSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU0OTY4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1644604088797-a55fcf880d51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGJvdHRsZSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU0OTY4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1644604088797-a55fcf880d51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGJvdHRsZSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU0OTY4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGNvb2tpbmclMjBmcmVzaCUyMGhlcmJzfGVufDF8fHx8MTc1NDk2ODIxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    ],
    specifications: {
      volume: "500ml",
      acidity: "< 0.5%",
      harvest: "December 2025",
      extraction: "First Cold Pressed",
      certification: "Organic, PDO",
      storage: "Cool, dark place"
    },
    tastingNotes: [
      "Soft and smooth, medium fruitiness.",
      "Rich, fruity body with hints of artichoke",
      "Mild peppery finish, easy to pair with many dishes.",
      "Perfect for finishing dishes and salads",
      "More robust and intense."
    ],
    // awards: [
    //   { name: "Gold Medal", event: "International Olive Oil Competition 2024" },
    //   { name: "Best in Class", event: "Tuscany Olive Oil Awards 2024" }
    // ]
  },
  "tuniolive-500ml-evoo": {
    id: "tuniolive-500ml-evoo",
    name: "Tuscan Gold",
    origin: "Bouhajla, Kairouan, Tunisie",
    flavor: "Robust & Peppery",
    price: 45,
    originalPrice: 55,
    badge: "Best Seller",
    rating: 4.9,
    reviewCount: 127,
    description: "Tunisian olive oils express a rich Mediterranean character, ranging from the soft, fruity Sehli Chemlali with notes of almond and green apple, to the bold and peppery Chetoui, marked by herbs and artichoke. Smooth in texture with a clean, lingering finish, they balance fruitiness, gentle bitterness, and a pleasant peppery kick — a sign of freshness and healthful polyphenols. Ideal for salads, couscous, grilled fish, meats, and as a finishing touch to elevate any dish.",
    images: [
      "https://images.unsplash.com/photo-1644604088797-a55fcf880d51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGJvdHRsZSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU0OTY4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1644604088797-a55fcf880d51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGJvdHRsZSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU0OTY4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1644604088797-a55fcf880d51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGJvdHRsZSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU0OTY4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGNvb2tpbmclMjBmcmVzaCUyMGhlcmJzfGVufDF8fHx8MTc1NDk2ODIxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    ],
    specifications: {
      volume: "500ml",
      acidity: "< 0.5%",
      harvest: "December 2025",
      extraction: "First Cold Pressed",
      certification: "Organic, PDO",
      storage: "Cool, dark place"
    },
    tastingNotes: [
      "Soft and smooth, medium fruitiness.",
      "Rich, fruity body with hints of artichoke",
      "Mild peppery finish, easy to pair with many dishes.",
      "Perfect for finishing dishes and salads",
      "More robust and intense."
    ],
    // awards: [
    //   { name: "Gold Medal", event: "International Olive Oil Competition 2024" },
    //   { name: "Best in Class", event: "Tuscany Olive Oil Awards 2024" }
    // ]
  },
  "tuniolive-3l-evoo": {
    id: "tuniolive-3l-evoo",
    name: "3 Litre Tuni Olive EVOO",
    origin: "Bouhajla, Kairouan, Tunisie",
    flavor: "Robust & Peppery",
    price: 45,
    originalPrice: 55,
    badge: "Best Seller",
    rating: 4.9,
    reviewCount: 127,
    description: "Tunisian olive oils express a rich Mediterranean character, ranging from the soft, fruity Sehli Chemlali with notes of almond and green apple, to the bold and peppery Chetoui, marked by herbs and artichoke. Smooth in texture with a clean, lingering finish, they balance fruitiness, gentle bitterness, and a pleasant peppery kick — a sign of freshness and healthful polyphenols. Ideal for salads, couscous, grilled fish, meats, and as a finishing touch to elevate any dish.",
    images: [
      "https://images.unsplash.com/photo-1644604088797-a55fcf880d51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGJvdHRsZSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU0OTY4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1644604088797-a55fcf880d51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGJvdHRsZSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU0OTY4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1644604088797-a55fcf880d51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGJvdHRsZSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU0OTY4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGNvb2tpbmclMjBmcmVzaCUyMGhlcmJzfGVufDF8fHx8MTc1NDk2ODIxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    ],
    specifications: {
      volume: "500ml",
      acidity: "< 0.5%",
      harvest: "December 2025",
      extraction: "First Cold Pressed",
      certification: "Organic, PDO",
      storage: "Cool, dark place"
    },
    tastingNotes: [
      "Soft and smooth, medium fruitiness.",
      "Rich, fruity body with hints of artichoke",
      "Mild peppery finish, easy to pair with many dishes.",
      "Perfect for finishing dishes and salads",
      "More robust and intense."
    ],
    // awards: [
    //   { name: "Gold Medal", event: "International Olive Oil Competition 2024" },
    //   { name: "Best in Class", event: "Tuscany Olive Oil Awards 2024" }
    // ]
  },
  "tuniolive-500ml-bio-organic": {
    id: "tuniolive-500ml-bio-organic",
    name: "Spanish Reserve",
    origin: "Bouhajla, Kairouan, Tunisie",
    flavor: "Robust & Peppery",
    price: 45,
    originalPrice: 55,
    badge: "Best Seller",
    rating: 4.9,
    reviewCount: 127,
    description: "Tunisian olive oils express a rich Mediterranean character, ranging from the soft, fruity Sehli Chemlali with notes of almond and green apple, to the bold and peppery Chetoui, marked by herbs and artichoke. Smooth in texture with a clean, lingering finish, they balance fruitiness, gentle bitterness, and a pleasant peppery kick — a sign of freshness and healthful polyphenols. Ideal for salads, couscous, grilled fish, meats, and as a finishing touch to elevate any dish.",
    images: [
      "https://images.unsplash.com/photo-1644604088797-a55fcf880d51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGJvdHRsZSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU0OTY4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1644604088797-a55fcf880d51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGJvdHRsZSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU0OTY4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1644604088797-a55fcf880d51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGJvdHRsZSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU0OTY4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGNvb2tpbmclMjBmcmVzaCUyMGhlcmJzfGVufDF8fHx8MTc1NDk2ODIxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
    ],
    specifications: {
      volume: "500ml",
      acidity: "< 0.5%",
      harvest: "December 2025",
      extraction: "First Cold Pressed",
      certification: "Organic, PDO",
      storage: "Cool, dark place"
    },
    tastingNotes: [
      "Soft and smooth, medium fruitiness.",
      "Rich, fruity body with hints of artichoke",
      "Mild peppery finish, easy to pair with many dishes.",
      "Perfect for finishing dishes and salads",
      "More robust and intense."
    ],
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

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl mb-4">Product Not Found</h1>
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedProducts = Object.values(products).filter(p => p.id !== product.id).slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */ }
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-green-600" />
            <Link href="/" className="text-xl font-bold">Olive Grove</Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/#products" className="text-sm hover:text-primary transition-colors">Products</Link>
            <Link href="/#about" className="text-sm hover:text-primary transition-colors">About</Link>
            <Link href="/#quality" className="text-sm hover:text-primary transition-colors">Quality</Link>
            <Link href="/#contact" className="text-sm hover:text-primary transition-colors">Contact</Link>
          </nav>
          <Button>Shop Now</Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */ }
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/#products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <span className="text-foreground">{ product.name }</span>
        </div>

        {/* Back Button */ }
        <Link href="/" className="inline-flex items-center space-x-2 text-sm hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Link>

        {/* Product Details */ }
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */ }
          <div className="space-y-4">
            <div className="relative h-96 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={ product.images[0] }
                alt={ product.name }
                className="w-full h-full object-cover"
              />
              <Badge className="absolute top-4 left-4">{ product.badge }</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4">
              { product.images.slice(1).map((image, index) => (
                <div key={ index } className="relative h-32 rounded-lg overflow-hidden">
                  <ImageZoom
                    src={ image }
                    alt={ `${product.name} ${index + 2}` }
                    className="w-full h-full object-cover"
                  />
                </div>
              )) }
            </div>
          </div>

          {/* Product Info */ }
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span>{ product.origin }</span>
              </div>
              <h1 className="text-3xl mb-2">{ product.name }</h1>
              <p className="text-muted-foreground mb-4">{ product.flavor }</p>

              <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  { [...Array(5)].map((_, i) => (
                    <Star
                      key={ i }
                      className={ `h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}` }
                    />
                  )) }
                  <span className="text-sm text-muted-foreground ml-2">({ product.rating }) • { product.reviewCount } reviews</span>
                </div>
              </div>

              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl text-green-600">${ product.price }</span>
                { product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">${ product.originalPrice }</span>
                ) }
              </div>
            </div>

            <p className="text-muted-foreground leading-relaxed">{ product.description }</p>

            {/* Quantity and Add to Cart */ }
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm">Quantity:</span>
                <div className="flex items-center border rounded-md">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="px-4 py-2 text-sm">1</span>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button disabled size="lg" className="flex-1 bg-green-600 hover:bg-green-700">
                  Sold out
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Features */ }
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-2 text-sm">
                <Leaf className="h-4 w-4 text-green-600" />
                <span>100% Naturelle</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Cold Pressed</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Truck className="h-4 w-4 text-green-600" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Quality Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */ }
        <Tabs defaultValue="details" className="mb-16">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="tasting">Tasting Notes</TabsTrigger>
            {/* <TabsTrigger value="awards">Awards</TabsTrigger> */ }
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Product Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  { Object.entries(product.specifications).map(([key, value]) => (
                    <div key={ key } className="flex justify-between">
                      <span className="capitalize text-muted-foreground">{ key.replace(/([A-Z])/g, ' $1') }:</span>
                      <span>{ value }</span>
                    </div>
                  )) }
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasting" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tasting Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  { product.tastingNotes.map((note, index) => (
                    <li key={ index } className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{ note }</span>
                    </li>
                  )) }
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="awards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recognition & Awards</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  { product.awards.map((award, index) => (
                    <div key={ index } className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Award className="h-6 w-6 text-yellow-500" />
                      <div>
                        <div className="font-medium">{ award.name }</div>
                        <div className="text-sm text-muted-foreground">{ award.event }</div>
                      </div>
                    </div>
                  )) }
                </div>
              </CardContent>
            </Card>
          </TabsContent> */}

          <TabsContent value="reviews" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Reviews</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                { reviews.map((review) => (
                  <div key={ review.id } className="border-b pb-6 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{ review.name }</span>
                        { review.verified && (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        ) }
                      </div>
                      <span className="text-sm text-muted-foreground">{ review.date }</span>
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      { [...Array(5)].map((_, i) => (
                        <Star
                          key={ i }
                          className={ `h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}` }
                        />
                      )) }
                    </div>
                    <p className="text-muted-foreground">{ review.comment }</p>
                  </div>
                )) }
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related Products */ }
        <section>
          <h2 className="text-2xl mb-8">You Might Also Like</h2>
          <div className="grid md:grid-cols-2 gap-8">
            { relatedProducts.map((relatedProduct) => (
              <Card key={ relatedProduct.id } className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src={ relatedProduct.images[0] }
                    alt={ relatedProduct.name }
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4">{ relatedProduct.badge }</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    { relatedProduct.name }
                    <span className="text-green-600">${ relatedProduct.price }</span>
                  </CardTitle>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{ relatedProduct.origin }</p>
                    <p className="text-sm">{ relatedProduct.flavor }</p>
                    <div className="flex items-center space-x-1">
                      { [...Array(5)].map((_, i) => (
                        <Star key={ i } className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )) }
                      <span className="text-sm text-muted-foreground ml-2">({ relatedProduct.rating })</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link href={ `/products/${relatedProduct.id}` }>
                    <Button className="w-full">View Details</Button>
                  </Link>
                </CardContent>
              </Card>
            )) }
          </div>
        </section>
      </div>

      {/* Footer */ }
      <footer className="bg-primary text-primary-foreground py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6" />
                <span className="text-lg font-bold">Olive Grove</span>
              </div>
              <p className="text-sm opacity-80">
                Premium Mediterranean olive oil from family groves since 1723.
              </p>
            </div>
            <div>
              <h4 className="mb-4">Products</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>Extra Virgin Olive Oil</li>
                <li>Flavored Oils</li>
                <li>Gift Sets</li>
                <li>Bulk Orders</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Company</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>About Us</li>
                <li>Our Story</li>
                <li>Sustainability</li>
                <li>Awards</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4">Support</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>Contact</li>
                <li>Shipping</li>
                <li>Returns</li>
                <li>FAQ</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-80">
            <p>&copy; 2025 Olive Grove. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}