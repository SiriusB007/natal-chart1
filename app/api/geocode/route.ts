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

    const {
      year,
      month,
      day,
      hour,
      minute,
      latitude,
      longitude,
    } = body;

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

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "API request failed" },
      { status: 500 }
    );
  }
}
