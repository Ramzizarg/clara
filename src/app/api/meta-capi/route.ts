import { NextRequest, NextResponse } from "next/server";

const META_PIXEL_ID = process.env.META_PIXEL_ID;
const META_CAPI_ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;

export async function POST(req: NextRequest) {
  if (!META_PIXEL_ID || !META_CAPI_ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "Meta Pixel ID or Conversions API access token is not configured" },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const {
      eventName,
      eventId,
      productId,
      value,
      currency = "TND",
      eventSourceUrl,
    } = body as {
      eventName: string;
      eventId: string;
      productId?: number | string;
      value?: number;
      currency?: string;
      eventSourceUrl?: string;
    };

    if (!eventName || !eventId) {
      return NextResponse.json({ error: "Missing eventName or eventId" }, { status: 400 });
    }

    const userAgent = req.headers.get("user-agent") || "";
    const ipHeader =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "";
    const clientIp = ipHeader.split(",")[0]?.trim();

    const payload = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: eventId,
          event_source_url:
            eventSourceUrl || req.headers.get("referer") || undefined,
          action_source: "website",
          user_data: {
            client_user_agent: userAgent,
            client_ip_address: clientIp || undefined,
          },
          custom_data: {
            content_ids: productId ? [String(productId)] : undefined,
            content_type: productId ? "product" : undefined,
            value,
            currency,
          },
        },
      ],
    };

    const fbRes = await fetch(
      `https://graph.facebook.com/v18.0/${META_PIXEL_ID}/events?access_token=${META_CAPI_ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!fbRes.ok) {
      const errorText = await fbRes.text();
      console.error("Meta CAPI error", fbRes.status, errorText);
      return NextResponse.json(
        { error: "Meta CAPI request failed", status: fbRes.status },
        { status: 500 }
      );
    }

    const json = await fbRes.json();
    return NextResponse.json({ success: true, fb: json });
  } catch (error) {
    console.error("Meta CAPI handler error", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
