/**
 * Script to list available Calendly Event Types.
 * Run this locally with:
 * npx ts-node scripts/list-calendly-events.ts [ACCESS_TOKEN]
 */

const ACCESS_TOKEN = process.argv[2];

if (!ACCESS_TOKEN) {
  console.error("Please provide your Calendly Access Token as an argument.");
  process.exit(1);
}

async function listEvents() {
  try {
    // 1. Get Current User/Organization
    const userRes = await fetch("https://api.calendly.com/users/me", {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
    });
    const { resource: user } = await userRes.json();
    const organization = user.current_organization;

    console.log(`Fetching events for organization: ${organization}`);
    console.log(`User URI: ${user.uri}`);

    // 2. List Event Types (Try both Org and User)
    const orgEventsRes = await fetch(`https://api.calendly.com/event_types?organization=${organization}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
    });
    const userEventsRes = await fetch(`https://api.calendly.com/event_types?user=${user.uri}`, {
      headers: { Authorization: `Bearer ${ACCESS_TOKEN}` }
    });

    const orgData = await orgEventsRes.json();
    const userData = await userEventsRes.json();

    const collection = [...(orgData.collection || []), ...(userData.collection || [])];
    
    // De-duplicate by URI
    const uniqueCollection = collection.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

    if (collection && collection.length > 0) {
      console.log("\n✅ Found available Event Types:");
      collection.forEach((ev: any) => {
        if (ev.active) {
          console.log(`- ${ev.name}: ${ev.scheduling_url}`);
        }
      });
    } else {
      console.log("No active event types found.");
    }
  } catch (error) {
    console.error("Error listing events:", error);
  }
}

listEvents();
