import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const userId = process.env.ASTROLOGY_USER_ID;
    const apiKey = process.env.ASTROLOGY_API_KEY;

    if (!userId || !apiKey) {
      return NextResponse.json(
        { error: "Missing ASTROLOGY_USER_ID or ASTROLOGY_API_KEY" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const { date, time, latitude, longitude } = body;

    if (!date || !time || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: date, time, latitude, longitude" },
        { status: 400 }
      );
    }

    // Parse date (format: YYYY-MM-DD)
    const [year, month, day] = date.split("-").map(Number);

    // Parse time (format: HH:MM)
    const [hour, minute] = time.split(":").map(Number);

    // Use Basic Auth with User ID as username and API Key as password
    const authString = Buffer.from(`${userId}:${apiKey}`).toString('base64');

    const res = await fetch("https://json.astrologyapi.com/v1/planets/tropical", {
      method: "POST",
      headers: {
        Authorization: `Basic ${authString}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        day,
        month,
        year,
        hour,
        min: minute,
        lat: latitude,
        lon: longitude,
        tzone: 0, // UTC timezone, adjust as needed
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
