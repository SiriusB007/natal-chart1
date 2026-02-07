import { NextResponse } from "next/server";

// Simple rate limiter: Nominatim allows 1 req/sec
const lastRequestTime = new Map<string, number>();

export async function POST(req: Request) {
  const clientId = req.headers.get("x-forwarded-for") || "default";
  const now = Date.now();
  const lastTime = lastRequestTime.get(clientId) || 0;

  if (now - lastTime < 1000) {
    return NextResponse.json(
      { error: "Please wait a moment before trying again." },
      { status: 429 }
    );
  }

  lastRequestTime.set(clientId, now);


  try {
    const { city } = await req.json();

    if (!city || typeof city !== "string") {
      return NextResponse.json({ error: "City of birth is required." }, { status: 400 });
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", city);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");

    const res = await fetch(url.toString(), {
      headers: {
        // Nominatim requires a valid User-Agent with contact info
        // Replace with your actual email
        "User-Agent": "natal-chart-next/1.0 (contact: your-email@example.com)",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Nominatim API error (${res.status}):`, errorText);

      // Provide more specific error messages
      if (res.status === 429) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please wait a moment and try again." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: `Geocoding failed (HTTP ${res.status}). ${errorText || "Please try again."}` },
        { status: 502 }
      );
    }

    const data = (await res.json()) as Array<{ lat: string; lon: string; display_name: string }>;

    if (!data.length) {
      return NextResponse.json(
        { error: "City not found. Try adding state/country (e.g., 'Washington, DC, USA')." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      latitude: Number(data[0].lat),
      longitude: Number(data[0].lon),
      display_name: data[0].display_name,
    });
  } catch {
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
