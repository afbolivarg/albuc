// import { subscriptions, database } from "@/db"
const LEMONSQUEEZY_API_BASE = "https://api.lemonsqueezy.com/v1"

export async function getPlanDetail(type: "monthly" | "lifetime") {
  const response = await fetch(
    `https://api.lemonsqueezy.com/v1/variants/${
      type === "monthly"
        ? process.env.LEMONSQUEEZY_VARIANT_ID_MONTHLY
        : process.env.LEMONSQUEEZY_VARIANT_ID_LIFETIME
    }`,
    {
      headers: {
        Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
    }
  )

  const data = await response.json()

  return data
}

export async function createCheckoutLink(
  variantId: string,
  storeId: string,
  userId: string,
  userEmail: string
) {
  const url = `${LEMONSQUEEZY_API_BASE}/checkouts`

  const body = {
    data: {
      type: "checkouts",
      attributes: {
        checkout_data: {
          email: userEmail,
          custom: {
            userId,
          },
        },
        product_options: {
          redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL || ""}/library`,
          enabled_variants: [variantId],
        },
        checkout_options: {
          embed: false,
          media: false,
          logo: true,
        },
      },
      relationships: {
        store: { data: { type: "stores", id: storeId } },
        variant: { data: { type: "variants", id: variantId } },
      },
    },
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Failed to create checkout: ${await response.text()}`)
  }

  const { data } = await response.json()
  return data.attributes.url as string
}

// Retrieve a pre-signed Customer Portal URL for the user's LS customer
export async function getCustomerPortalUrl(customerId: string) {
  const response = await fetch(
    `${LEMONSQUEEZY_API_BASE}/customers/${customerId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.LEMONSQUEEZY_API_KEY}`,
      },
      // Do not cache sensitive URLs
      cache: "no-store",
    }
  )

  if (!response.ok) {
    throw new Error(`Failed to fetch customer: ${await response.text()}`)
  }

  const { data } = await response.json()
  return (data?.attributes?.urls?.customer_portal as string | null) || null
}

// export async function createCheckoutLink(
//   variantId: string,
//   storeId: string,
//   userId: string,
//   userEmail: string,
//   selectedCompanyId: string,
//   discountCode?: string
// ) {
//   const response = await fetch(`https://api.lemonsqueezy.com/v1/checkouts`, {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${env.LEMON_SQUEEZY_API_KEY}`,
//     },
//     body: JSON.stringify({
//       data: {
//         type: "checkouts",
//         attributes: {
//           checkout_data: {
//             custom: {
//               userId,
//               companyId: selectedCompanyId,
//             },
//             email: userEmail,
//             discount_code: discountCode || undefined,
//           },
//         },
//         relationships: {
//           store: { data: { type: "stores", id: storeId } },
//           variant: { data: { type: "variants", id: variantId } },
//         },
//       },
//     }),
//   })

//   if (!response.ok) {
//     throw new Error(`Failed to create checkout: ${await response.text()}`)
//   }
//   const { data } = await response.json()

//   return data.attributes.url
// }

// export async function getSubscriptionByCompanyId(companyId: string) {
//   const subscription = await database.query.subscriptions.findFirst({
//     where: eq(subscriptions.companyId, companyId),
//   })

//   return subscription
// }
