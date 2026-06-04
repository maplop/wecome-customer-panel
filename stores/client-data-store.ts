import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ClientType } from "@/types/client-data/client";

interface ClientDataStore {
  client: ClientType | null;
  setClient: (client: ClientType) => void;
  clearClient: () => void;
}

export const useClientDataStore = create<ClientDataStore>()(
  persist(
    (set) => ({
      client: null,
      setClient: (client) => set({ client }),
      clearClient: () => set({ client: null }),
    }),
    {
      name: "client-data-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
