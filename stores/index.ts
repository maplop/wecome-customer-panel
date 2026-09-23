// stores/index.ts
import { useClientDataStore } from "@/stores/client-data-store";
import { useClientProfileStore } from "@/stores/client-profile-store";
import { useClientRequestStore } from "@/stores/client-request-store";
import { useCreditDetailsStore } from "@/stores/credit-details-store";
import { useCreditHistoryQueryStore } from "@/stores/credit-history-query-store";
import { useJumioVerificationStore } from "@/stores/jumio-verification-store";

export const clearAllStores = () => {
  useClientDataStore.getState().clearClient();
  useClientProfileStore.getState().reset();
  useClientRequestStore.getState().clearRequests();
  useCreditDetailsStore.getState().clearCreditDetails();
  useCreditHistoryQueryStore.getState().clear();
  useJumioVerificationStore.getState().clear();
};

export {
  useClientDataStore,
  useClientProfileStore,
  useClientRequestStore,
  useCreditDetailsStore,
  useCreditHistoryQueryStore,
  useJumioVerificationStore,
};
