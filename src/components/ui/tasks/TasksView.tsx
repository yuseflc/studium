import { FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { CALIFICACIONES } from '@/seed/data';

/**
 * Componente de icono extraído fuera del render principal
 * Evita recrear JSX en cada render y mantiene la lógica limpia y reutilizable
 */
const TaskStatusIcon = ({ status }: { status: string }) => {
  // js-index-maps: Map para lookups O(1) en lugar de switch/case repetido
  const iconConfig = new Map([
    ['graded', { icon: CheckCircle, className: 'text-success' }],
    ['pending', { icon: Clock, className: 'text-warning' }],
    ['late', { icon: AlertCircle, className: 'text-error' }],
  ]);
  
  const config = iconConfig.get(status) || { icon: FileText, className: 'text-base-content/60' };
  const IconComponent = config.icon;
  
  return <IconComponent className={config.className} size={18} aria-hidden="true" />;
};

const TasksView = () => {
  // Datos estáticos importados del seed. No se necesita memoización adicional.
  const tasks = CALIFICACIONES;

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold mb-6 text-base-content">Tareas del Curso</h1>
      <div className="space-y-4">
        {tasks.map((task) => {
          // js-cache-property-access: Cachear propiedades computadas en la iteración
          // Evita recalcular en cada render si el componente padre re-renderiza
          const submittedDate = new Date(task.submittedAt).toLocaleDateString();
          const isGraded = task.status === 'graded';
          const scoreColorClass = task.score < 50 ? 'text-error' : 'text-success';
          
          return (
            <Link 
              href={`/mycourses/course-1/tasks/${task.id}`} 
              key={task.id}
              className="block"
              aria-label={`Ver tarea: ${task.taskTitle}`}
            >
              {/* rendering-conditional-render: Uso de ternario explícito en lugar de && para mayor claridad */}
              <div className="card bg-base-100 shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out border border-base-300 hover:border-primary cursor-pointer">
                <div className="card-body p-4">
                  <div className="flex items-center justify-between">
                    {/* Columna izquierda: Icono y detalles de la tarea */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {/* Icono de estado visible solo en pantallas medianas+ (responsive) */}
                      <div className="hidden sm:flex flex-shrink-0">
                        <TaskStatusIcon status={task.status} />
                      </div>
                      {/* Información principal: título y categoría */}
                      <div className="flex-1 min-w-0">
                        <h2 className="card-title text-base sm:text-lg font-semibold text-base-content truncate">
                          {task.taskTitle}
                        </h2>
                        <p className="text-xs sm:text-sm text-base-content/70 truncate">
                          {task.category}
                        </p>
                      </div>
                    </div>
                    
                    {/* Columna derecha: Calificación y fecha (alineadas a la derecha) */}
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className={`text-sm font-semibold ${scoreColorClass}`}>
                        {isGraded ? `${task.score}/${task.maxScore}` : 'Pendiente'}
                      </p>
                      <p className="text-xs text-base-content/60">
                        {submittedDate}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TasksView;
