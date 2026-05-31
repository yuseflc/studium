export const MENSAJES = [
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

export const NOTIFICACIONES = [
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

export const CALIFICACIONES = [
  {
    _id: "calificacion-1",
    taskTitle: "Entrega de Flexbox y Grid",
    title: "Entrega de Flexbox y Grid",
    category: "CSS",
    status: "graded",
    score: 9.2,
    maxScore: 10,
    feedback: "Buen uso de grid y estructura limpia.",
    avatar: "https://i.pravatar.cc/150?u=estudiante-1",
    studentName: "Laura Gómez",
    submittedAt: new Date().toISOString(),
    description: "Diseño de una landing responsive con Flexbox y CSS Grid.",
    dueDate: new Date().toISOString(),
    isSubmitted: true,
  },
  {
    _id: "calificacion-2",
    taskTitle: "API REST básica",
    title: "API REST básica",
    category: "Backend",
    status: "pending",
    score: 0,
    maxScore: 10,
    feedback: "Pendiente de revisión.",
    avatar: "https://i.pravatar.cc/150?u=estudiante-2",
    studentName: "Carlos Ruiz",
    submittedAt: new Date().toISOString(),
    description: "Implementación de endpoints CRUD.",
    dueDate: new Date().toISOString(),
    isSubmitted: false,
  },
];

