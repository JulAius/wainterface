
import React from 'react';
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  title?: string;
}

const IconButton: React.FC<IconButtonProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  title,
  ...props
}) => {
  const baseClasses = "rounded-full flex items-center justify-center transition-all duration-200 focus:outline-none";
  
  const variantClasses = {
    default: "text-muted-foreground hover:text-foreground hover:bg-accent/70 hover:backdrop-blur-sm focus:ring-2 focus:ring-primary/20 active:scale-95 border border-transparent hover:border-white/5",
    primary: "bg-whatsapp text-black hover:bg-whatsapp-light focus:ring-2 focus:ring-whatsapp/50 active:scale-95 shadow-md hover:shadow-lg shadow-whatsapp/20",
    danger: "text-destructive hover:bg-destructive/10 focus:ring-2 focus:ring-destructive/20 active:scale-95",
    ghost: "text-muted-foreground hover:text-foreground focus:ring-2 focus:ring-primary/20 active:scale-95"
  };
  
  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-2.5"
  };
  
  const button = (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );

  if (title) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {button}
          </TooltipTrigger>
          <TooltipContent className="glass-morphism border-white/10">
            <p>{title}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

export default IconButton;
