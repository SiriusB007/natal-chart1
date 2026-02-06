"use client";

import React, { useMemo, useState } from "react";
import NatalWheel from "@/components/NatalWheel";

type FormState = {
  first: string;
  middle: string;
  last: string;
  dob: string; // YYYY-MM-DD
  tob: string; // HH:MM
  city: string;
};

export default function Page() {
  const [form, setForm] = useState<FormState>({
    first: "",
    middle: "",
    last: "",
    dob: "",
    tob: "",
    city: "",
  });

  const [loading, setLoading] = useState(false);
  const [geo, setGeo] = useState<any>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fullName = useMemo(
    () => [form.first, form.middle, form.last].filter(Boolean).join(" ").trim(),
    [form]
  );

  const planets = useMemo(() => {
    if (!result) return [];
    const c = result?.planets || result?.data?.planets || result?.data || result;
    if (Array.isArray(c)) return c;
    if (c && typeof c === "object") return Object.values(c);
    return [];
  }, [result]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  async function revealChart() {
    setError(null);
    setLoading(true);
    setGeo(null);
    setResult(null);

    try {
      if (!form.first || !form.last || !form.dob || !form.tob || !form.city) {
        throw new Error("Please fill First, Last, Date of Birth, Time of Birth, and City.");
      }

      // 1) city -> lat/lon
      const geoRes = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city: form.city }),
      });
      const geoJson = await geoRes.json();
      if (!geoRes.ok) throw new Error(geoJson?.error || "Geocoding failed.");
      setGeo(geoJson);

      // 2) natal call
      const time = form.tob.length === 5 ? `${form.tob}:00` : form.tob;

      const natalRes = await fetch("/api/natal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: form.dob,
          time,
          latitude: geoJson.latitude,
          longitude: geoJson.longitude,
        }),
      });

      const natalJson = await natalRes.json();
      if (!natalRes.ok) throw new Error(natalJson?.error || "Astrology API request failed.");
      setResult(natalJson);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="sticky top-0 z-10 backdrop-blur bg-brand-creme/80 border-b border-brand-green/25">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-brand-red shadow-soft flex items-center justify-center">
              <span className="text-brand-creme font-bold">✦</span>
            </div>
            <div>
              <div className="text-lg font-semibold leading-tight">Natal Chart App</div>
              <div className="text-xs text-black/60">Red · Crème · Green</div>
            </div>
          </div>

          <div className="text-xs text-black/60 hidden sm:block">
            Key stays server-side on Vercel
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-5">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Reveal your <span className="text-brand-red">Natal Chart</span>
            </h1>
            <p className="text-black/70 leading-relaxed">
              Enter your birth details and birthplace. We’ll convert your city into coordinates and generate
              accurate planetary positions via the Astrology API.
            </p>

            <div className="rounded-xl2 border border-brand-green/30 bg-white shadow-soft p-5">
              <div className="text-sm text-black/70">
                Tip: If your city is ambiguous, add region and country (e.g., <span className="font-semibold">“Paris, France”</span>).
              </div>
            </div>
          </div>

          <div className="rounded-xl2 border border-brand-green/30 bg-white shadow-soft p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="First name">
                <input className="input" value={form.first} onChange={(e) => update("first", e.target.value)} />
              </Field>
              <Field label="Middle name">
                <input className="input" value={form.middle} onChange={(e) => update("middle", e.target.value)} />
              </Field>
              <Field label="Last name">
                <input className="input" value={form.last} onChange={(e) => update("last", e.target.value)} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <Field label="Date of birth">
                <input className="input" type="date" value={form.dob} onChange={(e) => update("dob", e.target.value)} />
              </Field>
              <Field label="Time of birth">
                <input className="input" type="time" value={form.tob} onChange={(e) => update("tob", e.target.value)} />
              </Field>
            </div>

            <div className="mt-3">
              <Field label="City of birth">
                <input className="input" value={form.city} onChange={(e) => update("city", e.target.value)} placeholder="Washington, DC, USA" />
              </Field>
            </div>

            <button
              onClick={revealChart}
              disabled={loading}
              className="mt-5 w-full rounded-xl2 px-4 py-3 font-semibold bg-brand-red text-brand-creme shadow-soft
                         hover:opacity-95 active:opacity-90 disabled:opacity-60"
            >
              {loading ? "Generating…" : "Reveal My Natal Chart"}
            </button>

            {error && (
              <div className="mt-4 rounded-xl2 border border-brand-red/40 bg-brand-creme p-3 text-sm text-brand-red">
                {error}
              </div>
            )}
          </div>
        </div>
      </section>

      {(geo || result) && (
        <section className="max-w-5xl mx-auto px-4 pb-16">
          <div className="rounded-xl2 border border-brand-green/30 bg-white shadow-soft p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  Chart for <span className="text-brand-green">{fullName || "—"}</span>
                </h2>
                <p className="text-sm text-black/60 mt-1">
                  {form.dob} · {form.tob} · {geo?.display_name || form.city}
                </p>
                {geo && (
                  <p className="text-xs text-black/60 mt-1">
                    Lat/Lon: {Number(geo.latitude).toFixed(4)}, {Number(geo.longitude).toFixed(4)}
                  </p>
                )}
              </div>

              <button
                className="rounded-xl2 px-4 py-2 text-sm font-semibold border border-brand-green/40 hover:bg-brand-creme"
                onClick={() => { setGeo(null); setResult(null); setError(null); }}
              >
                Reset
              </button>
            </div>

            {result && (
              <div className="mt-6 grid lg:grid-cols-2 gap-6 items-start">
                <div className="rounded-xl2 border border-brand-green/25 bg-brand-creme p-4">
                  <div className="text-sm font-semibold mb-3">Natal Wheel (planet longitudes)</div>
                  <NatalWheel planets={planets} />
                </div>

                <div className="rounded-xl2 border border-brand-green/25 p-4">
                  <div className="text-sm font-semibold mb-3">API Response</div>
                  <pre className="text-xs bg-brand-creme rounded-xl2 p-3 overflow-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-xs font-semibold text-black/70 mb-1">{label}</div>
      {children}
    </label>
  );
}
