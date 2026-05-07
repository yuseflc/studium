const CURSOS = [
    {
        id: "course-1",
        nombre: "Diseño de Interfaces Web",
        descripcion: "Diseña interfaces modernas y accesibles con principios de UX/UI, prototipado en Figma y CSS avanzado.",
        imagen: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=60"
    },
    {
        id: "course-2",
        nombre: "Despliegue de Aplicaciones Web",
        descripcion: "Despliega aplicaciones con Vercel/Netlify, configura CI/CD, dominios y certificados SSL.",
        imagen: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=60"
    },
    {
        id: "course-3",
        nombre: "Desarrollo Web en Entorno Cliente",
        descripcion: "Domina HTML, CSS, JavaScript y frameworks (React) para construir experiencias web interactivas.",
        imagen: "https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=800&q=60"
    },
    {
        id: "course-4",
        nombre: "Desarrollo Web en Entorno Servidor",
        descripcion: "Crea APIs y servicios con Node.js/Express, maneja bases de datos y buenas prácticas de backend.",
        imagen: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60"
    },
    {
        id: "course-5",
        nombre: "Shell Scripting",
        descripcion: "Automatiza tareas en Unix/Linux usando Bash: scripting, cron, pipes y gestión de procesos.",
        imagen: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=800&q=60"
    },
    {
        id: "course-6",
        nombre: "Digitalización",
        descripcion: "Aprende procesos de transformación digital, herramientas SaaS y técnicas para optimizar workflows.",
        imagen: "https://images.unsplash.com/photo-1526378721914-8fb5b3a8f8a6?auto=format&fit=crop&w=800&q=60"
    }
];
const MENSAJES = [
    {
        id: "mensaje-1",
        sender: "Juan Pérez",
        content: "Hola, ¿podrías revisar el material de la semana 3?",
        time: "Hace 5 min",
        avatar: "https://i.pravatar.cc/150?u=juan"
    },
    {
        id: "mensaje-2",
        sender: "María García",
        content: "Gracias por la ayuda con el ejercicio de matemáticas.",
        time: "Hace 1 hora",
        avatar: "https://i.pravatar.cc/150?u=maria"
    }
];
const NOTIFICACIONES = [
    {
        id: "notificacion-1",
        title: "Nuevo curso disponible",
        description: "El curso de Inteligencia Artificial ya está disponible. ¡Inscríbete ahora!",
        time: "Hace 10 min"
    },
    {
        id: "notificacion-2",
        title: "Recordatorio de tarea",
        description: "No olvides entregar tu tarea de programación antes del viernes.",
        time: "Hace 2 horas"
    }
];
const USUARIO =
{
    id: "usuario-1",
    name: "María García",
    email: "maria.garcia@example.com",
    image: "https://i.pravatar.cc/150?u=maria",
    role: "estudiante",
    enrolledCourses: ["curso-1"],
    notifications: ["notification-1"],
}

export { CURSOS, MENSAJES, NOTIFICACIONES, USUARIO };