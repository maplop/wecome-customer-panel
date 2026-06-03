/**
 * Registro de usuario con AWS Cognito (SignUp)
 *
 * --- POSTMAN ---
 *
 * 1) SignUp (registrar usuario)
 *
 *   Method:  POST
 *   URL:     {{COGNITO_API_URL}}/SignUp
 *            (ej: https://cognito-idp.us-east-2.amazonaws.com/ si usas proxy, o la URL de tu backend)
 *
 *   Headers:
 *     Content-Type          application/x-amz-json-1.1
 *     X-Amz-Target          AWSCognitoIdentityProviderService.SignUp
 *
 *   Body (raw JSON):
 *     {
 *       "ClientId": "TU_CLIENT_ID",
 *       "Username": "usuario@ejemplo.com",
 *       "Password": "MiClave123!",
 *       "UserAttributes": [
 *         { "Name": "email", "Value": "usuario@ejemplo.com" },
 *         { "Name": "email_verified", "Value": "true" }
 *       ]
 *     }
 *
 * 2) ConfirmSignUp (confirmar con código)
 *
 *   Method:  POST
 *   URL:     {{COGNITO_API_URL}}/ConfirmSignUp
 *
 *   Headers:
 *     Content-Type          application/x-amz-json-1.1
 *     X-Amz-Target          AWSCognitoIdentityProviderService.ConfirmSignUp
 *
 *   Body (raw JSON):
 *     {
 *       "ClientId": "TU_CLIENT_ID",
 *       "Username": "usuario@ejemplo.com",
 *       "ConfirmationCode": "123456"
 *     }
 *
 * Variables en Postman: COGNITO_API_URL y TU_CLIENT_ID (o usa el valor de .env NEXT_PUBLIC_AWS_COGNITO_*).
 */

export type SignUpPayload = {
  Username: string;
  Password: string;
  UserAttributes?: Array<{ Name: string; Value: string }>;
  SecretHash?: string;
  ValidationData?: Array<{ Name: string; Value: string }>;
  ClientMetadata?: Record<string, string>;
};

export type ConfirmSignUpPayload = {
  Username: string;
  ConfirmationCode: string;
  ForceAliasCreate?: boolean;
};
