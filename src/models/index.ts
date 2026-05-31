/* Archivo: src\models\index.ts
   Descripción: Reexporta los modelos del sistema para importarlos desde un único punto. */

// Export centralizado de modelos Mongoose usados en la aplicación
// Reexporta cada modelo para importación cómoda desde otras capas
// Modelos de la base de datos - exporta los modelos para usarlos en otras partes de la aplicación

export { default as User } from './User';
export { default as Course } from './Course';
export { default as Unit } from './Unit';
export { default as Resource } from './Resource';
export { default as Session } from './Session';
export { default as Task } from './Task';
export { default as Submission } from './Submission';