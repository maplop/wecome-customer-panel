// auth.types.ts

export interface AuthProps {
  onClose: () => void;
  onSuccess: (user: LoggedUser) => void;
}

export interface LoggedUser {
  name: string;
  email: string;
  curp: string;
}

export type ViewMode =
  | "login"
  | "recover-request"
  | "recover-verify"
  | "recover-reset";

// Extiende LoggedUser en lugar de repetir los campos
export type MockUser = LoggedUser & { password: string };

export interface LoginProps {
  email: string;
  password: string;
  showPassword: boolean;
  error: string;
  loading: boolean;
  successMessage: string;
  setEmail: (v: string) => void;
  setPassword: (v: string) => void;
  setShowPassword: (v: boolean) => void;
  setError: (v: string) => void;
  setSuccessMessage: (v: string) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  setMode: (mode: ViewMode) => void;
  onClose: () => void;
}

export interface RecoverRequestProps {
  recoveryEmail: string;
  recoveryLoading: boolean;
  handleSendRecoveryCode: () => Promise<void>;
  goToLogin: () => void;
  onClose: () => void;
}

export interface RecoverResetProps {
  recoveryEmail: string;
  newPassword: string;
  confirmPassword: string;
  showNewPassword: boolean;
  showConfirmPassword: boolean;
  resetError: string;
  recoveryLoading: boolean;
  setNewPassword: (v: string) => void;
  setConfirmPassword: (v: string) => void;
  setShowNewPassword: (v: boolean) => void;
  setShowConfirmPassword: (v: boolean) => void;
  setResetError: (v: string) => void;
  setMode: (mode: ViewMode) => void;
  handleResetPassword: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onClose: () => void;
}

export interface RecoverVerifyProps {
  recoveryEmail: string;
  recoveryCode: string;
  recoveryDigits: string[];
  recoveryRefs: React.RefObject<HTMLInputElement | null>[];
  recoveryLoading: boolean;
  recoveryError: string;
  recoveryInfo: string;
  handleVerifyRecoveryCode: (
    e: React.FormEvent<HTMLFormElement>,
  ) => Promise<void>;
  handleRecoveryDigitChange: (index: number, value: string) => void;
  handleRecoveryKeyDown: (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => void;
  handleRecoveryPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  handleResendRecoveryCode: () => Promise<void>;
  setMode: (mode: ViewMode) => void;
  onClose: () => void;
}
