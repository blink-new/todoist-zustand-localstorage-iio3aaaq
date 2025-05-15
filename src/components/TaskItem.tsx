import { Circle, CheckCircle, Flag, Calendar, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useState } from 'react';
import { Task, Project, Label } from '../types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { motion } from 'framer-motion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

interface TaskItemProps {
  task: Task;
  project: Project;
  labels: Label[];
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onSetPriority: (taskId: string, priority: Task['priority']) => void;
}

const getPriorityFlag = (priority: number) => {
  switch (priority) {
    case 4: // Highest
      return <Flag className="h-4 w-4 text-red-500 fill-red-500" />;
    case 3: // High
      return <Flag className="h-4 w-4 text-orange-500 fill-orange-500" />;
    case 2: // Medium
      return <Flag className="h-4 w-4 text-blue-500 fill-blue-500" />;
    case 1: // Low
      return <Flag className="h-4 w-4 text-gray-400" />;
    default:
      return null;
  }
};

export function TaskItem({
  task,
  project,
  labels,
  onToggleComplete,
  onDelete,
  onEdit,
  onSetPriority,
}: TaskItemProps) {
  const [isHovered, setIsHovered] = useState(false);
  const taskLabels = labels.filter((label) => task.labelIds.includes(label.id));
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group flex items-start gap-3 rounded-lg p-3 transition-all border border-transparent",
        task.completed ? "bg-gray-50" : "bg-white",
        isHovered && "border-gray-200 shadow-sm"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.005 }}
    >
      <motion.button
        className="mt-0.5 flex-shrink-0"
        onClick={() => onToggleComplete(task.id)}
        whileTap={{ scale: 0.85 }}
      >
        {task.completed ? (
          <CheckCircle className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5 text-gray-300 group-hover:text-gray-400" />
        )}
      </motion.button>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-sm font-medium line-clamp-2 break-words",
            task.completed && "text-gray-400 line-through"
          )}>
            {task.title}
          </p>
          {task.priority > 1 && (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {getPriorityFlag(task.priority)}
            </motion.div>
          )}
        </div>
        
        {task.description && (
          <p className={cn(
            "mt-1 text-xs text-[#86868B] line-clamp-2",
            task.completed && "text-gray-400"
          )}>
            {task.description}
          </p>
        )}
        
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge 
            variant="outline" 
            className="px-2 py-0 h-5 text-xs border-none transition-all"
            style={{ 
              backgroundColor: `${project.color}20`,
              color: project.color,
              boxShadow: isHovered ? `0 1px 3px ${project.color}20` : 'none'
            }}
          >
            {project.name}
          </Badge>
          
          {task.dueDate && (
            <Badge 
              variant="outline" 
              className="px-2 py-0 h-5 text-xs flex items-center gap-1 border-none bg-gray-100 text-gray-600 transition-all"
              style={{
                boxShadow: isHovered ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              <Calendar className="h-3 w-3" />
              {format(new Date(task.dueDate), 'MMM d')}
            </Badge>
          )}
          
          {taskLabels.map((label) => (
            <Badge 
              key={label.id}
              variant="outline" 
              className="px-2 py-0 h-5 text-xs border-none transition-all"
              style={{ 
                backgroundColor: `${label.color}20`,
                color: label.color,
                boxShadow: isHovered ? `0 1px 3px ${label.color}20` : 'none'
              }}
            >
              {label.name}
            </Badge>
          ))}
        </div>
      </div>
      
      <div className={cn(
        "flex-shrink-0 opacity-0 transition-opacity",
        isHovered && "opacity-100"
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-[#86868B] hover:text-[#1D1D1F] hover:bg-gray-100 rounded-full"
            >
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-lg border-gray-200">
            <DropdownMenuItem onClick={() => onEdit(task)} className="cursor-pointer">
              Edit Task
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onSetPriority(task.id, 4)} className="cursor-pointer">
              <Flag className="h-4 w-4 text-red-500 fill-red-500 mr-2" />
              Priority 1
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSetPriority(task.id, 3)} className="cursor-pointer">
              <Flag className="h-4 w-4 text-orange-500 fill-orange-500 mr-2" />
              Priority 2
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSetPriority(task.id, 2)} className="cursor-pointer">
              <Flag className="h-4 w-4 text-blue-500 fill-blue-500 mr-2" />
              Priority 3
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onSetPriority(task.id, 1)} className="cursor-pointer">
              <Flag className="h-4 w-4 text-gray-400 mr-2" />
              Priority 4
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-red-500 focus:text-red-500 cursor-pointer" 
              onClick={() => onDelete(task.id)}
            >
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.div>
  );
}