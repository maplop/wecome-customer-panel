"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ClientData } from "@/types/client-data";

export interface ClientDataState {
  people: ClientData | undefined;
  setPeople: (people: ClientData) => void;
  clearClientData: () => void;
}

export const useClientDataStore = create<ClientDataState>()(
  persist(
    (set) => ({
      people: undefined,
      setPeople: (people) => set({ people }),
      clearClientData: () => set({ people: undefined }),
    }),
    {
      name: "client-data-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        people: state.people,
      }),
    },
  ),
);
