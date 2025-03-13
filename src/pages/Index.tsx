
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getConversations, checkHealth } from '../services/api';
import { toast } from "sonner";
import Conversation from '../components/Conversation';
import ChatInterface from '../components/ChatInterface';
import SidebarHeader from '../components/SidebarHeader';
import TransitionWrapper from '../components/TransitionWrapper';
import Dashboard from '../components/Dashboard';
import AppointmentsCalendar from '../components/AppointmentsCalendar';
import NewConversation from '../components/NewConversation';
import MediaSender from '../components/MediaSender';
import TemplateSender from '../components/TemplateSender';
import { Activity, AlertCircle } from 'lucide-react';

// Filter out this specific phone number
const FILTERED_PHONE_NUMBER = "605370542649440";

const Index = () => {
  // State
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [showTemplateSender, setShowTemplateSender] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showDistributionList, setShowDistributionList] = useState(false);
  const [showMediaSender, setShowMediaSender] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showAppointmentsCalendar, setShowAppointmentsCalendar] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  // Check API health - updated to use proper React Query v5 syntax
  const { data: healthData, isError: healthError } = useQuery({
    queryKey: ['health'],
    queryFn: checkHealth,
    retry: 2,
    refetchInterval: 30000, // Check health every 30 seconds
    // Using onSuccess and onError via meta to match latest React Query API
    meta: {
      onSuccess: () => {
        if (isOffline) {
          setIsOffline(false);
          toast.success("Connexion rétablie", {
            description: "Le serveur est de nouveau accessible",
          });
        }
      },
      onError: () => {
        setIsOffline(true);
        toast.error("Impossible de se connecter au serveur", {
          description: "Vérifiez votre connexion et réessayez",
          icon: <AlertCircle className="h-5 w-5 text-destructive" />
        });
      }
    }
  });

  // Handle health check responses manually since the meta approach may not be fully compatible
  useEffect(() => {
    if (healthError && !isOffline) {
      setIsOffline(true);
      toast.error("Impossible de se connecter au serveur", {
        description: "Vérifiez votre connexion et réessayez",
        icon: <AlertCircle className="h-5 w-5 text-destructive" />
      });
    } else if (healthData && isOffline) {
      setIsOffline(false);
      toast.success("Connexion rétablie", {
        description: "Le serveur est de nouveau accessible",
      });
    }
  }, [healthData, healthError, isOffline]);

  // Fetch conversations
  const { data: conversations = [], refetch, isLoading, isError } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchInterval: 5000,
    enabled: !isOffline,
    select: (data) => data
      .filter((conv: any) => conv.id !== FILTERED_PHONE_NUMBER && conv.phoneNumber !== FILTERED_PHONE_NUMBER)
      .map((conv: any) => ({
        ...conv,
        lastActive: new Date(conv.lastActive),
        messageCount: Number(conv.messageCount) || 0,
        displayName: conv.phoneNumber || `+${conv.id}`,
        lastMessage: conv.lastMessage || 'No messages'
      }))
  });

  // Mock modal components that we'd implement in a real app
  const ModalPlaceholder = ({ title, onClose }: { title: string, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-morphism border border-white/10 rounded-xl p-6 max-w-md w-full shadow-neon">
        <h2 className="text-xl font-medium mb-4">{title}</h2>
        <p className="text-muted-foreground mb-6">This is a placeholder for the {title} component.</p>
        <div className="flex justify-end">
          <button className="bg-whatsapp text-white px-4 py-2 rounded-lg shadow-neon hover:bg-whatsapp-light" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  // Display Dashboard or Calendar when selected
  if (showDashboard) {
    return <Dashboard onClose={() => setShowDashboard(false)} />;
  }

  if (showAppointmentsCalendar) {
    return <AppointmentsCalendar onClose={() => setShowAppointmentsCalendar(false)} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Offline Indicator */}
      {isOffline && (
        <div className="absolute top-0 left-0 right-0 bg-destructive/80 text-white py-1 px-4 z-50 flex items-center justify-center space-x-2 backdrop-blur-sm">
          <Activity className="h-4 w-4 animate-pulse" />
          <span className="text-sm">Connexion au serveur perdue. Tentative de reconnexion...</span>
        </div>
      )}
      
      {/* Sidebar */}
      <TransitionWrapper animation="slide-right" className="w-80 h-full flex flex-col border-r border-border bg-card/80 backdrop-blur-sm">
        <SidebarHeader 
          onNewConversation={() => setShowNewConversation(true)}
          onShowDistributionList={() => setShowDistributionList(true)}
          onShowDashboard={() => setShowDashboard(true)}
          onShowCalendar={() => setShowAppointmentsCalendar(true)}
        />
        
        <div className="overflow-y-auto flex-1 scrollbar-thin">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-8 h-8 border-2 border-whatsapp/20 border-t-whatsapp rounded-full animate-spin" />
              <p className="text-muted-foreground text-sm">Chargement des conversations...</p>
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <h3 className="font-medium">Erreur de chargement</h3>
              <p className="text-muted-foreground text-sm mb-4">Impossible de récupérer les conversations</p>
              <button 
                onClick={() => refetch()} 
                className="bg-card hover:bg-accent/50 text-sm px-3 py-2 rounded-md transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <p className="text-muted-foreground">Aucune conversation disponible</p>
              <button 
                onClick={() => setShowNewConversation(true)} 
                className="mt-4 bg-whatsapp hover:bg-whatsapp-light text-white text-sm px-3 py-2 rounded-md transition-colors"
              >
                Nouvelle conversation
              </button>
            </div>
          ) : (
            conversations.map((conv: any) => (
              <Conversation
                key={conv.id}
                id={conv.id}
                lastActive={conv.lastActive}
                messageCount={conv.messageCount}
                isOnline={conv.isOnline}
                isSelected={selectedChat?.id === conv.id}
                lastMessage={conv.lastMessage}
                onClick={() => setSelectedChat(conv)}
              />
            ))
          )}
        </div>
      </TransitionWrapper>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full">
        <ChatInterface
          selectedChat={selectedChat}
          onShowTemplateSender={() => setShowTemplateSender(true)}
          onShowMediaSender={() => setShowMediaSender(true)}
          onShowDashboard={() => setShowDashboard(true)}
          onShowCalendar={() => setShowAppointmentsCalendar(true)}
        />
      </div>

      {/* Modals */}
      {showTemplateSender && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <TemplateSender 
            selectedChat={selectedChat}
            onClose={() => setShowTemplateSender(false)} 
          />
        </div>
      )}

      {showNewConversation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <NewConversation 
            onClose={() => setShowNewConversation(false)}
            onSuccess={() => {
              setShowNewConversation(false);
              refetch();
            }}
          />
        </div>
      )}

      {showMediaSender && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <MediaSender 
            selectedChat={selectedChat}
            onClose={() => setShowMediaSender(false)} 
          />
        </div>
      )}
      
      {showDistributionList && (
        <ModalPlaceholder 
          title="Distribution Lists" 
          onClose={() => setShowDistributionList(false)} 
        />
      )}
    </div>
  );
};

export default Index;
