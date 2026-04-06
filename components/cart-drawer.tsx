  "use client";

  import { useCart } from "@/contexts/cart-context";
  import { Button } from "@/components/ui/button";
  import {
    Sheet,
    SheetContent,
    SheetTrigger,
  } from "@/components/ui/sheet";
  import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
  import Image from "next/image";
  import { useRouter } from "next/navigation";
  import { useLanguage } from "@/contexts/language-context";
  import { DialogTitle } from "@radix-ui/react-dialog";
  import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

  export default function CartDrawer() {
    const { items, removeItem, updateQuantity, totalItems, totalPrice, isCartOpen, setIsCartOpen } = useCart();
    const { t } = useLanguage();
    const router = useRouter();
    const handleCheckout = () => {
      setIsCartOpen(false);
      router.push("/checkout");
    };

    return (
      <Sheet open={ isCartOpen } onOpenChange={ setIsCartOpen }>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            { totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                { totalItems }
              </span>
            ) }
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[350px] sm:w-[420px] flex flex-col">
          <VisuallyHidden>
            <DialogTitle>{ t("cart.title") }</DialogTitle>
          </VisuallyHidden>
          <div className="flex items-center justify-between pb-4 border-b">
            <h2 className="text-lg font-semibold">{ t("cart.title") }</h2>
          </div>

          { items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{ t("cart.empty") }</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                { items.map((item) => (
                  <div key={ item.id } className="flex gap-3 p-3 border rounded-lg">
                    <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden">
                      <Image
                        src={ item.image }
                        alt={ item.name }
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ item.name }</p>
                      <p className="text-sm text-green-600 font-semibold">${ item.price }</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={ () => updateQuantity(item.id, item.quantity - 1) }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm w-6 text-center">{ item.quantity }</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={ () => updateQuantity(item.id, item.quantity + 1) }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 ml-auto text-destructive"
                          onClick={ () => removeItem(item.id) }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )) }
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex justify-between text-lg font-semibold">
                  <span>{ t("cart.total") }</span>
                  <span>${ totalPrice.toFixed(2) }</span>
                </div>
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                  onClick={ handleCheckout }
                >
                  { t("cart.checkout") }
                </Button>
              </div>
            </>
          ) }
        </SheetContent>
      </Sheet>
    );
  }
