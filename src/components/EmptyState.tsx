
import React from 'react';
import { BarChart2, Calendar } from 'lucide-react';
import TransitionWrapper from './TransitionWrapper';

interface EmptyStateProps {
  onShowDashboard: () => void;
  onShowCalendar: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  onShowDashboard,
  onShowCalendar
}) => {
  return (
    <TransitionWrapper animation="fade" className="flex flex-col items-center justify-center h-full">
      <div className="w-32 h-32 rounded-full bg-accent/30 flex items-center justify-center mb-6">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          className="w-16 h-16 text-muted-foreground"
        >
          <path 
            fill="currentColor" 
            d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"
          />
        </svg>
      </div>
      
      <h2 className="text-xl font-medium text-foreground mb-2">
        Select a conversation
      </h2>
      
      <p className="text-muted-foreground mb-8 text-center max-w-sm">
        Choose a conversation from the list or start a new one to begin messaging
      </p>
      
      <div className="flex space-x-4">
        <button
          onClick={onShowDashboard}
          className="primary-button flex items-center"
        >
          <BarChart2 className="w-4 h-4 mr-2" />
          View Dashboard
        </button>
        
        <button
          onClick={onShowCalendar}
          className="secondary-button flex items-center"
        >
          <Calendar className="w-4 h-4 mr-2" />
          View Calendar
        </button>
      </div>
    </TransitionWrapper>
  );
};

export default EmptyState;
