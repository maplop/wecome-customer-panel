// store/index.ts
import { useClientDataStore } from "@/stores/client-data-store";
import { useClientProfileStore } from "@/stores/client-profile-store";

export const clearAllStores = () => {
  useClientDataStore.getState().clearClient();
  useClientProfileStore.getState().reset();
};

export { useClientDataStore, useClientProfileStore };
