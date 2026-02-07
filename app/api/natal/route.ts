import { NextRequest, NextResponse } from "next/server";

function parseDateTime(date: string, time: string) {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);

  return { year: y, month: m, day: d, hour: hh, minute: mm };
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ASTROLOGY_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing ASTROLOGY_API_KEY" },
        { status: 500 }
      );
    }

    const { date, time, latitude, longitude } = await req.json();

    if (!date || !time || latitude == null || longitude == null) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const { year, month, day, hour, minute } =
      parseDateTime(date, time);

    const res = await fetch(
      "https://astrology-api.io/api/v3/planetary-positions",
      {
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
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { error: "Astrology API error", details: data },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json(
      { error: "Server error", details: e.message },
      { status: 500 }
    );
  }
}
