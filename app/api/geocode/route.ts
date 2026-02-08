import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { city } = body;

    if (!city) {
      return NextResponse.json(
        { error: "City name is required" },
        { status: 400 }
      );
    }

    // Use OpenStreetMap Nominatim for geocoding (free, no API key required)
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`,
      {
        headers: {
          "User-Agent": "Dendera-Astrology-App/1.0",
        },
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        {
          error: "Geocoding service error",
          status: res.status,
          details: errorText
        },
        { status: res.status }
      );
    }

    const data = await res.json();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: `Could not find coordinates for city: ${city}` },
        { status: 404 }
      );
    }

    const location = data[0];

    return NextResponse.json({
      latitude: parseFloat(location.lat),
      longitude: parseFloat(location.lon),
      displayName: location.display_name,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Geocoding request failed", details: msg },
      { status: 500 }
    );
  }
}
