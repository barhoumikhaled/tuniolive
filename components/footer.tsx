import React from 'react'
import Image from 'next/image'
import { useLanguage } from '@/contexts/language-context';

export default function Footer() {
  const { t, isRTL } = useLanguage();

  return (
    < footer className="bg-primary text-primary-foreground py-12" >
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <a href="/">
              <div className="flex items-center space-x-2 mb-4">
                <Image src="/tuniolive-white.png" alt="Tunisian Olive oil" width={ 140 } height={ 10 } />
              </div>
            </a>
            <p className="text-sm opacity-80">
              { t("footer.tagline") }
            </p>
          </div>
          <div>
            <h4 className="mb-4">{ t("footer.products") }</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>{ t("footer.extraVirgin") }</li>
              <li>{ t("footer.flavored") }</li>
              <li>{ t("footer.giftSets") }</li>
              <li>{ t("footer.bulkOrders") }</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4">{ t("footer.company") }</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>{ t("footer.aboutUs") }</li>
              <li>{ t("footer.ourStory") }</li>
              <li>{ t("footer.sustainability") }</li>
              <li>{ t("footer.awards") }</li>
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
            </div>  */}
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm opacity-80">
          <p>&copy; { t("footer.copyright") }</p>
        </div>
      </div>
    </footer >
  )
}
