import { Plus, Inbox, Calendar, Tag, Sun, MoreHorizontal } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { cn } from '../lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';
import { useState } from 'react';
import { Project } from '../types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from './ui/dialog';
import { Input } from './ui/input';
import { motion } from 'framer-motion';

// Define vibrant project colors
const PROJECT_COLORS = [
  '#0077ED', // Apple blue
  '#FF9500', // Apple orange
  '#FF2D55', // Apple pink
  '#5856D6', // Apple purple
  '#34C759', // Apple green
  '#AF52DE', // Apple violet
  '#FFCC00', // Apple yellow
  '#FF3B30', // Apple red
];

interface SidebarProps {
  onAddTask?: () => void;
}

export function Sidebar({ onAddTask }: SidebarProps) {
  const {
    projects,
    labels,
    selectedProjectId,
    selectedLabelId,
    view,
    setView,
    setSelectedProject,
    setSelectedLabel,
    getTodayTasks,
    getUpcomingTasks,
    getProjectTasks,
    addProject,
    updateProject,
    deleteProject,
  } = useAppStore();

  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [selectedProjectForEdit, setSelectedProjectForEdit] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState(PROJECT_COLORS[0]);
  
  const todayTasksCount = getTodayTasks().length;
  const upcomingTasksCount = getUpcomingTasks().length;

  const handleAddProject = () => {
    if (newProjectName.trim() === '') return;
    addProject(newProjectName, newProjectColor);
    setNewProjectName('');
    setNewProjectColor(PROJECT_COLORS[0]);
    setIsAddProjectOpen(false);
  };

  const handleEditProject = () => {
    if (!selectedProjectForEdit || newProjectName.trim() === '') return;
    updateProject(selectedProjectForEdit.id, {
      name: newProjectName,
      color: newProjectColor,
    });
    setIsEditProjectOpen(false);
  };

  const handleProjectClick = (projectId: string) => {
    setSelectedProject(projectId);
  };

  const handleLabelClick = (labelId: string) => {
    setSelectedLabel(labelId);
  };

  const handleEditProjectClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProjectForEdit(project);
    setNewProjectName(project.name);
    setNewProjectColor(project.color);
    setIsEditProjectOpen(true);
  };

  const handleDeleteProjectClick = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteProject(projectId);
  };

  // Animation variants
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  return (
    <div className="h-full w-[260px] flex-shrink-0 bg-gradient-to-b from-[#F8F8FA] to-[#F5F5F7] border-r border-[#E5E5EA] flex flex-col">
      <motion.div 
        className="p-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <Button 
          variant="default" 
          className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all shadow-md hover:shadow-lg"
          onClick={onAddTask}
        >
          <Plus size={18} className="text-white" />
          <span className="font-medium">Add Task</span>
        </Button>
      </motion.div>
      
      <ScrollArea className="flex-1 pb-8">
        <motion.div 
          className="px-2 py-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="space-y-1 px-2">
            <motion.button
              variants={itemVariants}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                view === 'today' 
                  ? "bg-[#E4E4E9] text-[#1D1D1F] shadow-sm" 
                  : "text-[#86868B] hover:bg-[#E4E4E9]/50 hover:text-[#1D1D1F] hover:shadow-sm"
              )}
              onClick={() => setView('today')}
            >
              <Sun size={18} className={view === 'today' ? "text-amber-500" : ""} />
              <span>Today</span>
              {todayTasksCount > 0 && (
                <Badge 
                  variant="outline"
                  className="ml-auto bg-amber-500/10 hover:bg-amber-500/10 text-amber-600 border-none"
                >
                  {todayTasksCount}
                </Badge>
              )}
            </motion.button>
            
            <motion.button
              variants={itemVariants}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                view === 'upcoming' 
                  ? "bg-[#E4E4E9] text-[#1D1D1F] shadow-sm" 
                  : "text-[#86868B] hover:bg-[#E4E4E9]/50 hover:text-[#1D1D1F] hover:shadow-sm"
              )}
              onClick={() => setView('upcoming')}
            >
              <Calendar size={18} className={view === 'upcoming' ? "text-indigo-500" : ""} />
              <span>Upcoming</span>
              {upcomingTasksCount > 0 && (
                <Badge 
                  variant="outline" 
                  className="ml-auto bg-indigo-500/10 hover:bg-indigo-500/10 text-indigo-600 border-none"
                >
                  {upcomingTasksCount}
                </Badge>
              )}
            </motion.button>
          </div>
          
          <Separator className="my-4 bg-[#E5E5EA]" />
          
          <div>
            <div className="flex items-center justify-between px-4 py-2">
              <motion.h3 
                variants={itemVariants}
                className="text-xs font-semibold uppercase tracking-wider text-[#86868B]"
              >
                Projects
              </motion.h3>
              <motion.div variants={itemVariants}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E4E4E9]/50"
                  onClick={() => setIsAddProjectOpen(true)}
                >
                  <Plus size={14} />
                </Button>
              </motion.div>
            </div>
            
            <div className="space-y-1 px-2">
              {projects.map((project, index) => {
                const tasksCount = getProjectTasks(project.id).filter(t => !t.completed).length;
                return (
                  <motion.div
                    key={project.id}
                    variants={itemVariants}
                    className={cn(
                      "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      project.id === selectedProjectId && view === 'project'
                        ? "bg-[#E4E4E9] text-[#1D1D1F] shadow-sm"
                        : "text-[#86868B] hover:bg-[#E4E4E9]/50 hover:text-[#1D1D1F] hover:shadow-sm"
                    )}
                    onClick={() => handleProjectClick(project.id)}
                    custom={index}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="h-3 w-3 rounded-sm shadow-inner" 
                        style={{ 
                          backgroundColor: project.color,
                          boxShadow: `0 0 0 1px rgba(0,0,0,0.05), inset 0 1px 3px ${project.color}40`
                        }} 
                      />
                      <span>{project.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {tasksCount > 0 && (
                        <Badge 
                          variant="outline" 
                          className="bg-[#0077ED]/10 hover:bg-[#0077ED]/10 text-[#0077ED] border-none"
                        >
                          {tasksCount}
                        </Badge>
                      )}
                      
                      {project.id !== 'inbox' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 text-[#86868B] hover:text-[#1D1D1F] hover:bg-[#E4E4E9]/50 transition-opacity"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={(e: any) => handleEditProjectClick(project, e)}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-500 focus:text-red-500" 
                              onClick={(e: any) => handleDeleteProjectClick(project.id, e)}
                            >
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
          
          <Separator className="my-4 bg-[#E5E5EA]" />
          
          <div>
            <div className="flex items-center justify-between px-4 py-2">
              <motion.h3 
                variants={itemVariants}
                className="text-xs font-semibold uppercase tracking-wider text-[#86868B]"
              >
                Labels
              </motion.h3>
            </div>
            
            <div className="space-y-1 px-2">
              {labels.map((label, index) => (
                <motion.button
                  key={label.id}
                  variants={itemVariants}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                    label.id === selectedLabelId && view === 'label'
                      ? "bg-[#E4E4E9] text-[#1D1D1F] shadow-sm"
                      : "text-[#86868B] hover:bg-[#E4E4E9]/50 hover:text-[#1D1D1F] hover:shadow-sm"
                  )}
                  onClick={() => handleLabelClick(label.id)}
                  custom={index}
                >
                  <Tag 
                    size={18} 
                    style={{ 
                      color: label.color,
                      filter: label.id === selectedLabelId && view === 'label' 
                        ? 'drop-shadow(0 0 2px rgba(0,0,0,0.1))' 
                        : 'none'
                    }} 
                  />
                  <span>{label.name}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </ScrollArea>
      
      {/* Add Project Dialog */}
      <Dialog open={isAddProjectOpen} onOpenChange={setIsAddProjectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Create a new project to organize your tasks.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="focus-visible:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Choose a color</label>
              <div className="flex flex-wrap gap-3 mt-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all",
                      newProjectColor === color ? "ring-2 ring-[#0077ED] ring-offset-2 scale-110" : "hover:scale-110"
                    )}
                    style={{ 
                      backgroundColor: color,
                      boxShadow: `0 0 0 1px rgba(0,0,0,0.05), inset 0 2px 6px ${color}40`
                    }}
                    onClick={() => setNewProjectColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleAddProject}
              className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600"
            >
              Add Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Project Dialog */}
      <Dialog open={isEditProjectOpen} onOpenChange={setIsEditProjectOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update your project details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="focus-visible:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Choose a color</label>
              <div className="flex flex-wrap gap-3 mt-2">
                {PROJECT_COLORS.map((color) => (
                  <button
                    key={color}
                    className={cn(
                      "h-7 w-7 rounded-full transition-all",
                      newProjectColor === color ? "ring-2 ring-[#0077ED] ring-offset-2 scale-110" : "hover:scale-110"
                    )}
                    style={{ 
                      backgroundColor: color,
                      boxShadow: `0 0 0 1px rgba(0,0,0,0.05), inset 0 2px 6px ${color}40`
                    }}
                    onClick={() => setNewProjectColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleEditProject}
              className="bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}