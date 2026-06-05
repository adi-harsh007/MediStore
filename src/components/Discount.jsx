import React from 'react';
import { s } from '../utils/theme';

export default function Discount({ price, original }) {
  const pct = Math.round((1 - price / original) * 100);
  return <span style={s.prodDiscount}>{pct}% off</span>;
}
