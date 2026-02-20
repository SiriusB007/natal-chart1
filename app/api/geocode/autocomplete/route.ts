import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (q.length < 2) {
        return NextResponse.json([]);
    }

    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            q
        )}&format=json&limit=5&addressdetails=1&featuretype=city`;

        const res = await fetch(url, {
            headers: { "User-Agent": "Dendera-Astrology-App/1.0" },
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Geocoding service error" },
                { status: res.status }
            );
        }

        const data = await res.json();

        const suggestions = data.map(
            (item: { display_name: string; lat: string; lon: string }) => ({
                display_name: item.display_name,
                lat: item.lat,
                lon: item.lon,
            })
        );

        return NextResponse.json(suggestions);
    } catch {
        return NextResponse.json(
            { error: "Autocomplete request failed" },
            { status: 500 }
        );
    }
}
