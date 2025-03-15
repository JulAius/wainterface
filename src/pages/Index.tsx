
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getConversations, getSystemHealth } from '../services/api';
import ChatInterface from '../components/ChatInterface';
import TransitionWrapper from '../components/TransitionWrapper';
import Dashboard from '../components/Dashboard';
import AppointmentsCalendar from '../components/AppointmentsCalendar';
import ConversationList from '../components/ConversationList';
import ModalWrapper from '../components/ModalWrapper';
import { toast } from 'sonner';
import TemplateSender from '../components/TemplateSender';
import NewConversation from '../components/NewConversation';
import MediaSender from '../components/MediaSender';
import DistributionListModal from '../components/DistributionListModal';

// Filter out this specific phone number if needed
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

  // Check API health
  useQuery({
    queryKey: ['health'],
    queryFn: getSystemHealth,
    retry: 3,
    meta: {
      onError: () => {
        toast.error('API connection error', {
          description: 'Could not connect to the server. Please check your connection.',
        });
      }
    }
  });

  // Fetch conversations
  const { data: conversations = [], isError } = useQuery({
    queryKey: ['conversations'],
    queryFn: getConversations,
    refetchInterval: 5000,
    select: (data) => data
      .filter((conv: any) => conv.id !== FILTERED_PHONE_NUMBER && conv.phoneNumber !== FILTERED_PHONE_NUMBER)
      .map((conv: any) => ({
        ...conv,
        lastActive: new Date(conv.lastActive),
        messageCount: Number(conv.messageCount) || 0,
        displayName: conv.phoneNumber || `+${conv.id}`,
        lastMessage: conv.lastMessage || 'No messages'
      })),
    meta: {
      onError: () => {
        toast.error('Error loading conversations', {
          description: 'Failed to load conversations. Please try again later.',
        });
      }
    }
  });

  // Display Dashboard or Calendar when selected
  if (showDashboard) {
    return <Dashboard onClose={() => setShowDashboard(false)} />;
  }

  if (showAppointmentsCalendar) {
    return <AppointmentsCalendar onClose={() => setShowAppointmentsCalendar(false)} />;
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar with Conversations */}
      <ConversationList 
        conversations={conversations}
        selectedChat={selectedChat}
        onSelectChat={setSelectedChat}
        onNewConversation={() => setShowNewConversation(true)}
        onShowDistributionList={() => setShowDistributionList(true)}
        onShowDashboard={() => setShowDashboard(true)}
        onShowCalendar={() => setShowAppointmentsCalendar(true)}
      />

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
        <ModalWrapper 
          title="Template Sender" 
          onClose={() => setShowTemplateSender(false)} 
        >
          <TemplateSender 
            selectedChat={selectedChat} 
            onClose={() => setShowTemplateSender(false)} 
          />
        </ModalWrapper>
      )}

      {showNewConversation && (
        <ModalWrapper 
          title="New Conversation" 
          onClose={() => setShowNewConversation(false)} 
        >
          <NewConversation 
            onClose={() => setShowNewConversation(false)} 
            onSuccess={() => {
              toast.success("Nouveau message envoyé", {
                description: "Le contact sera affiché dans la liste une fois qu'il aura répondu."
              });
            }}
          />
        </ModalWrapper>
      )}

      {showMediaSender && (
        <ModalWrapper 
          title="Media Sender" 
          onClose={() => setShowMediaSender(false)} 
        >
          <MediaSender 
            selectedChat={selectedChat} 
            onClose={() => setShowMediaSender(false)} 
          />
        </ModalWrapper>
      )}
      
      {showDistributionList && (
        <ModalWrapper 
          title="Distribution Lists" 
          onClose={() => setShowDistributionList(false)} 
        >
          <DistributionListModal 
            onClose={() => setShowDistributionList(false)} 
          />
        </ModalWrapper>
      )}
    </div>
  );
};

export default Index;
