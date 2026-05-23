import { useState, useRef } from "react";
import type { AuthProps, LoggedUser, ViewMode, MockUser } from "./types.js";

const MOCK_USERS: MockUser[] = [
  {
    name: "Maria Gonzalez Perez",
    email: "maria.gonzalez@empresa.com",
    password: "demo1234",
    curp: "GOPM850312MDFNRR08",
  },
  {
    name: "Carlos Ramirez Lopez",
    email: "carlos.ramirez@empresa.com",
    password: "demo1234",
    curp: "RALC900715HDFLPR05",
  },
];

export const RECOVERY_EMAIL = "maria.gonzalez@empresa.com";
export const RECOVERY_CODE = "123456";

interface UseAuthOptions extends AuthProps {
  onModeChange?: (mode: ViewMode) => void;
}

export function maskEmail(email: string) {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;

  const visible = user.slice(0, 2);
  const masked = "*".repeat(Math.max(user.length - 2, 3));
  return `${visible}${masked}@${domain}`;
}

export const useAuth = ({ onClose, onSuccess, onModeChange }: UseAuthOptions) => {
  const [mode, setModeState] = useState<ViewMode>("login");

  const setMode = (nextMode: ViewMode) => {
    setModeState(nextMode);
    onModeChange?.(nextMode);
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [recoveryDigits, setRecoveryDigits] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryInfo, setRecoveryInfo] = useState("");
  const recoveryRefs = Array.from({ length: 6 }, () =>
    useRef<HTMLInputElement>(null),
  );

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetError, setResetError] = useState("");

  const resetRecoveryState = () => {
    setModeState("login");
    setRecoveryDigits(["", "", "", "", "", ""]);
    setRecoveryLoading(false);
    setRecoveryError("");
    setRecoveryInfo("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setResetError("");
  };

  const handleClose = () => {
    resetRecoveryState();
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setError("");
    setLoading(false);
    setSuccessMessage("");
    onClose();
  };

  const goToLogin = (message = "") => {
    resetRecoveryState();
    setEmail(RECOVERY_EMAIL);
    setPassword("");
    setShowPassword(false);
    setError("");
    setSuccessMessage(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!email || !password) {
      setError("Completa todos los campos.");
      return;
    }

    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));

    const match = MOCK_USERS.find(
      (user) =>
        user.email.toLowerCase() === email.toLowerCase() &&
        user.password === password,
    );

    setLoading(false);

    if (!match) {
      setError("Correo o contraseña incorrectos.");
      return;
    }

    onSuccess({ name: match.name, email: match.email, curp: match.curp });
  };

  const handleSendRecoveryCode = async () => {
    setRecoveryError("");
    setRecoveryInfo("");
    setRecoveryLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 900));

    setRecoveryLoading(false);
    setRecoveryInfo(
      `Enviamos un codigo de 6 digitos a ${maskEmail(RECOVERY_EMAIL)}.`,
    );
    setMode("recover-verify");
  };

  const handleRecoveryDigitChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const nextDigits = [...recoveryDigits];
    nextDigits[index] = value;
    setRecoveryDigits(nextDigits);
    setRecoveryError("");

    if (value && index < recoveryRefs.length - 1) {
      recoveryRefs[index + 1].current?.focus();
    }
  };

  const handleRecoveryKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !recoveryDigits[index] && index > 0) {
      recoveryRefs[index - 1].current?.focus();
    }
  };

  const handleRecoveryPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const pastedCode = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pastedCode.length !== 6) return;

    setRecoveryDigits(pastedCode.split(""));
    setRecoveryError("");
    recoveryRefs[5].current?.focus();
  };

  const handleVerifyRecoveryCode = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = recoveryDigits.join("");
    if (code.length !== 6) {
      setRecoveryError("Ingresa los 6 digitos del codigo.");
      return;
    }

    setRecoveryError("");
    setRecoveryLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    setRecoveryLoading(false);

    if (code !== RECOVERY_CODE) {
      setRecoveryError("El codigo no es valido. Usa 123456 para esta demo.");
      return;
    }

    setMode("recover-reset");
  };

  const handleResendRecoveryCode = async () => {
    setRecoveryDigits(["", "", "", "", "", ""]);
    setRecoveryError("");
    setRecoveryInfo("");
    setRecoveryLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 700));

    setRecoveryLoading(false);
    setRecoveryInfo(`Reenviamos el codigo a ${maskEmail(RECOVERY_EMAIL)}.`);
    recoveryRefs[0].current?.focus();
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError("");

    if (!newPassword || !confirmPassword) {
      setResetError("Completa ambos campos.");
      return;
    }

    if (newPassword.length < 8) {
      setResetError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setResetError("Las contrasenas no coinciden.");
      return;
    }

    setRecoveryLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setRecoveryLoading(false);

    const user = MOCK_USERS.find(
      (item) => item.email.toLowerCase() === RECOVERY_EMAIL.toLowerCase(),
    );
    if (user) user.password = newPassword;

    goToLogin(
      "Contraseña actualizada. Ahora puedes iniciar sesion con tu nueva contraseña.",
    );
  };

  return {
    mode,
    setMode,
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    error,
    setError,
    loading,
    successMessage,
    setSuccessMessage,
    handleSubmit,
    handleClose,
    recovery: {
      digits: recoveryDigits,
      loading: recoveryLoading,
      error: recoveryError,
      info: recoveryInfo,
      refs: recoveryRefs,
    },
    handleSendRecoveryCode,
    handleRecoveryDigitChange,
    handleRecoveryKeyDown,
    handleRecoveryPaste,
    handleVerifyRecoveryCode,
    handleResendRecoveryCode,
    reset: {
      newPassword,
      confirmPassword,
      showNewPassword,
      showConfirmPassword,
      error: resetError,
    },
    handleResetPassword,
    setNewPassword,
    setConfirmPassword,
    setShowNewPassword,
    setShowConfirmPassword,
    setResetError,
  };
};
