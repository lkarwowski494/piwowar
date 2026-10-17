/**
 * Piwowar (Brewcraft) — Access & Monetization Quota Manager
 * DEC-06: Freemium Quota (3 free batches) + Ethical Read-Only Guarantee
 */

import { AccessState, FREE_BATCH_LIMIT } from './types/domain';

export { FREE_BATCH_LIMIT };

/**
 * Computes user access state based on total batches created and subscription status.
 *
 * @param totalBatchesCreated Number of batches ever created in SQLite database
 * @param isPro Whether the user has an active Apps4Brew Pro Pass
 */
export function getAccessState(
  totalBatchesCreated: number,
  isPro: boolean = false
): AccessState {
  if (isPro) {
    return {
      isPro: true,
      totalBatchesCreated,
      batchesRemaining: Infinity,
      canCreateBatch: true
    };
  }

  const batchesRemaining = Math.max(0, FREE_BATCH_LIMIT - totalBatchesCreated);
  const canCreateBatch = batchesRemaining > 0;

  return {
    isPro: false,
    totalBatchesCreated,
    batchesRemaining,
    canCreateBatch
  };
}

/**
 * Helper to check whether creating a new batch is permitted.
 */
export function canStartNewBatch(
  totalBatchesCreated: number,
  isPro: boolean = false
): boolean {
  return isPro || totalBatchesCreated < FREE_BATCH_LIMIT;
}
