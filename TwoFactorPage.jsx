import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Lock, ArrowLeft, CheckCircle } from 'lucide-react';
import './TwoFactorPage.css';

/**
 * TwoFactorPage - Professional 2FA Verification
 * Enterprise-grade security verification with TankFuel branding
 *
 * WCAG 2.1 AA Compliant - Mejoras de accesibilidad implementadas:
 * - Labels y aria-labels descriptivos
 * - aria-live para alertas dinámicas
 * - aria-invalid para errores de validación
 * - Focus management para lectores de pantalla
 * - autoComplete="one-time-code" para autocompletado
 */
function TwoFactorPageComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const inputRef = useRef(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isFocused, setIsFocused] = useState(false);

  // ID único para el form y región de errores
  const formId = 'twofa-form';
  const errorId = 'twofa-error';
  const successId = 'twofa-success';
  const codeInputId = 'twofa-code-input';

  const getUsernameFromQuery = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('username') || '';
  };

  const username = getUsernameFromQuery();

  useEffect(() => {
    document.title = 'Verificación 2FA - TankFuel';
    return () => {
      document.title = 'TankFuel - SaaS';
    };
  }, []);

  // Focus the input after mount - iOS requires a slight delay to show keyboard
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!username) {
      window.location.href = 'https://login.tankfuel.app/';
      return;
    }
  }, [username]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = 'https://login.tankfuel.app/';
          return 0;
        }
        return prev - 1;
      });
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validación: requerir exactamente 6 dígitos
    if (!code || code.length !== 6) {
      setError('Debes introducir un código de 6 dígitos');
      // Mantener foco en el input para corregir
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, code })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setError('');
        login(data.user);

        // Redirigir a dashboard - el router determina qué dashboard mostrar según el rol
        setTimeout(() => {
          window.location.href = 'https://dashboard.tankfuel.app/';
        }, 800);
        return;
      } else {
        setError(data.error || 'Código inválido. Inténtalo nuevamente.');
        setCode('');
        // Refocar input después de error
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    } catch (err) {
      console.error('Error en 2FA:', err);
      setError('Error de conexión. Verifica tu red e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }, [username, code, login]);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setCode(value);
    }
  }, []);

  const handleCancel = useCallback(() => {
    window.location.href = 'https://login.tankfuel.app/';
  }, []);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (code.length === 6 && !loading && !success) {
      const timer = setTimeout(() => {
        document.getElementById('twofa-form')?.requestSubmit();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [code, loading, success]);

  return (
    <div className="twofa-page">
      {/* Animated Background */}
      <div className="twofa-bg">
        <div className="twofa-bg-grid"></div>
        <div className="twofa-bg-glow twofa-bg-glow-1"></div>
        <div className="twofa-bg-glow twofa-bg-glow-2"></div>
        <div className="twofa-bg-glow twofa-bg-glow-3"></div>
      </div>

      {/* Main Container */}
      <div className="twofa-container">
        {/* Left Panel - Branding (Desktop only) */}
        <motion.div
          className="twofa-brand-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="twofa-brand-content">
            <div className="twofa-brand-logo">
              <img src="/static/icon-167.png" alt="TankFuel" />
              <div className="twofa-brand-info">
                <span className="twofa-brand-name">TankFuel</span>
                <span className="twofa-brand-badge">GlassOS 2.0</span>
              </div>
            </div>

            <div className="twofa-brand-hero">
              <div className="twofa-shield-icon">
                <Shield size={48} strokeWidth={1.5} />
                <div className="twofa-shield-ring"></div>
              </div>
              <h2>Seguridad Empresarial</h2>
              <p>Protección de doble factor para tu infraestructura de monitoreo de combustible</p>
            </div>

            <div className="twofa-brand-features">
              <div className="twofa-feature">
                <CheckCircle size={16} />
                <span>Cifrado AES-256</span>
              </div>
              <div className="twofa-feature">
                <CheckCircle size={16} />
                <span>TOTP compatible</span>
              </div>
              <div className="twofa-feature">
                <CheckCircle size={16} />
                <span>Sesión segura 24h</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Form */}
        <motion.div
          className="twofa-form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Mobile Logo */}
          <div className="twofa-mobile-brand">
            <img src="/static/icon-167.png" alt="TankFuel" className="twofa-mobile-logo" />
            <span className="twofa-mobile-name">TankFuel</span>
            <span className="twofa-mobile-badge">GlassOS 2.0</span>
          </div>

          {/* Lock Icon */}
          <div className={`twofa-lock-icon ${success ? 'success' : ''}`}>
            {success ? <CheckCircle size={28} /> : <Lock size={28} />}
          </div>

          {/* Header */}
          <div className="twofa-form-header">
            <h1>Verificación 2FA</h1>
            <p>Introduce el código de 6 dígitos de tu aplicación autenticadora</p>
          </div>

          {/* User Badge */}
          <div className="twofa-user-badge">
            <div className="twofa-user-avatar">
              {username.charAt(0).toUpperCase()}
            </div>
            <div className="twofa-user-info">
              <span className="twofa-user-label">Cuenta</span>
              <span className="twofa-user-name">{username}</span>
            </div>
          </div>

          {/* Form */}
          <form id={formId} onSubmit={handleSubmit} className="twofa-form" noValidate>
            {error && (
              <motion.div
                className="twofa-alert twofa-alert-error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                role="alert"
                aria-live="assertive"
                id={errorId}
              >
                <div className="twofa-alert-icon" aria-hidden="true">!</div>
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div
                className="twofa-alert twofa-alert-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                role="status"
                aria-live="polite"
                id={successId}
              >
                <CheckCircle size={16} aria-hidden="true" />
                <span>Verificación exitosa. Redirigiendo al dashboard...</span>
              </motion.div>
            )}

            {/* Code Input with individual digit display */}
            <div className="twofa-code-wrapper" onClick={focusInput}>
              <label htmlFor={codeInputId} className="sr-only">
                Introduce el código de 6 dígitos de tu aplicación autenticadora
              </label>
              <input
                ref={inputRef}
                id={codeInputId}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]{6}"
                value={code}
                onChange={handleInputChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="------"
                maxLength={6}
                disabled={loading || success}
                className="twofa-code-input"
                autoComplete="one-time-code"
                required
                aria-required="true"
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? errorId : success ? successId : undefined}
                aria-label="Código de verificación de 6 dígitos"
              />
              <div className="twofa-code-display" role="presentation" aria-hidden="true">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`twofa-digit ${i < code.length ? 'filled' : ''} ${i === code.length && isFocused ? 'active' : ''}`}
                    aria-hidden="true"
                  >
                    {code[i] || ''}
                  </div>
                ))}
              </div>
            </div>

            {/* Progress dots - hidden from screen readers */}
            <div className="twofa-progress" role="presentation" aria-hidden="true">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`twofa-progress-dot ${i < code.length ? 'filled' : ''}`}
                />
              ))}
            </div>

            <button
              type="submit"
              className={`twofa-btn-verify ${loading ? 'loading' : ''} ${success ? 'success' : ''}`}
              disabled={loading || code.length !== 6 || success}
              aria-busy={loading}
              aria-describedby={loading ? 'twofa-loading-desc' : undefined}
            >
              {loading ? (
                <>
                  <span className="twofa-spinner" aria-hidden="true"></span>
                  <span id="twofa-loading-desc" className="sr-only">Verificando código...</span>
                  <span aria-hidden="true">Verificando...</span>
                </>
              ) : success ? (
                <>
                  <CheckCircle size={18} aria-hidden="true" />
                  <span>Verificado</span>
                </>
              ) : (
                <>
                  <Shield size={18} aria-hidden="true" />
                  <span>Verificar Código</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleCancel}
              className="twofa-btn-cancel"
              disabled={loading || success}
              aria-label="Cancelar y volver al inicio de sesión"
            >
              <ArrowLeft size={16} aria-hidden="true" />
              <span>Volver al inicio de sesión</span>
            </button>
          </form>

          {/* Footer */}
          <div className="twofa-form-footer">
            <p>Sesión expira en <strong>{timeLeft} min</strong></p>
            <p className="twofa-help-text">
              ¿Sin acceso a tu dispositivo? Contacta al administrador
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

const TwoFactorPage = memo(TwoFactorPageComponent);
TwoFactorPage.displayName = 'TwoFactorPage';

export default TwoFactorPage;
