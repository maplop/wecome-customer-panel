import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ClientPiiType } from "@/types/client-data/client";

interface ClientDataStore {
  pii: ClientPiiType | null;
  setPii: (pii: ClientPiiType) => void;
  clearPii: () => void;
}

export const useClientDataStore = create<ClientDataStore>()(
  persist(
    (set) => ({
      pii: null,
      setPii: (pii) => set({ pii }),
      clearPii: () => set({ pii: null }),
    }),
    {
      name: "client-data-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
