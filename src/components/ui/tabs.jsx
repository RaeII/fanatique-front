import { forwardRef, useState, useEffect, createContext, useContext } from 'react'
import { cn } from '../../lib/utils'

const TabsContext = createContext({ activeTab: null, setActiveTab: () => {} })

const Tabs = forwardRef(({ className, value, onValueChange, defaultValue, children, ...props }, ref) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue || null)
  
  useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value)
    }
  }, [value])
  
  const handleValueChange = (newValue) => {
    if (value === undefined) {
      setActiveTab(newValue)
    }
    if (onValueChange) {
      onValueChange(newValue)
    }
  }
  
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleValueChange }}>
      <div 
        className={cn("w-full", className)} 
        ref={ref}
        {...props}
      >
        {children}
      </div>
    </TabsContext.Provider>
  )
})

Tabs.displayName = 'Tabs'

const TabsList = forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div 
      className={cn(
        "flex flex-wrap items-center justify-start w-full rounded-md bg-muted/30 dark:bg-muted/10 p-1 text-muted-foreground",
        className
      )} 
      ref={ref}
      role="tablist"
      {...props}
    >
      {children}
    </div>
  )
})

TabsList.displayName = 'TabsList'

const TabsTrigger = forwardRef(({ className, value, children, ...props }, ref) => {
  const { activeTab, setActiveTab } = useContext(TabsContext)
  const isActive = activeTab === value
  
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        "hover:bg-background/50 dark:hover:bg-background/10 hover:text-foreground",
        isActive ? "bg-background dark:bg-background/20 text-foreground shadow-sm" : "text-muted-foreground",
        className
      )}
      ref={ref}
      role="tab"
      data-state={isActive ? "active" : "inactive"}
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      {...props}
    >
      {children}
    </button>
  )
})

TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = forwardRef(({ className, value, children, ...props }, ref) => {
  const { activeTab } = useContext(TabsContext)
  const isActive = activeTab === value
  
  if (!isActive) return null
  
  return (
    <div
      className={cn(
        "mt-2 ring-offset-background focus-visible:outline-none",
        className
      )}
      ref={ref}
      role="tabpanel"
      data-state={isActive ? "active" : "inactive"}
      aria-hidden={!isActive}
      tabIndex={isActive ? 0 : -1}
      {...props}
    >
      {children}
    </div>
  )
})

TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent } 
