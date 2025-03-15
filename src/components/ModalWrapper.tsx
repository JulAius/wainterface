
import React from 'react';

interface ModalWrapperProps {
  title: string;
  onClose: () => void;
}

const ModalWrapper: React.FC<React.PropsWithChildren<ModalWrapperProps>> = ({ 
  title, 
  onClose,
  children 
}) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl p-6 max-w-md w-full shadow-xl border border-border">
        <h2 className="text-xl font-medium mb-4 text-foreground">{title}</h2>
        {children || (
          <p className="text-muted-foreground mb-6">This is a placeholder for the {title} component.</p>
        )}
        <div className="flex justify-end">
          <button className="whatsapp-button-primary px-4 py-2" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default ModalWrapper;
