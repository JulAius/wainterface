
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getConversations } from '../services/api';
import ChatInterface from '../components/ChatInterface';
import TransitionWrapper from '../components/TransitionWrapper';
import Dashboard from '../components/Dashboard';
import AppointmentsCalendar from '../components/AppointmentsCalendar';
import ConversationList from '../components/ConversationList';
import ModalWrapper from '../components/ModalWrapper';

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

  // Fetch conversations
  const { data: conversations = [] } = useQuery({
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
      }))
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
        />
      )}

      {showNewConversation && (
        <ModalWrapper 
          title="New Conversation" 
          onClose={() => setShowNewConversation(false)} 
        />
      )}

      {showMediaSender && (
        <ModalWrapper 
          title="Media Sender" 
          onClose={() => setShowMediaSender(false)} 
        />
      )}
      
      {showDistributionList && (
        <ModalWrapper 
          title="Distribution Lists" 
          onClose={() => setShowDistributionList(false)} 
        />
      )}
    </div>
  );
};

export default Index;
