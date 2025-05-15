import React, { useState } from 'react';
import { 
  DndContext, 
  useSensors, 
  useSensor, 
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  DragOverlay,
  DragStartEvent,
  DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, Project, Label } from '../types';
import { TaskItem } from './TaskItem';
import { useAppStore } from '../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, CircleDashed } from 'lucide-react';

// Create a sortable version of TaskItem
interface SortableTaskItemProps {
  task: Task;
  project: Project;
  labels: Label[];
  onToggleComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onSetPriority: (taskId: string, priority: Task['priority']) => void;
}

function SortableTaskItem({ 
  task, 
  project, 
  labels, 
  onToggleComplete, 
  onDelete, 
  onEdit, 
  onSetPriority 
}: SortableTaskItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 999 : 1
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="touch-manipulation cursor-grab active:cursor-grabbing"
      whileHover={{ scale: isDragging ? 1 : 1.01 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      layout
    >
      <TaskItem
        task={task}
        project={project}
        labels={labels}
        onToggleComplete={onToggleComplete}
        onDelete={onDelete}
        onEdit={onEdit}
        onSetPriority={onSetPriority}
      />
    </motion.div>
  );
}

interface DraggableTaskListProps {
  title?: string;
  tasks: Task[];
  groupBy?: 'project' | 'date' | 'none';
  projectId?: string;
}

export function DraggableTaskList({ 
  title, 
  tasks, 
  groupBy = 'none', 
  projectId
}: DraggableTaskListProps) {
  const { 
    projects, 
    labels, 
    toggleTaskCompletion, 
    deleteTask, 
    setSelectedTask, 
    setTaskPriority,
    reorderTasks
  } = useAppStore();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Set up sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getProjectById = (projectId: string) => {
    return projects.find((p) => p.id === projectId) || projects[0];
  };

  const getTaskLabels = (labelIds: string[]) => {
    return labels.filter((label) => labelIds.includes(label.id));
  };

  const nonCompletedTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);
  
  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    const draggedTask = nonCompletedTasks.find(task => task.id === active.id);
    if (draggedTask) {
      setActiveTask(draggedTask);
    }
  };

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveTask(null);
    
    if (active.id !== over?.id && projectId && over) {
      const oldIndex = nonCompletedTasks.findIndex(task => task.id === active.id);
      const newIndex = nonCompletedTasks.findIndex(task => task.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderTasks(projectId, oldIndex, newIndex);
      }
    }
  };

  if (tasks.length === 0) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center py-16 px-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="mb-6 rounded-full bg-blue-50 p-5"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 300,
            damping: 20,
            delay: 0.2 
          }}
        >
          <CheckCircle className="h-16 w-16 text-blue-500" />
        </motion.div>
        <motion.h3 
          className="text-xl font-medium tracking-tight"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          All caught up!
        </motion.h3>
        <motion.p 
          className="mt-2 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          No tasks to show here.
        </motion.p>
      </motion.div>
    );
  }

  // Render a simple non-draggable list for views other than project view
  if (groupBy !== 'none' || !projectId) {
    return (
      <div className="h-full">
        {title && (
          <h2 className="mb-4 text-xl font-semibold tracking-tight">{title}</h2>
        )}
        
        <div className="space-y-8">
          <AnimatePresence>
            {nonCompletedTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <CircleDashed className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-medium text-gray-700">To Do</h3>
                  <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                    {nonCompletedTasks.length}
                  </span>
                </div>
                <motion.div 
                  className="space-y-1 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
                  layout
                >
                  <AnimatePresence>
                    {nonCompletedTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TaskItem
                          task={task}
                          project={getProjectById(task.projectId)}
                          labels={getTaskLabels(task.labelIds)}
                          onToggleComplete={toggleTaskCompletion}
                          onDelete={deleteTask}
                          onEdit={setSelectedTask}
                          onSetPriority={setTaskPriority}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {completedTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <h3 className="text-sm font-medium text-gray-700">Completed</h3>
                  <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-600">
                    {completedTasks.length}
                  </span>
                </div>
                <motion.div 
                  className="space-y-1 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
                  layout
                >
                  <AnimatePresence>
                    {completedTasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
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
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // For project view, use the draggable version
  return (
    <div className="h-full">
      {title && (
        <h2 className="mb-4 text-xl font-semibold tracking-tight">{title}</h2>
      )}
      
      <div className="space-y-8">
        {nonCompletedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CircleDashed className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-700">To Do</h3>
              <span className="ml-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-600">
                {nonCompletedTasks.length}
              </span>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={nonCompletedTasks.map(task => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <motion.div className="space-y-1" layout>
                    {nonCompletedTasks.map((task) => (
                      <SortableTaskItem
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
                  </motion.div>
                </SortableContext>

                <DragOverlay>
                  {activeTask ? (
                    <div className="opacity-80 rounded-xl shadow-lg">
                      <TaskItem
                        task={activeTask}
                        project={getProjectById(activeTask.projectId)}
                        labels={getTaskLabels(activeTask.labelIds)}
                        onToggleComplete={toggleTaskCompletion}
                        onDelete={deleteTask}
                        onEdit={setSelectedTask}
                        onSetPriority={setTaskPriority}
                      />
                    </div>
                  ) : null}
                </DragOverlay>
              </DndContext>
            </div>
          </motion.div>
        )}

        {completedTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <h3 className="text-sm font-medium text-gray-700">Completed</h3>
              <span className="ml-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-600">
                {completedTasks.length}
              </span>
            </div>
            <motion.div 
              className="space-y-1 rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm"
              layout
            >
              <AnimatePresence>
                {completedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TaskItem
                      task={task}
                      project={getProjectById(task.projectId)}
                      labels={getTaskLabels(task.labelIds)}
                      onToggleComplete={toggleTaskCompletion}
                      onDelete={deleteTask}
                      onEdit={setSelectedTask}
                      onSetPriority={setTaskPriority}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}