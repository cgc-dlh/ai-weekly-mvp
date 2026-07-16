import { db } from "@/db/drizzle";
import { account, session, subscription, user, verification } from "@/db/schema";
import {
  checkout,
  polar,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";
import { Polar } from "@polar-sh/sdk";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

// Utility function to safely parse dates
function safeParseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return value;
  return new Date(value);
}

// ===== Polar 配置（可选，缺省时跳过）=====
const polarAccessToken = process.env.POLAR_ACCESS_TOKEN;
const polarWebhookSecret = process.env.POLAR_WEBHOOK_SECRET;
const starterTier = process.env.NEXT_PUBLIC_STARTER_TIER;
const starterSlug = process.env.NEXT_PUBLIC_STARTER_SLUG;

const hasPolarConfig = polarAccessToken && polarWebhookSecret && starterTier && starterSlug;

let polarClient: Polar | undefined;
let polarPlugins: any[] = [];

if (hasPolarConfig) {
  polarClient = new Polar({
    accessToken: polarAccessToken,
    server: "sandbox",
  });

  polarPlugins = [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: starterTier!,
              slug: starterSlug!,
            },
          ],
          successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${process.env.POLAR_SUCCESS_URL || "success"}`,
          authenticatedUsersOnly: true,
        }),
        portal(),
        usage(),
        webhooks({
          secret: polarWebhookSecret!,
          onPayload: async ({ data, type }) => {
            if (
              type === "subscription.created" ||
              type === "subscription.active" ||
              type === "subscription.canceled" ||
              type === "subscription.revoked" ||
              type === "subscription.uncanceled" ||
              type === "subscription.updated"
            ) {
              try {
                const userId = data.customer?.externalId;
                const subscriptionData = {
                  id: data.id,
                  createdAt: new Date(data.createdAt),
                  modifiedAt: safeParseDate(data.modifiedAt),
                  amount: data.amount,
                  currency: data.currency,
                  recurringInterval: data.recurringInterval,
                  status: data.status,
                  currentPeriodStart: safeParseDate(data.currentPeriodStart) || new Date(),
                  currentPeriodEnd: safeParseDate(data.currentPeriodEnd) || new Date(),
                  cancelAtPeriodEnd: data.cancelAtPeriodEnd || false,
                  canceledAt: safeParseDate(data.canceledAt),
                  startedAt: safeParseDate(data.startedAt) || new Date(),
                  endsAt: safeParseDate(data.endsAt),
                  endedAt: safeParseDate(data.endedAt),
                  customerId: data.customerId,
                  productId: data.productId,
                  discountId: data.discountId || null,
                  checkoutId: data.checkoutId || "",
                  customerCancellationReason: data.customerCancellationReason || null,
                  customerCancellationComment: data.customerCancellationComment || null,
                  metadata: data.metadata ? JSON.stringify(data.metadata) : null,
                  customFieldData: data.customFieldData ? JSON.stringify(data.customFieldData) : null,
                  userId: userId as string | null,
                };

                await db
                  .insert(subscription)
                  .values(subscriptionData)
                  .onConflictDoUpdate({
                    target: subscription.id,
                    set: {
                      modifiedAt: subscriptionData.modifiedAt || new Date(),
                      amount: subscriptionData.amount,
                      currency: subscriptionData.currency,
                      recurringInterval: subscriptionData.recurringInterval,
                      status: subscriptionData.status,
                      currentPeriodStart: subscriptionData.currentPeriodStart,
                      currentPeriodEnd: subscriptionData.currentPeriodEnd,
                      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
                      canceledAt: subscriptionData.canceledAt,
                      startedAt: subscriptionData.startedAt,
                      endsAt: subscriptionData.endsAt,
                      endedAt: subscriptionData.endedAt,
                      customerId: subscriptionData.customerId,
                      productId: subscriptionData.productId,
                      discountId: subscriptionData.discountId,
                      checkoutId: subscriptionData.checkoutId,
                      customerCancellationReason: subscriptionData.customerCancellationReason,
                      customerCancellationComment: subscriptionData.customerCancellationComment,
                      metadata: subscriptionData.metadata,
                      customFieldData: subscriptionData.customFieldData,
                      userId: subscriptionData.userId,
                    },
                  });
              } catch (error) {
                console.error("Polar webhook error:", error);
              }
            }
          },
        }),
      ],
    }),
  ];
} else {
  console.warn("⚠️ Polar config incomplete. Subscription/payment features disabled.");
}

// ===== Google OAuth（可选）=====
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

const socialProviders: any = {};
if (googleClientId && googleClientSecret) {
  socialProviders.google = {
    clientId: googleClientId,
    clientSecret: googleClientSecret,
  };
}

export const auth = betterAuth({
  trustedOrigins: [`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`],
  allowedDevOrigins: [`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}`],
  cookieCache: {
    enabled: true,
    maxAge: 5 * 60,
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user,
      session,
      account,
      verification,
      subscription,
    },
  }),
  socialProviders,
  plugins: [...polarPlugins, nextCookies()],
});
