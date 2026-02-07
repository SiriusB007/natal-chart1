import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { city } = await req.json();

    if (!city) {
      return NextResponse.json(
        { error: "City is required." },
        { status: 400 }
      );
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      city
    )}&limit=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "natal-chart-app",
      },
    });

    const data = await res.json();

    if (!data.length) {
      return NextResponse.json(
        { error: "City not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      latitude: Number(data[0].lat),
      longitude: Number(data[0].lon),
      display_name: data[0].display_name,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Geocode failed.", details: e.message },
      { status: 500 }
    );
  }
}
