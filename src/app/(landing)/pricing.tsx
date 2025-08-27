"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  signInWithGoogleFree,
  subscribeMonthly,
  subscribeYearly,
  subscribeLifetime,
} from "./actions"

interface PricingCardProps {
  price: string | number
  planName: string
  features: string[]
  buttonText: string
  buttonVariant?: "default" | "outline" | "secondary"
  isPrimary?: boolean
  showBillingToggle?: boolean
  isYearly?: boolean
  onBillingToggle?: (checked: boolean) => void
  yearlyPrice?: string
  monthlyPrice?: string
  planType?: "free" | "monthly" | "yearly" | "lifetime"
}

function PricingCard({
  price,
  planName,
  features,
  buttonText,
  buttonVariant = "default",
  isPrimary = false,
  showBillingToggle = false,
  isYearly,
  onBillingToggle,
  yearlyPrice,
  monthlyPrice,
  planType = "free",
}: PricingCardProps) {
  const displayPrice = showBillingToggle
    ? isYearly
      ? yearlyPrice
      : monthlyPrice
    : price

  return (
    <Card
      className={`rounded-2xl shadow-lg ${isPrimary ? "bg-primary text-primary-foreground relative" : ""}`}
    >
      <CardContent className="p-8 space-y-6">
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            {typeof displayPrice === "string" && displayPrice !== "Free"
              ? `$${displayPrice}`
              : displayPrice}
            {showBillingToggle && (
              <span className="text-sm text-muted-foreground"> / month</span>
            )}
          </div>
          <div className={isPrimary ? "text-muted" : "text-muted-foreground"}>
            {planName}
          </div>

          {/* Billing Toggle */}
          {showBillingToggle && onBillingToggle && (
            <div className="flex items-center justify-center gap-3 mb-2 absolute top-4 right-4">
              <span
                className={`text-sm font-medium ${!isYearly ? "text-primary-foreground/50" : "text-primary-foreground"}`}
              >
                Pay yearly
              </span>
              <Switch
                checked={isYearly}
                onCheckedChange={onBillingToggle}
                className="data-[state=checked]:bg-primary-foreground/50"
              />
            </div>
          )}
        </div>

        <ul className="space-y-3 text-sm">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <form
          action={
            planType === "free"
              ? signInWithGoogleFree
              : planType === "lifetime"
                ? subscribeLifetime
                : showBillingToggle
                  ? isYearly
                    ? subscribeYearly
                    : subscribeMonthly
                  : planType === "monthly"
                    ? subscribeMonthly
                    : signInWithGoogleFree
          }
        >
          <Button type="submit" variant={buttonVariant} className="w-full">
            {buttonText}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(true)

  return (
    <>
      {/* Pricing Section */}
      <div id="pricing">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 font-serif tracking-tight">
            Every reader deserves a library
          </h2>
          <p className="text-foreground/80 max-w-2xl mx-auto">
            Read intentionally. Think clearly. From book to idea, Albuc holds it
            all.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Wanderer Plan */}
          <PricingCard
            price="Free"
            planName="Wanderer"
            features={["Access to all features", "Start your personal library"]}
            buttonText="Sign up"
            buttonVariant="outline"
            planType="free"
          />

          {/* Curator Plan */}
          <PricingCard
            price="4.00"
            planName="Curator"
            features={["Everything in Wanderer", "Unlimited books & notes"]}
            buttonText="Get started"
            buttonVariant="secondary"
            isPrimary={true}
            showBillingToggle={true}
            isYearly={isYearly}
            onBillingToggle={setIsYearly}
            yearlyPrice="4.00"
            monthlyPrice="12.00"
            planType="monthly"
          />

          {/* Archivist Plan */}
          <PricingCard
            price="100"
            planName="Archivist"
            features={["Lifetime access", "All current & future features"]}
            buttonText="Get started"
            buttonVariant="outline"
            planType="lifetime"
          />
        </div>
      </div>
    </>
  )
}
