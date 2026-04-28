/**
 * Zoom Integration Library
 * Uses Zoom Server-to-Server OAuth (Account Credentials) to create and manage meetings.
 *
 * Required environment variables:
 *   ZOOM_ACCOUNT_ID     – from Zoom Marketplace app credentials
 *   ZOOM_CLIENT_ID      – from Zoom Marketplace app credentials
 *   ZOOM_CLIENT_SECRET  – from Zoom Marketplace app credentials
 *   ZOOM_HOST_EMAIL     – email of the Zoom user who will own the meetings
 */

const ZOOM_OAUTH_URL = "https://zoom.us/oauth/token";
const ZOOM_API_BASE = "https://api.zoom.us/v2";

let _cachedToken: { token: string; expiresAt: number } | null = null;

/** Obtain a short-lived OAuth2 access token using Server-to-Server credentials. */
async function getAccessToken(): Promise<string> {
  if (_cachedToken && Date.now() < _cachedToken.expiresAt - 30_000) {
    return _cachedToken.token;
  }

  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error(
      "Zoom credentials not configured. Set ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET."
    );
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(
    `${ZOOM_OAUTH_URL}?grant_type=account_credentials&account_id=${accountId}`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Zoom OAuth failed (${response.status}): ${text}`);
  }

  const data = await response.json();
  _cachedToken = {
    token: data.access_token as string,
    expiresAt: Date.now() + (data.expires_in as number) * 1000,
  };

  return _cachedToken.token;
}

export interface ZoomMeeting {
  id: number;
  uuid: string;
  hostEmail: string;
  topic: string;
  startTime: string;
  duration: number;
  /** URL for the meeting host to start the session */
  startUrl: string;
  /** URL for participants to join */
  joinUrl: string;
  password: string;
}

export interface CreateMeetingOptions {
  topic: string;
  startTime: Date;
  /** Duration in minutes */
  durationMinutes: number;
  agenda?: string;
  /** Allow anonymous attendees to join without waiting room */
  waitingRoom?: boolean;
}

/** Create a scheduled Zoom meeting and return join/start URLs. */
export async function createZoomMeeting(
  options: CreateMeetingOptions
): Promise<ZoomMeeting> {
  const token = await getAccessToken();
  const hostEmail = process.env.ZOOM_HOST_EMAIL;

  if (!hostEmail) {
    throw new Error("ZOOM_HOST_EMAIL environment variable is required");
  }

  const payload = {
    topic: options.topic,
    type: 2, // scheduled meeting
    start_time: options.startTime.toISOString(),
    duration: options.durationMinutes,
    agenda: options.agenda ?? "",
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry: true,
      waiting_room: options.waitingRoom ?? true,
      meeting_authentication: false,
      allow_multiple_devices: false,
      auto_recording: "none",
    },
  };

  const response = await fetch(`${ZOOM_API_BASE}/users/${encodeURIComponent(hostEmail)}/meetings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Zoom meeting creation failed (${response.status}): ${text}`);
  }

  const data = await response.json();

  return {
    id: data.id,
    uuid: data.uuid,
    hostEmail: data.host_email,
    topic: data.topic,
    startTime: data.start_time,
    duration: data.duration,
    startUrl: data.start_url,
    joinUrl: data.join_url,
    password: data.password,
  };
}

/** Delete a Zoom meeting by its numeric meeting ID. */
export async function deleteZoomMeeting(meetingId: number): Promise<void> {
  const token = await getAccessToken();

  const response = await fetch(`${ZOOM_API_BASE}/meetings/${meetingId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 404) {
    const text = await response.text();
    throw new Error(`Zoom meeting deletion failed (${response.status}): ${text}`);
  }
}

/** Update a Zoom meeting's start time and duration. */
export async function updateZoomMeeting(
  meetingId: number,
  updates: { startTime?: Date; durationMinutes?: number; topic?: string }
): Promise<void> {
  const token = await getAccessToken();

  const payload: Record<string, unknown> = {};
  if (updates.startTime) payload.start_time = updates.startTime.toISOString();
  if (updates.durationMinutes) payload.duration = updates.durationMinutes;
  if (updates.topic) payload.topic = updates.topic;

  const response = await fetch(`${ZOOM_API_BASE}/meetings/${meetingId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Zoom meeting update failed (${response.status}): ${text}`);
  }
}

/** Returns true if Zoom credentials are present in the environment. */
export function isZoomConfigured(): boolean {
  return Boolean(
    process.env.ZOOM_ACCOUNT_ID &&
      process.env.ZOOM_CLIENT_ID &&
      process.env.ZOOM_CLIENT_SECRET &&
      process.env.ZOOM_HOST_EMAIL
  );
}
