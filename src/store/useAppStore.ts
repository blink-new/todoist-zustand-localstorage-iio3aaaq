import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Project, Label, Priority, AppState } from '../types';
import { format } from 'date-fns';

// Default projects and labels for new users
const DEFAULT_PROJECTS: Project[] = [
  {
    id: 'inbox',
    name: 'Inbox',
    color: '#0077ED',
    createdAt: new Date(),
  },
  {
    id: 'personal',
    name: 'Personal',
    color: '#FF9500',
    createdAt: new Date(),
  },
  {
    id: 'work',
    name: 'Work',
    color: '#FF2D55',
    createdAt: new Date(),
  },
];

const DEFAULT_LABELS: Label[] = [
  { id: 'important', name: 'Important', color: '#FF3B30' },
  { id: 'urgent', name: 'Urgent', color: '#FF9500' },
  { id: 'later', name: 'Later', color: '#5856D6' },
];

const initialState: AppState = {
  tasks: [],
  projects: DEFAULT_PROJECTS,
  labels: DEFAULT_LABELS,
  selectedProjectId: 'inbox',
  selectedLabelId: null,
  selectedTask: null,
  view: 'today',
};

export const useAppStore = create<
  AppState & {
    // Task actions
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
    updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void;
    deleteTask: (taskId: string) => void;
    toggleTaskCompletion: (taskId: string) => void;
    setTaskPriority: (taskId: string, priority: Priority) => void;
    reorderTasks: (projectId: string, startIndex: number, endIndex: number) => void;
    
    // Project actions
    addProject: (name: string, color: string) => void;
    updateProject: (projectId: string, updates: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
    deleteProject: (projectId: string) => void;
    
    // Label actions
    addLabel: (name: string, color: string) => void;
    updateLabel: (labelId: string, updates: Partial<Omit<Label, 'id'>>) => void;
    deleteLabel: (labelId: string) => void;
    
    // View actions
    setView: (view: AppState['view']) => void;
    setSelectedProject: (projectId: string | null) => void;
    setSelectedLabel: (labelId: string | null) => void;
    setSelectedTask: (task: Task | null) => void;
    
    // Filters
    getTodayTasks: () => Task[];
    getUpcomingTasks: () => Task[];
    getProjectTasks: (projectId: string) => Task[];
    getLabelTasks: (labelId: string) => Task[];
    getAllTasks: () => Task[];
  }
>(
  persist(
    (set, get) => ({
      ...initialState,
      
      // Task actions
      addTask: (taskData) => {
        const task: Task = {
          id: crypto.randomUUID(),
          createdAt: new Date(),
          ...taskData,
        };
        
        set((state) => ({
          tasks: [...state.tasks, task],
        }));
      },
      
      updateTask: (taskId, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === taskId ? { ...task, ...updates } : task
          ),
        }));
      },
      
      deleteTask: (taskId) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        }));
      },
      
      toggleTaskCompletion: (taskId) => {
        const { tasks } = get();
        const task = tasks.find(t => t.id === taskId);
        
        if (!task) return;
        
        // Handle recurring tasks when completed
        if (task.recurringConfig && !task.completed) {
          // Create the next occurrence
          const { recurringConfig, dueDate } = task;
          
          if (dueDate) {
            const newDueDate = new Date(dueDate);
            const { frequency, interval } = recurringConfig;
            
            // Calculate next due date based on recurrence pattern
            switch (frequency) {
              case 'daily':
                newDueDate.setDate(newDueDate.getDate() + interval);
                break;
              case 'weekly':
                newDueDate.setDate(newDueDate.getDate() + (interval * 7));
                break;
              case 'monthly':
                newDueDate.setMonth(newDueDate.getMonth() + interval);
                break;
              case 'yearly':
                newDueDate.setFullYear(newDueDate.getFullYear() + interval);
                break;
            }
            
            // Create next occurrence
            const nextTask = {
              ...task,
              id: crypto.randomUUID(),
              completed: false,
              dueDate: newDueDate,
              createdAt: new Date()
            };
            
            // Update current task as completed and add next occurrence
            set((state) => ({
              tasks: [
                ...state.tasks.map((t) => 
                  t.id === taskId ? { ...t, completed: true } : t
                ),
                nextTask
              ],
            }));
            return;
          }
        }
        
        // Regular task completion toggle
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === taskId ? { ...task, completed: !task.completed } : task
          ),
        }));
      },
      
      setTaskPriority: (taskId, priority) => {
        set((state) => ({
          tasks: state.tasks.map((task) => 
            task.id === taskId ? { ...task, priority } : task
          ),
        }));
      },
      
      // Project actions
      addProject: (name, color) => {
        const project: Project = {
          id: crypto.randomUUID(),
          name,
          color,
          createdAt: new Date(),
        };
        
        set((state) => ({
          projects: [...state.projects, project],
        }));
      },
      
      updateProject: (projectId, updates) => {
        set((state) => ({
          projects: state.projects.map((project) => 
            project.id === projectId ? { ...project, ...updates } : project
          ),
        }));
      },
      
      deleteProject: (projectId) => {
        // Don't allow deleting the inbox project
        if (projectId === 'inbox') return;
        
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== projectId),
          // Move tasks from deleted project to inbox
          tasks: state.tasks.map((task) => 
            task.projectId === projectId ? { ...task, projectId: 'inbox' } : task
          ),
          // If the deleted project was selected, switch to inbox
          selectedProjectId: state.selectedProjectId === projectId ? 'inbox' : state.selectedProjectId,
        }));
      },
      
      // Label actions
      addLabel: (name, color) => {
        const label: Label = {
          id: crypto.randomUUID(),
          name,
          color,
        };
        
        set((state) => ({
          labels: [...state.labels, label],
        }));
      },
      
      updateLabel: (labelId, updates) => {
        set((state) => ({
          labels: state.labels.map((label) => 
            label.id === labelId ? { ...label, ...updates } : label
          ),
        }));
      },
      
      deleteLabel: (labelId) => {
        set((state) => ({
          labels: state.labels.filter((label) => label.id !== labelId),
          // Remove the label from all tasks
          tasks: state.tasks.map((task) => ({
            ...task,
            labelIds: task.labelIds.filter((id) => id !== labelId),
          })),
          // If the deleted label was selected, clear the selection
          selectedLabelId: state.selectedLabelId === labelId ? null : state.selectedLabelId,
        }));
      },
      
      // View actions
      setView: (view) => {
        set({ view });
      },
      
      setSelectedProject: (projectId) => {
        set({ 
          selectedProjectId: projectId,
          view: projectId ? 'project' : 'today',
        });
      },
      
      setSelectedLabel: (labelId) => {
        set({ 
          selectedLabelId: labelId,
          view: labelId ? 'label' : 'today',
        });
      },
      
      setSelectedTask: (task) => {
        set({ selectedTask: task });
      },
      
      // Filters
      getTodayTasks: () => {
        const { tasks } = get();
        const today = new Date();
        
        return tasks.filter((task) => {
          if (!task.dueDate) return false;
          
          const dueDate = new Date(task.dueDate);
          return (
            format(dueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') && 
            !task.completed
          );
        }).sort((a, b) => b.priority - a.priority);
      },
      
      getUpcomingTasks: () => {
        const { tasks } = get();
        const today = new Date();
        
        return tasks
          .filter((task) => {
            if (!task.dueDate || task.completed) return false;
            const dueDate = new Date(task.dueDate);
            return dueDate > today;
          })
          .sort((a, b) => {
            if (!a.dueDate || !b.dueDate) return 0;
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            return dateA.getTime() - dateB.getTime();
          });
      },
      
      getProjectTasks: (projectId) => {
        const { tasks } = get();
        return tasks
          .filter((task) => task.projectId === projectId)
          .sort((a, b) => {
            // First by completion status
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1;
            }
            // Then by priority (higher priority first)
            if (a.priority !== b.priority) {
              return b.priority - a.priority;
            }
            // Finally by creation date (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
      },
      
      getLabelTasks: (labelId) => {
        const { tasks } = get();
        return tasks
          .filter((task) => task.labelIds.includes(labelId))
          .sort((a, b) => {
            // First by completion status
            if (a.completed !== b.completed) {
              return a.completed ? 1 : -1;
            }
            // Then by priority (higher priority first)
            if (a.priority !== b.priority) {
              return b.priority - a.priority;
            }
            // Finally by creation date (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
      },
      
      getAllTasks: () => {
        const { tasks } = get();
        return tasks.sort((a, b) => {
          // First by completion status
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          // Then by priority (higher priority first)
          if (a.priority !== b.priority) {
            return b.priority - a.priority;
          }
          // Finally by creation date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      },
      
      // Add reorder tasks functionality
      reorderTasks: (projectId, startIndex, endIndex) => {
        const { tasks } = get();
        
        // Get tasks for the specific project
        const projectTasks = tasks
          .filter((task) => task.projectId === projectId && !task.completed)
          .sort((a, b) => {
            // Then by priority (higher priority first)
            if (a.priority !== b.priority) {
              return b.priority - a.priority;
            }
            // Finally by creation date (newest first)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
        
        if (startIndex === endIndex) return;
        
        // Reorder the tasks within the project
        const [movedTask] = projectTasks.splice(startIndex, 1);
        projectTasks.splice(endIndex, 0, movedTask);
        
        // Create a new order mapping to update positions
        const taskOrder = {};
        projectTasks.forEach((task, index) => {
          taskOrder[task.id] = index;
        });
        
        // Update all tasks with their new order
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.projectId === projectId && !task.completed && taskOrder[task.id] !== undefined) {
              return {
                ...task,
                order: taskOrder[task.id],
              };
            }
            return task;
          }),
        }));
      },
    }),
    {
      name: 'todoist-app-storage',
    }
  )
);