"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { ClientDataState } from "@/types/client-data";

export const useClientDataStore = create<ClientDataState>()(
  persist(
    (set) => ({
      id: undefined,
      data: undefined,
      entities: undefined,
      setClientData: (clientData) =>
        set({
          id: clientData.id,
          data: clientData.data,
          entities: clientData.entities,
        }),
      clearClientData: () =>
        set({
          id: undefined,
          data: undefined,
          entities: undefined,
        }),
    }),
    {
      name: "client-data-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        id: state.id,
        data: state.data,
        entities: state.entities,
      }),
    },
  ),
);
