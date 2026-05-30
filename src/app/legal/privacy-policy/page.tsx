import LegalDocument, { type LegalSection, type SummaryItem } from '@/components/sections/LegalDocument'

const summary: SummaryItem[] = [
    {
        label: 'Datos de cuenta',
        value: 'Email, nombre y perfil',
        description: 'Usamos estos datos para crear tu cuenta, identificarte y personalizar tu experiencia en la plataforma.',
    },
    {
        label: 'Datos académicos',
        value: 'Cursos, tareas y notas',
        description: 'Guardamos el contenido necesario para impartir, seguir y evaluar la actividad educativa.',
    },
    {
        label: 'Archivos',
        value: 'R2 y MongoDB',
        description: 'Las entregas y recursos subidos se almacenan con referencias técnicas para poder servirlos de forma segura.',
    },
    {
        label: 'Sesión',
        value: '30 días',
        description: 'Las sesiones se gestionan con NextAuth y expiran automáticamente; los registros caducados se eliminan.',
    },
]

const sections: LegalSection[] = [
    {
        title: '1. Qué datos tratamos',
        paragraphs: [
            'Studium trata únicamente los datos necesarios para prestar un entorno educativo funcional. El alcance real del tratamiento incluye datos de registro, acceso y perfil, información académica generada dentro de la plataforma y metadatos técnicos imprescindibles para que el servicio funcione.',
        ],
        bullets: [
            'Datos de identificación: correo electrónico, nombre, apellido, imagen de perfil y rol de usuario.',
            'Datos de autenticación: contraseña cifrada, credenciales de acceso y, si usas Google, identificadores y tokens asociados al proveedor.',
            'Datos académicos: cursos en los que participas, unidades, tareas, entregas, calificaciones, feedback y recursos asociados.',
            'Datos técnicos: identificadores de sesión, caducidad de sesión, preferencias visuales del tema y registros de error o seguridad necesarios para operar el sistema.',
        ],
    },
    {
        title: '2. Para qué usamos la información',
        paragraphs: [
            'La información se usa para crear y mantener cuentas, autenticar usuarios, administrar cursos, gestionar invitaciones, almacenar recursos, registrar entregas y calificaciones, y preservar el funcionamiento seguro de la plataforma.',
            'También utilizamos datos técnicos mínimos para resolver incidencias, auditar accesos y evitar usos indebidos. No realizamos venta de datos ni publicidad comportamental con la información del usuario.',
        ],
        bullets: [
            'Prestar el servicio de aprendizaje y sus funciones asociadas.',
            'Gestionar sesiones, permisos y roles de estudiante, profesor o administrador.',
            'Conservar evidencias académicas como tareas, entregas y feedback.',
            'Mantener la seguridad, depurar errores y proteger la integridad de la cuenta.',
        ],
    },
    {
        title: '3. Base jurídica del tratamiento',
        paragraphs: [
            'El tratamiento se apoya en la relación de uso del servicio y, cuando corresponde, en el consentimiento del usuario. En especial, el uso de proveedores externos como Google para iniciar sesión o la subida voluntaria de archivos requiere tu participación activa.',
        ],
        bullets: [
            'Ejecución de la relación de uso y prestación del servicio educativo.',
            'Consentimiento para funciones opcionales, como el inicio de sesión con Google o la carga de archivos.',
            'Interés legítimo para asegurar la plataforma, prevenir fraude y diagnosticar incidencias técnicas.',
        ],
    },
    {
        title: '4. Con quién compartimos los datos',
        paragraphs: [
            'No vendemos datos personales ni los cedemos con fines publicitarios. Solo compartimos información con proveedores técnicos indispensables para operar Studium o cuando exista una obligación legal o una petición válida de autoridad competente.',
        ],
        bullets: [
            'NextAuth y el proveedor de identidad utilizado para autenticarte, incluido Google cuando decides iniciar sesión con esa cuenta.',
            'Cloudflare R2 para almacenar archivos subidos por estudiantes y profesores.',
            'MongoDB o el servicio de base de datos que aloje la información persistente de la plataforma.',
            'Proveedores de infraestructura, monitoreo o registro si se habilitan para mantener el servicio.',
        ],
    },
    {
        title: '5. Conservación y seguridad',
        paragraphs: [
            'Las sesiones de usuario caducan a los 30 días y los registros expirados se eliminan automáticamente. El contenido académico y los archivos se conservan mientras la cuenta o el curso permanezcan activos, o durante el tiempo razonablemente necesario para cumplir con la finalidad educativa y con obligaciones legales o institucionales.',
            'Aplicamos medidas razonables de seguridad, como hashing de contraseñas, control de acceso por roles, sesiones limitadas y almacenamiento separado de archivos. Ningún sistema es infalible, pero el objetivo es minimizar exposición y pérdida de datos.',
        ],
    },
    {
        title: '6. Tus derechos',
        paragraphs: [
            'Puedes solicitar acceso, rectificación, supresión, oposición, portabilidad y limitación del tratamiento de tus datos cuando resulte aplicable. Si deseas ejercer estos derechos o pedir aclaraciones sobre el tratamiento, escríbenos al correo de contacto indicado abajo.',
        ],
        bullets: [
            'Eliminar o actualizar tu perfil de cuenta cuando ya no necesites el servicio.',
            'Revisar qué información guarda la plataforma sobre tu actividad académica.',
            'Solicitar la retirada de datos que no sean necesarios para fines educativos o legales.',
        ],
    },
]

export default function PrivacyPolicyPage() {
    return (
        <LegalDocument
            eyebrow="Política de privacidad"
            title="Cómo tratamos tus datos en Studium"
            intro="Esta política describe el uso real de la información que la plataforma almacena para gestionar cuentas, cursos, tareas, recursos y sesiones. Está redactada para reflejar el funcionamiento actual del proyecto, no una plantilla genérica."
            updatedAt="30 de mayo de 2026"
            summary={summary}
            sections={sections}
            contactEmail="hola@studium.com"
            contactLabel="Contacto para privacidad y derechos de usuario"
            closingNote="Este documento cubre el funcionamiento actual de Studium como plataforma educativa: acceso con email o Google, persistencia de cuentas en MongoDB, sesiones JWT con caducidad, archivos subidos a Cloudflare R2 y preferencias visuales guardadas localmente."
        />
    )
}