import {createHmac, timingSafeEqual} from "node:crypto";
import {NextResponse} from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function verifyMetaSignature(rawBody: string, signature: string | null) {
  const appSecret = process.env.META_APP_SECRET;

  // During initial setup, signature checking becomes active as soon as
  // META_APP_SECRET is configured in Vercel.
  if (!appSecret) return true;
  if (!signature?.startsWith("sha256=")) return false;

  const expected = createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");
  const received = signature.slice("sha256=".length);

  if (expected.length !== received.length) return false;

  return timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(received, "utf8"),
  );
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

  if (!verifyToken) {
    console.error("META_WEBHOOK_VERIFY_TOKEN is not configured");
    return new NextResponse("Webhook verify token is not configured", {status: 503});
  }

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new NextResponse(challenge, {
      status: 200,
      headers: {"content-type": "text/plain; charset=utf-8"},
    });
  }

  return new NextResponse("Forbidden", {status: 403});
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-hub-signature-256");

  if (!verifyMetaSignature(rawBody, signature)) {
    console.warn("Rejected WhatsApp webhook with invalid Meta signature");
    return new NextResponse("Invalid signature", {status: 401});
  }

  try {
    const payload = JSON.parse(rawBody) as {
      object?: string;
      entry?: Array<{
        id?: string;
        changes?: Array<{field?: string}>;
      }>;
    };

    const fields = payload.entry
      ?.flatMap((entry) => entry.changes?.map((change) => change.field) ?? [])
      .filter(Boolean) ?? [];

    console.log("WhatsApp webhook received", {
      object: payload.object,
      entryCount: payload.entry?.length ?? 0,
      fields,
    });
  } catch {
    console.warn("WhatsApp webhook received with non-JSON body");
  }

  // Meta expects a fast 200 response. Business processing can be added later.
  return NextResponse.json({ok: true});
}
