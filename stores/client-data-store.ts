"use client";

import { create } from "zustand";
import { ClientDataState } from "@/types/client-data";

export const useClientDataStore = create<ClientDataState>((set) => ({
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
}));
