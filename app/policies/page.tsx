"use client";

import { useState } from "react";
import { Shield, Truck, RotateCcw, Package, ScrollText, Mail, ChevronRight, ArrowLeft } from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { useLanguage } from "@/contexts/language-context";

const policies = [
  { id: "privacy", label: "Privacy Policy", icon: Shield },
  { id: "shipping", label: "Shipping Policy", icon: Truck },
  { id: "subscription", label: "Subscription Policy", icon: Package },
  { id: "refund", label: "Refund Policy", icon: RotateCcw },
  { id: "delivery", label: "Delivery Policy", icon: Package },
  { id: "terms", label: "Terms of Service", icon: ScrollText },
];

function ContactBlock() {
  const { t, isRTL } = useLanguage();
  return (
    <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-5 space-y-3">
      <p className="text-green-800 text-sm font-medium flex items-center gap-2">
        <Mail className="h-4 w-4" /> { t("policyContact.contactUs") }:
      </p>
      <div className="space-y-1">
        <a href="mailto:support@tuniolive.com" className="block text-green-700 hover:underline text-sm font-medium">
          support@tuniolive.com
        </a>
        <a href="mailto:onlinesales@tuniolive.com" className="block text-green-700 hover:underline text-sm font-medium">
          onlinesales@tuniolive.com
        </a>
      </div>
      <p className="text-xs text-green-700 opacity-80">{ t("policyContact.weAim") }.</p>
    </div>
  )
}

function renderPolicyContent(id: string, t: (key: string) => string) {
  switch (id) {
    case "privacy":
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl mb-1">{ t("policies.privacy.title") }</h2>
            <p className="text-xs text-muted-foreground">{ t("policies.privacy.privacyPolicy") }</p>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            { t("policies.privacy.description") }
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">1. { t("policies.privacy.informationWeCollect.title") }</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li><strong>{ t("policies.privacy.informationWeCollect.personalIdentifiers") }:</strong> { t("policies.privacy.informationWeCollect.collectedInfo") }.</li>
              <li><strong>{ t("policies.privacy.informationWeCollect.paymentInfo") }:</strong> { t("policies.privacy.informationWeCollect.collectedPayment") }.</li>
              <li><strong>{ t("policies.privacy.informationWeCollect.usageData") }:</strong> { t("policies.privacy.informationWeCollect.usageCollect") }.</li>
              <li><strong>{ t("policies.privacy.informationWeCollect.communicationData") }:</strong>  { t("policies.privacy.informationWeCollect.communicationCollect") }.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">2. { t("policies.privacy.howWeUseInformation.title") }</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li>{ t("policies.privacy.howWeUseInformation.processFulfil") }.</li>
              <li>{ t("policies.privacy.howWeUseInformation.respondInquireies") }.</li>
              <li>{ t("policies.privacy.howWeUseInformation.transactionalEmail") }.</li>
              <li>{ t("policies.privacy.howWeUseInformation.improveWebsite") }.</li>
              <li>{ t("policies.privacy.howWeUseInformation.comply") }.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">3. { t("policies.privacy.sharingData.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("policies.privacy.sharingData.description") }.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">4. { t("policies.privacy.cookies.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("policies.privacy.cookies.description") }.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">5. { t("policies.privacy.dataRetention.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("policies.privacy.dataRetention.description") }.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">6. { t("policies.privacy.rights.title") }</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li>{ t("policies.privacy.rights.right1") }.</li>
              <li>{ t("policies.privacy.rights.right2") }.</li>
              <li>{ t("policies.privacy.rights.right3") }.</li>
              <li>{ t("policies.privacy.rights.right4") }.</li>
            </ul>
            <p className="text-muted-foreground text-sm mt-2">{ t("policies.privacy.rights.description") }.</p>
          </div>

          <ContactBlock />
        </div>
      );

    case "shipping":
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl mb-1">{ t("shippingPolicies.title") }</h2>
            <p className="text-xs text-muted-foreground">{ t("shippingPolicies.lastUpdate") }</p>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            { t("shippingPolicies.description") }.
          </p>

          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">1. { t("shippingPolicies.processingTime.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("shippingPolicies.processingTime.part1") } <strong>{ t("shippingPolicies.processingTime.part2") }</strong> { t("shippingPolicies.processingTime.part3") }.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">2. { t("shippingPolicies.shippingDestination.title") }</h3>
            <p className="text-muted-foreground text-sm mb-2">{ t("shippingPolicies.shippingDestination.shiprRegion") }:</p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li>{ t("shippingPolicies.shippingDestination.region1") }</li>
              {/* <li>European Union</li>
          <li>United Kingdom</li>
          <li>Middle East & North Africa</li>
          <li>Australia & New Zealand</li> */}
            </ul>
            <p className="text-muted-foreground text-sm mt-2">{ t("shippingPolicies.shippingDestination.description") }.</p>
          </div>

          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">3. { t("shippingPolicies.shippingMethod.title") }</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border rounded-lg overflow-hidden">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-2">{ t("shippingPolicies.shippingMethod.method") }</th>
                    <th className="text-left px-4 py-2">{ t("shippingPolicies.shippingMethod.estimatedTime") }</th>
                    <th className="text-left px-4 py-2">{ t("shippingPolicies.shippingMethod.cost") }</th>
                  </tr>
                </thead>
                <tbody>
                  { [
                    [t("shippingPolicies.shippingMethod.standard"), t("shippingPolicies.shippingMethod.sday"), t("shippingPolicies.shippingMethod.from") + " 15.99"],
                    [t("shippingPolicies.shippingMethod.express"), t("shippingPolicies.shippingMethod.eday"), t("shippingPolicies.shippingMethod.from") + " $16.99"],
                    [t("shippingPolicies.shippingMethod.international"), t("shippingPolicies.shippingMethod.iday"), t("shippingPolicies.shippingMethod.from") + " $20.99"],
                    [t("shippingPolicies.shippingMethod.free"), t("shippingPolicies.shippingMethod.fday"), t("shippingPolicies.shippingMethod.ordersOver") + " $80"],
                  ].map(([method, time, cost], i) => (
                    <tr key={ i } className={ i % 2 === 0 ? "bg-white" : "bg-muted/20" }>
                      <td className="px-4 py-2">{ method }</td>
                      <td className="px-4 py-2 text-muted-foreground">{ time }</td>
                      <td className="px-4 py-2 text-green-700 font-medium">{ cost }</td>
                    </tr>
                  )) }
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">4. { t("shippingPolicies.packaging.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("shippingPolicies.packaging.description") }.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">5. { t("shippingPolicies.tracking.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("shippingPolicies.tracking.description") }.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">6. { t("shippingPolicies.damageLost.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("shippingPolicies.damageLost.part1") } <strong>{ t("shippingPolicies.damageLost.part2") }</strong> { t("shippingPolicies.damageLost.part3") }.
            </p>
          </div>

          <ContactBlock />
        </div>
      );

    case "subscription":
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl mb-1">{ t("subscriptionPolicy.title") }</h2>
            <p className="text-xs text-muted-foreground">{ t("subscriptionPolicy.lastUpdate") }</p>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            { t("subscriptionPolicy.description") }.
          </p>

          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">1. { t("subscriptionPolicy.subcription.title") }</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li>{ t("subscriptionPolicy.subcription.choose") }.</li>
              <li>{ t("subscriptionPolicy.subcription.card") }.</li>
              <li>{ t("subscriptionPolicy.subcription.receive") } <strong>{ t("subscriptionPolicy.subcription.receiveDay") }</strong> { t("subscriptionPolicy.subcription.receiveAfter") }.</li>
            </ul>
          </div>

          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">2. { t("subscriptionPolicy.pricing.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("subscriptionPolicy.pricing.part1") }<strong>{ t("subscriptionPolicy.pricing.part2") }</strong> { t("subscriptionPolicy.pricing.part3") }.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">3. { t("subscriptionPolicy.pausing.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("subscriptionPolicy.pausing.part1") } <strong>{ t("subscriptionPolicy.pausing.part2") }</strong> { t("subscriptionPolicy.pausing.part3") }.
            </p>
          </div>

          <div className="space-y-6">
            <h3 className="text-base font-semibold text-foreground">4. { t("subscriptionPolicy.cancellation.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("subscriptionPolicy.cancellation.part1") } <strong>{ t("subscriptionPolicy.cancellation.part2") }</strong> { t("subscriptionPolicy.cancellation.part3") }.
            </p>
          </div>

          <div title="5. ">
            <h3 className="text-base font-semibold text-foreground">5. { t("subscriptionPolicy.product.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("subscriptionPolicy.product.description") }.
            </p>
          </div>

          <ContactBlock />
        </div>
      );

    case "refund":
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl mb-1">{ t("refundPolicy.title") }</h2>
            <p className="text-xs text-muted-foreground">{ t("refundPolicy.lastUpdate") }</p>
          </div>

          {/* Important notice banner */ }
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 flex gap-3">
            <span className="text-2xl">🫒</span>
            <div className="space-y-1">
              <p className="text-amber-900 font-semibold text-sm">{ t("refundPolicy.importantNotice") }</p>
              <p className="text-amber-800 text-sm leading-relaxed">
                { t("refundPolicy.noticePart1") } <strong>{ t("refundPolicy.noticePart2") }</strong>. { t("refundPolicy.noticePart3") } <strong>{ t("refundPolicy.noticePart4") }</strong> { t("refundPolicy.noticePart5") }.
              </p>
            </div>
          </div>

          <p className="text-muted-foreground leading-relaxed">
            { t("refundPolicy.description") }.
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">1. { t("refundPolicy.noRefunds.title") }</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li> { t("refundPolicy.noRefunds.why1Part1") } <strong>{ t("refundPolicy.noRefunds.why1Part2") }</strong> { t("refundPolicy.noRefunds.why1Part3") }.</li>
              <li> { t("refundPolicy.noRefunds.why2") }.</li>
              <li>{ t("refundPolicy.noRefunds.why3") }.</li>
              <li>{ t("refundPolicy.noRefunds.why4") }.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">2. { t("refundPolicy.weResolve.title") }</h3>
            <p className="text-muted-foreground text-sm mb-2">
              { t("refundPolicy.weResolve.descriptionPart1") } <strong>{ t("refundPolicy.weResolve.descriptionPart2") }</strong> { t("refundPolicy.weResolve.descriptionPart3") }:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li><strong>{ t("refundPolicy.weResolve.why1Part1") }:</strong> { t("refundPolicy.weResolve.why1Part2") }.</li>
              <li><strong>{ t("refundPolicy.weResolve.why2Part1") }:</strong> { t("refundPolicy.weResolve.why2Part2") }.</li>
              <li><strong>{ t("refundPolicy.weResolve.why3Part1") }:</strong> { t("refundPolicy.weResolve.why3Part2") }.</li>
              <li><strong>{ t("refundPolicy.weResolve.why4Part1") }:</strong> { t("refundPolicy.weResolve.why4Part2") }.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">3. { t("refundPolicy.report.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("refundPolicy.report.desriptionPart1") } <strong>{ t("refundPolicy.report.desriptionPart2") }</strong> { t("refundPolicy.report.desriptionPart3") }:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground text-sm">
              <li>{ t("refundPolicy.report.report1") }</li>
              <li>{ t("refundPolicy.report.report2") }</li>
              <li>{ t("refundPolicy.report.report3") }</li>
            </ul>
            <p className="text-muted-foreground text-sm mt-2">
              { t("refundPolicy.report.notePart1") } <strong>{ t("refundPolicy.report.notePart2") } </strong>.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">4. { t("refundPolicy.credit.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("refundPolicy.credit.creditPart1") } <strong>{ t("refundPolicy.credit.creditPart2") }</strong> { t("refundPolicy.credit.creditPart3") }.
            </p>
          </div>

          <ContactBlock />
        </div>
      );

    case "delivery":
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl mb-1">{ t("delivryPolicy.title") }</h2>
            <p className="text-xs text-muted-foreground">{ t("delivryPolicy.lastUpdate") }</p>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            { t("delivryPolicy.description") }.
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">1. { t("delivryPolicy.deliveryPartner.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("delivryPolicy.deliveryPartner.description") }.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">2. { t("delivryPolicy.deliveryAdresse.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("delivryPolicy.deliveryAdresse.description") }.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">3. { t("delivryPolicy.deliveryAttempt.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("delivryPolicy.deliveryAttempt.descriptionPart1") } <strong>{ t("delivryPolicy.deliveryAttempt.descriptionPart2") } </strong>. { t("delivryPolicy.deliveryAttempt.descriptionPart3") }.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">4. { t("delivryPolicy.deliveryTimeFrame.title") }</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              { [
                { region: "usa", time: "day515" },
                { region: "canada", time: "day510" },
                // { region: "European Union", time: "3–7 business days" },
                // { region: "United Kingdom", time: "3–6 business days" },
                // { region: "Middle East & North Africa", time: "5–10 business days" },
                // { region: "Australia & New Zealand", time: "7–14 business days" },
              ].map(({ region, time }) => (
                <div key={ region } className="flex items-center justify-between p-3 border rounded-lg bg-muted/20">
                  <span className="text-sm font-medium">{ renderRegion(region, t) }</span>
                  <span className="text-sm text-muted-foreground">{ renderTime(time, t) }</span>
                </div>
              )) }
            </div>
            <p className="text-muted-foreground text-sm mt-3">
              { t("delivryPolicy.deliveryTimeFrame.description") }.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">5. { t("delivryPolicy.customDuties.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("delivryPolicy.customDuties.description") }.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">6. { t("delivryPolicy.handling.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("delivryPolicy.handling.description") }.
            </p>
          </div>

          <ContactBlock />
        </div>
      );
    case "terms":
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl mb-1">{ t("termsPolicy.title") }</h2>
            <p className="text-xs text-muted-foreground">{ t("termsPolicy.lastUpdate") }</p>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            { t("termsPolicy.description") }.
          </p>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">1. { t("termsPolicy.accpetanceTerms.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("termsPolicy.accpetanceTerms.description") }.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">2. { t("termsPolicy.productPricing.title") }</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li>{ t("termsPolicy.productPricing.point1") }.</li>
              <li>{ t("termsPolicy.productPricing.point2") }.</li>
              <li>{ t("termsPolicy.productPricing.point3") }.</li>
              <li>{ t("termsPolicy.productPricing.point4") }.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">3. { t("termsPolicy.ordersPayment.title") }</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground text-sm">
              <li>{ t("termsPolicy.ordersPayment.point1") }.</li>
              <li>{ t("termsPolicy.ordersPayment.point2") }.</li>
              <li>{ t("termsPolicy.ordersPayment.point3") }.</li>
              <li>{ t("termsPolicy.ordersPayment.point4") }.</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">4. { t("termsPolicy.intellictualProperty.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("termsPolicy.intellictualProperty.title") }.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">5. { t("termsPolicy.limitations.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("termsPolicy.limitations.description") }.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">6. { t("termsPolicy.governing.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("termsPolicy.governing.description") }.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">7. { t("termsPolicy.changeToTerms.title") }</h3>
            <p className="text-muted-foreground text-sm">
              { t("termsPolicy.changeToTerms.description") }.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground">8. { t("termsPolicy.contact.title") }</h3>
            <p className="text-muted-foreground text-sm">{ t("termsPolicy.contact.contactAt") }:</p>
          </div>

          <ContactBlock />
        </div>
      );

    default:
      return null;
  }
}

function renderRegion(region: string, t: (key: string) => string) {
  switch (region) {
    case "usa":
      return t("delivryPolicy.deliveryTimeFrame.region.usa");
    case "canada":
      return t("delivryPolicy.deliveryTimeFrame.region.canada");

    default:
      break;
  }
}

function renderTime(time: string, t: (key: string) => string) {
  switch (time) {
    case "day515":
      return t("delivryPolicy.deliveryTimeFrame.time.day515");
    case "day510":
      return t("delivryPolicy.deliveryTimeFrame.time.day510");

    default:
      break;
  }
}

function renderPolicy(policy: string, t: (key: string) => string) {
  switch (policy) {
    case "privacy":
      return t("policies.policyDocument.details");
    case "shipping":
      return t("shippingPolicies.policyDocument.details");
    case "subscription":
      return t("subscriptionPolicy.policyDocument.details");
    case "refund":
      return t("refundPolicy.policyDocument.details");
    case "delivery":
      return t("delivryPolicy.policyDocument.details");
    case "terms":
      return t("termsPolicy.policyDocument.details");
    default:
      break;
  }
}

function renderNavigationLabel(label: string, t: (key: string) => string) {
  switch (label) {
    case "privacy":
      return t("navigationLabel.privacy");
    case "shipping":
      return t("navigationLabel.shipping");
    case "subscription":
      return t("navigationLabel.subscription");
    case "refund":
      return t("navigationLabel.refund");
    case "delivery":
      return t("navigationLabel.delivery");
    case "terms":
      return t("navigationLabel.terms");

    default:
      break;
  }
}

export default function PoliciesPage() {
  const { t, isRTL } = useLanguage();

  const [active, setActive] = useState("privacy");
  const activePolicy = policies.find((p) => p.id === active)!;
  const ActiveIcon = activePolicy.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */ }
      <div className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 py-14 px-4 overflow-hidden">
        {/* decorative circles */ }
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-10 w-80 h-80 bg-white/5 rounded-full" />
        <div className="container mx-auto relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <ScrollText className="h-5 w-5 text-green-300" />
            <span className="text-green-300 text-sm tracking-wide uppercase">{ t("policies.legalandpolicy") }</span>
          </div>
          <h1 className="text-white text-3xl md:text-4xl mb-3">{ t("policies.title") }</h1>
          <p className="text-green-100 max-w-xl text-sm leading-relaxed">
            { t("policies.description") }
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Navigation */ }
          <aside className="lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3 font-medium px-1">{ t("policies.sections") }</p>
              <nav className="space-y-1">
                { policies.map((policy) => {
                  const Icon = policy.icon;
                  const isActive = active === policy.id;
                  return (
                    <button
                      key={ policy.id }
                      onClick={ () => setActive(policy.id) }
                      className={ `w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm transition-all duration-150 ${isActive
                        ? "bg-green-600 text-white shadow-sm"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        }` }
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={ `h-4 w-4 flex-shrink-0 ${isActive ? "text-white" : "text-green-600"}` } />
                        <span>{ policy.label }</span>
                      </div>
                      { isActive && <ChevronRight className="h-4 w-4 flex-shrink-0" /> }
                    </button>
                  );
                }) }
              </nav>

              <Separator className="my-5" />

              {/* Quick contact card in sidebar */ }
              <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
                <p className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-green-600" />
                  { t("policyContact.needHelp") }
                </p>
                <div className="space-y-1">
                  <a href="mailto:support@tuniolive.com" className="block text-xs text-green-700 hover:underline">
                    support@tuniolive.com
                  </a>
                  <a href="mailto:onlinesales@tuniolive.com" className="block text-xs text-green-700 hover:underline">
                    onlinesales@tuniolive.com
                  </a>
                </div>
              </div>
            </div>
          </aside>

          {/* Content Area */ }
          <main className="flex-1 min-w-0">
            {/* Mobile: pill tab row */ }
            <div className="flex flex-wrap gap-2 mb-6 lg:hidden">
              { policies.map((policy) => {
                const Icon = policy.icon;
                return (
                  <button
                    key={ policy.id }
                    onClick={ () => setActive(policy.id) }
                    className={ `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-all ${active === policy.id
                      ? "bg-green-600 text-white border-green-600"
                      : "border-muted-foreground/30 text-muted-foreground hover:border-green-400"
                      }` }
                  >
                    <Icon className="h-3 w-3" />
                    { policy.label }
                  </button>
                );
              }) }
            </div>

            {/* Content card */ }
            <div className="rounded-2xl border bg-card shadow-sm p-6 md:p-8">
              {/* Section header with icon */ }
              <div className="flex items-center gap-3 mb-6 pb-5 border-b">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <ActiveIcon className="h-5 w-5 text-green-700" />
                </div>
                <div>
                  <Badge variant="outline" className="text-xs text-green-700 border-green-300 mb-1">
                    { t("policyDocument.title") }
                  </Badge>
                  <p className="text-sm text-muted-foreground">Tuni Olive { renderPolicy(active, t) }</p>
                </div>
              </div>
              { renderPolicyContent(active, t) }
            </div>

            {/* Bottom navigation between policies */ }
            <div className="flex items-center justify-between mt-6">
              { (() => {
                const idx = policies.findIndex((p) => p.id === active);
                const prev = policies[idx - 1];
                const next = policies[idx + 1];
                return (
                  <>
                    <div>
                      { prev && (
                        <button
                          onClick={ () => setActive(prev.id) }
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>{ renderNavigationLabel(prev.id,t) }</span>
                        </button>
                      ) }
                    </div>
                    <div>
                      { next && (
                        <button
                          onClick={ () => setActive(next.id) }
                          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span>{ renderNavigationLabel(next.id, t) }</span>
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      ) }
                    </div>
                  </>
                );
              })() }
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
