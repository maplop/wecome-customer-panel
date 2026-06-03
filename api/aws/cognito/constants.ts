export const API_URL = process.env.NEXT_PUBLIC_AWS_COGNITO_API_URL || "";
export const API_CLIENT_ID =
  process.env.NEXT_PUBLIC_AWS_USER_POOLS_WEB_CLIENT_ID ||
  process.env.NEXT_PUBLIC_AWS_COGNITO_CLIENT_ID ||
  "";

export const SERVICES = {
  // ADMIN_ADD_USER_TO_GROUP: 'AdminAddUserToGroup',
  // ADMIN_CREATE_USER: 'AdminCreateUser',
  // ADMIN_DISABLE_USER: 'AdminDisableUser',
  // ADMIN_ENABLE_USER: 'AdminEnableUser',
  // ADMIN_GET_USER: 'AdminGetUser',
  // ADMIN_INITIATE_AUTH: 'AdminInitiateAuth',
  // ADMIN_REMOVE_USER_FROM_GROUP: 'AdminRemoveUserFromGroup',
  // ADMIN_SET_USER_PASSWORD: 'AdminSetUserPassword',
  // ADMIN_UPDATE_USER_ATTRIBUTES: 'AdminUpdateUserAttributes',
  CHANGE_PASSWORD: "ChangePassword",
  // CONFIRM_DEVICE: 'ConfirmDevice',
  CONFIRM_FORGOT_PASSWORD: "ConfirmForgotPassword",
  CONFIRM_SIGN_UP: "ConfirmSignUp",
  // FORGOT_DEVICE: 'ForgotDevice',
  FORGOT_PASSWORD: "ForgotPassword",
  GLOBAL_SIGN_OUT: "GlobalSignOut",
  INITIATE_AUTH: "InitiateAuth",
  // LIST_GROUPS: 'ListGroups',
  RESPOND_TO_AUTH_CHALLENGE: "RespondToAuthChallenge",
  SIGN_UP: 'SignUp',
};
