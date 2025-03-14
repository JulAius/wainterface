
import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getMessages, sendMessage, markMessageAsRead } from '../services/api';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import EmptyState from './EmptyState';
import TransitionWrapper from './TransitionWrapper';
import { User, PanelRightOpen, BarChart2, Calendar } from 'lucide-react';

interface ChatInterfaceProps {
  selectedChat: any;
  onShowTemplateSender: () => void;
  onShowMediaSender: () => void;
  onShowDashboard: () => void;
  onShowCalendar: () => void;
  onToggleClientInfo?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  selectedChat,
  onShowTemplateSender,
  onShowMediaSender,
  onShowDashboard,
  onShowCalendar,
  onToggleClientInfo
}) => {
  // State management
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Queries and data fetching
  const {
    data: messages = [],
    isLoading,
    isError,
    refetch: refetchMessages
  } = useQuery({
    queryKey: ['messages', selectedChat?.id],
    queryFn: () => (selectedChat ? getMessages(selectedChat.id) : Promise.resolve([])),
    enabled: !!selectedChat,
    refetchInterval: 3000,
  });

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat) return;
    
    try {
      await sendMessage(selectedChat.id, message);
      setMessage('');
      refetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message', {
        description: 'Please try again later',
      });
    }
  };

  // Mark messages as read
  useEffect(() => {
    if (!selectedChat || !messages.length) return;
    
    const unreadMessages = messages.filter(
      (msg: any) => !msg.read && msg.from !== 'me'
    );
    
    unreadMessages.forEach(async (msg: any) => {
      try {
        await markMessageAsRead(msg.id);
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });
  }, [messages, selectedChat]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Render empty state when no chat is selected
  if (!selectedChat) {
    return (
      <EmptyState
        icon={User}
        title="No conversation selected"
        description="Select a conversation to start chatting"
        action={onShowDashboard}
        actionLabel="View Dashboard"
        actionIcon={BarChart2}
      />
    );
  }

  return (
    <TransitionWrapper animation="fade-in" className="flex flex-col h-full">
      {/* Chat Header with the contact info */}
      <ChatHeader 
        phone={selectedChat.displayName || selectedChat.phoneNumber || `+${selectedChat.id}`}
        isOnline={selectedChat.isOnline}
        onOpenMediaModal={onShowMediaSender}
        onOpenTemplateModal={onShowTemplateSender}
        onShowCalendar={onShowCalendar}
        buttons={[
          {
            icon: PanelRightOpen,
            tooltip: "Informations client",
            onClick: onToggleClientInfo,
          }
        ]}
      />
      
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-2 border-whatsapp/20 border-t-whatsapp rounded-full animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-destructive">Failed to load messages</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          messages.map((msg: any, i: number) => (
            <MessageBubble
              key={msg.id || i}
              message={msg.body || msg.text}
              timestamp={msg.timestamp}
              sender={msg.from === 'me' ? 'me' : 'them'}
              status={msg.status}
              read={msg.read}
              type={msg.type}
              mediaUrl={msg.mediaUrl}
              filename={msg.filename}
              caption={msg.caption}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message Input */}
      <MessageInput
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onSend={handleSendMessage}
        placeholder="Type a message"
        disabled={isLoading || isError}
      />
    </TransitionWrapper>
  );
};

export default ChatInterface;
