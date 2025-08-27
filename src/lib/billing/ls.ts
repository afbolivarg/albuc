const LEMONSQUEEZY_API_BASE = "https://api.lemonsqueezy.com/v1"

export async function getPlanDetail(type: "monthly" | "yearly" | "lifetime") {
  let variantId: string | undefined
  switch (type) {
    case "monthly":
      variantId = process.env.LEMON_SQUEEZY_VARIANT_ID_MONTHLY
      break
    case "yearly":
      variantId =
        process.env.LEMON_SQUEEZY_VARIANT_ID_YEARLY ||
        process.env.LEMON_SQUEEZY_VARIANT_ID_MONTHLY
      break
    case "lifetime":
      variantId = process.env.LEMON_SQUEEZY_VARIANT_ID_LIFETIME
      break
  }

  const response = await fetch(
    `https://api.lemonsqueezy.com/v1/variants/${variantId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
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
      Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Failed to create checkout: ${await response.text()}`)
  }

  const { data } = await response.json()
  return data.attributes.url as string
}
