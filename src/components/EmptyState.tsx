import { CheckCircle, CalendarClock, Inbox, Tag, ListTodo, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { AppState } from '../types';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  view: AppState['view'];
  onAddTask: () => void;
}

export function EmptyState({ view, onAddTask }: EmptyStateProps) {
  // Content based on the current view
  const content = {
    today: {
      icon: <CheckCircle className="h-16 w-16 text-emerald-500 opacity-90" />,
      title: 'All clear for today',
      description: 'Great job! You have no tasks scheduled for today.',
      actionText: 'Add task for today',
      color: 'from-emerald-400 to-teal-500',
      bgColor: 'bg-emerald-50',
    },
    upcoming: {
      icon: <CalendarClock className="h-16 w-16 text-indigo-500 opacity-90" />,
      title: 'Looking ahead',
      description: 'No upcoming tasks scheduled. Plan your future tasks here.',
      actionText: 'Schedule a new task',
      color: 'from-indigo-400 to-purple-500',
      bgColor: 'bg-indigo-50',
    },
    project: {
      icon: <Inbox className="h-16 w-16 text-blue-500 opacity-90" />,
      title: 'No tasks in this project',
      description: 'Add tasks to this project to get started.',
      actionText: 'Add a project task',
      color: 'from-blue-400 to-sky-500',
      bgColor: 'bg-blue-50',
    },
    label: {
      icon: <Tag className="h-16 w-16 text-orange-500 opacity-90" />,
      title: 'No tasks with this label',
      description: 'Add this label to tasks to see them here.',
      actionText: 'Add a labeled task',
      color: 'from-orange-400 to-amber-500',
      bgColor: 'bg-orange-50',
    },
    all: {
      icon: <ListTodo className="h-16 w-16 text-blue-500 opacity-90" />,
      title: 'No tasks yet',
      description: 'Add your first task to get started.',
      actionText: 'Add your first task',
      color: 'from-blue-400 to-sky-500',
      bgColor: 'bg-blue-50',
    },
  };

  const currentContent = content[view];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="flex h-full flex-col items-center justify-center p-10 text-center"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div 
        className={cn(
          "mb-8 rounded-full p-6 shadow-inner",
          currentContent.bgColor
        )}
        variants={itemVariants}
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {currentContent.icon}
      </motion.div>
      
      <motion.h3 
        className="mb-3 text-2xl font-medium tracking-tight bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
        variants={itemVariants}
      >
        {currentContent.title}
      </motion.h3>
      
      <motion.p 
        className="mb-8 max-w-md text-gray-500"
        variants={itemVariants}
      >
        {currentContent.description}
      </motion.p>
      
      <motion.div 
        variants={itemVariants}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          onClick={onAddTask}
          className={cn(
            "flex items-center gap-2 transition-all hover:shadow-lg bg-gradient-to-r px-5 py-6 text-white font-medium",
            currentContent.color
          )}
        >
          <Plus size={20} className="text-white" />
          {currentContent.actionText}
        </Button>
      </motion.div>

      <motion.div 
        className="mt-20 rounded-2xl bg-gray-50 p-6 max-w-sm"
        variants={itemVariants}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <p className="text-sm text-gray-500 italic">
          "The key is not to prioritize what's on your schedule, but to schedule your priorities."
        </p>
        <p className="mt-3 text-sm font-medium text-gray-700">
          — Stephen Covey
        </p>
      </motion.div>
    </motion.div>
  );
}