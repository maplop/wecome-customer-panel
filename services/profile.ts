import AwsCognito, { SERVICES } from "@/sdk/aws/cognito";
import { getCognitoAuthSession } from "@/lib/auth-session";

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Cognito can return an empty object on ChangePassword.
export interface CodeDeliveryDetailsResponse {
  [key: string]: unknown;
}

export async function changePassword({
  currentPassword,
  newPassword,
}: ChangePasswordRequest): Promise<CodeDeliveryDetailsResponse> {
  const authentication = getCognitoAuthSession()?.AuthenticationResult;

  if (!authentication?.AccessToken) {
    throw new Error("No hay sesión activa para cambiar la contraseña.");
  }

  const { data } = await AwsCognito<CodeDeliveryDetailsResponse>(
    SERVICES.CHANGE_PASSWORD,
    {
      AccessToken: authentication.AccessToken,
      PreviousPassword: currentPassword,
      ProposedPassword: newPassword,
    },
  );

  return data;
}
