"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlanType } from "@/lib/billing/plan"
import { subscribeMonthly, subscribeYearly } from "@/app/(landing)/actions"

interface PlanCardProps {
  planName: string
  price: string
  period?: string
  features: string[]
  currentPlan: PlanType
  planType: PlanType
  icon?: React.ReactNode
}

function PlanCard({
  planName,
  price,
  period,
  features,
  currentPlan,
  planType,
  icon,
}: PlanCardProps) {
  const isCurrent = currentPlan === planType

  const getButtonAction = () => {
    switch (planType) {
      case "monthly":
        return subscribeMonthly
      case "yearly":
        return subscribeYearly
      default:
        return undefined
    }
  }

  return (
    <Card className="relative w-full h-full">
      <CardContent className="p-6 flex flex-col h-full space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            {icon}
            <h3 className="text-lg font-medium">{planName}</h3>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-bold">${price}</div>
            {period && (
              <div className="text-sm text-muted-foreground">per {period}</div>
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
          ) : (
            <form action={getButtonAction()} className="w-full">
              <Button type="submit" className="w-full" variant="default">
                Subscribe to {planName}
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
      planName: "Monthly",
      price: "9",
      period: "month",
      features: [
        "Unlimited books & notes",
        "Unlimited AI queries",
        "Full reading copilot features",
      ],
      planType: "monthly" as PlanType,
    },
    {
      planName: "Yearly",
      price: "90",
      period: "year",
      features: [
        "Unlimited books & notes",
        "Unlimited AI queries",
        "Full reading copilot features",
        "2 months free",
      ],
      planType: "yearly" as PlanType,
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 px-4 sm:px-6 max-w-3xl mx-auto">
          {plans.map((plan, index) => (
            <PlanCard key={index} {...plan} currentPlan={currentPlan} />
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
