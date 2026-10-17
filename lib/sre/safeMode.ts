/**
 * Piwowar (Brewcraft) — SRE Circuit Breaker Safe Mode
 * Prevents crash-loops upon startup and recovers state.
 */

export interface CrashTombstone {
  timestamp: string;
  consecutiveCrashes: number;
  lastErrorMessage?: string;
  safeModeTriggered: boolean;
}

const CRASH_LOOP_THRESHOLD = 3;
const CRASH_TIME_WINDOW_MS = 15000; // 15 seconds

export class SafeModeCircuitBreaker {
  private crashCount: number = 0;
  private lastCrashTimestamp: number = 0;
  private isSafeModeActive: boolean = false;

  constructor(initialCrashCount: number = 0, lastCrashTime: number = 0) {
    this.crashCount = initialCrashCount;
    this.lastCrashTimestamp = lastCrashTime;
    if (this.crashCount >= CRASH_LOOP_THRESHOLD) {
      this.isSafeModeActive = true;
    }
  }

  public recordStartup(): void {
    const now = Date.now();
    if (now - this.lastCrashTimestamp < CRASH_TIME_WINDOW_MS) {
      this.crashCount++;
    } else {
      this.crashCount = 1;
    }
    this.lastCrashTimestamp = now;

    if (this.crashCount >= CRASH_LOOP_THRESHOLD) {
      this.isSafeModeActive = true;
    }
  }

  public markStartupSuccessful(): void {
    // Reset crash count when app runs stably for > 15 seconds
    this.crashCount = 0;
    this.isSafeModeActive = false;
  }

  public isInSafeMode(): boolean {
    return this.isSafeModeActive;
  }

  public getTombstone(error?: Error): CrashTombstone {
    return {
      timestamp: new Date().toISOString(),
      consecutiveCrashes: this.crashCount,
      lastErrorMessage: error?.message,
      safeModeTriggered: this.isSafeModeActive
    };
  }

  public resetCircuit(): void {
    this.crashCount = 0;
    this.isSafeModeActive = false;
  }
}

export const globalCircuitBreaker = new SafeModeCircuitBreaker();
