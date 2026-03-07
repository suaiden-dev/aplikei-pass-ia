/**
 * Script to automatically register the Supabase Edge Function as a Calendly Webhook.
 * Run this locally with:
 * npx ts-node setup-calendly.ts <your_access_token>
 */

const ACCESS_TOKEN = process.argv[2];
const WEBHOOK_URL = "https://nkhblkilekfpqhyuhrrj.supabase.co/functions/v1/calendly-webhook";

if (!ACCESS_TOKEN) {
  console.error("Please provide your Calendly Access Token as an argument.");
  process.exit(1);
}

async function setup() {
  try {
    // 1. Get Current User/Organization
    const userRes = await fetch("https://api.calendly.com/users/me", {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
    });
    const { resource: user } = await userRes.json();
    const organization = user.current_organization;

    console.log(`Setting up webhook for organization: ${organization}`);

    // 2. Register Webhook
    const webhookRes = await fetch("https://api.calendly.com/webhook_subscriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        events: ["invitee.created", "invitee.canceled"],
        organization: organization, // Organization is required even for scope: user
        user: user.uri, // Use individual user URI
        scope: "user"   // Use user scope instead of organization
      })
    });

    const result = await webhookRes.json();
    if (webhookRes.ok) {
      console.log("✅ Webhook registered successfully (User scope)!");
      console.log("Subscription URI:", result.resource.uri);
    } else {
      console.error("❌ Failed to register webhook:", result);
    }
  } catch (error) {
    console.error("Error setting up Calendly:", error);
  }
}

setup();
