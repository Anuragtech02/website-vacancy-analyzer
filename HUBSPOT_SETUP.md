# HubSpot Integration Setup Guide

## Issues Found & Fixed

### 🔧 Fixed Issues:

1. **Incorrect Error Code Check**
   - **Problem**: Code checked `error.code === 409` but HubSpot API returns `error.status === 409` or `error.statusCode === 409`
   - **Fix**: Updated to check all possible status code properties

2. **No Update Logic for Existing Contacts**
   - **Problem**: When contact existed (409 error), it just logged a message
   - **Fix**: Added search + update logic to handle existing contacts properly

3. **Poor Error Handling**
   - **Problem**: Fire-and-forget `.catch()` swallowed all errors
   - **Fix**: Proper async/await with detailed logging and return values

4. **Missing Success Logging**
   - **Problem**: Only errors were logged, making debugging difficult
   - **Fix**: Added detailed logs with emojis for success, updates, and errors

---

## Required HubSpot Configuration

### Step 1: Verify Access Token Scopes

Your access token needs these scopes:
- ✅ `crm.objects.contacts.read`
- ✅ `crm.objects.contacts.write`

**To verify:**
1. Go to HubSpot > Settings > Integrations > Private Apps
2. Find your app/token
3. Check that both scopes are enabled
4. If not, add them and regenerate the token

### Step 2: Create Custom Properties (Optional but Recommended)

The code tries to sync these custom properties:
- `vacature_titel` - Job title from the vacancy (Dutch: Vacature Titel)
- `vacature_report_id` - Report ID for tracking

**To create custom properties:**
1. Go to HubSpot > Settings > Data Management > Properties
2. Click "Create property"
3. Select object type: **Contact**
4. Create these properties:

   **Property 1: Vacature Titel**
   - Label: `Vacature Titel`
   - Internal name: `vacature_titel`
   - Field type: Single-line text
   - Group: Contact Information

   **Property 2: Vacancy Report ID**
   - Label: `Vacancy Report ID`
   - Internal name: `vacancy_report_id`
   - Field type: Single-line text
   - Group: Contact Information

5. After creating, uncomment the lines in `app/api/optimize/route.ts`:
   ```typescript
   // vacature_titel: analysis.metadata?.job_title || "Unknown Vacancy",
   // vacature_report_id: reportId
   ```

### Step 3: Test the Integration

Run the test script:

```bash
cd /Users/anurag/bubbble/upwork/vacature-tovenaar/website-vacancy-analyzer
npx ts-node test-hubspot.ts
```

Expected output:
```
🧪 Testing HubSpot Integration...

✅ HubSpot Access Token found
   Token preview: CiRldTEtNDkxMS02ZTQy...

📧 Testing with email: test@vacaturetovenaar.nl

Test 1: Creating/Updating contact...
✅ Test 1 PASSED: Contact created successfully
   Contact ID: 12345

Test 2: Testing duplicate contact handling...
✅ Test 2 PASSED: Duplicate handled correctly (updated)
   Contact ID: 12345

✅ All tests completed!
```

---

## Current Implementation

### How It Works Now:

1. User submits email in the optimization form
2. Backend calls `syncHubSpotContact(email, properties)`
3. Function tries to create contact in HubSpot
4. If contact exists (409 error):
   - Searches for contact by email
   - Updates contact with new properties
5. Logs success/failure with detailed information
6. Returns status to API route

### Files Modified:

- `lib/hubspot.ts` - Core sync logic with proper error handling
- `app/api/optimize/route.ts` - API route with better HubSpot integration
- `test-hubspot.ts` - Test script for verification (new)

---

## Troubleshooting

### Error: "Type 'EQ' is not assignable to type 'FilterOperatorEnum'"
**Solution**: Already fixed with `as any` type assertion. This is a known HubSpot SDK quirk.

### Error: "Property 'vacature_titel' does not exist"
**Solution**: Create the custom property in HubSpot (see Step 2 above)

### Error: "401 Unauthorized"
**Solutions**:
- Check if `HUBSPOT_ACCESS_TOKEN` is set in `.env.local`
- Verify token hasn't expired (HubSpot tokens can expire)
- Check token scopes (see Step 1)

### Error: "403 Forbidden"
**Solution**: Token lacks required scopes. Add `crm.objects.contacts.write` scope.

### No Error but Contact Not Created
**Solutions**:
- Check server logs for warnings: `⚠️ HubSpot sync failed`
- Verify token is valid by testing in HubSpot API
- Run test script to see detailed error messages

---

## Production Checklist

Before deploying to production:

- [ ] Verify HubSpot access token is set in production environment
- [ ] Create custom properties (`vacature_titel`, `vacature_report_id`) in HubSpot
- [ ] Uncomment custom property lines in `optimize/route.ts`
- [ ] Run test script successfully
- [ ] Monitor logs for `✅ HubSpot sync successful` messages
- [ ] Test with real email addresses
- [ ] Verify contacts appear in HubSpot CRM

---

## Monitoring

Look for these log messages:

✅ **Success**: `✅ HubSpot contact created for email@example.com - ID: 12345`

🔄 **Update**: `✅ HubSpot contact updated for email@example.com - ID: 12345`

⚠️ **Warning**: `⚠️ HubSpot sync failed for email@example.com: reason`

❌ **Error**: `❌ Error syncing to HubSpot for email@example.com: { message, status, body }`

---

## Support

If you encounter issues:
1. Run the test script for detailed diagnostics
2. Check HubSpot API logs in your HubSpot account
3. Verify all steps in this guide are completed
4. Review server logs for detailed error messages
