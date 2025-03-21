
import React, { useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMessages, sendMessage, deleteConversationHistory } from '../services/api';
import ChatHeader from './ChatHeader';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import EmptyState from './EmptyState';
import TransitionWrapper from './TransitionWrapper';

interface ChatInterfaceProps {
  selectedChat: any | null;
  onShowTemplateSender: () => void;
  onShowMediaSender: () => void;
  onShowDashboard: () => void;
  onShowCalendar: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  selectedChat,
  onShowTemplateSender,
  onShowMediaSender,
  onShowDashboard,
  onShowCalendar
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  
  // Query for messages using the proper API endpoint
  const { data: messages = [] } = useQuery({
    queryKey: ['messages', selectedChat?.id],
    queryFn: () => getMessages(selectedChat.id),
    enabled: !!selectedChat,
    refetchInterval: selectedChat ? 5000 : false,
    select: (data) => data.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
      preview: msg.preview ? {
        type: msg.preview.type,
        id: msg.preview.id,
        caption: msg.preview.caption,
        mime_type: msg.preview.mime_type
      } : null
    }))
  });

  // Send message mutation using the proper API endpoint
  const sendMessageMutation = useMutation({
    mutationFn: ({ userId, message }: { userId: string, message: string }) => sendMessage(userId, message),
    onMutate: async (newMessage) => {
      await queryClient.cancelQueries({ queryKey: ['messages', selectedChat.id] });
      const previousMessages = queryClient.getQueryData(['messages', selectedChat.id]);
      
      const tempMessage = {
        content: newMessage.message,
        sender: 'bot',
        timestamp: new Date(),
        status: { sent: true, delivered: false, read: false, failed: false, timestamp: null },
        messageId: `temp-${Date.now()}`,
        preview: null,
      };
      
      queryClient.setQueryData(['messages', selectedChat.id], (old: any[] = []) => [
        ...old,
        tempMessage,
      ]);
      
      return { previousMessages, tempMessage };
    },
    onError: (err, newMessage, context: any) => {
      queryClient.setQueryData(['messages', selectedChat.id], context.previousMessages);
    },
    onSuccess: (data, variables, context: any) => {
      // Update the temp message with the real message data
      queryClient.setQueryData(['messages', selectedChat.id], (old: any[] = []) => {
        return old.map(msg => 
          msg.messageId === context.tempMessage.messageId
            ? { 
                ...msg, 
                messageId: data.messageId || data.messageId,
                status: { 
                  sent: true, 
                  delivered: false, 
                  read: false, 
                  failed: false, 
                  timestamp: new Date() 
                }
              }
            : msg
        );
      });
      
      // Refresh the conversations list to reflect the new message
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  // Delete history mutation using the proper API endpoint
  const deleteHistoryMutation = useMutation({
    mutationFn: deleteConversationHistory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedChat.id] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || !selectedChat) return;
    
    try {
      await sendMessageMutation.mutateAsync({
        userId: selectedChat.id,
        message: message.trim()
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteHistory = async () => {
    if (!selectedChat) return;
    
    if (window.confirm('Are you sure you want to delete all conversation history?')) {
      try {
        await deleteHistoryMutation.mutateAsync(selectedChat.id);
      } catch (error) {
        console.error('Error deleting history:', error);
        alert('Error deleting conversation history');
      }
    }
  };

  if (!selectedChat) {
    return (
      <EmptyState 
        onShowDashboard={onShowDashboard}
        onShowCalendar={onShowCalendar}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader
        chatId={selectedChat.id}
        isOnline={selectedChat.isOnline}
        onShowDashboard={onShowDashboard}
        onShowCalendar={onShowCalendar}
        onDeleteHistory={handleDeleteHistory}
        isDeleting={deleteHistoryMutation.isPending}
      />
      
      <TransitionWrapper animation="fade" className="flex-1 overflow-y-auto px-4 py-6 chatbox-bg scrollbar-thin">
        <div className="space-y-1 max-w-3xl mx-auto">
          {messages.map((msg: any, index: number) => (
            <MessageBubble
              key={msg.messageId || index}
              content={msg.content}
              sender={msg.sender === 'user' ? 'user' : 'bot'}
              timestamp={new Date(msg.timestamp)}
              status={msg.status}
              preview={msg.preview}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </TransitionWrapper>
      
      <MessageInput
        onSendMessage={handleSendMessage}
        onShowTemplates={onShowTemplateSender}
        onShowMediaSender={onShowMediaSender}
        isLoading={sendMessageMutation.isPending}
      />
    </div>
  );
};

export default ChatInterface;
