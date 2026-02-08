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

        const { date, time, latitude, longitude, format = "svg", width = 800, scale = 1.0, custom_colors } = body;

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

        // Build request body for the render API
        const requestBody: any = {
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
                    timezone: "UTC",
                }
            },
            format,
            width,
            scale,
        };

        // Add custom colors if provided
        if (custom_colors) {
            requestBody.custom_colors = custom_colors;
        }

        // Call the Astrology API v3 render endpoint
        const res = await fetch("https://api.astrology-api.io/api/v3/render/natal", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });

        // Check if response is ok
        if (!res.ok) {
            const contentType = res.headers.get("content-type");
            let errorDetails;

            if (contentType && contentType.includes("application/json")) {
                try {
                    errorDetails = await res.json();
                } catch {
                    errorDetails = await res.text();
                }
            } else {
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

        // Get the content type from the response
        const contentType = res.headers.get("content-type") || "image/svg+xml";

        // For SVG, return as text/JSON with the SVG content
        if (format === "svg") {
            const svgContent = await res.text();
            return NextResponse.json({
                format: "svg",
                content: svgContent
            });
        }

        // For binary formats (PNG, JPG, WebP, PDF), return as base64
        const buffer = await res.arrayBuffer();
        const base64 = Buffer.from(buffer).toString("base64");

        return NextResponse.json({
            format,
            contentType,
            content: base64
        });

    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
