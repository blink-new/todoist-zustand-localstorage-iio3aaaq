import { useMemo } from 'react';
import { Task, Project, Label } from '../types';
import { TaskItem } from './TaskItem';
import { format } from 'date-fns';
import { useAppStore } from '../store/useAppStore';

interface TaskListProps {
  title?: string;
  tasks: Task[];
  groupBy?: 'project' | 'date' | 'none';
}

export function TaskList({ title, tasks, groupBy = 'none' }: TaskListProps) {
  const { projects, labels, toggleTaskCompletion, deleteTask, setSelectedTask, setTaskPriority } = useAppStore();
  
  const getProjectById = (projectId: string) => {
    return projects.find((p) => p.id === projectId) || projects[0];
  };

  const getTaskLabels = (labelIds: string[]) => {
    return labels.filter((label) => labelIds.includes(label.id));
  };

  const groupedTasks = useMemo(() => {
    if (groupBy === 'none') {
      return { 'All Tasks': tasks };
    }

    if (groupBy === 'project') {
      return tasks.reduce((groups, task) => {
        const project = getProjectById(task.projectId);
        const groupName = project.name;
        
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        
        groups[groupName].push(task);
        return groups;
      }, {} as Record<string, Task[]>);
    }

    if (groupBy === 'date') {
      return tasks.reduce((groups, task) => {
        let groupName = 'No Due Date';
        
        if (task.dueDate) {
          const date = new Date(task.dueDate);
          const today = new Date();
          const tomorrow = new Date();
          tomorrow.setDate(today.getDate() + 1);
          
          if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
            groupName = 'Today';
          } else if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
            groupName = 'Tomorrow';
          } else {
            groupName = format(date, 'EEEE, MMMM d');
          }
        }
        
        if (!groups[groupName]) {
          groups[groupName] = [];
        }
        
        groups[groupName].push(task);
        return groups;
      }, {} as Record<string, Task[]>);
    }

    return { 'All Tasks': tasks };
  }, [tasks, groupBy]);

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="mb-4 rounded-full bg-[#F2F2F7] p-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="text-[#86868B]"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-[#1D1D1F]">All caught up!</h3>
        <p className="mt-1 text-sm text-[#86868B]">No tasks to show here.</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      {title && (
        <h2 className="mb-4 text-lg font-semibold text-[#1D1D1F]">{title}</h2>
      )}
      
      <div className="space-y-6">
        {Object.entries(groupedTasks).map(([groupName, groupTasks]) => (
          <div key={groupName}>
            <h3 className="mb-2 text-sm font-medium text-[#86868B]">{groupName}</h3>
            <div className="space-y-1 rounded-lg border border-[#E5E5EA] bg-white overflow-hidden">
              {groupTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  project={getProjectById(task.projectId)}
                  labels={getTaskLabels(task.labelIds)}
                  onToggleComplete={toggleTaskCompletion}
                  onDelete={deleteTask}
                  onEdit={setSelectedTask}
                  onSetPriority={setTaskPriority}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}