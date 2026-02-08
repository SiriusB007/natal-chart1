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

    // V3 API uses Bearer authentication
    const res = await fetch("https://api.astrology-api.io/api/v3/charts/natal", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subject: {
          name: "User",
          birth_data: {
            year,
            month,
            day,
            hour,
            minute,
            second: 0,
            latitude,
            longitude,
            timezone: "UTC", // UTC timezone, adjust as needed
          }
        },
        options: {
          house_system: "P", // Placidus (most popular)
          zodiac_system: "tropical"
        }
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
