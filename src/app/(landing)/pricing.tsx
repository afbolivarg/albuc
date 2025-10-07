"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { subscribeMonthly, subscribeYearly } from "./actions"

interface PricingCardProps {
  price: string | number
  planName: string
  features: string[]
  buttonText: string
  buttonVariant?: "default" | "outline" | "secondary"
  isPrimary?: boolean
  planType: "monthly" | "yearly"
}

function PricingCard({
  price,
  planName,
  features,
  buttonText,
  buttonVariant = "default",
  isPrimary = false,
  planType,
}: PricingCardProps) {
  return (
    <Card
      className={`rounded-2xl shadow-lg ${isPrimary ? "bg-primary text-primary-foreground" : ""}`}
    >
      <CardContent className="p-8 h-full flex flex-col">
        <div className="text-center mb-6">
          <div className="text-3xl font-serif font-bold mb-2">${price}</div>
          <div className={isPrimary ? "text-muted" : "text-muted-foreground"}>
            {planName}
          </div>
        </div>

        <ul className="space-y-3 text-sm flex-1">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-green-500" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <form
          action={planType === "monthly" ? subscribeMonthly : subscribeYearly}
          className="mt-6"
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

        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Monthly Plan */}
          <PricingCard
            price="9"
            planName="Monthly"
            features={[
              "Unlimited books & notes",
              "Unlimited AI queries",
              "Full reading copilot features",
            ]}
            buttonText="Get started"
            buttonVariant="default"
            isPrimary={false}
            planType="monthly"
          />

          {/* Yearly Plan */}
          <PricingCard
            price="90"
            planName="Yearly"
            features={[
              "Unlimited books & notes",
              "Unlimited AI queries",
              "Full reading copilot features",
              "2 months free",
            ]}
            buttonText="Get started"
            buttonVariant="secondary"
            isPrimary={true}
            planType="yearly"
          />
        </div>
      </div>
    </>
  )
}
