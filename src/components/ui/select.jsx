import React from "react";

export const Select = ({ value, onValueChange, children, ...props }) => {
  return (
    <div className="relative">
      <select 
        value={value} 
        onChange={(e) => onValueChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
      >
        {children}
      </select>
    </div>
  );
};

// Componentes dummy para manter a compatibilidade com a API existente
export const SelectTrigger = () => null;
export const SelectValue = () => null;
export const SelectContent = ({ children }) => children;
export const SelectItem = ({ value, children }) => (
  <option value={value}>{children}</option>
);

export default Select; 