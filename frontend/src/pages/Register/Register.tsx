import React, { useState, FormEvent, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/Logo/Logo';
import { validateEmail, validatePassword } from '../../utils/validation';
import apiService from '../../services/api';
import './Register.scss';

type PasswordStrength = 'weak' | 'medium' | 'strong' | '';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: '',
    general: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Calculate password strength
  const passwordStrength = useMemo((): PasswordStrength => {
    if (!formData.password) return '';
    
    const hasLength = formData.password.length >= 8;
    const hasUpper = /[A-Z]/.test(formData.password);
    const hasLower = /[a-z]/.test(formData.password);
    const hasNumber = /[0-9]/.test(formData.password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
    
    const criteriaMet = [hasLength, hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length;
    
    if (criteriaMet <= 2) return 'weak';
    if (criteriaMet <= 4) return 'medium';
    return 'strong';
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
        general: '',
      }));
    }
    // Clear success message when user makes changes
    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: '',
      general: '',
    });

    // Validation
    let hasErrors = false;
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: '',
      general: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
      hasErrors = true;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
      hasErrors = true;
    }

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es requerido';
      hasErrors = true;
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
      hasErrors = true;
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
      hasErrors = true;
    } else {
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        newErrors.password = passwordValidation.error || 'Contraseña inválida';
        hasErrors = true;
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
      hasErrors = true;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
      hasErrors = true;
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Debes aceptar los términos y condiciones';
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }

    // API call
    try {
      const response = await apiService.register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        // Show success message
        setSuccessMessage('¡Cuenta creada exitosamente! Redirigiendo...');
        
        // Navigate to login after a short delay
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Cuenta creada exitosamente. Por favor, inicia sesión.' 
            } 
          });
        }, 1500);
      } else {
        setErrors({
          ...newErrors,
          general: response.message || 'Error al registrar. Por favor, intenta nuevamente.',
        });
      }
    } catch (error) {
      setErrors({
        ...newErrors,
        general: error instanceof Error 
          ? error.message 
          : 'Error al registrar. Por favor, intenta nuevamente.',
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
          <h2 className="auth-title">Crear Cuenta</h2>
          <p className="auth-subtitle">Únete al sistema de seguridad LINCOLN</p>

          {errors.general && (
            <div className="error-message">{errors.general}</div>
          )}
          
          {successMessage && (
            <div className="success-message">{successMessage}</div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Nombre Completo
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`form-input ${errors.name ? 'error' : ''}`}
                placeholder="Juan Pérez"
                autoComplete="name"
              />
              {errors.name && (
                <span className="error-text">{errors.name}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Correo Electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? 'error' : ''}`}
                placeholder="usuario@ejemplo.com"
                autoComplete="email"
              />
              {errors.email && (
                <span className="error-text">{errors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Contraseña
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? 'error' : ''} ${passwordStrength ? `strength-${passwordStrength}` : ''}`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formData.password && (
                <div className="password-strength">
                  <div className="strength-label">
                    Fortaleza: <span className={`strength-text strength-${passwordStrength}`}>
                      {passwordStrength === 'weak' && 'Débil'}
                      {passwordStrength === 'medium' && 'Media'}
                      {passwordStrength === 'strong' && 'Fuerte'}
                    </span>
                  </div>
                  <div className="strength-bar">
                    <div 
                      className={`strength-fill strength-${passwordStrength}`}
                      style={{ 
                        width: passwordStrength === 'weak' ? '33%' : 
                               passwordStrength === 'medium' ? '66%' : 
                               passwordStrength === 'strong' ? '100%' : '0%' 
                      }}
                    />
                  </div>
                </div>
              )}
              {errors.password && (
                <span className="error-text">{errors.password}</span>
              )}
              <div className="password-hint">
                Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                Confirmar Contraseña
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${errors.confirmPassword ? 'error' : ''} ${formData.confirmPassword && formData.password === formData.confirmPassword ? 'match' : ''}`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <span className="success-text">✓ Las contraseñas coinciden</span>
              )}
              {errors.confirmPassword && (
                <span className="error-text">{errors.confirmPassword}</span>
              )}
            </div>

            <div className="form-group">
              <label className={`checkbox-label ${errors.acceptTerms ? 'error' : ''}`}>
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                />
                <span>
                  Acepto los{' '}
                  <Link to="/terms" className="inline-link">
                    términos y condiciones
                  </Link>{' '}
                  y la{' '}
                  <Link to="/privacy" className="inline-link">
                    política de privacidad
                  </Link>
                </span>
              </label>
              {errors.acceptTerms && (
                <span className="error-text">{errors.acceptTerms}</span>
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
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="auth-link">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

