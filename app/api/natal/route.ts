import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.ASTROLOGY_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing ASTROLOGY_API_KEY." }, { status: 500 });
    }

    const { date, time, latitude, longitude } = await req.json();

    if (!date || !time || typeof latitude !== "number" || typeof longitude !== "number") {
      return NextResponse.json(
        { error: "date, time, latitude, and longitude are required." },
        { status: 400 }
      );
    }

    // IMPORTANT: Authorization header must be a STRING, e.g. "Bearer ask_..."
    const res = await fetch("https://astrology-api.io/api/v3/planetary-positions", {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, time, latitude, longitude }),
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Astrology API error.", details: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Unexpected error." }, { status: 500 });
  }
}
