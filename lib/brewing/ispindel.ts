/**
 * Piwowar (Brewcraft) — iSpindel Polynomial Calibration & Telemetry Adapter
 * Converts raw tilt angles to Specific Gravity / Plato and bridges iSpindel to Tilt formats (Z-025).
 */

import { TiltTelemetry, TiltColor } from '../types/domain';
import { sgToPlato } from './gravity';

export interface IspindelCoefficients {
  a3?: number; // tilt^3 coefficient (optional for 3rd order)
  a2: number;  // tilt^2 coefficient
  a1: number;  // tilt^1 coefficient
  a0: number;  // constant offset
}

// Typical standard default polynomial for calibrated 25-70° iSpindel
export const DEFAULT_ISPINDEL_COEFFS: IspindelCoefficients = {
  a3: 0,
  a2: 0.0000045,
  a1: 0.00085,
  a0: 0.985
};

export interface IspindelPayload {
  name: string;
  angle: number; // Tilt angle in degrees (e.g. 25° - 75°)
  temperature: number; // Celsius or Fahrenheit
  temp_units?: 'C' | 'F';
  battery?: number; // Volts e.g. 4.12
  gravity?: number; // Pre-calculated SG if device sends it
  token?: string;
}

/**
 * Calculates Specific Gravity from raw tilt angle using polynomial coefficients.
 */
export function calculateIspindelSg(
  angle: number,
  coeffs: IspindelCoefficients = DEFAULT_ISPINDEL_COEFFS
): number {
  if (isNaN(angle) || angle <= 0) return 1.000;

  const a3 = coeffs.a3 ?? 0;
  const sg = a3 * Math.pow(angle, 3) + coeffs.a2 * Math.pow(angle, 2) + coeffs.a1 * angle + coeffs.a0;

  // Clamp within plausible physical range
  return Number(Math.max(0.990, Math.min(1.200, sg)).toFixed(4));
}

/**
 * Solves for 2nd order polynomial coefficients (y = a*x^2 + b*x + c) given 3 calibration points.
 * Point 1: Water (e.g. angle=25.0, sg=1.000)
 * Point 2: Low gravity wort (e.g. angle=45.0, sg=1.045)
 * Point 3: High gravity wort (e.g. angle=65.0, sg=1.085)
 */
export function solveIspindelPolynomial(
  p1: { angle: number; sg: number },
  p2: { angle: number; sg: number },
  p3: { angle: number; sg: number }
): IspindelCoefficients {
  const x1 = p1.angle, y1 = p1.sg;
  const x2 = p2.angle, y2 = p2.sg;
  const x3 = p3.angle, y3 = p3.sg;

  const denom = (x1 - x2) * (x1 - x3) * (x2 - x3);
  if (Math.abs(denom) < 1e-9) {
    return { ...DEFAULT_ISPINDEL_COEFFS };
  }

  const a = (x3 * (y2 - y1) + x2 * (y1 - y3) + x1 * (y3 - y2)) / denom;
  const b = (x3 * x3 * (y1 - y2) + x2 * x2 * (y3 - y1) + x1 * x1 * (y2 - y3)) / denom;
  const c = (x2 * x3 * (x2 - x3) * y1 + x3 * x1 * (x3 - x1) * y2 + x1 * x2 * (x1 - x2) * y3) / denom;

  return {
    a3: 0,
    a2: Number(a.toFixed(8)),
    a1: Number(b.toFixed(6)),
    a0: Number(c.toFixed(4))
  };
}

/**
 * Converts an iSpindel incoming reading into the standard TiltTelemetry schema.
 */
export function convertIspindelToTelemetry(
  payload: IspindelPayload,
  batchId: string,
  coeffs: IspindelCoefficients = DEFAULT_ISPINDEL_COEFFS
): TiltTelemetry {
  const calibratedSg = payload.gravity && payload.gravity > 0.9
    ? payload.gravity
    : calculateIspindelSg(payload.angle, coeffs);

  const tempUnits = payload.temp_units ?? 'C';
  const tempC = tempUnits === 'C' ? payload.temperature : (payload.temperature - 32) * (5 / 9);
  const tempF = tempUnits === 'F' ? payload.temperature : payload.temperature * (9 / 5) + 32;

  const plato = sgToPlato(calibratedSg);

  return {
    id: `ispindel-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    batch_id: batchId,
    color: 'yellow' as TiltColor, // Standard default color representation
    raw_temp_f: Number(tempF.toFixed(1)),
    raw_sg: calibratedSg,
    calibrated_temp_c: Number(tempC.toFixed(1)),
    calibrated_sg: calibratedSg,
    calibrated_plato: plato,
    rssi: payload.battery ? Math.round(payload.battery * 10) : null,
    recorded_at: new Date().toISOString()
  };
}
