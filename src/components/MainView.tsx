import { useMemo } from 'react'
import { useAppStore } from '../store/useAppStore'
import { Header } from './Header'
import { TaskList } from './TaskList'
import { DraggableTaskList } from './DraggableTaskList'
import { EmptyState } from './EmptyState'
import { Task } from '../types'
import { TaskHeader } from './TaskHeader'

interface MainViewProps {
  onAddTask: () => void
}

export function MainView({ onAddTask }: MainViewProps) {
  const {
    view,
    selectedProjectId,
    selectedLabelId,
    getTodayTasks,
    getUpcomingTasks,
    getProjectTasks,
    getLabelTasks,
    getAllTasks,
    projects,
    labels,
  } = useAppStore()

  // Get the current tasks based on selected view
  const tasks = useMemo(() => {
    switch (view) {
      case 'today':
        return getTodayTasks()
      case 'upcoming':
        return getUpcomingTasks()
      case 'project':
        return selectedProjectId ? getProjectTasks(selectedProjectId) : []
      case 'label':
        return selectedLabelId ? getLabelTasks(selectedLabelId) : []
      case 'all':
        return getAllTasks()
      default:
        return []
    }
  }, [view, selectedProjectId, selectedLabelId, getTodayTasks, getUpcomingTasks, getProjectTasks, getLabelTasks, getAllTasks])

  // Determine the appropriate group by strategy
  const groupBy = useMemo(() => {
    switch (view) {
      case 'upcoming':
        return 'date'
      case 'all':
        return 'project'
      default:
        return 'none'
    }
  }, [view])

  // Get the title based on current view
  const title = useMemo(() => {
    switch (view) {
      case 'today':
        return 'Today'
      case 'upcoming':
        return 'Upcoming'
      case 'project':
        if (selectedProjectId) {
          const project = projects.find(p => p.id === selectedProjectId)
          return project?.name || 'Project'
        }
        return 'Project'
      case 'label':
        if (selectedLabelId) {
          const label = labels.find(l => l.id === selectedLabelId)
          return label?.name || 'Label'
        }
        return 'Label'
      case 'all':
        return 'All Tasks'
      default:
        return ''
    }
  }, [view, selectedProjectId, selectedLabelId, projects, labels])

  return (
    <div className="flex h-full flex-col">
      <TaskHeader onAddTask={onAddTask} />
      
      <div className="flex-1 overflow-y-auto p-6">
        {tasks.length > 0 ? (
          view === 'project' && selectedProjectId ? (
            <DraggableTaskList
              title=""
              tasks={tasks}
              groupBy={groupBy}
              projectId={selectedProjectId}
            />
          ) : (
            <TaskList
              title=""
              tasks={tasks}
              groupBy={groupBy}
            />
          )
        ) : (
          <EmptyState 
            view={view} 
            onAddTask={onAddTask}
          />
        )}
      </div>
    </div>
  )
}