import { ICourse } from "@/models/Course";
import { ISubject } from "@/models/Subject";
import { IUnit } from "@/models/Unit";
import { IResource } from "@/models/Resource";

type SeedUnit = IUnit & { resources?: IResource[] };
type SeedSubject = ISubject & { units?: SeedUnit[] };

export interface SeedCourseStructure {
  subjects: SeedSubject[];
}

const sameId = (left: unknown, right: unknown) => String(left) === String(right);

const SEED_SUBJECTS: ISubject[] = [
  {
    _id: "general" as any,
    courseId: "course-1" as any,
    title: "General",
    description: "Información general y avisos del curso.",
    order: 0,
    taskIds: [],
    unitIds: ["unidad-1" as any, "unidad-2" as any],
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
  },
  {
    _id: "info-gen-2" as any,
    courseId: "course-2" as any,
    title: "Información General",
    description: "Recursos básicos para el despliegue.",
    order: 0,
    taskIds: [],
    unitIds: ["unidad-3" as any],
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
    unitIds: ["unidad-4" as any],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const SEED_UNITS: IUnit[] = [
  {
    _id: "unidad-1" as any,
    subjectId: "general" as any,
    courseId: "course-1" as any,
    title: "Introducción a UX",
    content: "Conceptos básicos de experiencia de usuario, diseño centrado en el usuario y principios de usabilidad.",
    order: 1,
    resourceIds: ["recurso-1" as any, "recurso-2" as any],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "unidad-2" as any,
    subjectId: "general" as any,
    courseId: "course-1" as any,
    title: "Investigación de Usuarios",
    content: "Técnicas para entender a los usuarios: entrevistas, encuestas, análisis de competencia y creación de personas.",
    order: 2,
    resourceIds: ["recurso-3" as any],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "unidad-3" as any,
    subjectId: "info-gen-2" as any,
    courseId: "course-2" as any,
    title: "Checklist de despliegue",
    content: "Lista base para validar un despliegue antes de publicar una aplicación.",
    order: 1,
    resourceIds: ["recurso-4" as any],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "unidad-4" as any,
    subjectId: "tema-1-c2" as any,
    courseId: "course-2" as any,
    title: "Flujo Git para CI/CD",
    content: "Buenas prácticas para ramas, PRs y automatización de despliegues.",
    order: 1,
    resourceIds: ["recurso-5" as any],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const SEED_RESOURCES: IResource[] = [
  {
    _id: "recurso-1" as any,
    unitId: "unidad-1" as any,
    courseId: "course-1" as any,
    title: "Guía UX para principiantes",
    type: "link",
    url: "https://www.nngroup.com/articles/definition-user-experience/",
    description: "Lectura base para introducir el concepto de UX.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "recurso-2" as any,
    unitId: "unidad-1" as any,
    courseId: "course-1" as any,
    title: "Mapa de experiencia",
    type: "text",
    description: "Plantilla para analizar el recorrido de usuario en una interfaz.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "recurso-3" as any,
    unitId: "unidad-2" as any,
    courseId: "course-1" as any,
    title: "Entrevistas con usuarios",
    type: "file",
    description: "Documento con guion de entrevistas semiestructuradas.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "recurso-4" as any,
    unitId: "unidad-3" as any,
    courseId: "course-2" as any,
    title: "Checklist de despliegue en producción",
    type: "text",
    description: "Verificación previa para evitar fallos al publicar.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    _id: "recurso-5" as any,
    unitId: "unidad-4" as any,
    courseId: "course-2" as any,
    title: "Pipeline básico de CI/CD",
    type: "link",
    url: "https://docs.github.com/actions",
    description: "Referencia para automatizar integraciones y despliegues.",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const CURSOS: ICourse[] = [
  {
    _id: "course-1" as any,
    title: "Diseño de Interfaces Web",
    description: "Diseña interfaces modernas y accesibles con principios de UX/UI, prototipado en Figma y CSS avanzado.",
    ownerId: "seed" as any,
    teachers: [],
    status: "active",
    subjectIds: ["general" as any, "tema-1" as any, "tema-2" as any],
    enrolledStudents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    // Materias/Temas que componen el curso
    subjects: [
      {
        _id: "general" as any,
        title: "General",
        description: "Información general y avisos del curso.",
        order: 0,
        taskIds: [],
        // Unidades de contenido dentro de la materia
        units: [
          {
            _id: "info-1" as any,
            title: "Guía Docente",
            content: "Descarga aquí la guía docente del curso 2023/24.",
            order: 1,
            resources: [
              { _id: "task-guia" as any, title: "Consultar Guía Docente", type: "text", description: "Documentación obligatoria" }
            ]
          },
          {
            _id: "info-2" as any,
            title: "Foro de Avisos",
            content: "Consulta los últimos avisos del profesor.",
            order: 2,
            resources: [
              { _id: "task-foro" as any, title: "Revisar Foro de Avisos", type: "text", description: "Nuevas notificaciones" }
            ]
          }
        ]
      },
      {
        _id: "tema-1" as any,
        title: "Tema 1: Fundamentos UX",
        description: "Introducción a la experiencia de usuario.",
        order: 1,
        taskIds: [],
        units: [
          {
            _id: "u1t1" as any,
            title: "Principios de Diseño",
            content: "Exploración de los 10 principios de Nielsen.",
            order: 1,
            resources: [
              { _id: "res-1" as any, title: "Guía de Principios UX", type: "link", url: "#", description: "Documentación oficial" },
            ]
          }
        ],
        tasks: [
          { id: "t1", title: "Análisis de Heurísticas de Nielsen", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
          { id: "t2", title: "Prototipo de Baja Fidelidad", dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) }
        ] as any
      },
      {
        _id: "tema-2" as any,
        title: "Tema 2: Tipografía y Color",
        description: "Uso del color y tipografía en interfaces.",
        order: 2,
        taskIds: [],
        units: [
          {
            _id: "u1t2" as any,
            title: "Psicología del Color",
            content: "Cómo afectan los colores a la percepción del usuario.",
            order: 1,
            resources: []
          }
        ],
        tasks: [
          { id: "t3", title: "Paleta de Colores Accesible", dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000) }
        ] as any
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
    subjectIds: ["info-gen-2" as any, "tema-1-c2" as any],
    enrolledStudents: [],
    createdAt: new Date(),
    updatedAt: new Date(),
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
  },
];

const buildSeedSubjects = (courseId: string): SeedSubject[] => {
  return SEED_SUBJECTS.filter((subject) => sameId(subject.courseId, courseId))
    .sort((left, right) => left.order - right.order)
    .map((subject) => ({
      ...subject,
      units: SEED_UNITS.filter((unit) => sameId(unit.subjectId, subject._id) && sameId(unit.courseId, courseId))
        .sort((left, right) => left.order - right.order)
        .map((unit) => ({
          ...unit,
          resources: SEED_RESOURCES.filter((resource) => sameId(resource.unitId, unit._id) && sameId(resource.courseId, courseId)),
        })),
    }));
};

export const getSeedCourseStructure = (courseId: string): SeedCourseStructure => ({
  subjects: buildSeedSubjects(courseId),
});
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

export interface IGrade {
  id: string;
  studentName: string;
  studentEmail: string;
  avatar: string;
  taskTitle: string;
  category: string;
  score: number;
  maxScore: number;
  status: "graded" | "pending" | "late";
  submittedAt: string;
  feedback?: string;
}

const CALIFICACIONES: IGrade[] = [
  {
    id: "g-pass",
    studentName: "Yusef Laroussi",
    studentEmail: "yusef.laroussi@studium.com",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg",
    taskTitle: "Práctica de Grid y Flexbox",
    category: "Tareas",
    score: 100,
    maxScore: 100,
    status: "graded",
    submittedAt: "2024-03-20",
    feedback: "Maquetación perfecta. Has demostrado un dominio absoluto de Flexbox y CSS Grid.",
  },
  {
    id: "g-fail",
    studentName: "Yusef Laroussi",
    studentEmail: "yusef.laroussi@studium.com",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg",
    taskTitle: "Cuestionario de Accesibilidad",
    category: "Exámenes",
    score: 35,
    maxScore: 100,
    status: "graded",
    submittedAt: "2024-03-18",
    feedback: "Debes revisar los conceptos de contraste de color y etiquetas ARIA. Te recomiendo volver a leer el tema 2.",
  },
  {
    id: "g-pending",
    studentName: "Yusef Laroussi",
    studentEmail: "yusef.laroussi@studium.com",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg",
    taskTitle: "Análisis de Interfaz UX",
    category: "Proyectos",
    score: 0,
    maxScore: 100,
    status: "pending",
    submittedAt: "2024-03-21",
  },
  {
    id: "g-late",
    studentName: "Yusef Laroussi",
    studentEmail: "yusef.laroussi@studium.com",
    avatar: "https://upload.wikimedia.org/wikipedia/commons/2/2c/Default_pfp.svg",
    taskTitle: "Propuesta de Personas",
    category: "Tareas",
    score: 85,
    maxScore: 100,
    status: "late",
    submittedAt: "2024-03-15",
    feedback: "Buen trabajo, aunque entregado fuera de plazo.",
  }
];

// Export mock data for UI
export { CURSOS, MENSAJES, NOTIFICACIONES, USUARIO, PARTICIPANTES, CALIFICACIONES, SEED_SUBJECTS, SEED_UNITS, SEED_RESOURCES };
