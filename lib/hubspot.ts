import { Client } from "@hubspot/api-client";

export async function syncHubSpotContact(email: string, properties: Record<string, string> = {}) {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!accessToken) {
    // Only warn in production, or silent return in dev if irrelevant
    console.warn("HUBSPOT_ACCESS_TOKEN is not set. Skipping HubSpot sync.");
    return;
  }

  const hubspotClient = new Client({ accessToken });

  // Default properties we always want to set
  const contactProperties = {
    email,
    lifecyclestage: "lead", // Default to 'lead'
    ...properties,
  };

  try {
    await hubspotClient.crm.contacts.basicApi.create({
      properties: contactProperties,
      associations: [],
    });
    console.log(`HubSpot contact created for ${email}`);
  } catch (error: any) {
    // 409 Conflict means contact already exists
    if (error.code === 409) {
       console.log(`HubSpot contact already exists for ${email}. Contact was not updated.`);
       // If we wanted to update, we'd need to search by email to get ID, then update.
       // For now, existence is enough for the "Sync" requirement.
    } else {
      console.error("Error syncing to HubSpot:", error.message || error);
    }
  }
}
