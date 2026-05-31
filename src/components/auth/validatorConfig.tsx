/* Archivo: src\components\auth\validatorConfig.tsx
    Descripción: Configuración de validadores y esquemas para formularios de autenticación (signup/login). */

// Resumen de reglas de validación para campos de autenticación
/**
 * Configuración de validadores para el formulario de signup
 * Centraliza las reglas de validación y mensajes
 */

export const validators = {
    firstName: {
        minLength: 2,
        maxLength: 100,
        pattern: '[A-Za-záéíóúàèìòùäëïöüñ\\s-]*',
        validatorHint: (
            <>
                Debe tener entre 2 y 100 caracteres
                <br />
                solo letras y espacios
            </>
        ),
        icon: (
            <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
            >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </g>
        ),
    },

    email: {
        type: 'email',
        validatorHint: (
            <>
                Debe ser un email válido
                <br />
                ejemplo@dominio.com
            </>
        ),
        icon: (
            <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
            >
                <rect x="2" y="4" width="20" height="16" rx="2"></rect>
                <path d="m22 7-10 5L2 7"></path>
            </g>
        ),
    },

    password: {
        minLength: 6,
        validatorHint: (
            <>
                Mínimo 6 caracteres
                <br />
                Usa letras, números y símbolos
            </>
        ),
        icon: (
            <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
            >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </g>
        ),
    },

    confirmPassword: {
        minLength: 6,
        validatorHint: (
            <>
                Debe coincidir con la contraseña
                <br />
                Verifica que sean iguales
            </>
        ),
        icon: (
            <g
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeWidth="2.5"
                fill="none"
                stroke="currentColor"
            >
                <polyline points="20 6 9 17 4 12"></polyline>
            </g>
        ),
    },
};

export type ValidatorKey = keyof typeof validators;
