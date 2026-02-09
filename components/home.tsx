'use client'
import Image from 'next/image'
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Leaf, Star, Shield, Truck, Mail, Phone, MapPin, Send, Sheet } from "lucide-react";
import Link from "next/link";

import Contact from "@/components/contact";
import { useLanguage } from "@/contexts/language-context";

export default function ClientHome() {
  const { t, isRTL } = useLanguage();


  return (
    <div className="min-h-screen bg-background">
      {/* <Header /> */ }

      {/* Hero Section */ }
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <ImageWithFallback
          src="/sadok-tuniolive.jpg"
          alt="Premium olive oil bottle"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white max-w-4xl px-4">
          <h1 className="text-4xl md:text-6xl mb-6">
            { t("hero.title") }
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            { t("hero.description") }
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <a href="/#products">
                { t("hero.explore") }
              </a>
            </Button>
            <Button size="lg" variant="outline" className="bg-yellow-400 hover:bg-yellow-300 hover:text-black">
              <a href="/#about">
                { t("hero.story") }
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Products */ }
      <section id="products" className="py-16 bg-muted/30 flex justify-center">
        <div className="container max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl mb-4"> { t("products.title") }</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              { t("products.description") }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            { [
              {
                id: "tuniolive-1l-evoo",
                name: "TuniOlive Extra Virgin Olive Oil – 1 L Bottle",
                origin: "Kairouan, Tunisie",
                flavor: "Robust & Peppery",
                image: "/tuniolive-1l/tuniolive-1l-main.jpeg"
                // price: "$45",
                // badge: "Best Seller"
              },
              {
                id: "tuniolive-750ml-evoo",
                name: "TuniOlive Extra Virgin Olive Oil - 750 ML",
                origin: "Kairouan, Tunisie",
                flavor: "Robust & Peppery",
                image: "/tuniolive-750-ml/tuniolive-750-ml-main.jpeg",
                // price: "$25",
                badge: "Popular"
              },
              {
                id: "tuniolive3l",
                name: "3 Litre Tuni Olive EVOO",
                origin: "Kairouan, Tunisie",
                flavor: "Robust & Peppery",
                image: "/tuniolive-3l/tuniolive-3l-main.jpeg",
                // price: "$25",
                badge: "Premium"
              }
            ].map((product, index) => {
              var translateString = "products.tunioliveevoo1l"
              switch (index) {
                case 0:
                  translateString = "products.tunioliveevoo1l"
                  break;
                case 1:
                  translateString = "products.tunioliveevoo750ml"
                  break;
                case 2:
                  translateString = "products.tuniolive3l"
                  break;
                case 3:
                  translateString = "products.tuniolivebio750ml"
                  break;
                default:
                  break;
              }
              return (
                <Card key={ index } className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="relative overflow-hidden">
                    <ImageWithFallback
                      src={ product.image }
                      alt={ t("products.name") }

                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* <Badge className="absolute top-4 left-4">{ product.badge }</Badge> */ }
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      { t(`${translateString}.name`) }
                      {/* <span className="text-green-600">{ product.price }</span> */ }
                    </CardTitle>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{ t(`${translateString}.origin`) }</p>
                      <p className="text-sm"> { t(`${translateString}.flavor`) }</p>
                      {/* <div className="flex items-center space-x-1">
                      { [...Array(5)].map((_, i) => (
                        <Star key={ i } className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )) }
                      <span className="text-sm text-muted-foreground ml-2">(4.9)</span>
                    </div> */}
                    </div>
                  </CardHeader>
                  <Link href={ `/products/${product.id}` }>
                    <CardContent>
                      <Button variant={ "green" } className="w-full">
                        { t("common.viewDetails") }
                      </Button>
                    </CardContent>
                  </Link>
                  {/* <CardContent>
                  <Button disabled variant={ "green" } className="w-full">Sold out</Button>
                </CardContent> */}
                </Card>
              )
            }) }
          </div>
        </div>
      </section >

      {/* About Section */ }
      < section id="about" className="py-16" >
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl mb-6"> { t("about.title") }</h2>
              <p className="text-muted-foreground mb-6">
                { t("about.paragraph1") }
              </p>
              <p className="text-muted-foreground mb-8">
                { t("about.paragraph2") }
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">100+</div>
                  <div className="text-sm text-muted-foreground">{ t("about.yearsOfHeritage") }</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-2">10,000</div>
                  <div className="text-sm text-muted-foreground">{ t("about.oliveTrees") }</div>
                </div>
              </div>
            </div>
            <div className="relative h-96 rounded-lg overflow-hidden">
              <ImageWithFallback
                src="/sadok-tuniolive.jpg"
                alt="TuniOlive tunisian olive oil"
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
            <h2 className="text-3xl md:text-4xl mb-4">{ t("quality.title") }</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              { t("quality.description") }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            { [
              {
                icon: Leaf,
                title: "100% Organic & Clean Farming",
                description: "No chemical pesticides. No synthetic additives. Just pure, natural cultivation."
              },
              {
                icon: Shield,
                title: "First Cold Pressed",
                description: "We extract the oil at low temperatures to preserve nutrients, aroma, and freshness."
              },
              {
                icon: Star,
                title: "Award-Winning Quality",
                description: "Our olive oils are judged and honored in international competitions, reflecting global recognition."
              },
              {
                icon: Truck,
                title: "From Grove to Table Freshness",
                description: "We manage the supply chain tightly so you receive oil in peak condition — vibrant, fragrant and flavorful."
              },
              {
                icon: Star,
                title: "Distinct Flavor Profiles",
                description: "From robust, peppery notes to mellow, buttery textures — we have an expression for every palate and cuisine."
              }
            ].map((feature, index) => {
              var translateString = "quality.organic"
              switch (index) {
                case 0:
                  translateString = "quality.organic"
                  break;
                case 1:
                  translateString = "quality.coldPressed"
                  break;
                case 2:
                  translateString = "quality.award"
                  break;
                case 3:
                  translateString = "quality.delivery"
                  break;
                case 4:
                  translateString = "quality.taste"
                  break;
                default:
                  break;
              }
              return (
                <Card key={ index } className="text-center p-3">
                  <div className="w-12 h-12 mx-auto mb-5 bg-green-100 rounded-full flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="mb-2"> { t(`${translateString}.title`) }</h3>
                  <p className="text-sm text-muted-foreground"> { t(`${translateString}.description`) }</p>
                </Card>
              )
            }) }
          </div>

          <div className="mt-16 relative h-64 rounded-lg overflow-hidden">
            <ImageWithFallback
              src="/tuniolive-tree.JPG"
              alt="Olive oil with fresh herbs"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white">
                <h3 className="text-2xl mb-2"> { t(`quality.tasteDifference`) }</h3>
                <p>{ t(`quality.taseDescription`) }</p>
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

    </div >
  );
}