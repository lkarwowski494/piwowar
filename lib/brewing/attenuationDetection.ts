/**
 * Piwowar (Brewcraft) — Fermentation Attenuation & End Detection Engine
 * Analyzes continuous Tilt / iSpindel readings to detect completion of fermentation (Z-024).
 */

export interface TelemetryReading {
  recorded_at: string; // ISO 8601
  calibrated_sg: number;
}

export type FermentationPhase = 'lag' | 'active' | 'slowing' | 'completed' | 'insufficient_data';

export interface AttenuationDetectionResult {
  isCompleted: boolean;
  phase: FermentationPhase;
  currentSg: number;
  initialSg: number;
  apparentAttenuationPct: number;
  stableHours: number;
  totalSpanHours: number;
  message: string;
}

/**
 * Analyzes SG trajectory over time to determine whether primary fermentation has safely concluded.
 *
 * @param readings Chronological or un-ordered array of hydrometer readings
 * @param requiredStableHours Hours of stability required (standard: 48h)
 * @param deltaSgThreshold Max allowable drift in SG to consider stable (standard: 0.001 SG)
 */
export function detectFermentationEnd(
  readings: TelemetryReading[],
  requiredStableHours: number = 48,
  deltaSgThreshold: number = 0.001
): AttenuationDetectionResult {
  if (!readings || readings.length < 2) {
    const defaultSg = readings && readings.length === 1 ? readings[0].calibrated_sg : 1.050;
    return {
      isCompleted: false,
      phase: 'insufficient_data',
      currentSg: defaultSg,
      initialSg: defaultSg,
      apparentAttenuationPct: 0,
      stableHours: 0,
      totalSpanHours: 0,
      message: 'Zbyt mało punktów pomiarowych do analizy dynamiki fermentacji.'
    };
  }

  // Sort chronologically ascending
  const sorted = [...readings].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  const initialSg = sorted[0].calibrated_sg;
  const currentSg = sorted[sorted.length - 1].calibrated_sg;

  const startTime = new Date(sorted[0].recorded_at).getTime();
  const endTime = new Date(sorted[sorted.length - 1].recorded_at).getTime();
  const totalSpanHours = Math.max(0, (endTime - startTime) / (1000 * 60 * 60));

  // Calculate apparent attenuation
  let apparentAttenuationPct = 0;
  if (initialSg > 1.0) {
    apparentAttenuationPct = Math.max(
      0,
      Math.min(100, ((initialSg - currentSg) / (initialSg - 1.0)) * 100)
    );
  }
  apparentAttenuationPct = Number(apparentAttenuationPct.toFixed(1));

  // Find stable duration from the end backwards
  const windowMs = requiredStableHours * 60 * 60 * 1000;
  const recentCutoff = endTime - windowMs;

  const recentReadings = sorted.filter(
    r => new Date(r.recorded_at).getTime() >= recentCutoff
  );

  let stableHours = 0;
  let isCompleted = false;

  if (totalSpanHours >= requiredStableHours && recentReadings.length >= 2) {
    const sgs = recentReadings.map(r => r.calibrated_sg);
    const minSg = Math.min(...sgs);
    const maxSg = Math.max(...sgs);
    const delta = maxSg - minSg;

    if (delta <= deltaSgThreshold) {
      isCompleted = true;
      stableHours = requiredStableHours;
    } else {
      // Calculate how long it has been within threshold from the end
      for (let i = sorted.length - 1; i >= 0; i--) {
        const diff = Math.abs(sorted[i].calibrated_sg - currentSg);
        if (diff > deltaSgThreshold) {
          const stableStart = new Date(sorted[i + 1]?.recorded_at ?? sorted[i].recorded_at).getTime();
          stableHours = Math.max(0, (endTime - stableStart) / (1000 * 60 * 60));
          break;
        }
      }
    }
  }

  stableHours = Number(stableHours.toFixed(1));

  // Determine phase
  let phase: FermentationPhase = 'insufficient_data';
  let message = '';

  if (isCompleted) {
    phase = 'completed';
    message = `Gęstość ustabilizowana od ${stableHours}h (SG: ${currentSg.toFixed(3)}). Piwo gotowe do rozlewu.`;
  } else if (apparentAttenuationPct < 15) {
    phase = 'lag';
    message = `Faza adaptacji (lag-phase). Ekstrakt jeszcze nie spada (${currentSg.toFixed(3)} SG).`;
  } else if (stableHours >= 24) {
    phase = 'slowing';
    message = `Wyhamowanie fermentacji. Stabilne od ${stableHours}h, wymagane 48h przed rozlewem.`;
  } else {
    phase = 'active';
    message = `Trwa aktywna fermentacja burzliwa (atenuacja: ${apparentAttenuationPct}%).`;
  }

  return {
    isCompleted,
    phase,
    currentSg,
    initialSg,
    apparentAttenuationPct,
    stableHours,
    totalSpanHours: Number(totalSpanHours.toFixed(1)),
    message
  };
}
