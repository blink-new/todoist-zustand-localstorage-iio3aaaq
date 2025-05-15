import { ChevronDown, Plus, Search } from 'lucide-react'
import { Button } from './ui/button'
import { Separator } from './ui/separator'
import { useAppStore } from '../store/useAppStore'
import { cn } from '../lib/utils'
import { useState } from 'react'
import { SearchDialog } from './SearchDialog'
import { motion } from 'framer-motion'

interface TaskHeaderProps {
  onAddTask: () => void
}

export function TaskHeader({ onAddTask }: TaskHeaderProps) {
  const { view, selectedProjectId, selectedLabelId, projects, labels } = useAppStore()
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Get the current view name for display
  const getViewName = () => {
    switch (view) {
      case 'today':
        return 'Today'
      case 'upcoming':
        return 'Upcoming'
      case 'project':
        if (selectedProjectId) {
          const project = projects.find(p => p.id === selectedProjectId)
          return project ? project.name : 'Project'
        }
        return 'Project'
      case 'label':
        if (selectedLabelId) {
          const label = labels.find(l => l.id === selectedLabelId)
          return label ? label.name : 'Label'
        }
        return 'Label'
      case 'all':
        return 'All Tasks'
      default:
        return 'Today'
    }
  }

  // Get a color based on the current view
  const getViewColor = () => {
    switch (view) {
      case 'today':
        return 'from-amber-500 to-orange-600'
      case 'upcoming':
        return 'from-indigo-500 to-purple-600'
      case 'project':
        if (selectedProjectId) {
          const project = projects.find(p => p.id === selectedProjectId)
          if (project && project.color) {
            // Just return a solid color for projects
            return ''
          }
        }
        return 'from-blue-500 to-sky-600'
      case 'label':
        if (selectedLabelId) {
          const label = labels.find(l => l.id === selectedLabelId)
          if (label && label.color) {
            // Just return a solid color for labels
            return ''
          }
        }
        return 'from-orange-500 to-amber-600'
      case 'all':
        return 'from-blue-500 to-sky-600'
      default:
        return 'from-blue-500 to-sky-600'
    }
  }

  // Get the project color
  const getProjectOrLabelColor = () => {
    if (view === 'project' && selectedProjectId) {
      const project = projects.find(p => p.id === selectedProjectId)
      return project?.color || '#0077ED'
    }
    if (view === 'label' && selectedLabelId) {
      const label = labels.find(l => l.id === selectedLabelId)
      return label?.color || '#FF9500'
    }
    return null
  }

  const textColor = getProjectOrLabelColor() || 'transparent'
  const gradientClass = getViewColor()

  return (
    <>
      <motion.div 
        className="bg-white border-b border-[#E5E5EA] shadow-sm"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container py-5 px-6">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.3 }}
            >
              {getProjectOrLabelColor() ? (
                <h1 
                  className="text-2xl font-semibold"
                  style={{ color: textColor }}
                >
                  {getViewName()}
                </h1>
              ) : (
                <h1 className={cn(
                  "text-2xl font-semibold bg-gradient-to-r bg-clip-text text-transparent",
                  gradientClass
                )}>
                  {getViewName()}
                </h1>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-[#86868B] hover:bg-gray-100 rounded-full">
                <ChevronDown size={18} />
              </Button>
            </motion.div>
            
            <motion.div 
              className="flex items-center gap-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="h-9 w-9 text-[#86868B] hover:text-[#1D1D1F] hover:bg-gray-100 rounded-full"
              >
                <Search size={20} />
              </Button>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  onClick={onAddTask} 
                  className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-700 hover:to-indigo-600 transition-all shadow-sm hover:shadow-md"
                >
                  <Plus size={18} />
                  <span>Add Task</span>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      <SearchDialog
        isOpen={isSearchOpen}
        onOpenChange={setIsSearchOpen}
      />
    </>
  )
}