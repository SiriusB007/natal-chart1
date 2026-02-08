"use client";

import { useState } from "react";

export default function HomePage() {
  const [form, setForm] = useState({
    dob: "",
    time: "",
    city: "",
  });

  const [chart, setChart] = useState<any>(null);
  const [chartImage, setChartImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [renderFormat, setRenderFormat] = useState("svg");
  const [chartWidth, setChartWidth] = useState(800);

  const update = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function revealChart() {
    setLoading(true);
    setChart(null);
    setChartImage(null);

    try {
      const geoRes = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: form.city }),
      });

      const geoJson = await geoRes.json();
      if (!geoRes.ok) throw new Error(geoJson.error);

      const natalRes = await fetch("/api/natal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.dob,
          time: form.time,
          latitude: geoJson.latitude,
          longitude: geoJson.longitude,
        }),
      });

      const natalJson = await natalRes.json();
      if (!natalRes.ok) throw new Error(natalJson.error);

      setChart(natalJson);

      // Fetch the rendered chart image
      const renderRes = await fetch("/api/render-natal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.dob,
          time: form.time,
          latitude: geoJson.latitude,
          longitude: geoJson.longitude,
          format: renderFormat,
          width: chartWidth,
        }),
      });

      const renderJson = await renderRes.json();
      if (!renderRes.ok) throw new Error(renderJson.error);

      setChartImage(renderJson);
    } catch (err: any) {
      alert(err.message);
    }

    setLoading(false);
  }

  return (
    <main className="p-8 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Dendera's Charts</h1>

      <input
        type="date"
        value={form.dob}
        onChange={(e) => update("dob", e.target.value)}
        className="border p-2 w-full"
      />

      <input
        type="time"
        value={form.time}
        onChange={(e) => update("time", e.target.value)}
        className="border p-2 w-full"
      />

      <input
        placeholder="Birth city"
        value={form.city}
        onChange={(e) => update("city", e.target.value)}
        className="border p-2 w-full"
      />

      <div className="space-y-2">
        <label className="block text-sm font-medium">Chart Format</label>
        <select
          value={renderFormat}
          onChange={(e) => setRenderFormat(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="svg">SVG (Scalable Vector)</option>
          <option value="png">PNG</option>
          <option value="jpg">JPG</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Chart Width: {chartWidth}px
        </label>
        <input
          type="range"
          min="400"
          max="1200"
          step="50"
          value={chartWidth}
          onChange={(e) => setChartWidth(Number(e.target.value))}
          className="w-full"
        />
      </div>

      <button
        onClick={revealChart}
        className="bg-black text-white px-4 py-2"
      >
        {loading ? "Calculating..." : "Reveal Chart"}
      </button>

      {chartImage && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Your Natal Chart</h2>
          {chartImage.format === "svg" ? (
            <div
              dangerouslySetInnerHTML={{ __html: chartImage.content }}
              className="border rounded"
            />
          ) : (
            <img
              src={`data:${chartImage.contentType};base64,${chartImage.content}`}
              alt="Natal Chart"
              className="border rounded"
            />
          )}
        </div>
      )}

      {chart && (
        <details className="bg-gray-100 p-4 overflow-auto">
          <summary className="cursor-pointer font-medium">Chart Data (JSON)</summary>
          <pre className="mt-2">
            {JSON.stringify(chart, null, 2)}
          </pre>
        </details>
      )}
    </main>
  );
}
