"use client";

import { useState, useEffect, useRef } from "react";

export default function HomePage() {
  const [form, setForm] = useState({
    name: "",
    dob: "",
    time: "",
    city: "",
  });

  const [chart, setChart] = useState<any>(null);
  const [chartImage, setChartImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [renderFormat, setRenderFormat] = useState("svg");
  const [chartWidth, setChartWidth] = useState(800);

  const starsRef = useRef<HTMLDivElement>(null);

  const update = (k: string, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  // Create animated stars on mount
  useEffect(() => {
    const container = starsRef.current;
    if (!container) return;
    for (let i = 0; i < 50; i++) {
      const star = document.createElement("div");
      star.className = "star";
      const size = Math.random() * 3 + "px";
      star.style.width = size;
      star.style.height = size;
      star.style.left = Math.random() * 100 + "%";
      star.style.top = Math.random() * 100 + "%";
      star.style.animationDelay = Math.random() * 3 + "s";
      container.appendChild(star);
    }
    return () => {
      container.innerHTML = "";
    };
  }, []);

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
    <>
      {/* Animated stars background */}
      <div ref={starsRef} className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <i className="fas fa-moon text-6xl text-yellow-200" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Cosmic Insights
            </h1>
            <p className="text-xl text-purple-100">
              Discover your celestial blueprint and unlock the secrets written
              in the stars
            </p>
          </div>

          {/* Form Card */}
          <div className="glass-effect rounded-3xl shadow-2xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">
              Begin Your Journey
            </h2>
            <p className="text-purple-100 text-center mb-8">
              Enter your birth details for a personalized astrology reading
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                revealChart();
              }}
              className="space-y-6"
            >
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-white font-semibold mb-2"
                >
                  <i className="fas fa-user mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white/30 transition"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Date of Birth */}
              <div>
                <label
                  htmlFor="dob"
                  className="block text-white font-semibold mb-2"
                >
                  <i className="fas fa-calendar mr-2" />
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  required
                  value={form.dob}
                  onChange={(e) => update("dob", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white/30 transition"
                />
              </div>

              {/* Time of Birth */}
              <div>
                <label
                  htmlFor="tob"
                  className="block text-white font-semibold mb-2"
                >
                  <i className="fas fa-clock mr-2" />
                  Time of Birth
                </label>
                <input
                  type="time"
                  id="tob"
                  required
                  value={form.time}
                  onChange={(e) => update("time", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white/30 transition"
                />
              </div>

              {/* City of Birth */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-white font-semibold mb-2"
                >
                  <i className="fas fa-map-marker-alt mr-2" />
                  City of Birth
                </label>
                <input
                  type="text"
                  id="city"
                  required
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white/30 transition"
                  placeholder="Enter your city of birth"
                />
              </div>

              {/* Chart Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">
                    <i className="fas fa-image mr-2" />
                    Chart Format
                  </label>
                  <select
                    value={renderFormat}
                    onChange={(e) => setRenderFormat(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-purple-300 focus:bg-white/30 transition"
                  >
                    <option value="svg" className="text-gray-900">
                      SVG (Scalable Vector)
                    </option>
                    <option value="png" className="text-gray-900">
                      PNG
                    </option>
                    <option value="jpg" className="text-gray-900">
                      JPG
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2 text-sm">
                    <i className="fas fa-arrows-alt-h mr-2" />
                    Width: {chartWidth}px
                  </label>
                  <input
                    type="range"
                    min="400"
                    max="1200"
                    step="50"
                    value={chartWidth}
                    onChange={(e) => setChartWidth(Number(e.target.value))}
                    className="w-full accent-purple-300 mt-2"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-purple-700 font-bold py-4 px-6 rounded-xl hover:bg-purple-50 transform hover:scale-105 transition duration-300 shadow-lg text-lg disabled:opacity-60 disabled:hover:scale-100"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2" />
                    Calculating your chart…
                  </>
                ) : (
                  <>
                    <i className="fas fa-star mr-2" />
                    Reveal My Cosmic Blueprint
                  </>
                )}
              </button>
            </form>

            {/* Trust Indicators */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <div className="flex flex-wrap justify-center gap-6 text-purple-100 text-sm">
                <div className="flex items-center">
                  <i className="fas fa-lock mr-2" />
                  <span>100% Private</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-shield-alt mr-2" />
                  <span>Secure Data</span>
                </div>
                <div className="flex items-center">
                  <i className="fas fa-star mr-2" />
                  <span>Expert Astrologers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart Results */}
          {chartImage && (
            <div className="glass-effect rounded-3xl shadow-2xl p-8 md:p-12 mt-8">
              <h2 className="text-3xl font-bold text-white mb-6 text-center">
                <i className="fas fa-sun mr-3 text-yellow-200" />
                Your Natal Chart
              </h2>
              <div className="flex justify-center">
                {chartImage.format === "svg" ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: chartImage.content }}
                    className="rounded-2xl overflow-hidden bg-white/10 p-4"
                  />
                ) : (
                  <img
                    src={`data:${chartImage.contentType};base64,${chartImage.content}`}
                    alt="Natal Chart"
                    className="rounded-2xl border border-white/20"
                  />
                )}
              </div>
            </div>
          )}

          {chart && (
            <div className="glass-effect rounded-3xl shadow-2xl p-8 mt-8">
              <details>
                <summary className="cursor-pointer font-medium text-white text-lg">
                  <i className="fas fa-database mr-2" />
                  Chart Data (JSON)
                </summary>
                <pre className="mt-4 text-purple-100 text-sm overflow-auto max-h-96 bg-black/20 rounded-xl p-4">
                  {JSON.stringify(chart, null, 2)}
                </pre>
              </details>
            </div>
          )}

          {/* Footer */}
          <div className="text-center mt-8 text-purple-100 text-sm">
            <p>✨ Join thousands discovering their cosmic destiny ✨</p>
          </div>
        </div>
      </div>
    </>
  );
}
