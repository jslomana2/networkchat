import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Key, CheckCircle, Smartphone, Copy, Printer, AlertTriangle } from 'lucide-react';
import './TwoFactorSetupPage.css';

/**
 * TwoFactorSetupPage - Configuración 2FA obligatoria (GlassOS 2.0)
 * Mismo tema que TwoFactorPage
 *
 * WCAG 2.1 AA Compliant - Mejoras de accesibilidad implementadas:
 * - Labels y aria-labels descriptivos
 * - aria-live para alertas dinámicas
 * - Roles apropiados para regions
 * - Focus management
 * - Touch targets mejorados
 */
export default function TwoFactorSetupPage() {
  const location = useLocation();
  const { login } = useAuth();

  const [step, setStep] = useState(1); // 1: intro, 2: setup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [verificationCode, setVerificationCode] = useState('');

  // IDs únicos para accesibilidad
  const setupFormId = 'tfsetup-verify-form';
  const errorId = 'tfsetup-error';
  const successId = 'tfsetup-success';
  const codeInputId = 'tfsetup-code-input';
  const inputRef = useRef(null);

  const username =
    location.state?.username ||
    new URLSearchParams(window.location.search).get('username') ||
    '';

  useEffect(() => {
    if (!username) {
      window.location.href = 'https://login.tankfuel.app/';
      return;
    }
    document.title = 'Configurar 2FA - TankFuel';
    return () => { document.title = 'TankFuel - SaaS'; };
  }, [username]);

  // Auto-arrancar setup al montar si hay username
  useEffect(() => {
    if (username && step === 1 && !loading) {
      startSetup();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username })
      });
      const data = await response.json();
      if (response.ok) {
        setSecret(data.secret);
        setQrCode(data.qr_code);
        setBackupCodes(data.backup_codes || []);
        setStep(2);
      } else {
        setError(data.error || 'Error iniciando configuración');
      }
    } catch {
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndActivate = async (e) => {
    e.preventDefault();

    // Validación: requerir exactamente 6 dígitos
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Debes introducir el código de 6 dígitos de tu app autenticadora');
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code: verificationCode })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess('¡2FA configurado correctamente! Redirigiendo al dashboard...');
        login(data.user);
        setTimeout(() => {
          window.location.href = 'https://dashboard.tankfuel.app/';
        }, 1500);
      } else {
        setError(data.error || 'Código inválido. Verifica que coincide con tu app autenticadora.');
        setVerificationCode('');
        inputRef.current?.focus();
      }
    } catch {
      setError('Error de conexión. Verifica tu red e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) setVerificationCode(value);
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const printBackupCodes = () => window.print();

  return (
    <div className="tfsetup-page">
      {/* Animated Background */}
      <div className="tfsetup-bg">
        <div className="tfsetup-bg-grid"></div>
        <div className="tfsetup-bg-glow tfsetup-bg-glow-1"></div>
        <div className="tfsetup-bg-glow tfsetup-bg-glow-2"></div>
        <div className="tfsetup-bg-glow tfsetup-bg-glow-3"></div>
      </div>

      {/* Main Container */}
      <div className="tfsetup-container">

        {/* ── LEFT PANEL: Branding ── */}
        <motion.div
          className="tfsetup-brand-panel"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="tfsetup-brand-content">
            <div className="tfsetup-brand-logo">
              <img src="/static/icon-167.png" alt="TankFuel" />
              <div className="tfsetup-brand-info">
                <span className="tfsetup-brand-name">TankFuel</span>
                <span className="tfsetup-brand-badge">GlassOS 2.0</span>
              </div>
            </div>

            <div className="tfsetup-brand-hero">
              <div className="tfsetup-shield-icon">
                <Shield size={48} strokeWidth={1.5} />
                <div className="tfsetup-shield-ring"></div>
              </div>
              <h2>Configuración 2FA</h2>
              <p>Protege tu cuenta con autenticación de doble factor antes de continuar</p>
            </div>

            <div className="tfsetup-brand-features">
              <div className="tfsetup-feature">
                <CheckCircle size={16} />
                <span>Código TOTP temporal</span>
              </div>
              <div className="tfsetup-feature">
                <CheckCircle size={16} />
                <span>Códigos de respaldo</span>
              </div>
              <div className="tfsetup-feature">
                <CheckCircle size={16} />
                <span>Compatible con Authenticator</span>
              </div>
              <div className="tfsetup-feature">
                <CheckCircle size={16} />
                <span>Solo 2-3 minutos</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT PANEL: Setup Wizard ── */}
        <motion.div
          className="tfsetup-form-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Mobile logo */}
          <div className="tfsetup-mobile-brand">
            <img src="/static/icon-167.png" alt="TankFuel" className="tfsetup-mobile-logo" />
            <span className="tfsetup-mobile-name">TankFuel</span>
            <span className="tfsetup-mobile-badge">GlassOS 2.0</span>
          </div>

          {/* Lock icon */}
          <div className={`tfsetup-lock-icon ${success ? 'success' : ''}`}>
            {success ? <CheckCircle size={28} /> : <Key size={28} />}
          </div>

          {/* Header */}
          <div className="tfsetup-form-header">
            <h1>Configura tu 2FA</h1>
            <p>Primer acceso — protege la cuenta <strong>{username}</strong></p>
          </div>

          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="tfsetup-alert tfsetup-alert-error"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                role="alert"
                aria-live="assertive"
                id={errorId}
              >
                <AlertTriangle size={16} aria-hidden="true" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                className="tfsetup-alert tfsetup-alert-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                role="status"
                aria-live="polite"
                id={successId}
              >
                <CheckCircle size={16} aria-hidden="true" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── STEP 1: Intro / Loading ── */}
          {step === 1 && (
            <motion.div
              className="tfsetup-step-panel"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="tfsetup-apps-info">
                <p className="tfsetup-apps-label">
                  <Smartphone size={14} /> Instala una de estas apps:
                </p>
                <div className="tfsetup-apps-grid">
                  {['Google Authenticator', 'Microsoft Authenticator', 'Authy', 'FreeOTP'].map(app => (
                    <div key={app} className="tfsetup-app-chip">{app}</div>
                  ))}
                </div>
              </div>

              <button
                className="tfsetup-btn-primary"
                onClick={startSetup}
                disabled={loading}
              >
                {loading ? (
                  <><span className="tfsetup-spinner" /> Iniciando...</>
                ) : (
                  'Comenzar configuración →'
                )}
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: QR + Backup + Verify ── */}
          {step === 2 && (
            <motion.div
              className="tfsetup-step-panel tfsetup-step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Step 1 of wizard: Scan QR */}
              <div className="tfsetup-wizard-step">
                <div className="tfsetup-wizard-number">1</div>
                <div>
                  <p className="tfsetup-wizard-label">Escanea el código QR con tu app</p>
                  <div className="tfsetup-qr-box">
                    {qrCode
                      ? <img src={qrCode} alt="QR Code 2FA" />
                      : <div className="tfsetup-qr-placeholder"><span className="tfsetup-spinner" /></div>
                    }
                  </div>
                </div>
              </div>

              {/* Step 2 of wizard: Manual key */}
              <div className="tfsetup-wizard-step">
                <div className="tfsetup-wizard-number">2</div>
                <div style={{ width: '100%' }}>
                  <p className="tfsetup-wizard-label">O introduce la clave manual</p>
                  <div className="tfsetup-secret-box" onClick={copySecret} title="Click para copiar">
                    <code>{secret}</code>
                    <Copy size={14} className={copied ? 'copied' : ''} />
                  </div>
                  {copied && <span className="tfsetup-copied-hint">¡Copiado!</span>}
                </div>
              </div>

              {/* Step 3 of wizard: Backup codes */}
              <div className="tfsetup-wizard-step">
                <div className="tfsetup-wizard-number">3</div>
                <div style={{ width: '100%' }}>
                  <p className="tfsetup-wizard-label">
                    <AlertTriangle size={13} style={{ color: '#f59e0b', verticalAlign: 'middle' }} aria-hidden="true" />
                    &nbsp;Guarda estos códigos de respaldo (uso único)
                  </p>
                  <div className="tfsetup-backup-grid" role="list" aria-label="Códigos de respaldo de un solo uso">
                    {backupCodes.map((code, i) => (
                      <div key={i} className="tfsetup-backup-code" role="listitem">
                        <span className="sr-only">Código de respaldo {i + 1}:</span>
                        {code}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="tfsetup-btn-secondary"
                    onClick={printBackupCodes}
                    aria-label="Imprimir códigos de respaldo para guardarlos en un lugar seguro"
                  >
                    <Printer size={14} aria-hidden="true" /> Imprimir códigos
                  </button>
                </div>
              </div>

              {/* Step 4 of wizard: Verify */}
              <div className="tfsetup-wizard-step">
                <div className="tfsetup-wizard-number">4</div>
                <div style={{ width: '100%' }}>
                  <p className="tfsetup-wizard-label">Verifica con el código de 6 dígitos</p>

                  <form id={setupFormId} onSubmit={verifyAndActivate} className="tfsetup-verify-form" noValidate>
                    {/* Code display */}
                    <div className="tfsetup-code-wrapper">
                      <label htmlFor={codeInputId} className="sr-only">
                        Introduce el código de verificación de 6 dígitos de tu aplicación autenticadora
                      </label>
                      <input
                        ref={inputRef}
                        id={codeInputId}
                        type="text"
                        inputMode="numeric"
                        value={verificationCode}
                        onChange={handleCodeChange}
                        placeholder="------"
                        maxLength={6}
                        disabled={loading || !!success}
                        autoComplete="one-time-code"
                        className="tfsetup-code-input"
                        required
                        aria-required="true"
                        aria-invalid={error ? 'true' : 'false'}
                        aria-describedby={error ? errorId : success ? successId : undefined}
                        pattern="[0-9]{6}"
                      />
                      <div className="tfsetup-code-display" role="presentation" aria-hidden="true">
                        {[...Array(6)].map((_, i) => (
                          <div
                            key={i}
                            className={`tfsetup-digit ${i < verificationCode.length ? 'filled' : ''} ${i === verificationCode.length ? 'active' : ''}`}
                          >
                            {verificationCode[i] || ''}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="tfsetup-btn-primary"
                      disabled={loading || verificationCode.length !== 6 || !!success}
                      aria-busy={loading}
                    >
                      {loading ? (
                        <>
                          <span className="tfsetup-spinner" aria-hidden="true" />
                          <span className="sr-only">Verificando código...</span>
                          <span aria-hidden="true"> Verificando...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} aria-hidden="true" />
                          <span>Verificar y activar 2FA</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
