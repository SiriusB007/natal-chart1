import { NextResponse } from "next/server";

export async function POST(req: Request) {
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
        // Nominatim asks for a UA/contact
        "User-Agent": "natal-chart-next/1.0 (contact: you@example.com)",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Geocoding failed." }, { status: 502 });
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
