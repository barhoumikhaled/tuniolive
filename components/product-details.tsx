'use client'
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import {
  Leaf,
  Star,
  Shield,
  Snowflake,
  Sun,
  HeartPulse,
  // HeartPlus,
  ArrowLeft,
  MapPinCheck,
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
import { ShareButton } from "@/components/share-button";
import { NextSeo } from "next-seo";
import CustomImage from "@/components/custom-image";
import { useLanguage } from "@/contexts/language-context";
import { Product } from "@/models/product";
export default function ProductDetail(
  {
    params
  }: {
    params: { product: Product, products: Product[] }
  }) {
  const { t, isRTL } = useLanguage();

  const { product, products } = params
  let translateString = "productDetails.oliveoil1l"
  console.log(products)
  switch (product.id) {
    case "tuniolive-1l-evoo":
      translateString = "productDetails.oliveoil1l"
      break;
    case "tuniolive-500ml-evoo":
      translateString = "productDetails.oliveoil500ml"
      break;
    case "tuniolive-3l-evoo":
      translateString = "productDetails.oliveoil3l"
      break;
    case "tuniolive-500ml-bio-organic":
      translateString = "productDetails.oliveoilbio500ml"
      break;

    default:
      break;
  }

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

  return (
    <div className="min-h-screen bg-background">

      {/* <NextSeo
        title={ `${product.name} - Premium ${product.origin} Olive Oil` }
        description={ product.description }
        openGraph={ {
          title: `${product.name} - Premium ${product.origin} Olive Oil`,
          description: product.description,
          url: `https://yourdomain.com/products/${product.id}`,
          images: [
            {
              url: product.images[0],
              width: 800,
              height: 600,
              alt: product.name,
            },
          ],
          site_name: "TuniOlive",
        } }
      /> */}

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */ }
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <Link href="/#products" className="hover:text-primary">Products</Link>
          <span>/</span>
          <span className="text-foreground">{ product.name }{ t(`${translateString}.name`) }</span>
        </div>

        {/* Back Button */ }
        <Link href="/" className="inline-flex items-center space-x-2 text-sm hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Products</span>
        </Link>

        {/* Product Details */ }
        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */ }
          <CustomImage product={ product } />

          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span>{ t(`${translateString}.origin`) }</span>
              </div>
              <h1 className="text-3xl mb-2"> { t(`${translateString}.name`) }</h1>
              <p className="text-muted-foreground mb-4">{ t(`${translateString}.flavor`) }</p>

              {/* <div className="flex items-center space-x-4 mb-4">
                <div className="flex items-center space-x-1">
                  { [...Array(5)].map((_, i) => (
                    <Star
                      key={ i }
                      className={ `h-4 w-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}` }
                    />
                  )) }
                  <span className="text-sm text-muted-foreground ml-2">({ product.rating }) • { product.reviewCount } reviews</span>
                </div>
              </div> */}

              {/* <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl text-green-600">${ product.price }</span>
                { product.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">${ product.originalPrice }</span>
                ) }
              </div> */}
            </div>

            <p className="text-muted-foreground leading-relaxed">{ t(`${translateString}.description`) }</p>

            {/* Quantity and Add to Cart */ }
            <div className="space-y-4">
              {/* <div className="flex items-center space-x-4">
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
              </div> */}

              <div className="flex space-x-4">
                {/* <Button disabled size="lg" className="flex-1 bg-green-600 hover:bg-green-700">
                  Sold out
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-4 w-4 mr-2" />
                  Save
                </Button> */}
                <ShareButton
                  url={ `/products/${product.id}` }
                  title={ `${product.name} - Premium ${product.origin} Olive Oil` }
                  description={ product.description }
                  variant="outline"
                  size="lg"
                />
              </div>
            </div>

            {/* Features */ }
            <div className="grid grid-cols-2 gap-4 pt-6 border-t">
              <div className="flex items-center space-x-2 text-sm">
                <Snowflake className="h-4 w-4 text-green-600" />
                <span>{ t(`${translateString}.features.0.name`) }</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <MapPinCheck className="h-4 w-4 text-green-600" />
                <span>{ t(`${translateString}.features.1.name`) }</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Sun className="h-4 w-4 text-green-600" />
                <span>{ t(`${translateString}.features.2.name`) }</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>{ t(`${translateString}.features.3.name`) }</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <HeartPulse className="h-4 w-4 text-green-600" />
                <span>{ t(`${translateString}.features.4.name`) }</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */ }
        <Tabs defaultValue="details" className="mb-16">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">{ t(`productDetails.tab1`) }</TabsTrigger>
            <TabsTrigger value="tasting">{ t(`productDetails.tab2`) }</TabsTrigger>
            <TabsTrigger value="awards">{ t(`productDetails.tab3`) }</TabsTrigger>
            {/* <TabsTrigger value="reviews">Reviews</TabsTrigger> */ }
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <Card>
              {/* <CardHeader>
                <CardTitle>TuniOlive Specifications</CardTitle>
              </CardHeader> */}
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  { Object.entries(product.specifications).map(([key, value]) => {
                    return (
                      <div key={ key } className="flex justify-between">
                        <span className="capitalize text-muted-foreground">{ key.replace(/([A-Z])/g, ' $1') }:</span>
                        {/* <span>{ t(`${translateString}.${key}`) }</span> */ }
                        <span>{ t(`${translateString}.specifications.${key}`) }</span>
                      </div>
                    )
                  }) }
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
                      {/* <span>{ note }</span> */ }
                      <span>{ t(`${translateString}.tastingNotes.${index}`) }</span>
                    </li>
                  )) }
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="awards" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle></CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  { product.features.map((award, index) => (
                    <div key={ index } className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Award className="h-6 w-6 text-yellow-500" />
                      <div>
                        <div className="font-medium">{ t(`${translateString}.features.${index}.name`) }</div>
                        <div className="text-sm text-muted-foreground">{ t(`${translateString}.features.${index}.value`) }</div>
                      </div>
                    </div>
                  )) }
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* <TabsContent value="reviews" className="space-y-4">
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
          </TabsContent> */}
        </Tabs>

        {/* Related Products */ }
        <section>
          <h2 className="text-2xl mb-8">{ t(`productDetails.youMayLike`) }</h2>
          <div className="grid md:grid-cols-2 gap-8">
            { products.map((relatedProduct) => {
              let translateString = "productDetails.oliveoil1l"
              switch (relatedProduct.id) {
                case "tuniolive-1l-evoo":
                  translateString = "productDetails.oliveoil1l"
                  break;
                case "tuniolive-500ml-evoo":
                  translateString = "productDetails.oliveoil500ml"
                  break;
                case "tuniolive-3l-evoo":
                  translateString = "productDetails.oliveoil3l"
                  break;
                case "tuniolive-500ml-bio-organic":
                  translateString = "productDetails.oliveoilbio500ml"
                  break;

                default:
                  break;
              }
              console.log(product.id)
              return (
                <Card key={ relatedProduct.id } className="overflow-hidden group hover:shadow-lg transition-all duration-300">
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={ relatedProduct.images[0] }
                      alt={ relatedProduct.name }
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* <Badge className="absolute top-4 left-4">{ relatedProduct.badge }</Badge> */ }
                  </div>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      { t(`${translateString}.name`) }
                      {/* <span className="text-green-600">${ relatedProduct.price }</span> */ }
                    </CardTitle>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">{ t(`${translateString}.origin`) }</p>
                      <p className="text-sm">{ t(`${translateString}.flavor`) }</p>
                      {/* <div className="flex items-center space-x-1">
                      { [...Array(5)].map((_, i) => (
                        <Star key={ i } className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      )) }
                      <span className="text-sm text-muted-foreground ml-2">({ relatedProduct.rating })</span>
                    </div> */}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Link href={ `/products/${relatedProduct.id}` }>
                      <Button className="w-full">{ t(`common.viewDetails`) }</Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            }) }
          </div>
        </section>
      </div>
    </div>
  );
}