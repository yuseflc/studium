import { ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { CALIFICACIONES } from '@/seed/data';
import { useParams } from 'next/navigation';

/* Vista de la tarea en el curso */

const TaskStatusIcon = () => {
  return <ClipboardList size={18} className="text-yellow-600" aria-hidden="true" />;
};

interface TasksViewProps {
  tasks: any[];
  deletedItems?: string[];
  onDeleteItem?: (id: string) => void;
  isTeacher?: boolean;
}

const TasksView = ({ 
  tasks = [], 
  deletedItems = [], 
  onDeleteItem, 
  isTeacher = false 
}: TasksViewProps) => {
  const params = useParams();
  const courseid = (params?.courseid as string) || 'course-1';

  // Filtrar tareas eliminadas
  const filteredTasks = tasks.filter(
    (task) => !deletedItems.includes(String(task._id || task.id))
  );

  return (
    <div className="space-y-3">
      {filteredTasks.map((task) => {
        const taskId = task._id?.toString() || task.id;
        const taskTitle = task.title || task.taskTitle;
        const taskDescription = task.description || task.category || "Nueva tarea publicada";
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : (task.submittedAt ? new Date(task.submittedAt).toLocaleDateString() : "");
        
        return (
          <Link 
            href={`/mycourses/${courseid}/tasks/${taskId}`} 
            key={taskId}
            className="block"
            aria-label={`Ver tarea: ${taskTitle}`}
          >
            <div className="flex items-center gap-4 p-4 rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all hover:shadow-md cursor-pointer group">
              <div className="p-2.5 rounded-full flex-shrink-0 bg-yellow-100 text-yellow-600 shadow-sm">
                  <TaskStatusIcon />
                </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-base-content/90 group-hover:text-primary transition-colors truncate">
                    {taskTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-base-content/50 truncate">
                    {taskDescription}
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0 ml-2">
                <p className="text-xs text-base-content/60">
                  {dueDate}
                </p>
              </div>
              
              {/* Menú de opciones opcional */}
              {isTeacher && (
                <div className="dropdown dropdown-end opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" onClick={(e) => e.preventDefault()}>
                  <div tabIndex={0} role="button" aria-label="Abrir opciones de tarea" className="btn btn-ghost btn-xs btn-circle text-base-content/50 hover:text-base-content">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                  </div>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-32 border border-base-200">
                    <li>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          onDeleteItem?.(String(taskId));
                        }} 
                        className="text-error hover:bg-error/10 hover:text-error"
                      >
                        Eliminar
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default TasksView;
