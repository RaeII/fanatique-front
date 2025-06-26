import { forwardRef } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '../../lib/utils'

const Button = forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-secondary disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-primary text-black hover:bg-primary/90': variant === 'default',
          'bg-secondary text-black hover:bg-secondary/90': variant === 'secondary',
          'bg-transparent border border-primary hover:bg-primary/10 text-black': variant === 'outline',
          'bg-transparent text-black hover:bg-primary/10': variant === 'ghost',
          'h-9 px-4 py-2': size === 'default',
          'h-7 px-2 rounded-md text-sm': size === 'sm',
          'h-11 px-8 rounded-md': size === 'lg',
        },
        className
      )}
      ref={ref}
      {...props}
    />
  )
})

Button.displayName = 'Button'

export { Button } 