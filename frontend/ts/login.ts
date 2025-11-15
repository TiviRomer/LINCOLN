// Login form handling with TypeScript

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email: string;
  password: string;
  general: string;
}

class LoginForm {
  private form: HTMLFormElement;
  private emailInput: HTMLInputElement;
  private passwordInput: HTMLInputElement;
  private submitBtn: HTMLButtonElement;
  private buttonText: HTMLElement;
  private spinner: HTMLElement;
  private errorMessage: HTMLElement;
  private emailError: HTMLElement;
  private passwordError: HTMLElement;
  private isLoading: boolean = false;

  constructor() {
    this.form = document.getElementById('login-form') as HTMLFormElement;
    this.emailInput = document.getElementById('email') as HTMLInputElement;
    this.passwordInput = document.getElementById('password') as HTMLInputElement;
    this.submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
    this.buttonText = document.getElementById('button-text') as HTMLElement;
    this.spinner = document.getElementById('spinner') as HTMLElement;
    this.errorMessage = document.getElementById('error-message') as HTMLElement;
    this.emailError = document.getElementById('email-error') as HTMLElement;
    this.passwordError = document.getElementById('password-error') as HTMLElement;

    this.init();
  }

  private init(): void {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    // Clear errors on input
    this.emailInput.addEventListener('input', () => this.clearFieldError('email'));
    this.passwordInput.addEventListener('input', () => this.clearFieldError('password'));
  }

  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private validateForm(data: LoginFormData): LoginFormErrors {
    const errors: LoginFormErrors = {
      email: '',
      password: '',
      general: ''
    };

    if (!data.email.trim()) {
      errors.email = 'El correo electrónico es requerido';
    } else if (!this.validateEmail(data.email)) {
      errors.email = 'Correo electrónico inválido';
    }

    if (!data.password) {
      errors.password = 'La contraseña es requerida';
    } else if (data.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    return errors;
  }

  private showErrors(errors: LoginFormErrors): void {
    this.emailError.textContent = errors.email;
    this.passwordError.textContent = errors.password;
    
    if (errors.email) {
      this.emailInput.classList.add('error');
    }
    if (errors.password) {
      this.passwordInput.classList.add('error');
    }

    if (errors.general) {
      this.errorMessage.textContent = errors.general;
      this.errorMessage.style.display = 'block';
    } else {
      this.errorMessage.style.display = 'none';
    }
  }

  private clearFieldError(field: string): void {
    if (field === 'email') {
      this.emailError.textContent = '';
      this.emailInput.classList.remove('error');
    } else if (field === 'password') {
      this.passwordError.textContent = '';
      this.passwordInput.classList.remove('error');
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
    this.emailInput.classList.remove('error');
    this.passwordInput.classList.remove('error');
    this.emailError.textContent = '';
    this.passwordError.textContent = '';
    this.errorMessage.style.display = 'none';

    const formData: LoginFormData = {
      email: this.emailInput.value.trim(),
      password: this.passwordInput.value
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
      // TODO: Replace with actual API call
      await this.submitLogin(formData);
      
      // On success, redirect (for demo, just log)
      console.log('Login successful:', formData.email);
      // window.location.href = '/dashboard.html';
      
      // For demo purposes, show success message
      alert('Login exitoso! (Demo - conectar con API real)');
      
    } catch (error) {
      const loginErrors: LoginFormErrors = {
        email: '',
        password: '',
        general: 'Error al iniciar sesión. Por favor, intenta nuevamente.'
      };
      this.showErrors(loginErrors);
    } finally {
      this.setLoading(false);
    }
  }

  private async submitLogin(data: LoginFormData): Promise<void> {
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // For demo, accept any login
        resolve();
        // In production, make actual API call:
        // fetch('/api/auth/login', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(data)
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
  new LoginForm();
});

