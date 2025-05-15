import { useState, useEffect } from 'react';
import { Task, Priority } from '../types';
import { useAppStore } from '../store/useAppStore';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Flag } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Calendar } from './ui/calendar';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from './ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';

interface TaskDialogProps {
  task: Task | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDialog({ task, isOpen, onOpenChange }: TaskDialogProps) {
  const {
    projects,
    labels,
    addTask,
    updateTask,
    selectedProjectId,
  } = useAppStore();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [priority, setPriority] = useState<Priority>(1);
  const [projectId, setProjectId] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDueDate(task.dueDate || null);
      setPriority(task.priority);
      setProjectId(task.projectId);
      setSelectedLabels(task.labelIds);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(null);
      setPriority(1);
      setProjectId(selectedProjectId || projects[0].id);
      setSelectedLabels([]);
    }
  }, [task, selectedProjectId, projects]);
  
  const handleSave = () => {
    if (!title.trim()) return;
    
    if (task) {
      updateTask(task.id, {
        title,
        description: description || undefined,
        dueDate,
        priority,
        projectId,
        labelIds: selectedLabels,
      });
    } else {
      addTask({
        title,
        description: description || undefined,
        completed: false,
        dueDate,
        priority,
        projectId,
        labelIds: selectedLabels,
      });
    }
    
    onOpenChange(false);
  };
  
  const getPriorityIcon = (p: Priority) => {
    switch (p) {
      case 4: // Highest
        return <Flag className="h-4 w-4 text-red-500 fill-red-500" />;
      case 3: // High
        return <Flag className="h-4 w-4 text-orange-500 fill-orange-500" />;
      case 2: // Medium
        return <Flag className="h-4 w-4 text-blue-500 fill-blue-500" />;
      case 1: // Low
        return <Flag className="h-4 w-4 text-gray-400" />;
      default:
        return <Flag className="h-4 w-4 text-gray-400" />;
    }
  };
  
  const getPriorityText = (p: Priority) => {
    switch (p) {
      case 4:
        return 'Priority 1';
      case 3:
        return 'Priority 2';
      case 2:
        return 'Priority 3';
      case 1:
        return 'Priority 4';
      default:
        return 'Priority 4';
    }
  };
  
  const toggleLabel = (labelId: string) => {
    setSelectedLabels((prev) =>
      prev.includes(labelId)
        ? prev.filter((id) => id !== labelId)
        : [...prev, labelId]
    );
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
          <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden rounded-xl border-none shadow-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className="p-6"
            >
              <DialogHeader className="pb-4">
                <DialogTitle className="text-xl font-semibold">
                  {task ? 'Edit Task' : 'Add Task'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid gap-5">
                <Input
                  placeholder="Task name"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-medium border-none bg-gray-50 rounded-lg focus-visible:ring-blue-500 focus-visible:ring-offset-0 px-4 py-3 h-auto"
                />
                
                <Textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="resize-none border-none bg-gray-50 rounded-lg focus-visible:ring-blue-500 focus-visible:ring-offset-0 px-4 py-3"
                  rows={3}
                />
                
                <div className="flex flex-wrap gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal rounded-lg border-gray-200 hover:border-gray-300 transition-all",
                          !dueDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, 'PPP') : 'Due date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate || undefined}
                        onSelect={setDueDate}
                        initialFocus
                        className="rounded-lg shadow-lg border border-gray-100"
                      />
                    </PopoverContent>
                  </Popover>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="justify-start text-left font-normal rounded-lg border-gray-200 hover:border-gray-300 transition-all gap-2">
                        {getPriorityIcon(priority)}
                        <span>{getPriorityText(priority)}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="rounded-lg shadow-lg">
                      <DropdownMenuItem onClick={() => setPriority(4)} className="cursor-pointer">
                        <Flag className="h-4 w-4 text-red-500 fill-red-500 mr-2" />
                        Priority 1
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPriority(3)} className="cursor-pointer">
                        <Flag className="h-4 w-4 text-orange-500 fill-orange-500 mr-2" />
                        Priority 2
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPriority(2)} className="cursor-pointer">
                        <Flag className="h-4 w-4 text-blue-500 fill-blue-500 mr-2" />
                        Priority 3
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setPriority(1)} className="cursor-pointer">
                        <Flag className="h-4 w-4 text-gray-400 mr-2" />
                        Priority 4
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger className="w-auto rounded-lg border-gray-200 hover:border-gray-300 transition-all">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg shadow-lg">
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id} className="cursor-pointer">
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-3 w-3 rounded-sm" 
                              style={{ 
                                backgroundColor: project.color,
                                boxShadow: `0 1px 2px ${project.color}20`
                              }} 
                            />
                            {project.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <h4 className="mb-3 text-sm font-medium text-gray-700">Labels</h4>
                  <ScrollArea className="h-[120px] rounded-lg border border-gray-200 p-3 bg-gray-50">
                    <div className="space-y-3">
                      {labels.map((label) => (
                        <motion.div 
                          key={label.id} 
                          className="flex items-center gap-2"
                          whileHover={{ x: 2 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Checkbox
                            id={`label-${label.id}`}
                            checked={selectedLabels.includes(label.id)}
                            onCheckedChange={() => toggleLabel(label.id)}
                            className={cn(
                              "border-gray-300 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-500",
                              "transition-all duration-200"
                            )}
                          />
                          <label
                            htmlFor={`label-${label.id}`}
                            className="flex items-center gap-2 text-sm cursor-pointer"
                          >
                            <Badge
                              variant="outline"
                              className="px-2 py-0 h-5 text-xs border-none transition-all"
                              style={{
                                backgroundColor: `${label.color}20`,
                                color: label.color,
                                boxShadow: `0 1px 2px ${label.color}20`
                              }}
                            >
                              {label.name}
                            </Badge>
                          </label>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
              
              <DialogFooter className="mt-6 gap-2">
                <DialogClose asChild>
                  <Button variant="outline" className="rounded-lg border-gray-200 hover:border-gray-300 transition-all">
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  onClick={handleSave}
                  className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
                >
                  {task ? 'Save Changes' : 'Add Task'}
                </Button>
              </DialogFooter>
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}