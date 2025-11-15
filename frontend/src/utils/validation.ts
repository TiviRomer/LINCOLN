/**
 * Validates email format
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 */
export const validatePassword = (
  password: string
): { isValid: boolean; error?: string } => {
  if (password.length < 8) {
    return {
      isValid: false,
      error: 'La contraseña debe tener al menos 8 caracteres',
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      error: 'La contraseña debe contener al menos una mayúscula',
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      error: 'La contraseña debe contener al menos una minúscula',
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      error: 'La contraseña debe contener al menos un número',
    };
  }

  return { isValid: true };
};

/**
 * Validates name format
 */
export const validateName = (name: string): boolean => {
  return name.trim().length >= 2 && /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name);
};

