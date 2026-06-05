import React from 'react';

export default function StarRating({ rating }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} style={{ color: i <= Math.round(rating) ? "#F59E0B" : "#E5E7EB", fontSize: 13 }}>★</span>
      ))}
    </div>
  );
}
