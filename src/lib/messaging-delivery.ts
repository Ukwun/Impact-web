export type DeliveryChannel = "WHATSAPP" | "SMS";

export type DeliveryRequest = {
  channel: DeliveryChannel;
  to: string;
  message: string;
};

export type DeliveryResult = {
  ok: boolean;
  provider: string;
  providerMessageId?: string;
  error?: string;
};

const SMS_PROVIDER = (process.env.SMS_PROVIDER || "TERMII").toUpperCase();
const WHATSAPP_PROVIDER = (process.env.WHATSAPP_PROVIDER || "META").toUpperCase();

function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("+")) {
    return trimmed;
  }

  if (trimmed.startsWith("0")) {
    return `+234${trimmed.slice(1)}`;
  }

  if (trimmed.startsWith("234")) {
    return `+${trimmed}`;
  }

  return `+${trimmed}`;
}

async function sendViaTwilioSMS(to: string, message: string): Promise<DeliveryResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_SMS_FROM;

  if (!sid || !token || !from) {
    return { ok: false, provider: "TWILIO_SMS", error: "Twilio SMS credentials not configured" };
  }

  const body = new URLSearchParams();
  body.set("From", from);
  body.set("To", normalizePhone(to));
  body.set("Body", message);

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      provider: "TWILIO_SMS",
      error: payload.message || `Twilio SMS failed with status ${response.status}`,
    };
  }

  return {
    ok: true,
    provider: "TWILIO_SMS",
    providerMessageId: payload.sid,
  };
}

async function sendViaTwilioWhatsApp(to: string, message: string): Promise<DeliveryResult> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_WHATSAPP_FROM;

  if (!sid || !token || !from) {
    return { ok: false, provider: "TWILIO_WHATSAPP", error: "Twilio WhatsApp credentials not configured" };
  }

  const body = new URLSearchParams();
  body.set("From", from.startsWith("whatsapp:") ? from : `whatsapp:${from}`);
  body.set("To", `whatsapp:${normalizePhone(to)}`);
  body.set("Body", message);

  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      provider: "TWILIO_WHATSAPP",
      error: payload.message || `Twilio WhatsApp failed with status ${response.status}`,
    };
  }

  return {
    ok: true,
    provider: "TWILIO_WHATSAPP",
    providerMessageId: payload.sid,
  };
}

async function sendViaTermiiSMS(to: string, message: string): Promise<DeliveryResult> {
  const apiKey = process.env.TERMII_API_KEY;
  const senderId = process.env.TERMII_SENDER_ID || "ImpactEdu";

  if (!apiKey) {
    return { ok: false, provider: "TERMII", error: "Termii API key not configured" };
  }

  const response = await fetch("https://api.ng.termii.com/api/sms/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      api_key: apiKey,
      to: normalizePhone(to),
      from: senderId,
      sms: message,
      type: "plain",
      channel: "generic",
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload.code === "400") {
    return {
      ok: false,
      provider: "TERMII",
      error: payload.message || `Termii failed with status ${response.status}`,
    };
  }

  return {
    ok: true,
    provider: "TERMII",
    providerMessageId: payload.message_id || payload.code,
  };
}

async function sendViaMetaWhatsApp(to: string, message: string): Promise<DeliveryResult> {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    return { ok: false, provider: "META_WHATSAPP", error: "Meta WhatsApp credentials not configured" };
  }

  const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: normalizePhone(to).replace("+", ""),
      type: "text",
      text: {
        body: message,
      },
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    return {
      ok: false,
      provider: "META_WHATSAPP",
      error: payload.error?.message || `Meta WhatsApp failed with status ${response.status}`,
    };
  }

  const messageId = Array.isArray(payload.messages) ? payload.messages[0]?.id : undefined;

  return {
    ok: true,
    provider: "META_WHATSAPP",
    providerMessageId: messageId,
  };
}

function mockDelivery(provider: string): DeliveryResult {
  return {
    ok: true,
    provider,
    providerMessageId: `mock_${Date.now()}`,
  };
}

export async function dispatchMessage(request: DeliveryRequest): Promise<DeliveryResult> {
  const to = normalizePhone(request.to);
  if (!to) {
    return {
      ok: false,
      provider: "VALIDATION",
      error: "Recipient phone is missing",
    };
  }

  if (process.env.MESSAGE_DELIVERY_MODE === "mock") {
    return mockDelivery(request.channel === "SMS" ? SMS_PROVIDER : WHATSAPP_PROVIDER);
  }

  if (request.channel === "SMS") {
    if (SMS_PROVIDER === "TWILIO") {
      return sendViaTwilioSMS(to, request.message);
    }
    return sendViaTermiiSMS(to, request.message);
  }

  if (WHATSAPP_PROVIDER === "TWILIO") {
    return sendViaTwilioWhatsApp(to, request.message);
  }

  return sendViaMetaWhatsApp(to, request.message);
}
