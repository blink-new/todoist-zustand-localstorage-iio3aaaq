import { Plus, Search, SlidersHorizontal, X } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { useState, useEffect } from 'react'
import { cn } from '../lib/utils'
import { useMobileView } from '../hooks/use-mobile'

interface HeaderProps {
  title: string
  onAddTask: () => void
}

export function Header({ title, onAddTask }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const isMobile = useMobileView()

  useEffect(() => {
    // Reset search state when changing views
    setIsSearchOpen(false)
    setSearchTerm('')
  }, [title])

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E5E5EA] bg-white/90 p-4 backdrop-blur-sm">
      {isSearchOpen ? (
        <div className="flex flex-1 items-center gap-2">
          <Input
            type="text"
            placeholder="Search tasks..."
            className="flex-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSearchOpen(false)}
            className="text-[#86868B] hover:text-[#1D1D1F]"
          >
            <X size={20} />
          </Button>
        </div>
      ) : (
        <>
          {!isMobile && (
            <h1 className="text-2xl font-semibold text-[#1D1D1F]">{title}</h1>
          )}
          
          <div className={cn("flex items-center gap-2", !isMobile && "ml-auto")}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="text-[#86868B] hover:text-[#1D1D1F]"
            >
              <Search size={20} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-[#86868B] hover:text-[#1D1D1F]"
            >
              <SlidersHorizontal size={20} />
            </Button>
            
            <Button 
              onClick={onAddTask}
              className="gap-2 bg-[#0077ED] hover:bg-[#0066CC] transition-colors"
            >
              <Plus size={18} />
              <span className={cn(isMobile && "sr-only")}>Add Task</span>
            </Button>
          </div>
        </>
      )}
    </header>
  )
}