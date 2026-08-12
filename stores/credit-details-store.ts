import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { EvaluateScoreResponse } from "@/types/score";

export interface CreditDetailsCacheEntry {
  scoreData: EvaluateScoreResponse;
  fetchedAt: number;
}

interface CreditDetailsStore {
  detailsCache: Record<string, CreditDetailsCacheEntry>;
  getCreditDetails: (
    evaluationId: string,
  ) => CreditDetailsCacheEntry | undefined;
  setCreditDetails: (
    evaluationId: string,
    entry: CreditDetailsCacheEntry,
  ) => void;
  clearCreditDetails: () => void;
}

export const useCreditDetailsStore = create<CreditDetailsStore>()(
  persist(
    (set, get) => ({
      detailsCache: {},

      getCreditDetails: (evaluationId) =>
        get().detailsCache[evaluationId],

      setCreditDetails: (evaluationId, entry) =>
        set((state) => ({
          detailsCache: {
            ...state.detailsCache,
            [evaluationId]: entry,
          },
        })),

      clearCreditDetails: () => set({ detailsCache: {} }),
    }),
    {
      name: "credit-details-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        detailsCache: state.detailsCache,
      }),
    },
  ),
);