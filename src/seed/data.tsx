// Mock data for UI (non-MongoDB)
// Esta constante almacena los datos de prueba de los cursos para la interfaz
const CURSOS = [
  {
    id: "course-1",
    nombre: "Diseño de Interfaces Web",
    descripcion: "Diseña interfaces modernas y accesibles con principios de UX/UI, prototipado en Figma y CSS avanzado.",
    imagen: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=60",
    // Materias/Temas que componen el curso
    subjects: [
      {
        _id: "general",
        title: "General",
        description: "Información general y avisos del curso.",
        order: 0,
        // Unidades de contenido dentro de la materia
        units: [
          {
            _id: "info-1",
            title: "Guía Docente",
            content: "Descarga aquí la guía docente del curso 2023/24.",
            order: 1,
            resources: [
              { _id: "task-guia", title: "Consultar Guía Docente", type: "doc", description: "Documentación obligatoria" }
            ]
          },
          {
            _id: "info-2",
            title: "Foro de Avisos",
            content: "Consulta los últimos avisos del profesor.",
            order: 2,
            resources: [
              { _id: "task-foro", title: "Revisar Foro de Avisos", type: "task", status: "pending", description: "Nuevas notificaciones" }
            ]
          }
        ]
      },
      {
        _id: "tema-1",
        title: "Tema 1: Fundamentos UX",
        description: "Introducción a la experiencia de usuario.",
        order: 1,
        units: [
          {
            _id: "u1t1",
            title: "Principios de Diseño",
            content: "Exploración de los 10 principios de Nielsen.",
            order: 1,
            resources: [
              { _id: "res-1", title: "Guía de Principios UX", type: "link", url: "#", description: "Documentación oficial" },
              { _id: "task-1", title: "Análisis de Interfaz", type: "task", status: "completed" },
              { _id: "task-2", title: "Propuesta de UX", type: "task", status: "pending" },
              { _id: "task-3", title: "Cuestionario Inicial", type: "task", status: "late" }
            ]
          }
        ]
      },
      {
        _id: "tema-2",
        title: "Tema 2: Tipografía y Color",
        description: "Uso del color y tipografía en interfaces.",
        order: 2,
        units: [
          {
            _id: "u1t2",
            title: "Psicología del Color",
            content: "Cómo afectan los colores a la percepción del usuario.",
            order: 1,
            resources: []
          }
        ]
      }
    ]
  },
  {
    id: "course-2",
    nombre: "Despliegue de Aplicaciones Web",
    descripcion: "Despliega aplicaciones con Vercel/Netlify, configura CI/CD, dominios y certificados SSL.",
    imagen: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=60",
    subjects: [
      {
        _id: "info-gen-2",
        title: "Información General",
        description: "Recursos básicos para el despliegue.",
        order: 0,
        units: [
          {
            _id: "u1g2",
            title: "Planificación del despliegue",
            content: "Checklist antes de subir a producción.",
            order: 1,
            resources: [
              { _id: "task-plan", title: "Completar Plan de Despliegue", type: "task", status: "pending" }
            ]
          }
        ]
      },
      {
        _id: "tema-1-c2",
        title: "Tema 1: Repositorios y Git",
        description: "Flujo de trabajo con Git para despliegues.",
        order: 1,
        units: [
          {
            _id: "u1t1c2",
            title: "Git Flow",
            content: "Estrategias de ramificación.",
            order: 1,
            resources: [
              { _id: "res-u1t1c2-1", title: "Git Flow Diagram", type: "doc" },
              { _id: "task-u1t1c2-1", title: "Configurar repositorio", type: "task", status: "completed" },
              { _id: "exam-u1t1c2-1", title: "Examen de Git", type: "exam", description: "Evaluación tema 1" }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "course-3",
    nombre: "Desarrollo Web en Entorno Cliente",
    descripcion: "Domina HTML, CSS, JavaScript y frameworks (React) para construir experiencias web interactivas.",
    imagen: "https://images.unsplash.com/photo-1505685296765-3a2736de412f?auto=format&fit=crop&w=800&q=60",
    subjects: []
  },
  {
    id: "course-4",
    nombre: "Desarrollo Web en Entorno Servidor",
    descripcion: "Crea APIs y servicios con Node.js/Express, maneja bases de datos y buenas prácticas de backend.",
    imagen: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=60",
    subjects: []
  },
  {
    id: "course-5",
    nombre: "Shell Scripting",
    descripcion: "Automatiza tareas en Unix/Linux usando Bash: scripting, cron, pipes y gestión de procesos.",
    imagen: "https://images.unsplash.com/photo-1517433456452-f9633a875f6f?auto=format&fit=crop&w=800&q=60",
    subjects: []
  },
  {
    id: "course-6",
    nombre: "Digitalización",
    descripcion: "Aprende procesos de transformación digital, herramientas SaaS y técnicas para optimizar workflows.",
    imagen: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=60",
    subjects: []
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

const USUARIO = {
  id: "usuario-1",
  name: "María García",
  email: "maria.garcia@example.com",
  image: "https://i.pravatar.cc/150?u=maria",
  role: "estudiante",
  enrolledCourses: ["curso-1"],
  notifications: ["notification-1"],
  phone: "123-456-7890",
  birthDate: "01-01-2000",
  address: "Calle Falsa 123, Ciudad, País"
};

const PARTICIPANTES = [
  {
    id: "p1",
    nombre: "Ignacio",
    apellidos: "Miguel Mateos",
    email: "ignacio.miguel@studium.com",
    rol: "profesor",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
  },
  {
    id: "p2",
    nombre: "Eva",
    apellidos: "Cantero Abad",
    email: "eva.cantero@studium.com",
    rol: "estudiante",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
  },
  {
    id: "p3",
    nombre: "David",
    apellidos: "Lopez Ferreras",
    email: "daid.lopez@studium.com",
    rol: "estudiante",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
  },
  {
    id: "p4",
    nombre: "Yusef",
    apellidos: "Laroussi de la Calle",
    email: "yusef.laroussi@studium.com",
    rol: "estudiante",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
  },
  {
    id: "p5",
    nombre: "Dario",
    apellidos: "Muñoz Rodríguez",
    email: "dario.munoz@studium.com",
    rol: "estudiante",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
  }
];

// Export mock data for UI
export { CURSOS, MENSAJES, NOTIFICACIONES, USUARIO, PARTICIPANTES };