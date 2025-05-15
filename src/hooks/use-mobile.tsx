import { useState, useEffect } from 'react'

export function useMobileView() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check initial screen size
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Set on initial load
    checkMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkMobile)
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}