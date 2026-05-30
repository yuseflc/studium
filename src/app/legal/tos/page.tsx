import LegalDocument, { type LegalSection, type SummaryItem } from '@/components/sections/LegalDocument'

const summary: SummaryItem[] = [
    {
        label: 'Uso permitido',
        value: 'Educación y gestión',
        description: 'Studium está pensado para gestionar cursos, materiales, tareas, entregas y evaluación dentro de un entorno académico.',
    },
    {
        label: 'Cuentas',
        value: 'Una persona, una cuenta',
        description: 'Cada usuario debe mantener sus credenciales seguras y usar la cuenta solo según el rol asignado.',
    },
    {
        label: 'Contenido',
        value: 'Responsabilidad del autor',
        description: 'Quien sube material o entregas declara tener derechos suficientes para hacerlo y autoriza su uso interno en la plataforma.',
    },
    {
        label: 'Disponibilidad',
        value: 'Sin garantía absoluta',
        description: 'Podemos cambiar funciones, corregir errores o interrumpir temporalmente el servicio por mantenimiento o seguridad.',
    },
]

const sections: LegalSection[] = [
    {
        title: '1. Aceptación de los términos',
        paragraphs: [
            'Al acceder o utilizar Studium aceptas estos términos y condiciones. Si no estás de acuerdo con ellos, no debes usar la plataforma ni crear contenido dentro de ella.',
            'Estos términos se aplican a estudiantes, profesores, administradores y cualquier persona que acceda al servicio desde un navegador o dispositivo autorizado.',
        ],
    },
    {
        title: '2. Qué es Studium y para qué sirve',
        paragraphs: [
            'Studium es una plataforma educativa para organizar cursos, publicar unidades, compartir recursos, gestionar tareas y registrar entregas y calificaciones. La plataforma facilita la coordinación académica, pero no sustituye la valoración pedagógica de docentes o instituciones.',
        ],
        bullets: [
            'Crear y administrar cursos y grupos de aprendizaje.',
            'Compartir recursos, materiales y enlaces asociados a unidades.',
            'Publicar tareas, recibir entregas y revisar calificaciones.',
            'Gestionar perfiles, invitaciones y roles de usuario.',
        ],
    },
    {
        title: '3. Cuentas y seguridad',
        paragraphs: [
            'Debes proporcionar información veraz y mantener la confidencialidad de tu contraseña o del proveedor externo que utilices para iniciar sesión. Eres responsable de la actividad realizada desde tu cuenta, salvo que nos notifiques un uso no autorizado y podamos bloquearlo a tiempo.',
        ],
        ordered: [
            'No compartas tu contraseña ni dejes la sesión abierta en dispositivos ajenos.',
            'Usa únicamente la cuenta asignada al rol que te corresponde.',
            'Informa de inmediato si detectas acceso indebido o pérdida de control de la cuenta.',
            'Mantén actualizados tus datos de contacto para que podamos comunicarnos contigo sobre incidencias o actividad académica.',
        ],
    },
    {
        title: '4. Contenido, archivos y licencias',
        paragraphs: [
            'Todo usuario que suba textos, archivos, imágenes o recursos garantiza que tiene los derechos necesarios para hacerlo y que ese contenido no infringe la ley ni derechos de terceros. Studium puede alojar, reproducir, mostrar y transmitir ese material solo en la medida necesaria para prestar el servicio educativo.',
            'Las entregas de estudiantes, materiales de curso, notas y feedback forman parte de la actividad académica de la plataforma. Su conservación y visibilidad dependen del curso, el rol y las configuraciones establecidas por profesores o administradores.',
        ],
        bullets: [
            'Conservas la titularidad de tu contenido original, salvo que una norma o contrato indique otra cosa.',
            'Nos conceder una licencia limitada, no exclusiva y revocable para alojar y mostrar el contenido dentro de Studium.',
            'No debes subir material ilegal, malicioso, difamatorio, discriminatorio o que infrinja derechos de autor o privacidad.',
        ],
    },
    {
        title: '5. Uso aceptable',
        paragraphs: [
            'La plataforma debe usarse con respeto y dentro de la finalidad educativa. Podemos limitar, suspender o cerrar cuentas que abusen del servicio, comprometan la seguridad o perjudiquen a otros usuarios.',
        ],
        bullets: [
            'No intentes acceder a datos ajenos, vulnerar roles o saltarte controles de autenticación.',
            'No subas malware, spam, automatizaciones abusivas ni contenido que degrade el servicio.',
            'No uses la plataforma para suplantar identidades, acosar, difundir contenido ilícito o infringir derechos de terceros.',
            'No explotes fallos técnicos para obtener ventajas, extraer datos o alterar calificaciones.',
        ],
    },
    {
        title: '6. Planes, disponibilidad y cambios del servicio',
        paragraphs: [
            'Studium puede mostrar referencias a planes o mejoras futuras, pero cualquier condición comercial específica se comunicará antes de activarse formalmente. El núcleo actual del proyecto está orientado a la gestión educativa y puede evolucionar con nuevas funciones o limitaciones.',
            'No garantizamos disponibilidad ininterrumpida. Podremos realizar mantenimientos, actualizaciones, correcciones de seguridad o cambios de diseño y funcionalidad cuando sea necesario.',
        ],
    },
    {
        title: '7. Responsabilidad y cierre de cuenta',
        paragraphs: [
            'No respondemos por daños derivados de un uso indebido de la cuenta, de la subida de archivos no autorizados o de interrupciones razonables del servicio. En ningún caso debes considerar Studium como sustituto de tu criterio académico o del de tu institución.',
            'Podremos suspender o cerrar cuentas que incumplan estos términos, que comprometan la seguridad del sistema o que sea necesario limitar por requerimiento legal o técnico.',
        ],
    },
    {
        title: '8. Ley aplicable y contacto',
        paragraphs: [
            'Estos términos se interpretarán de acuerdo con la normativa aplicable al proyecto y al lugar de prestación del servicio. Si tienes dudas sobre su contenido, puedes escribirnos antes de usar la plataforma de forma continuada.',
        ],
        bullets: [
            'Correo de contacto: hola@studium.com.',
            'Asunto recomendado: términos, privacidad o ejercicio de derechos.',
        ],
    },
]

export default function TermsAndConditionsPage() {
    return (
        <LegalDocument
            eyebrow="Términos y condiciones"
            title="Reglas de uso de la plataforma Studium"
            intro="Estas condiciones definen cómo puede utilizarse Studium, quién es responsable del contenido y qué límites rigen el uso de cuentas, cursos, tareas y archivos. Se han ajustado al comportamiento real de la aplicación y a su uso educativo."
            updatedAt="30 de mayo de 2026"
            summary={summary}
            sections={sections}
            contactEmail="hola@studium.com"
            contactLabel="Contacto para soporte legal y contractual"
            closingNote="Si la plataforma incorpora en el futuro servicios de pago, integraciones adicionales o funciones nuevas, esas condiciones se comunicarán de forma separada antes de su contratación o uso."
        />
    )
}