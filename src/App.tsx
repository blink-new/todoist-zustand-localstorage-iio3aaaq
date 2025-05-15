import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sidebar } from './components/Sidebar'
import { MainView } from './components/MainView'
import { TaskDialog } from './components/TaskDialog'
import { useAppStore } from './store/useAppStore'
import { useMobileView } from './hooks/use-mobile'
import { cn } from './lib/utils'
import { Sheet, SheetContent, SheetTrigger } from './components/ui/sheet'
import { Button } from './components/ui/button'
import { Menu } from 'lucide-react'
import { toast } from 'react-hot-toast'

function App() {
  const { 
    selectedTask, 
    setSelectedTask, 
    addTask,
    tasks
  } = useAppStore()
  const isMobile = useMobileView()
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Handle the case when selectedTask changes
  useEffect(() => {
    if (selectedTask) {
      setIsTaskDialogOpen(true)
    }
  }, [selectedTask])

  // After hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Add a test task if store is empty
  useEffect(() => {
    if (mounted && tasks.length === 0) {
      // Add a test task to ensure everything works
      addTask({
        title: "Welcome to your beautiful Todoist clone!",
        description: "This is a sample task to get you started. Try adding your own tasks using the 'Add Task' button. Enjoy the smooth animations and Apple-inspired design!",
        completed: false,
        priority: 3,
        projectId: "inbox",
        labelIds: ["important"],
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      });
      toast.success('Welcome! Sample task created for you to get started.', {
        style: {
          background: '#F5F5F7',
          color: '#1D1D1F',
          border: '1px solid #E5E5EA',
          borderRadius: '12px',
          padding: '16px',
          fontWeight: '500',
        },
        duration: 5000,
        iconTheme: {
          primary: '#34C759',
          secondary: '#FFFFFF',
        },
      });
    }
  }, [mounted, tasks.length, addTask]);

  // Close the dialog and clear selected task
  const handleDialogOpenChange = (open: boolean) => {
    setIsTaskDialogOpen(open)
    if (!open) {
      setSelectedTask(null)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-[#F9F9FC]">
      {/* Mobile View */}
      {isMobile ? (
        <div className="flex h-full w-full flex-col">
          <div className="flex items-center border-b border-[#E5E5EA] bg-white p-4 shadow-sm">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2 rounded-full">
                  <Menu size={20} className="text-gray-700" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 max-w-[280px] border-r border-[#E5E5EA]">
                <Sidebar onAddTask={() => {
                  setIsTaskDialogOpen(true)
                  setSidebarOpen(false)
                }} />
              </SheetContent>
            </Sheet>
            <h1 className="flex-1 text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">Todoist</h1>
          </div>
          <div className="flex-1 overflow-auto">
            <MainView onAddTask={() => setIsTaskDialogOpen(true)} />
          </div>
        </div>
      ) : (
        /* Desktop View */
        <motion.div 
          className="flex h-full w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence>
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30 
              }}
              className="border-r border-[#E5E5EA] shadow-sm"
            >
              <Sidebar onAddTask={() => setIsTaskDialogOpen(true)} />
            </motion.div>
          </AnimatePresence>
          
          <motion.div 
            className="flex-1 overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <MainView onAddTask={() => setIsTaskDialogOpen(true)} />
          </motion.div>
        </motion.div>
      )}

      <TaskDialog 
        task={selectedTask} 
        isOpen={isTaskDialogOpen} 
        onOpenChange={handleDialogOpenChange} 
      />
    </div>
  )
}

export default App
