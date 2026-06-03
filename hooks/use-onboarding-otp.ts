"use client";

import { useEffect, useState } from "react";
import { sendOtp, validateOtp } from "@/services/onboarding/onboarding";
import {
  ONBOARDING_MAX_RESEND_ATTEMPTS,
  ONBOARDING_OTP_LENGTH,
  ONBOARDING_RESEND_WAIT_SECONDS,
} from "@/services/onboarding/onboarding.constants";

interface UseInitialOtpSendOptions {
  email?: string;
  onSuccess: () => void;
}

interface UseOtpVerificationOptions {
  email?: string;
  onVerified: () => void;
  otpLength?: number;
  resendWaitSeconds?: number;
  maxResendAttempts?: number;
}

export function useInitialOtpSend(options: UseInitialOtpSendOptions) {
  const { email, onSuccess } = options;
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  const sendInitialOtp = async () => {
    if (isSendingOtp) {
      return;
    }

    if (!email) {
      setOtpError(
        "No se encontró un correo de lista blanca para enviar el código.",
      );
      return;
    }

    setOtpError("");
    setIsSendingOtp(true);

    try {
      const sent = await sendOtp(email);
      if (!sent) {
        setOtpError(
          "No fue posible enviar el código al correo. Intenta nuevamente.",
        );
        return;
      }

      onSuccess();
    } catch {
      setOtpError(
        "No fue posible enviar el código al correo. Intenta nuevamente.",
      );
    } finally {
      setIsSendingOtp(false);
    }
  };

  return {
    isSendingOtp,
    otpError,
    sendInitialOtp,
  };
}

export function useOtpVerificationFlow(options: UseOtpVerificationOptions) {
  const {
    email,
    onVerified,
    otpLength = ONBOARDING_OTP_LENGTH,
    resendWaitSeconds = ONBOARDING_RESEND_WAIT_SECONDS,
    maxResendAttempts = ONBOARDING_MAX_RESEND_ATTEMPTS,
  } = options;

  const [error, setError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendAttempts, setResendAttempts] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(resendWaitSeconds);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [secondsLeft]);

  const clearError = () => setError("");

  const verifyCode = async (otp: string): Promise<boolean> => {
    if (isVerifying) {
      return false;
    }

    if (otp.length < otpLength) {
      setError(`Ingresa los ${otpLength} dígitos del código.`);
      return false;
    }

    setError("");
    setIsVerifying(true);

    try {
      const isValid = await validateOtp(otp);
      if (!isValid) {
        setError("El código no es válido. Verifica e intenta nuevamente.");
        return false;
      }

      onVerified();
      return true;
    } catch {
      setError("No fue posible validar el código. Intenta nuevamente.");
      return false;
    } finally {
      setIsVerifying(false);
    }
  };

  const canResend =
    secondsLeft === 0 &&
    resendAttempts < maxResendAttempts &&
    !isResending &&
    !isVerifying;

  const resendCode = async (): Promise<boolean> => {
    if (!canResend) {
      return false;
    }

    if (!email) {
      setError(
        "No se encontró un correo de lista blanca para reenviar el código.",
      );
      return false;
    }

    setError("");
    setIsResending(true);

    try {
      const sent = await sendOtp(email);
      if (!sent) {
        setError("No fue posible reenviar el código. Intenta nuevamente.");
        return false;
      }

      setResendAttempts((prev) => prev + 1);
      setSecondsLeft(resendWaitSeconds);
      return true;
    } catch {
      setError("No fue posible reenviar el código. Intenta nuevamente.");
      return false;
    } finally {
      setIsResending(false);
    }
  };

  return {
    error,
    isVerifying,
    isResending,
    resendAttempts,
    maxResendAttempts,
    secondsLeft,
    canResend,
    resendLimitReached: resendAttempts >= maxResendAttempts,
    clearError,
    verifyCode,
    resendCode,
  };
}
