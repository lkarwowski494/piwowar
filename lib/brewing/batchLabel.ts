/**
 * Piwowar (Brewcraft) — Batch Printable Label Generator
 * Generates vector SVG and HTML markup for physical bottle, can, and keg labels (Z-033).
 */

import { Batch } from '../types/domain';
import { srmToHex } from './color';

export interface LabelOptions {
  breweryName?: string;
  widthMm?: number; // default 90 mm
  heightMm?: number; // default 60 mm
  includeQr?: boolean;
}

/**
 * Generates responsive vector SVG string for a physical brew label.
 */
export function generateBatchLabelSvg(batch: Batch, options: LabelOptions = {}): string {
  const brewery = options.breweryName || 'Domowy Browar Rzemieślniczy';
  const width = options.widthMm || 90;
  const height = options.heightMm || 60;
  const srm = 10; // Default amber if unknown
  const beerColorHex = srmToHex(srm);

  const abvText = batch.calculated_abv ? `${batch.calculated_abv.toFixed(1)}% ABV` : 'ABV: —';
  const ogText = batch.measured_og_sg ? `${batch.measured_og_sg.toFixed(3)} SG` : 'OG: —';
  const fgText = batch.measured_fg_sg ? `${batch.measured_fg_sg.toFixed(3)} SG` : 'FG: —';
  const brewDate = batch.brew_date || '—';
  const bottleDate = batch.bottling_date || '—';

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240" width="${width}mm" height="${height}mm" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #121418; color: #ffffff;">
  <!-- Border & Background -->
  <rect x="4" y="4" width="352" height="232" rx="12" fill="#181B20" stroke="#2D333B" stroke-width="2"/>
  
  <!-- Color Swatch Accent Bar -->
  <rect x="4" y="4" width="352" height="8" rx="4" fill="${beerColorHex}"/>

  <!-- Brewery Header -->
  <text x="24" y="36" fill="#8B949E" font-size="11" font-weight="600" letter-spacing="1.5" text-transform="uppercase">${brewery}</text>
  
  <!-- Batch Name -->
  <text x="24" y="68" fill="#F0F6FC" font-size="22" font-weight="bold">${batch.name}</text>
  
  <!-- Batch Number Badge -->
  <rect x="24" y="82" width="76" height="20" rx="4" fill="#21262D"/>
  <text x="62" y="96" fill="#58A6FF" font-size="11" font-weight="bold" text-anchor="middle">WARKA #${batch.batch_number}</text>

  <!-- Divider -->
  <line x1="24" y1="116" x2="336" y2="116" stroke="#30363D" stroke-width="1"/>

  <!-- Key Metrics Grid -->
  <text x="24" y="140" fill="#8B949E" font-size="10" text-transform="uppercase">Alkohol</text>
  <text x="24" y="158" fill="#F0F6FC" font-size="15" font-weight="bold">${abvText}</text>

  <text x="110" y="140" fill="#8B949E" font-size="10" text-transform="uppercase">Gęstość (OG)</text>
  <text x="110" y="158" fill="#F0F6FC" font-size="15" font-weight="bold">${ogText}</text>

  <text x="210" y="140" fill="#8B949E" font-size="10" text-transform="uppercase">Końcowa (FG)</text>
  <text x="210" y="158" fill="#F0F6FC" font-size="15" font-weight="bold">${fgText}</text>

  <!-- Dates -->
  <text x="24" y="196" fill="#8B949E" font-size="10">Uwarzono: <tspan fill="#C9D1D9" font-weight="600">${brewDate}</tspan></text>
  <text x="24" y="214" fill="#8B949E" font-size="10">Rozlew: <tspan fill="#C9D1D9" font-weight="600">${bottleDate}</tspan></text>

  <!-- QR placeholder graphic -->
  <g transform="translate(284, 168)">
    <rect width="52" height="52" rx="4" fill="#FFFFFF"/>
    <rect x="6" y="6" width="16" height="16" fill="#000000"/>
    <rect x="9" y="9" width="10" height="10" fill="#FFFFFF"/>
    <rect x="11" y="11" width="6" height="6" fill="#000000"/>
    <rect x="30" y="6" width="16" height="16" fill="#000000"/>
    <rect x="33" y="9" width="10" height="10" fill="#FFFFFF"/>
    <rect x="35" y="11" width="6" height="6" fill="#000000"/>
    <rect x="6" y="30" width="16" height="16" fill="#000000"/>
    <rect x="9" y="33" width="10" height="10" fill="#FFFFFF"/>
    <rect x="11" y="35" width="6" height="6" fill="#000000"/>
    <rect x="28" y="28" width="6" height="6" fill="#000000"/>
    <rect x="38" y="38" width="8" height="8" fill="#000000"/>
  </g>
</svg>
`.trim();
}
