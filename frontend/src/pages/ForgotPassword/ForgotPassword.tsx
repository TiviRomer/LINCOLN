import React, { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../../components/Logo/Logo';
import { validateEmail } from '../../utils/validation';
import './ForgotPassword.scss';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    general: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setEmail(value);
    // Clear error when user starts typing
    if (errors.email || errors.general) {
      setErrors({ email: '', general: '' });
    }
    setIsSuccess(false);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({ email: '', general: '' });
    setIsSuccess(false);

    // Validation
    let hasErrors = false;
    const newErrors = { email: '', general: '' };

    if (!email) {
      newErrors.email = 'El correo electrónico es requerido';
      hasErrors = true;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Correo electrónico inválido';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // API call
    try {
      // TODO: Replace with actual API call
      // Example API call structure:
      // const response = await fetch('/api/auth/forgot-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      // const data = await response.json();
      // if (!response.ok) throw new Error(data.message || 'Error al enviar el correo');
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log('Password reset requested for:', email);
      
      // Show success message
      setIsSuccess(true);
    } catch (error) {
      setErrors({
        ...newErrors,
        general: error instanceof Error 
          ? error.message 
          : 'Error al enviar el correo. Por favor, intenta nuevamente.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-grid"></div>
        <div className="auth-glow"></div>
      </div>
      
      <div className="auth-content">
        <Logo size="large" />
        
        <div className="auth-card">
          <h2 className="auth-title">Recuperar Contraseña</h2>
          <p className="auth-subtitle">
            {isSuccess 
              ? 'Revisa tu correo electrónico para restablecer tu contraseña'
              : 'Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña'
            }
          </p>

          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}
          
          {isSuccess && (
            <div className="success-message">
              <div className="success-icon">✓</div>
              <div>
                <strong>Correo enviado exitosamente</strong>
                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.9 }}>
                  Si el correo {email} está registrado, recibirás un enlace para restablecer tu contraseña.
                </p>
              </div>
            </div>
          )}

          {!isSuccess && (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="usuario@ejemplo.com"
                  autoComplete="email"
                  disabled={isLoading}
                />
                {errors.email && (
                  <span className="error-text">{errors.email}</span>
                )}
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner"></span>
                    Enviando...
                  </>
                ) : (
                  'Enviar Enlace de Recuperación'
                )}
              </button>
            </form>
          )}

          {isSuccess && (
            <div style={{ marginTop: '1.5rem' }}>
              <button
                onClick={() => {
                  setEmail('');
                  setIsSuccess(false);
                }}
                className="auth-button auth-button-secondary"
              >
                Enviar a otro correo
              </button>
            </div>
          )}

          <div className="auth-footer">
            <p>
              ¿Recordaste tu contraseña?{' '}
              <Link to="/login" className="auth-link">
                Inicia sesión aquí
              </Link>
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="auth-link">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

