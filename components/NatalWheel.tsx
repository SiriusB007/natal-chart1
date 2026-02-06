"use client";

import React from "react";

type Planet = { name?: string; planet?: string; longitude?: number };

const label = (p: Planet) => (p.name || p.planet || "Planet").toString();

function clamp360(n: number) {
  const x = n % 360;
  return x < 0 ? x + 360 : x;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default function NatalWheel({ planets }: { planets: Planet[] }) {
  const size = 420;
  const cx = size / 2;
  const cy = size / 2;
  const ringR = 170;
  const labelR = 190;

  const safe = (planets || [])
    .filter((p) => typeof p.longitude === "number")
    .map((p) => ({ ...p, longitude: clamp360(p.longitude as number) }));

  return (
    <div className="w-full flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={cx} cy={cy} r={ringR + 28} fill="#F6E7C8" stroke="#1F7A4A" strokeWidth="3" />
        <circle cx={cx} cy={cy} r={ringR} fill="none" stroke="#B21F2D" strokeWidth="3" />

        {Array.from({ length: 12 }).map((_, i) => {
          const deg = i * 30;
          const a = polar(cx, cy, ringR - 4, deg);
          const b = polar(cx, cy, ringR + 10, deg);
          return (
            <line
              key={i}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke="#1F7A4A"
              strokeWidth="2"
              opacity="0.75"
            />
          );
        })}

        {safe.map((p, idx) => {
          const deg = p.longitude as number;
          const pt = polar(cx, cy, ringR - 16, deg);
          const lb = polar(cx, cy, labelR, deg);
          const anchor = lb.x >= cx ? "start" : "end";
          return (
            <g key={`${label(p)}-${idx}`}>
              <circle cx={pt.x} cy={pt.y} r="6" fill="#B21F2D" stroke="#1F7A4A" strokeWidth="2" />
              <line x1={pt.x} y1={pt.y} x2={lb.x} y2={lb.y} stroke="#B21F2D" strokeWidth="1.5" opacity="0.6" />
              <text x={lb.x} y={lb.y} fill="#1a1a1a" fontSize="12" textAnchor={anchor} dominantBaseline="middle">
                {label(p)}
              </text>
            </g>
          );
        })}

        <circle cx={cx} cy={cy} r="6" fill="#1F7A4A" />
      </svg>
    </div>
  );
}
