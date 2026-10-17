/**
 * Piwowar (Brewcraft) — Access & Quota Test Suite (DEC-06)
 * Validates Freemium quota (3 free batches) and Pro access transitions.
 */

import { getAccessState, canStartNewBatch, FREE_BATCH_LIMIT } from '../lib/access';

describe('Access & Monetization Quota Suite (DEC-06)', () => {
  it('enforces FREE_BATCH_LIMIT = 3 for new users', () => {
    expect(FREE_BATCH_LIMIT).toBe(3);
  });

  it('allows batch creation for 0, 1, and 2 existing batches', () => {
    // 0 batches
    const state0 = getAccessState(0, false);
    expect(state0.canCreateBatch).toBe(true);
    expect(state0.batchesRemaining).toBe(3);
    expect(canStartNewBatch(0, false)).toBe(true);

    // 1 batch
    const state1 = getAccessState(1, false);
    expect(state1.canCreateBatch).toBe(true);
    expect(state1.batchesRemaining).toBe(2);
    expect(canStartNewBatch(1, false)).toBe(true);

    // 2 batches
    const state2 = getAccessState(2, false);
    expect(state2.canCreateBatch).toBe(true);
    expect(state2.batchesRemaining).toBe(1);
    expect(canStartNewBatch(2, false)).toBe(true);
  });

  it('blocks batch creation when free quota of 3 batches is exhausted', () => {
    const state3 = getAccessState(3, false);
    expect(state3.canCreateBatch).toBe(false);
    expect(state3.batchesRemaining).toBe(0);
    expect(canStartNewBatch(3, false)).toBe(false);

    const state5 = getAccessState(5, false);
    expect(state5.canCreateBatch).toBe(false);
    expect(state5.batchesRemaining).toBe(0);
    expect(canStartNewBatch(5, false)).toBe(false);
  });

  it('unlocks unlimited batch creation for Pro pass holders regardless of batch count', () => {
    const proState = getAccessState(10, true);
    expect(proState.isPro).toBe(true);
    expect(proState.canCreateBatch).toBe(true);
    expect(proState.batchesRemaining).toBe(Infinity);
    expect(canStartNewBatch(10, true)).toBe(true);
  });
});
