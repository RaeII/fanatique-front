import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Avatar component for displaying user images in a round format
 */
export const Avatar = React.forwardRef(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Avatar.displayName = "Avatar"; 