'use client'
import { Login, RecoverRequest, RecoverVerify, RecoverReset } from './components'
import { useAuth, RECOVERY_EMAIL, RECOVERY_CODE } from './useAuth'
import type { AuthProps } from './types'

export default function Auth({ onClose, onSuccess }: AuthProps) {

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
  } = useAuth({ onSuccess, onClose })

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
        />
      )}

      {mode === 'recover-request' && (
        <RecoverRequest
          recoveryEmail={RECOVERY_EMAIL}
          recoveryLoading={recoveryLoading}
          handleSendRecoveryCode={handleSendRecoveryCode}
          goToLogin={() => setMode('login')}
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
        />
      )}
    </>
  )
}
