import { useState, useEffect } from 'react';
import { Task } from '../types';
import { useAppStore } from '../store/useAppStore';
import { 
  Dialog, 
  DialogContent 
} from './ui/dialog';
import { Input } from './ui/input';
import { TaskItem } from './TaskItem';
import { Search, X } from 'lucide-react';
import { Button } from './ui/button';

interface SearchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ isOpen, onOpenChange }: SearchDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Task[]>([]);
  
  const {
    getAllTasks,
    projects,
    labels,
    toggleTaskCompletion,
    deleteTask,
    setSelectedTask,
    setTaskPriority,
  } = useAppStore();
  
  // Reset search when dialog is opened
  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setResults([]);
    }
  }, [isOpen]);
  
  // Search for tasks
  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    
    const allTasks = getAllTasks();
    const term = searchTerm.toLowerCase();
    
    const filtered = allTasks.filter(task => {
      const titleMatch = task.title.toLowerCase().includes(term);
      const descriptionMatch = task.description?.toLowerCase().includes(term) || false;
      
      // Get project and label names for this task
      const project = projects.find(p => p.id === task.projectId);
      const taskLabels = labels.filter(l => task.labelIds.includes(l.id));
      
      const projectMatch = project?.name.toLowerCase().includes(term) || false;
      const labelMatch = taskLabels.some(l => l.name.toLowerCase().includes(term));
      
      return titleMatch || descriptionMatch || projectMatch || labelMatch;
    });
    
    setResults(filtered);
  }, [searchTerm, getAllTasks, projects, labels]);
  
  const getProjectById = (projectId: string) => {
    return projects.find((p) => p.id === projectId) || projects[0];
  };

  const getTaskLabels = (labelIds: string[]) => {
    return labels.filter((label) => labelIds.includes(label.id));
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 pb-2 border-b">
          <Search className="h-5 w-5 text-[#86868B]" />
          <Input
            className="flex-1 border-none shadow-none focus-visible:ring-0 text-lg"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          {searchTerm && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => setSearchTerm('')}
            >
              <X className="h-5 w-5 text-[#86868B]" />
            </Button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          {searchTerm.trim() === '' ? (
            <div className="text-center py-8 text-[#86868B]">
              <p>Type to search for tasks, projects, or labels</p>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-[#86868B]">
              <p>No results found for "{searchTerm}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-[#86868B] mb-2">
                {results.length} {results.length === 1 ? 'result' : 'results'} found
              </p>
              <div className="space-y-1 rounded-lg border border-[#E5E5EA] bg-white overflow-hidden">
                {results.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    project={getProjectById(task.projectId)}
                    labels={getTaskLabels(task.labelIds)}
                    onToggleComplete={toggleTaskCompletion}
                    onDelete={deleteTask}
                    onEdit={(task) => {
                      setSelectedTask(task);
                      onOpenChange(false);
                    }}
                    onSetPriority={setTaskPriority}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}