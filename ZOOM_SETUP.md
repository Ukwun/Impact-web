# Zoom Integration Setup Guide

This document explains how to obtain and configure Zoom Server-to-Server OAuth credentials for live classroom integration.

## Overview

ImpactEdu uses **Zoom Server-to-Server OAuth** (Account Credentials flow) to automatically create and manage Zoom meetings when facilitators schedule live classroom sessions. This allows:

- Automatic meeting creation when a live session is scheduled
- Automatic meeting deletion when a session is cancelled
- Meeting updates (topic, time, duration)
- Secure meeting URLs for facilitators and students

## Step 1: Create a Zoom App

1. Go to **Zoom Marketplace** (https://marketplace.zoom.us)
2. Sign in with your Zoom business account
3. Click **Build** → **Create an app**
4. Select **Server-to-Server OAuth**
5. Fill in app details:
   - **App Name:** Impact Edu Live Classroom
   - **Company Name:** Your organization name
   - **Developer Name and Email:** Your contact info
6. Click **Create**

## Step 2: Retrieve Credentials

After creating the app, go to the **App Credentials** tab. You'll see:

- **Account ID** — Copy this
- **Client ID** — Copy this  
- **Client Secret** — Copy this and **keep it safe** (treat like a password)

## Step 3: Configure Credentials in `.env.local`

Create a `.env.local` file (do NOT commit to git) with:

```bash
ZOOM_ACCOUNT_ID=your_account_id_here
ZOOM_CLIENT_ID=your_client_id_here
ZOOM_CLIENT_SECRET=your_client_secret_here
ZOOM_HOST_EMAIL=facilitator@yourdomain.com
```

### Example (fill in your actual values):
```bash
ZOOM_ACCOUNT_ID=UGhP_e0WRpmZ1N2Tm9_1kw
ZOOM_CLIENT_ID=EHvL5N4xWqSyZ8K3Jm2Pq
ZOOM_CLIENT_SECRET=abcdefg123456HIJKLMNOP
ZOOM_HOST_EMAIL=khadijat@impactedu.org
```

## Step 4: Set the Host Email

**ZOOM_HOST_EMAIL** must be the email of the actual Zoom user who will own the created meetings. This user must:

- Have an active Zoom business account
- Be licensed (not a free account)
- Have the "Pro" or higher subscription tier
- Have permission to create meetings

> **Note:** All meetings created by ImpactEdu will appear in this user's Zoom dashboard.

## Step 5: Authorize the App

The first time you try to create a meeting, Zoom will:

1. Authenticate using your credentials
2. Generate a short-lived access token
3. Create the meeting under ZOOM_HOST_EMAIL

This happens automatically — no manual authorization needed.

## Step 6: Verify It's Working

Run the e2e test suite to verify Zoom integration:

```bash
npm run dev
node test-e2e-critical.js
```

Check the test output for:
- ✓ Live classroom features require auth
- ✓ Polls, Q&A, breakouts endpoints respond

Then verify in your Zoom dashboard that meetings are being created.

## Troubleshooting

### "Firebase web API key is required" error
This is from login, not Zoom. Add `FIREBASE_WEB_API_KEY` to `.env.local`.

### "Zoom OAuth failed" error
Check that:
1. All 4 credentials are correctly set
2. ZOOM_HOST_EMAIL is a valid, licensed Zoom user
3. Your network allows outbound HTTPS to `zoom.us`

### Meetings not appearing in Zoom dashboard
- Verify the ZOOM_HOST_EMAIL is correct
- Check Zoom account to ensure it's not suspended
- Look at server logs for OAuth token errors

### "waitingRoom: true" errors
The Zoom API sometimes fails on this field. It's optional and the code will continue without it.

## What Happens When a Facilitator Creates a Session

1. Facilitator visits `/dashboard/facilitator/classroom/[classroomId]`
2. Clicks "Create Live Session"
3. Fills in: title, description, start time, end time
4. Submits the form
5. Backend:
   - Creates a `LiveSession` record
   - Calls `createZoomMeeting()` (if Zoom is configured)
   - Stores the `meetingUrl` (student join link)
   - Queues notifications
6. Facilitator sees the session with automatic Zoom URL
7. Students see the join link on their live classroom page

## What Happens When a Student Joins

1. Student goes to `/dashboard/live-session/[sessionId]`
2. Clicks "Open in Zoom" (or manual join link)
3. Zoom opens or app switches to Zoom
4. Meeting is live with:
   - Facilitator can start polls
   - Students can ask questions (Q&A)
   - Facilitator can split into breakout rooms
   - Attendance is tracked automatically

## Production Deployment

When deploying to production (e.g., Netlify), add these env vars to your hosting platform:

### Netlify
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add new variables:
   - `ZOOM_ACCOUNT_ID`
   - `ZOOM_CLIENT_ID`
   - `ZOOM_CLIENT_SECRET`
   - `ZOOM_HOST_EMAIL`

### Render / Other Hosts
Follow the same pattern — add as environment variables in your deployment config.

## Security Considerations

1. **Client Secret** — Treat like a password. Never commit to git.
2. **Host Email** — This user controls all meetings created by the system.
3. **Token Caching** — Tokens are cached in-memory for 30 seconds, then refreshed.
4. **API Rate Limiting** — Zoom rate-limits at 100 requests/minute per account.

## Additional Resources

- [Zoom Server-to-Server OAuth Docs](https://developers.zoom.us/docs/internal-apps/jwt-flow/)
- [Zoom Meeting API Docs](https://developers.zoom.us/docs/api/rest/reference/zoom-api/methods/#operation/meetingCreate)
- [Zoom Marketplace](https://marketplace.zoom.us)

## Support

If you need help:

1. Check Zoom API docs for specific error codes
2. Verify all credentials are correct
3. Test in a sandbox Zoom account first
4. Contact Zoom support for account issues

---

**Last Updated:** April 28, 2026  
**Version:** 1.0  
**Status:** Ready for production
