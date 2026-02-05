
export type CancellationPolicy = {
  cutoffHours: number;            // Free cancellation window (e.g., 24h before)
  clientPenaltyPercent: number;   // Penalty if cancelled late
  providerPenaltyPercent: number; // Penalty for provider cancelling
};

// Default policy (In a real app, this might come from DB per Category)
export const DEFAULT_POLICY: CancellationPolicy = {
  cutoffHours: 24,
  clientPenaltyPercent: 20, // 20% penalty if cancelled within 24h
  providerPenaltyPercent: 0, // 0% financial penalty for now, but trust score hit
};
