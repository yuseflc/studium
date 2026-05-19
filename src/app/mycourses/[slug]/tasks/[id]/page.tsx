import TaskDetailView from '@/components/ui/tasks/TaskDetailView';

export const dynamic = 'force-dynamic';

export default function TaskDetailPage() {
  return (
    <div className="min-h-[70vh]">
      <div className="max-w-7xl mx-auto">
        <TaskDetailView />
      </div>
    </div>
  );
}
