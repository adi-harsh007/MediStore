import React from 'react';
import { CATEGORY_STYLE, DEFAULT_STYLE } from '../utils/theme';

export function CategoryIcon({ category, size = 20, color }) {
  const st = CATEGORY_STYLE[category] || DEFAULT_STYLE;
  const stroke = color || st.color;

  switch (category) {
    case "Pain Relief":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.5 20.5 19 12a4.95 4.95 0 1 0-7-7L3.5 13.5a4.95 4.95 0 1 0 7 7Z" />
          <path d="m8.5 8.5 7 7" />
        </svg>
      );
    case "Vitamins":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" /><path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" /><path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
        </svg>
      );
    case "Antibiotics":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12h6" /><path d="M12 9v6" />
        </svg>
      );
    case "Digestive":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 19a4 4 0 0 1-3-6.65C5.2 11.1 7 9.5 7 6.5A3.5 3.5 0 0 1 10.5 3h3A3.5 3.5 0 0 1 17 6.5c0 3 1.8 4.6 3 5.85A4 4 0 0 1 17 19H7z" />
          <path d="M10 11h4" /><path d="M12 9v4" />
        </svg>
      );
    case "Allergy":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          <path d="M12 11v4" /><path d="M10 13h4" />
        </svg>
      );
    case "Diabetes":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v4" /><path d="M8 6h8" />
          <rect x="6" y="6" width="12" height="16" rx="2" />
          <path d="M9 12h6" /><path d="M12 9v6" />
        </svg>
      );
    case "Cholesterol":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          <path d="M7 11h2l1.5-2.5 2 5 1.5-2.5H17" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="4" />
          <path d="M12 8v8" /><path d="M8 12h8" />
        </svg>
      );
  }
}

export default function MedicineArt({ category, name = "", variant = "card" }) {
  const st = CATEGORY_STYLE[category] || DEFAULT_STYLE;
  const accent = st.color;

  if (variant === "thumb") {
    return (
      <div style={{
        width: 48, height: 48, borderRadius: 10,
        background: `radial-gradient(circle at 30% 25%, ${accent}24, #092023 80%)`,
        border: `1px solid ${accent}40`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, position: "relative"
      }}>
        <CategoryIcon category={category} size={22} color={accent} />
      </div>
    );
  }

  const isDetail = variant === "detail";
  const iconSize = isDetail ? 74 : 40;
  const lower = (name || "").toLowerCase();
  const formLabel = lower.includes("syrup") || lower.includes("liquid") || lower.includes("solution") || lower.includes("suspension")
    ? "ORAL LIQUID"
    : lower.includes("gel") || lower.includes("ointment") || lower.includes("lotion")
    ? "TOPICAL"
    : lower.includes("spray") || lower.includes("drops")
    ? "SPRAY / DROPS"
    : lower.includes("pen") || lower.includes("insulin")
    ? "INJECTABLE"
    : lower.includes("capsule")
    ? "CAPSULE"
    : "CLINICAL FORM";

  return (
    <div style={{
      width: "100%",
      height: isDetail ? "100%" : 138,
      background: `radial-gradient(circle at 50% 42%, ${accent}22 0%, rgba(10, 34, 38, 0.94) 68%, #07191C 100%)`,
      position: "relative",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderBottom: isDetail ? "none" : "1px solid rgba(46, 230, 197, 0.1)"
    }}>
      {/* Subtle clinical grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.16,
        backgroundImage: "linear-gradient(to right, rgba(46,230,197,0.16) 1px, transparent 1px), linear-gradient(to bottom, rgba(46,230,197,0.16) 1px, transparent 1px)",
        backgroundSize: isDetail ? "28px 28px" : "20px 20px",
        pointerEvents: "none"
      }} />

      {/* Outer orbital ring */}
      <div style={{
        width: isDetail ? 170 : 88,
        height: isDetail ? 170 : 88,
        borderRadius: "50%",
        border: `1px solid ${accent}38`,
        background: `radial-gradient(circle, ${accent}16 0%, transparent 72%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: `0 0 ${isDetail ? 48 : 26}px ${accent}22`,
        position: "relative"
      }}>
        <div style={{
          width: isDetail ? 124 : 64,
          height: isDetail ? 124 : 64,
          borderRadius: "50%",
          background: "rgba(6, 24, 26, 0.85)",
          border: `1px solid ${accent}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <CategoryIcon category={category} size={iconSize} color={accent} />
        </div>
      </div>

      {/* Formulation Tag */}
      <div style={{
        position: "absolute",
        bottom: isDetail ? 18 : 10,
        left: isDetail ? 18 : 12,
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: isDetail ? 11 : 9.5,
        fontWeight: 600,
        letterSpacing: "0.08em",
        color: accent,
        background: "rgba(6, 24, 26, 0.82)",
        border: `1px solid ${accent}33`,
        padding: isDetail ? "4px 10px" : "2px 7px",
        borderRadius: 6
      }}>
        {formLabel}
      </div>
    </div>
  );
}

