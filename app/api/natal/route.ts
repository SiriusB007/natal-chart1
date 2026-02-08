import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ASTROLOGY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ASTROLOGY_API_KEY" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const { year, month, day, hour, minute, latitude, longitude } = body;

    const res = await fetch("https://astrology-api.io/api/v3/planetary-positions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        year,
        month,
        day,
        hour,
        minute,
        latitude,
        longitude,
      }),
    });

    // Check if response is ok before parsing
    if (!res.ok) {
      const contentType = res.headers.get("content-type");
      let errorDetails;

      // Try to parse JSON if content-type indicates JSON
      if (contentType && contentType.includes("application/json")) {
        try {
          errorDetails = await res.json();
        } catch {
          errorDetails = await res.text();
        }
      } else {
        // If not JSON, get the text (likely HTML error page)
        errorDetails = await res.text();
      }

      return NextResponse.json(
        {
          error: "Upstream API error",
          status: res.status,
          details: errorDetails
        },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
