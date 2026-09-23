import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type CreditHistoryQuerySource = 'profile' | 'rcc' | 'fallback' | null

interface CreditHistoryQueryStore {
  category: string | null
  source: CreditHistoryQuerySource
  setResult: (category: string, source: Exclude<CreditHistoryQuerySource, null>) => void
  clear: () => void
}

export const useCreditHistoryQueryStore = create<CreditHistoryQueryStore>()(
  persist(
    (set) => ({
      category: null,
      source: null,
      setResult: (category, source) => set({ category, source }),
      clear: () => set({ category: null, source: null }),
    }),
    {
      name: 'credit-history-query-store',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
