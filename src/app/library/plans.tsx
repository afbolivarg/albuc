"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlanType } from "@/lib/billing/plan"
import {
  subscribeMonthly,
  subscribeYearly,
  subscribeLifetime,
} from "@/app/(landing)/actions"

type ExtendedPlanType = PlanType | "yearly"

interface PlanCardProps {
  planName: string
  price: string
  period?: string
  features: string[]
  currentPlan: PlanType
  planType: ExtendedPlanType
  icon?: React.ReactNode
  isPopular?: boolean
}

function PlanCard({
  planName,
  price,
  period,
  features,
  currentPlan,
  planType,
  icon,
  isPopular = false,
}: PlanCardProps) {
  const isCurrent =
    currentPlan === planType ||
    (currentPlan === "monthly" && planType === "yearly")

  const getButtonAction = () => {
    switch (planType) {
      case "monthly":
        return subscribeMonthly
      case "yearly":
        return subscribeYearly
      case "lifetime":
        return subscribeLifetime
      default:
        return undefined
    }
  }

  return (
    <Card
      className={`relative w-full h-full ${isPopular ? "border-primary shadow-lg" : ""}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-primary text-primary-foreground font-serif">
            Most Popular
          </Badge>
        </div>
      )}

      <CardContent className="p-6 flex flex-col h-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            {icon}
            <h3 className="text-lg font-medium">{planName}</h3>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold">
              {price === "Free" ? "Free" : `$${price}`}
            </div>
            {period ? (
              <div className="text-sm text-muted-foreground">
                {period === "lifetime" ? "one-time" : `per ${period}`}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground invisible">
                placeholder
              </div>
            )}
          </div>
        </div>

        <ul className="space-y-3 text-sm flex-1 flex flex-col justify-start">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{feature}</span>
            </li>
          ))}
        </ul>

        <div className="pt-4 mt-auto">
          {isCurrent ? (
            <Button disabled className="w-full" variant="outline">
              Current Plan
            </Button>
          ) : currentPlan === "lifetime" && planType !== "lifetime" ? (
            <Button disabled className="w-full" variant="outline">
              You have lifetime access
            </Button>
          ) : planType === "free" ? (
            <Button disabled className="w-full" variant="outline">
              Downgrade not available
            </Button>
          ) : (
            <form action={getButtonAction()} className="w-full">
              <Button
                type="submit"
                className="w-full"
                variant={isPopular ? "default" : "outline"}
              >
                Upgrade to {planName}
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface PlansDialogProps {
  currentPlan: PlanType
  children: React.ReactNode
}

export function PlansDialog({ currentPlan, children }: PlansDialogProps) {
  const [open, setOpen] = useState(false)

  const plans = [
    {
      planName: "Wanderer",
      price: "Free",
      features: ["Access to all features", "Up to 10 books"],
      planType: "free" as ExtendedPlanType,
    },
    {
      planName: "Curator - Monthly",
      price: "12.00",
      period: "month",
      features: ["Everything in Wanderer", "Unlimited books & notes"],
      planType: "monthly" as ExtendedPlanType,
    },
    {
      planName: "Curator - Yearly",
      price: "48.00",
      period: "year",
      features: [
        "60% savings vs monthly",
        "Everything in Curator",
        "Unlimited books & notes",
      ],
      planType: "yearly" as ExtendedPlanType,
      isPopular: true,
    },
    {
      planName: "Archivist",
      price: "100.00",
      period: "lifetime",
      features: [
        "Lifetime access",
        "Everything in Curator",
        "All current & future features",
      ],
      planType: "lifetime" as ExtendedPlanType,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-3xl font-bold font-serif">
            Choose Your Journey
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 px-4 sm:px-6 md:h-[520px] lg:h-[420px]">
          {plans.map((plan, index) => (
            <PlanCard key={index} {...plan} currentPlan={currentPlan} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
