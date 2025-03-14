
import React, { useEffect, useState } from 'react';
import { getUserNpsResponses, getUserAppointments, getAppointmentDetails } from '../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  User, 
  Calendar, 
  Star, 
  Phone, 
  Clock, 
  MessageSquare,
  ChevronRight,
  X
} from 'lucide-react';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';
import TransitionWrapper from './TransitionWrapper';

interface ClientInfoPanelProps {
  selectedChat: any;
  onClose: () => void;
}

const ClientInfoPanel: React.FC<ClientInfoPanelProps> = ({ selectedChat, onClose }) => {
  const [npsData, setNpsData] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedChat?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    const fetchClientData = async () => {
      try {
        // Récupérer les données NPS du client
        const npsResponses = await getUserNpsResponses(selectedChat.id);
        setNpsData(npsResponses.length > 0 ? npsResponses[0] : null);
        
        // Récupérer les rendez-vous du client
        const userAppointments = await getUserAppointments(selectedChat.id);
        setAppointments(userAppointments);
      } catch (err) {
        console.error('Erreur récupération données client:', err);
        setError('Impossible de récupérer les informations client');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClientData();
  }, [selectedChat?.id]);

  if (!selectedChat) {
    return null;
  }

  return (
    <TransitionWrapper animation="slide-left" className="h-full w-80 border-l border-border bg-card/80 backdrop-blur-sm flex flex-col">
      {/* En-tête */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <User className="h-5 w-5 text-whatsapp" />
          <h3 className="font-medium">Informations client</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {/* Informations de base */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Informations de contact</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>+{selectedChat.id}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>{selectedChat.messageCount || 0} messages</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Dernier contact: {selectedChat.lastActive ? format(new Date(selectedChat.lastActive), 'dd MMM yyyy, HH:mm', { locale: fr }) : 'Inconnu'}</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          {/* Satisfaction client */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Satisfaction client</h4>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 border-2 border-whatsapp border-t-transparent rounded-full animate-spin" />
              </div>
            ) : npsData ? (
              <div className="bg-card rounded-lg p-3 border border-border/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Score NPS</span>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{npsData.score}/10</span>
                  </div>
                </div>
                {npsData.feedback && (
                  <p className="text-xs text-muted-foreground italic">"{npsData.feedback}"</p>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  {npsData.date && format(new Date(npsData.date), 'dd MMM yyyy', { locale: fr })}
                </div>
              </div>
            ) : error ? (
              <div className="text-sm text-muted-foreground">Erreur: {error}</div>
            ) : (
              <div className="text-sm text-muted-foreground">Aucune information de satisfaction disponible</div>
            )}
          </div>
          
          <Separator />
          
          {/* Rendez-vous */}
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-3">Rendez-vous</h4>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="h-5 w-5 border-2 border-whatsapp border-t-transparent rounded-full animate-spin" />
              </div>
            ) : appointments.length > 0 ? (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div key={appointment.id} className="bg-card rounded-lg p-3 border border-border/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-whatsapp" />
                      <span className="font-medium text-sm">
                        {format(new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`), 'EEEE d MMMM', { locale: fr })}
                      </span>
                    </div>
                    <div className="text-sm">
                      {format(new Date(`${appointment.appointmentDate}T${appointment.appointmentTime}`), 'HH:mm', { locale: fr })}
                    </div>
                    {appointment.description && (
                      <p className="text-xs text-muted-foreground mt-2">{appointment.description}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between text-xs">
                      <span className={`px-2 py-0.5 rounded-full ${
                        appointment.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-500' :
                        appointment.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                        'bg-blue-500/20 text-blue-500'
                      }`}>
                        {appointment.status === 'confirmed' ? 'Confirmé' :
                         appointment.status === 'cancelled' ? 'Annulé' :
                         'Planifié'}
                      </span>
                      <Button variant="ghost" size="sm" className="h-6 px-2">
                        <span className="text-xs">Détails</span>
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-sm text-muted-foreground">Erreur: {error}</div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
                <Calendar className="h-12 w-12 mb-2 opacity-20" />
                <span className="text-sm">Aucun rendez-vous</span>
                <Button variant="outline" size="sm" className="mt-3">
                  Planifier un rendez-vous
                </Button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </TransitionWrapper>
  );
};

export default ClientInfoPanel;
