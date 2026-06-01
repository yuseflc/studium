/* Archivo: src\components\ui\tasks\TasksView.tsx
  Descripción: Lista y tarjetas de tareas del curso; incluye interacciones de entrega y eliminación por mantener pulsado. */

/* eslint-disable */

// Vista y lista de tareas del curso; maneja estados de entrega y filtros
import { Calendar, ClipboardList, Trash2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

/* Vista de la tarea en el curso */

const TaskStatusIcon = () => {
  return <ClipboardList size={18} className="text-yellow-600" aria-hidden="true" />;
};

interface TasksViewProps {
  tasks?: any[];
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

  // Estados para eliminar manteniendo pulsado
  const [holdingTaskId, setHoldingTaskId] = useState<string | null>(null);
  const [holdProgress, setHoldProgress] = useState(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // Limpiar temporizadores al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleStartPress = (taskId: string) => {
    if (!isTeacher || !onDeleteItem) return;
    
    isLongPressRef.current = false;
    setHoldingTaskId(taskId);
    setHoldProgress(0);

    const startTime = Date.now();
    
    // Intervalo para actualizar la barra de progreso (cada 30ms incrementa el progreso)
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / 3000) * 100, 100);
      setHoldProgress(progress);
      if (progressBarRef.current) progressBarRef.current.style.width = `${progress}%`;
    }, 30);

    // Timeout para ejecutar la acción después de 3 segundos
    timerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      setHoldProgress(100);
      onDeleteItem(taskId);
      
      setTimeout(() => {
        setHoldingTaskId(null);
        setHoldProgress(0);
      }, 300);
    }, 3000);
  };

  const handleCancelPress = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setHoldingTaskId(null);
    setHoldProgress(0);
  };

  // Filtrar tareas eliminadas
  const filteredTasks = tasks.filter(
    (task) => !deletedItems.includes(String(task._id))
  );

  return (
    <div className="space-y-3">
      {/* Estilos para el efecto de vibración */}
      <style>{`
        @keyframes task-shake {
          0% { transform: translate(1px, 1px) rotate(0deg); }
          10% { transform: translate(-1px, -1px) rotate(-0.5deg); }
          20% { transform: translate(-2px, 0px) rotate(0.5deg); }
          30% { transform: translate(0px, 1.5px) rotate(0deg); }
          40% { transform: translate(1px, -0.5px) rotate(0.5deg); }
          50% { transform: translate(-1px, 1px) rotate(-0.5deg); }
          60% { transform: translate(-2px, 0.5px) rotate(0deg); }
          70% { transform: translate(1.5px, 0.5px) rotate(-0.5deg); }
          80% { transform: translate(-0.5px, -0.5px) rotate(0.5deg); }
          90% { transform: translate(1px, 1.5px) rotate(0deg); }
          100% { transform: translate(0.5px, -1px) rotate(-0.5deg); }
        }
        .task-shaking {
          animation: task-shake 0.2s infinite;
        }
      `}</style>

      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-base-300 bg-base-100 p-6 text-center text-sm text-base-content/55">
          No hay tareas publicadas todavía.
        </div>
      ) : filteredTasks.map((task) => {
        const taskId = task._id?.toString();
        const taskTitle = task.title;
        const taskDescription = task.description || "Nueva tarea publicada";
        const isSubmitted = !!task.isSubmitted;
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "";
        
        const isCurrentHolding = holdingTaskId === taskId;

        return (
          <Link 
            href={`/mycourses/${courseid}/tasks/${taskId}`} 
            key={taskId}
            className="block"
            aria-label={`Ver tarea: ${taskTitle}`}
            onClick={(e) => {
              if (isLongPressRef.current) {
                e.preventDefault();
                e.stopPropagation();
                isLongPressRef.current = false;
              }
            }}
          >
            <div 
              onMouseDown={() => handleStartPress(taskId)}
              onMouseUp={handleCancelPress}
              onMouseLeave={handleCancelPress}
              onTouchStart={(e) => {
                handleStartPress(taskId);
              }}
              onTouchEnd={handleCancelPress}
              onTouchMove={handleCancelPress}
              onTouchCancel={handleCancelPress}
              onContextMenu={(e) => {
                if (isTeacher) {
                  e.preventDefault();
                }
              }}
              className={`relative flex items-center gap-4 p-4 rounded-2xl border border-base-200 bg-base-100 shadow-sm transition-all hover:shadow-md cursor-pointer group select-none ${
                isCurrentHolding ? 'task-shaking scale-[0.98] border-error/40 shadow-inner' : 'active:scale-[0.99]'
              }`}
            >
              <div className="p-2.5 rounded-full flex-shrink-0 bg-primary/10 text-primary border border-primary/20 shadow-sm">
                <TaskStatusIcon />
              </div>
              <div className="flex flex-col min-w-0 flex-1 justify-center">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-base-200 text-base-content/70 border border-base-300 shadow-sm flex-shrink-0">Tarea</span>
                  <span className="font-bold text-base text-base-content/90 group-hover:text-primary transition-colors truncate">
                    {taskTitle}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-base-content/50 truncate">
                    {taskDescription}
                  </span>
                </div>
              </div>

              {isSubmitted && (
                <div className="flex items-center justify-center flex-shrink-0 ml-2">
                  <CheckCircle2 size={18} className="text-success" />
                </div>
              )}

              {dueDate && !isSubmitted && (
                  <div className="text-right flex-shrink-0 ml-2 flex items-center gap-1.5 text-xs text-base-content/60">
                    <Calendar size={14} className="text-primary" aria-hidden="true" />
                    <p>{dueDate}</p>
                  </div>
                )}

              {/* Indicador de ayuda táctil de pulsación */}
              {isTeacher && (
                <div className="text-xs text-base-content/40 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0 flex items-center gap-1 font-medium bg-base-200/50 px-2 py-1 rounded-lg">
                  <Trash2 size={12} className="text-error" />
                  <span>Mantén pulsado</span>
                </div>
              )}

              {/* Capa de progreso interactiva roja al mantener pulsado */}
              {isCurrentHolding && (
                <div className="absolute inset-0 bg-error/5 pointer-events-none rounded-2xl overflow-hidden z-20">
                  {/* Barra de progreso */}
                  <div 
                    className="absolute bottom-0 left-0 h-1.5 bg-error transition-all duration-75"
                    ref={progressBarRef}
                  />
                  {/* Texto indicador */}
                  <div className="absolute inset-0 flex items-center justify-center bg-base-100/90 backdrop-blur-xs">
                    <span className="text-error font-bold text-sm flex items-center gap-2">
                      <Trash2 size={14} className="animate-bounce" />
                      {holdProgress < 100 ? `Mantén presionado para eliminar (${Math.ceil((3000 - (holdProgress * 30)) / 1000)}s)` : "Eliminando..."}
                    </span>
                  </div>
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
