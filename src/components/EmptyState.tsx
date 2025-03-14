
import React from 'react';
import { LucideIcon } from 'lucide-react';
import TransitionWrapper from './TransitionWrapper';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action: () => void;
  actionLabel: string;
  actionIcon: LucideIcon;
  onShowDashboard: () => void;
  onShowCalendar: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  actionIcon: ActionIcon,
  onShowDashboard,
  onShowCalendar
}) => {
  return (
    <TransitionWrapper animation="fade" className="flex flex-col items-center justify-center h-full">
      <div className="w-32 h-32 rounded-full bg-accent/30 flex items-center justify-center mb-6">
        <Icon className="w-16 h-16 text-muted-foreground" />
      </div>
      
      <h2 className="text-xl font-medium text-foreground mb-2">
        {title}
      </h2>
      
      <p className="text-muted-foreground mb-8 text-center max-w-sm">
        {description}
      </p>
      
      <div className="flex space-x-4">
        <button
          onClick={action}
          className="primary-button flex items-center"
        >
          <ActionIcon className="w-4 h-4 mr-2" />
          {actionLabel}
        </button>
        
        <button
          onClick={onShowCalendar}
          className="secondary-button flex items-center"
        >
          <ActionIcon className="w-4 h-4 mr-2" />
          View Calendar
        </button>
      </div>
    </TransitionWrapper>
  );
};

export default EmptyState;
