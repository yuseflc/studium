/* Archivo: src\components\auth\SignUpForm.tsx
  Descripción: Formulario de registro de usuario con validaciones y envío al backend. */

"use client";
// Formulario de registro: valida campos localmente y crea cuenta vía API
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { FormInput } from './FormInput';
import { PasswordInput } from './PasswordInput';
import { validators } from './validatorConfig';
import { validateField, validatePasswordMatch } from '@/lib/clientValidation';
import { signupUser } from '@/app/actions/authActions';

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

interface FieldErrors {
  firstName?: string[];
  email?: string[];
  password?: string[];
  general?: string;
}

export default function SignUpForm() {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/mycourses';
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') router.push(callbackUrl);
  }, [status, router, callbackUrl]);

  const getFieldError = (fieldName: keyof FieldErrors): string | null => {
    const errors = fieldErrors[fieldName];
    return Array.isArray(errors) && errors.length > 0 ? errors[0] : null;
  };

  /**
   * Valida campo específico mientras se escribe
   */
  const handleFieldChange = (fieldName: string, value: string) => {
    // Actualizar el estado del campo
    switch (fieldName) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
    }

    // Validar el campo
    if (!value.trim()) {
      // Campo vacío - mostrar error si estaba lleno antes
      if (fieldErrors[fieldName as keyof FieldErrors]) {
        setFieldErrors((prev) => {
          const next = { ...prev };
          delete next[fieldName as keyof FieldErrors];
          return next;
        });
      }
      return;
    }

    const validation = validateField(fieldName, value);
    if (!validation.isValid) {
      setFieldErrors((prev) => ({
        ...prev,
        [fieldName]: [validation.error || 'Validation error'],
      }));
    } else {
      // Limpiar error si ahora es válido
      setFieldErrors((prev) => {
        if (prev[fieldName as keyof FieldErrors]) {
          const next = { ...prev };
          delete next[fieldName as keyof FieldErrors];
          return next;
        }
        return prev;
      });
    }
  };

  /**
   * Valida coincidencia de contraseñas al cambiar confirmPassword
   */
  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);

    if (!value.trim()) {
      // Limpiar error si está vacío
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.password;
        return next;
      });
      return;
    }

    const validation = validatePasswordMatch(password, value);
    if (!validation.isValid) {
      setFieldErrors((prev) => ({
        ...prev,
        password: [validation.error || 'Passwords do not match'],
      }));
    } else {
      // Limpiar error si coinciden
      setFieldErrors((prev) => {
        if (prev.password) {
          const next = { ...prev };
          delete next.password;
          return next;
        }
        return prev;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validar que no haya errores en el cliente
    if (Object.keys(fieldErrors).length > 0) {
      setFieldErrors((prev) => ({
        ...prev,
        general: 'Por favor corrige los errores antes de continuar.',
      }));
      return;
    }

    // Validar que todos los campos estén llenos
    if (!firstName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setFieldErrors({
        general: 'Por favor completa todos los campos.',
      });
      return;
    }

    // Validación final de contraseñas coincidentes
    if (password !== confirmPassword) {
      setFieldErrors({
        password: ['Las contraseñas no coinciden'],
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await signupUser({ firstName, email, password });

      if (!result.success) {
        if (result.details) {
          setFieldErrors(result.details);
        } else {
          setFieldErrors({
            general: result.error || 'Error desconocido. Por favor intenta de nuevo.',
          });
        }
        return;
      }

      // Registro exitoso: inicia sesión automáticamente
      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push(callbackUrl);
      } else {
        setFieldErrors({
          general: 'Error al iniciar sesión. Por favor intenta manualmente.',
        });
      }
    } catch (err: any) {
      setFieldErrors({
        general: err.message || 'Error de conexión. Por favor intenta de nuevo.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-25 card w-full max-w-sm bg-base-100 shadow-xl border border-base-300 rounded-2xl">
      <div className="card-body p-6 space-y-3">
        <div className="flex flex-col items-center text-center space-y-1">
          <Logo className="h-10 w-auto mb-2" />
          <p className="text-sm font-semibold text-base-content/60">Crea tu cuenta</p>
        </div>

        <form className="space-y-1" onSubmit={handleSubmit}>
          {/* Error general */}
          {fieldErrors.general && (
            <div className="alert alert-error py-2 px-2 text-[11px] rounded-lg mb-2">
              <span>{fieldErrors.general}</span>
            </div>
          )}

          {/* Campo: Nombre */}
          <FormInput
            id="signup-firstname"
            label="Nombre completo"
            placeholder="Tu nombre"
            value={firstName}
            onChange={(value) => handleFieldChange('firstName', value)}
            error={getFieldError('firstName')}
            disabled={isLoading}
            required
            autoComplete="name"
            minLength={validators.firstName.minLength}
            maxLength={validators.firstName.maxLength}
            pattern={validators.firstName.pattern}
            validatorHint={validators.firstName.validatorHint}
            icon={validators.firstName.icon}
          />

          {/* Campo: Email */}
          <FormInput
            id="signup-email"
            type="email"
            label="Email"
            placeholder="tu@ejemplo.com"
            value={email}
            onChange={(value) => handleFieldChange('email', value)}
            error={getFieldError('email')}
            disabled={isLoading}
            required
            autoComplete="email"
            validatorHint={validators.email.validatorHint}
            icon={validators.email.icon}
          />

          {/* Campo: Contraseña */}
          <PasswordInput
            id="signup-password"
            label="Contraseña"
            placeholder="••••••••"
            value={password}
            onChange={(value) => handleFieldChange('password', value)}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            error={getFieldError('password')}
            disabled={isLoading}
            required
            minLength={validators.password.minLength}
            validatorHint={validators.password.validatorHint}
            icon={validators.password.icon}
          />

          {/* Campo: Repetir contraseña */}
          <PasswordInput
            id="signup-confirm-password"
            label="Repetir contraseña"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            required
            minLength={validators.confirmPassword.minLength}
            validatorHint={validators.confirmPassword.validatorHint}
            icon={validators.confirmPassword.icon}
          />

          <button
            type="submit"
            className="btn btn-primary btn-sm w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>

          <div className="divider text-[10px] text-base-content/20 font-bold uppercase my-1">O</div>

          <button
            type="button"
            className="btn btn-outline btn-sm w-full gap-2 border-base-300 font-bold text-xs"
            onClick={() => signIn('google', { callbackUrl })}
            disabled={isLoading}
          >
            <GoogleIcon />
            <span className="text-base-content/80">Google</span>
          </button>
        </form>

        <div className="text-center pt-1">
          <p className="text-xs text-base-content/50">
            ¿Ya tienes cuenta? <Link href="/auth/login" className="text-primary font-bold hover:underline transition-all">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}