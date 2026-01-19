import { Client } from "@hubspot/api-client";

export async function syncHubSpotContact(email: string, properties: Record<string, string> = {}) {
  const accessToken = process.env.HUBSPOT_ACCESS_TOKEN;
  if (!accessToken) {
    console.warn("HUBSPOT_ACCESS_TOKEN is not set. Skipping HubSpot sync.");
    return { success: false, reason: "No access token" };
  }

  const hubspotClient = new Client({ accessToken });

  // Default properties we always want to set
  const contactProperties = {
    email,
    lifecyclestage: "lead", // Default to 'lead'
    ...properties,
  };

  try {
    // Try to create the contact
    const result = await hubspotClient.crm.contacts.basicApi.create({
      properties: contactProperties,
      associations: [],
    });
    console.log(`✅ HubSpot contact created for ${email} - ID: ${result.id}`);
    return { success: true, contactId: result.id, action: "created" };
  } catch (error: any) {
    // Check for existing contact (409 Conflict)
    // HubSpot API returns status or statusCode depending on version
    if (error.status === 409 || error.statusCode === 409 || error.code === 409) {
      console.log(`🔄 HubSpot contact already exists for ${email}. Attempting update...`);

      // Search for existing contact by email to get ID
      try {
        const searchResponse = await hubspotClient.crm.contacts.searchApi.doSearch({
          filterGroups: [
            {
              filters: [
                {
                  propertyName: "email",
                  operator: "EQ" as any, // HubSpot FilterOperatorEnum
                  value: email,
                },
              ],
            },
          ],
          properties: ["email", "lifecyclestage"],
          limit: 1,
        });

        if (searchResponse.results && searchResponse.results.length > 0) {
          const contactId = searchResponse.results[0].id;

          // Update the existing contact with new properties
          await hubspotClient.crm.contacts.basicApi.update(contactId, {
            properties: properties, // Only update the custom properties, not email
          });

          console.log(`✅ HubSpot contact updated for ${email} - ID: ${contactId}`);
          return { success: true, contactId, action: "updated" };
        } else {
          console.error(`❌ Could not find existing contact for ${email} after 409 error`);
          return { success: false, reason: "Contact exists but not found in search" };
        }
      } catch (searchError: any) {
        console.error(`❌ Error searching/updating HubSpot contact for ${email}:`, searchError.message);
        return { success: false, reason: `Search/update failed: ${searchError.message}` };
      }
    } else {
      // Other errors (authentication, permissions, etc.)
      console.error(`❌ Error syncing to HubSpot for ${email}:`, {
        message: error.message,
        status: error.status || error.statusCode,
        body: error.body,
      });
      return { success: false, reason: error.message || "Unknown error" };
    }
  }
}
