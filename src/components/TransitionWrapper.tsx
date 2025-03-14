
import React from 'react';
import { cn } from "@/lib/utils";

interface TransitionWrapperProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade' | 'fade-in' | 'scale' | 'slide-right' | 'slide-left' | 'slide-bottom';
  duration?: 'fast' | 'normal' | 'slow';
  delay?: 'none' | 'short' | 'medium' | 'long';
}

const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  children,
  className,
  animation = 'fade',
  duration = 'normal',
  delay = 'none',
}) => {
  const getAnimationClass = () => {
    switch (animation) {
      case 'fade':
      case 'fade-in': 
        return 'animate-fade-in';
      case 'scale': 
        return 'animate-scale-in';
      case 'slide-right': 
        return 'animate-slide-in-right';
      case 'slide-left': 
        return 'animate-slide-in-left';
      case 'slide-bottom': 
        return 'animate-slide-in-bottom';
      default: 
        return 'animate-fade-in';
    }
  };

  const getDurationClass = () => {
    switch (duration) {
      case 'fast': return 'duration-150';
      case 'normal': return 'duration-300';
      case 'slow': return 'duration-500';
      default: return 'duration-300';
    }
  };

  const getDelayClass = () => {
    switch (delay) {
      case 'none': return 'delay-0';
      case 'short': return 'delay-75';
      case 'medium': return 'delay-150';
      case 'long': return 'delay-300';
      default: return 'delay-0';
    }
  };

  return (
    <div className={cn(
      getAnimationClass(),
      getDurationClass(),
      getDelayClass(),
      className
    )}>
      {children}
    </div>
  );
};

export default TransitionWrapper;
