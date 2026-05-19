import { ICourse } from "@/models/Course";
import { ISubject } from "@/models/Subject";
import { IUnit } from "@/models/Unit";
import { IResource } from "@/models/Resource";

// Mock data for UI (non-MongoDB)
// Esta constante almacena los datos de prueba de los cursos para la interfaz
// NOTA: Estructura simplificada para UI mockup (en producción viene del servidor)
const CURSOS: (ICourse & { subjects?: ISubject[] })[] = [
  {
    _id: "course-1" as any,
    title: "Diseño de Interfaces Web",
    description: "Diseña interfaces modernas y accesibles con principios de UX/UI, prototipado en Figma y CSS avanzado.",
    ownerId: "seed" as any,
    teachers: [],
    status: "active",
    subjectIds: [],
    enrolledStudents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    // Para UIPreview: estructura mock de materias (sin guarda en BD)
    subjects: [
      {
        _id: "general" as any,
        courseId: "course-1" as any,
        title: "General",
        description: "Información general y avisos del curso.",
        order: 0,
        taskIds: [],
        unitIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "tema-1" as any,
        courseId: "course-1" as any,
        title: "Tema 1: Fundamentos UX",
        description: "Introducción a la experiencia de usuario.",
        order: 1,
        taskIds: [],
        unitIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "tema-2" as any,
        courseId: "course-1" as any,
        title: "Tema 2: Tipografía y Color",
        description: "Uso del color y tipografía en interfaces.",
        order: 2,
        taskIds: [],
        unitIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]
  },
  {
    _id: "course-2" as any,
    title: "Despliegue de Aplicaciones Web",
    description: "Despliega aplicaciones con Vercel/Netlify, configura CI/CD, dominios y certificados SSL.",
    ownerId: "seed" as any,
    teachers: [],
    status: "active",
    subjectIds: [],
    enrolledStudents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    subjects: [
      {
        _id: "info-gen-2" as any,
        courseId: "course-2" as any,
        title: "Información General",
        description: "Recursos básicos para el despliegue.",
        order: 0,
        taskIds: [],
        unitIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "tema-1-c2" as any,
        courseId: "course-2" as any,
        title: "Tema 1: Repositorios y Git",
        description: "Flujo de trabajo con Git para despliegues.",
        order: 1,
        taskIds: [],
        unitIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ]
  },
  {
    _id: "course-3" as any,
    title: "Desarrollo Web en Entorno Cliente",
    description: "Domina HTML, CSS, JavaScript y frameworks (React) para construir experiencias web interactivas.",
    ownerId: "seed" as any,
    teachers: [],
    status: "active",
    subjectIds: [],
    enrolledStudents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    subjects: []
  },
  {
    _id: "course-4" as any,
    title: "Desarrollo Web en Entorno Servidor",
    description: "Crea APIs y servicios con Node.js/Express, maneja bases de datos y buenas prácticas de backend.",
    ownerId: "seed" as any,
    teachers: [],
    status: "active",
    subjectIds: [],
    enrolledStudents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    subjects: []
  },
  {
    _id: "course-5" as any,
    title: "Shell Scripting",
    description: "Automatiza tareas en Unix/Linux usando Bash: scripting, cron, pipes y gestión de procesos.",
    ownerId: "seed" as any,
    teachers: [],
    status: "active",
    subjectIds: [],
    enrolledStudents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    subjects: []
  },
  {
    _id: "course-6" as any,
    title: "Digitalización",
    description: "Aprende procesos de transformación digital, herramientas SaaS y técnicas para optimizar workflows.",
    ownerId: "seed" as any,
    teachers: [],
    status: "active",
    subjectIds: [],
    enrolledStudents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
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
    email: "david.lopez@studium.com",
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
  },
  {
    id: "p6",
    nombre: "Pepe",
    apellidos: "Muñoz Rodríguez",
    email: "pepe.munoz@studium.com",
    rol: "estudiante",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
  }
];

// Export mock data for UI
export { CURSOS, MENSAJES, NOTIFICACIONES, USUARIO, PARTICIPANTES };