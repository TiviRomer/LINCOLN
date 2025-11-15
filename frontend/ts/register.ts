// Register form handling with TypeScript

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

interface FormErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: string;
  general: string;
}

class RegisterForm {
  private form: HTMLFormElement;
  private nameInput: HTMLInputElement;
  private emailInput: HTMLInputElement;
  private passwordInput: HTMLInputElement;
  private confirmPasswordInput: HTMLInputElement;
  private acceptTermsInput: HTMLInputElement;
  private submitBtn: HTMLButtonElement;
  private buttonText: HTMLElement;
  private spinner: HTMLElement;
  private errorMessage: HTMLElement;
  private nameError: HTMLElement;
  private emailError: HTMLElement;
  private passwordError: HTMLElement;
  private confirmPasswordError: HTMLElement;
  private acceptTermsError: HTMLElement;
  private isLoading: boolean = false;

  constructor() {
    this.form = document.getElementById('register-form') as HTMLFormElement;
    this.nameInput = document.getElementById('name') as HTMLInputElement;
    this.emailInput = document.getElementById('email') as HTMLInputElement;
    this.passwordInput = document.getElementById('password') as HTMLInputElement;
    this.confirmPasswordInput = document.getElementById('confirmPassword') as HTMLInputElement;
    this.acceptTermsInput = document.getElementById('acceptTerms') as HTMLInputElement;
    this.submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
    this.buttonText = document.getElementById('button-text') as HTMLElement;
    this.spinner = document.getElementById('spinner') as HTMLElement;
    this.errorMessage = document.getElementById('error-message') as HTMLElement;
    this.nameError = document.getElementById('name-error') as HTMLElement;
    this.emailError = document.getElementById('email-error') as HTMLElement;
    this.passwordError = document.getElementById('password-error') as HTMLElement;
    this.confirmPasswordError = document.getElementById('confirmPassword-error') as HTMLElement;
    this.acceptTermsError = document.getElementById('acceptTerms-error') as HTMLElement;

    this.init();
  }

  private init(): void {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Clear errors on input
    this.nameInput.addEventListener('input', () => this.clearFieldError('name'));
    this.emailInput.addEventListener('input', () => this.clearFieldError('email'));
    this.passwordInput.addEventListener('input', () => this.clearFieldError('password'));
    this.confirmPasswordInput.addEventListener('input', () => this.clearFieldError('confirmPassword'));
    this.acceptTermsInput.addEventListener('change', () => this.clearFieldError('acceptTerms'));
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validatePassword(password: string): { isValid: boolean; error?: string } {
    if (password.length < 8) {
      return {
        isValid: false,
        error: 'La contraseña debe tener al menos 8 caracteres'
      };
    }

    if (!/[A-Z]/.test(password)) {
      return {
        isValid: false,
        error: 'La contraseña debe contener al menos una mayúscula'
      };
    }

    if (!/[a-z]/.test(password)) {
      return {
        isValid: false,
        error: 'La contraseña debe contener al menos una minúscula'
      };
    }

    if (!/[0-9]/.test(password)) {
      return {
        isValid: false,
        error: 'La contraseña debe contener al menos un número'
      };
    }

    return { isValid: true };
  }

  private validateForm(data: RegisterFormData): FormErrors {
    const errors: FormErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: '',
      general: ''
    };

    if (!data.name.trim()) {
      errors.name = 'El nombre es requerido';
    } else if (data.name.trim().length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!data.email.trim()) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!this.validateEmail(data.email)) {
      errors.email = 'Correo electrónico inválido';
    }

    if (!data.password) {
      errors.password = 'La contraseña es requerida';
    } else {
      const passwordValidation = this.validatePassword(data.password);
      if (!passwordValidation.isValid) {
        errors.password = passwordValidation.error || 'Contraseña inválida';
      }
    }

    if (!data.confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (!data.acceptTerms) {
      errors.acceptTerms = 'Debes aceptar los términos y condiciones';
    }

    return errors;
  }

  private showErrors(errors: FormErrors): void {
    this.nameError.textContent = errors.name;
    this.emailError.textContent = errors.email;
    this.passwordError.textContent = errors.password;
    this.confirmPasswordError.textContent = errors.confirmPassword;
    this.acceptTermsError.textContent = errors.acceptTerms;
    
    if (errors.name) this.nameInput.classList.add('error');
    if (errors.email) this.emailInput.classList.add('error');
    if (errors.password) this.passwordInput.classList.add('error');
    if (errors.confirmPassword) this.confirmPasswordInput.classList.add('error');
    if (errors.acceptTerms) {
      const label = this.acceptTermsInput.closest('.checkbox-label');
      if (label) label.classList.add('error');
    }

    if (errors.general) {
      this.errorMessage.textContent = errors.general;
      this.errorMessage.style.display = 'block';
    } else {
      this.errorMessage.style.display = 'none';
    }
  }

  private clearFieldError(field: string): void {
    switch (field) {
      case 'name':
        this.nameError.textContent = '';
        this.nameInput.classList.remove('error');
        break;
      case 'email':
        this.emailError.textContent = '';
        this.emailInput.classList.remove('error');
        break;
      case 'password':
        this.passwordError.textContent = '';
        this.passwordInput.classList.remove('error');
        break;
      case 'confirmPassword':
        this.confirmPasswordError.textContent = '';
        this.confirmPasswordInput.classList.remove('error');
        break;
      case 'acceptTerms':
        this.acceptTermsError.textContent = '';
        const label = this.acceptTermsInput.closest('.checkbox-label');
        if (label) label.classList.remove('error');
        break;
    }
    this.errorMessage.style.display = 'none';
  }

  private setLoading(loading: boolean): void {
    this.isLoading = loading;
    this.submitBtn.disabled = loading;
    
    if (loading) {
      this.buttonText.style.display = 'none';
      this.spinner.style.display = 'block';
    } else {
      this.buttonText.style.display = 'inline';
      this.spinner.style.display = 'none';
    }
  }

  private async handleSubmit(e: Event): Promise<void> {
    e.preventDefault();

    if (this.isLoading) return;

    // Clear previous errors
    [this.nameInput, this.emailInput, this.passwordInput, this.confirmPasswordInput].forEach(input => {
      input.classList.remove('error');
    });
    const label = this.acceptTermsInput.closest('.checkbox-label');
    if (label) label.classList.remove('error');
    
    [this.nameError, this.emailError, this.passwordError, this.confirmPasswordError, this.acceptTermsError].forEach(error => {
      error.textContent = '';
    });
    this.errorMessage.style.display = 'none';

    const formData: RegisterFormData = {
      name: this.nameInput.value.trim(),
      email: this.emailInput.value.trim(),
      password: this.passwordInput.value,
      confirmPassword: this.confirmPasswordInput.value,
      acceptTerms: this.acceptTermsInput.checked
    };

    // Validate
    const errors = this.validateForm(formData);
    const hasErrors = Object.values(errors).some(error => error !== '');

    if (hasErrors) {
      this.showErrors(errors);
      return;
    }

    // Submit form
    this.setLoading(true);

    try {
      await this.submitRegister(formData);
      
      console.log('Registration successful:', formData.email);
      // Redirect to login
      alert('Registro exitoso! Redirigiendo al login...');
      window.location.href = 'login.html';
      
    } catch (error) {
      this.showErrors({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: '',
        general: 'Error al registrar. Por favor, intenta nuevamente.'
      });
    } finally {
      this.setLoading(false);
    }
  }

  private async submitRegister(data: RegisterFormData): Promise<void> {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // For demo, accept any registration
        resolve();
        // In production, make actual API call:
        // fetch('/api/auth/register', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     name: data.name,
        //     email: data.email,
        //     password: data.password
        //   })
        // })
        //   .then(res => res.json())
        //   .then(resolve)
        //   .catch(reject);
      }, 1500);
    });
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new RegisterForm();
});

