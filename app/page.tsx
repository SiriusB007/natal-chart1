"use client";

import { useState } from "react";

export default function HomePage() {
  const [form, setForm] = useState({
    dob: "",
    time: "",
    city: "",
  });

  const [chart, setChart] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const update = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function revealChart() {
    setLoading(true);
    setChart(null);

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
    } catch (err: any) {
      alert(err.message);
    }

    setLoading(false);
  }

  return (
    <main className="p-8 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Natal Chart</h1>

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

      <button
        onClick={revealChart}
        className="bg-black text-white px-4 py-2"
      >
        {loading ? "Calculating..." : "Reveal Chart"}
      </button>

      {chart && (
        <pre className="bg-gray-100 p-4 overflow-auto">
          {JSON.stringify(chart, null, 2)}
        </pre>
      )}
    </main>
  );
}
