'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { ROUTES } from '@/lib/routes'
import { useAuth, RECOVERY_EMAIL, RECOVERY_CODE } from './useAuth'
import { Login, RecoverRequest, RecoverVerify, RecoverReset } from './components'
import type { ViewMode } from './types'

const MODE_TO_ROUTE: Record<ViewMode, string> = {
  login: ROUTES.AUTH.LOGIN,
  'recover-request': ROUTES.AUTH.RECOVER_REQUEST,
  'recover-verify': ROUTES.AUTH.RECOVER_VERIFY,
  'recover-reset': ROUTES.AUTH.RECOVER_RESET,
}

interface AuthRouteViewProps {
  mode: ViewMode
}

export default function AuthRouteView({ mode: currentMode }: AuthRouteViewProps) {
  const router = useRouter()

  const {
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
  } = useAuth({
    onSuccess: () => router.push(ROUTES.DASHBOARD.ROOT),
    onClose: () => router.push(ROUTES.ONBOARDING.CURP_VERIFICATION),
    onModeChange: (nextMode) => {
      const route = MODE_TO_ROUTE[nextMode]
      if (route) router.push(route)
    },
  })

  useEffect(() => {
    setMode(currentMode)
  }, [currentMode, setMode])

  return (
    <>
      {mode === 'login' && (
        <Login
          email={email}
          password={password}
          showPassword={showPassword}
          error={error}
          loading={loading}
          successMessage={successMessage}
          setEmail={setEmail}
          setPassword={setPassword}
          setShowPassword={setShowPassword}
          setError={setError}
          setSuccessMessage={setSuccessMessage}
          handleSubmit={handleSubmit}
          setMode={setMode}
          onClose={handleClose}
        />
      )}

      {mode === 'recover-request' && (
        <RecoverRequest
          recoveryEmail={RECOVERY_EMAIL}
          recoveryLoading={recoveryLoading}
          handleSendRecoveryCode={handleSendRecoveryCode}
          goToLogin={() => setMode('login')}
          onClose={handleClose}
        />
      )}

      {mode === 'recover-verify' && (
        <RecoverVerify
          recoveryEmail={RECOVERY_EMAIL}
          recoveryCode={RECOVERY_CODE}
          recoveryDigits={recoveryDigits}
          recoveryError={recoveryError}
          recoveryInfo={recoveryInfo}
          recoveryRefs={recoveryRefs}
          recoveryLoading={recoveryLoading}
          handleRecoveryDigitChange={handleRecoveryDigitChange}
          handleRecoveryKeyDown={handleRecoveryKeyDown}
          handleRecoveryPaste={handleRecoveryPaste}
          handleVerifyRecoveryCode={handleVerifyRecoveryCode}
          handleResendRecoveryCode={handleResendRecoveryCode}
          setMode={setMode}
          onClose={handleClose}
        />
      )}

      {mode === 'recover-reset' && (
        <RecoverReset
          recoveryEmail={RECOVERY_EMAIL}
          newPassword={newPassword}
          confirmPassword={confirmPassword}
          showNewPassword={showNewPassword}
          showConfirmPassword={showConfirmPassword}
          resetError={resetError}
          recoveryLoading={recoveryLoading}
          setNewPassword={setNewPassword}
          setConfirmPassword={setConfirmPassword}
          setShowNewPassword={setShowNewPassword}
          setShowConfirmPassword={setShowConfirmPassword}
          setResetError={setResetError}
          setMode={setMode}
          handleResetPassword={handleResetPassword}
          onClose={handleClose}
        />
      )}
    </>
  )
}
