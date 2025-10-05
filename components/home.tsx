'use client'
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Leaf, Star, Shield, Truck, Mail, Phone, MapPin, Send, Sheet } from "lucide-react";
import Link from "next/link";

import Contact from "@/components/contact";
import Header from "@/components/header";
import { useLanguage } from "@/contexts/language-context";

export default function ClientHome() {
  const { t, isRTL } = useLanguage();


  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */ }
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1644604088797-a55fcf880d51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGJvdHRsZSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU0OTY4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Premium olive oil bottle"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white max-w-4xl px-4">
          <h1 className="text-4xl md:text-6xl mb-6">
            Pure Tunisian Excellence
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Experience the finest extra virgin olive oil, cold-pressed from centuries-old groves
            in the heart of the Tunisia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              Explore Collection
            </Button>
            <Button size="lg" variant="outline" className="bg-yellow-400 hover:bg-yellow-300 hover:text-black">
              Learn Our Story
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */ }
      <section id="products" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Featured Products</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our premium selection of extra virgin and organic olive oils from Tunisia, each with unique characteristics
              and flavors. With different types of olives (Sehli. Chemlali, ...) and production methods (hand picked, first cold pressed),
              our oils offer a range of tastes from robust and peppery to smooth and buttery.
              Experience the essence of the Mediterranean in every drop.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            { [
              {
                id: "tuniolive-1l-evoo",
                name: "Tuni Olive 1L EVOO",
                origin: "Bouhajla, Kairouan, Tunisie",
                flavor: "Robust & Peppery",
                // price: "$45",
                badge: "Best Seller"
              },
              {
                id: "tuniolive-500ml-evoo",
                name: "500 ML Tuni Olive EVOO",
                origin: "Bouhajla, Kairouan, Tunisie",
                flavor: "Robust & Peppery",
                // price: "$25",
                badge: "Popular"
              },
              {
                id: "tuniolive-3l-evoo",
                name: "3 Litre Tuni Olive EVOO",
                origin: "Bouhajla, Kairouan, Tunisie",
                flavor: "Robust & Peppery",
                // price: "$25",
                badge: "Premium"
              },
              {
                id: "tuniolive-500ml-bio-organic",
                name: "500 ML Tuni Olive Bio",
                origin: "Bouhajla, Kairouan, Tunisie",
                flavor: "Robust & Peppery",
                // price: "$25",
                badge: "Premium"
              }
            ].map((product, index) => (
              <Card key={ index } className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                <div className="relative h-64 overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1644604088797-a55fcf880d51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHhvbGl2ZSUyMG9pbCUyMGJvdHRsZSUyMG1lZGl0ZXJyYW5lYW58ZW58MXx8fHwxNzU0OTY4MjEzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                    alt={ product.name }
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4">{ product.badge }</Badge>
                </div>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    { product.name }
                    {/* <span className="text-green-600">{ product.price }</span> */ }
                  </CardTitle>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{ product.origin }</p>
                    <p className="text-sm">{ product.flavor }</p>
                    <div className="flex items-center space-x-1">
                      { [...Array(5)].map((_, i) => (
                        <Star key={ i } className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )) }
                      <span className="text-sm text-muted-foreground ml-2">(4.9)</span>
                    </div>
                  </div>
                </CardHeader>
                <Link href={ `/products/${product.id}` }>
                  <CardContent>
                    <Button className="w-full">
                      View Details
                    </Button>
                  </CardContent>
                </Link>
                <CardContent>
                  <Button disabled variant={ "green" } className="w-full">Sold out</Button>
                </CardContent>
              </Card>
            )) }
          </div>
        </div>
      </section >

      {/* About Section */ }
      < section id="about" className="py-16" >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl mb-6">Our Heritage</h2>
              <p className="text-muted-foreground mb-6">
                Our story begins with Sadok,
                who lost his parents at a young age and inherited only a small, barren piece of land in Kairouan, Tunisia.
                With determination and hard work, he cleared the weeds and began planting olive trees.
              </p>
              <p className="text-muted-foreground mb-8">
                While waiting for the olives to grow, he cultivated melons, watermelons, peppers, and other fruits to support his family.
                Year after year, his efforts bore fruit, and his small plot turned into a thriving farm.
                As his olive trees matured, he expanded, purchasing more land and planting even more olives.
                Decades later, Sadok’s dedication has grown into an estate with hundreds of flourishing olive trees in the heart of Tunisia.
              </p>
              <p className="text-muted-foreground mb-8">
                Today, his family proudly shares this heritage, exporting high-quality Tunisian olives and olive oil to the world.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">300+</div>
                  <div className="text-sm text-muted-foreground">Years of Heritage</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">50,000</div>
                  <div className="text-sm text-muted-foreground">Olive Trees</div>
                </div>
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden">
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1722228097356-bd0202d99367?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGl2ZSUyMHRyZWVzJTIwZ3JvdmUlMjBsYW5kc2NhcGV8ZW58MXx8fHwxNzU0OTY4MjE2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="TuniOlive landscape"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section >

      {/* Quality & Benefits */ }
      < section id="quality" className="py-16 bg-muted/30" >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">Why Choose Our Olive Oil</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every bottle represents our unwavering commitment to quality,
              sustainability, and the authentic taste of the Mediterranean.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            { [
              {
                icon: Leaf,
                title: "100% Organic",
                description: "Certified organic farming with no pesticides or chemicals"
              },
              {
                icon: Shield,
                title: "Cold Pressed",
                description: "First cold extraction preserves nutrients and flavor"
              },
              {
                icon: Star,
                title: "Award Winning",
                description: "Recognized by international olive oil competitions"
              },
              {
                icon: Truck,
                title: "Fresh Delivery",
                description: "From grove to your table in optimal condition"
              }
            ].map((feature, index) => (
              <Card key={ index } className="text-center p-6">
                <div className="w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2">{ feature.title }</h3>
                <p className="text-sm text-muted-foreground">{ feature.description }</p>
              </Card>
            )) }
          </div>

          <div className="mt-16 relative h-64 rounded-lg overflow-hidden">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbGl2ZSUyMG9pbCUyMGNvb2tpbmclMjBmcmVzaCUyMGhlcmJzfGVufDF8fHx8MTc1NDk2ODIxOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="Olive oil with fresh herbs"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-2xl mb-2">Taste the Difference</h3>
                <p>Experience the rich, complex flavors that only authentic Mediterranean olive oil can provide</p>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Contact Section */ }
      <section id="contact" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4">{ t("contact.title") }</h2>
            <p className="text-muted-foreground">
              { t("contact.description") }
            </p>
          </div>
        </div>
      </section>

      <Contact />

      {/* Footer */ }
      < footer className="bg-primary text-primary-foreground py-12" >
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Leaf className="h-6 w-6" />
                <span className="text-lg font-bold">TuniOlive</span>
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
            {/* <div>
              <h4 className="mb-4">Support</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <li>Contact</li>
                <li>Shipping</li>
                <li>Returns</li>
                <li>FAQ</li>
              </ul>
            </div> */}
          </div>
          <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-80">
            <p>&copy; 2025 Tuni Olive. All rights reserved.</p>
          </div>
        </div>
      </footer >
    </div >
  );
}