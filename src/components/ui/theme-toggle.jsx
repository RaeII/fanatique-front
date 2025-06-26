import { Moon, Sun } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useTheme } from '../../lib/theme'

export function ThemeToggle({ className }) {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme('dark')
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "w-10 h-10 rounded-full flex items-center justify-center bg-black/10 dark:bg-black/30 text-foreground dark:text-white transition-colors",
        className
      )}
      aria-label={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
    >
      {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
} 