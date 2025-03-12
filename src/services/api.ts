
// Mock API service with simulated network delays

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Get all conversations
export const getConversations = async () => {
  await delay(500);
  return [
    {
      id: '14155552671',
      phoneNumber: '14155552671',
      lastActive: new Date(),
      messageCount: 24,
      isOnline: true,
      lastMessage: 'Thank you for your help!'
    },
    {
      id: '14155552672',
      phoneNumber: '14155552672',
      lastActive: new Date(Date.now() - 3600000),
      messageCount: 15,
      isOnline: false,
      lastMessage: 'I need more information about your product'
    },
    {
      id: '14155552673',
      phoneNumber: '14155552673',
      lastActive: new Date(Date.now() - 7200000),
      messageCount: 8,
      isOnline: false,
      lastMessage: 'When will my order be shipped?'
    },
    {
      id: '14155552674',
      phoneNumber: '14155552674',
      lastActive: new Date(Date.now() - 86400000),
      messageCount: 32,
      isOnline: true,
      lastMessage: 'Can I get a refund?'
    },
    {
      id: '14155552675',
      phoneNumber: '14155552675',
      lastActive: new Date(Date.now() - 172800000),
      messageCount: 5,
      isOnline: false,
      lastMessage: 'I have a question about my order'
    }
  ];
};

// Get conversation messages
export const getMessages = async (userId: string) => {
  await delay(300);
  const commonMessages = [
    {
      messageId: '1',
      content: 'Hello, how can I help you today?',
      sender: 'bot',
      timestamp: new Date(Date.now() - 3600000),
      status: { sent: true, delivered: true, read: true, failed: false, timestamp: new Date() }
    },
    {
      messageId: '2',
      content: 'I have a question about your product',
      sender: 'user',
      timestamp: new Date(Date.now() - 3500000)
    },
    {
      messageId: '3',
      content: 'Of course, I\'d be happy to answer any questions you have. What would you like to know?',
      sender: 'bot',
      timestamp: new Date(Date.now() - 3400000),
      status: { sent: true, delivered: true, read: true, failed: false, timestamp: new Date() }
    },
    {
      messageId: '4',
      content: 'What are the available sizes?',
      sender: 'user',
      timestamp: new Date(Date.now() - 3300000)
    },
    {
      messageId: '5',
      content: 'We offer Small, Medium, Large, and Extra Large sizes. All of our products have a detailed size guide on their product page.',
      sender: 'bot',
      timestamp: new Date(Date.now() - 3200000),
      status: { sent: true, delivered: true, read: true, failed: false, timestamp: new Date() }
    },
    {
      messageId: '6',
      content: 'Great, thanks!',
      sender: 'user',
      timestamp: new Date(Date.now() - 3100000)
    },
    {
      messageId: '7',
      content: 'You\'re welcome! Is there anything else I can help you with today?',
      sender: 'bot',
      timestamp: new Date(Date.now() - 3000000),
      status: { sent: true, delivered: true, read: false, failed: false, timestamp: new Date() }
    }
  ];

  // Add a media message for the second user
  if (userId === '14155552672') {
    return [
      ...commonMessages,
      {
        messageId: '8',
        content: '',
        sender: 'bot',
        timestamp: new Date(Date.now() - 2000000),
        status: { sent: true, delivered: true, read: false, failed: false, timestamp: new Date() },
        mediaId: 'img123456',
        type: 'image/jpeg',
        caption: 'Here\'s our product catalog'
      }
    ];
  }

  return commonMessages;
};

// Send a message
export const sendMessage = async (userId: string, message: string) => {
  await delay(800);
  
  // Simulate message sending
  return {
    messageId: `msg-${Date.now()}`,
    content: message,
    sender: 'bot',
    timestamp: new Date(),
    status: { sent: true, delivered: false, read: false, failed: false, timestamp: new Date() }
  };
};

// Delete conversation history
export const deleteConversationHistory = async (userId: string) => {
  await delay(1000);
  return { success: true };
};

// Send template message
export const sendTemplateMessage = async (userId: string, templateId: string, params: any) => {
  await delay(1000);
  return {
    messageId: `template-${Date.now()}`,
    content: `Template message: ${templateId}`,
    sender: 'bot',
    timestamp: new Date(),
    status: { sent: true, delivered: false, read: false, failed: false, timestamp: new Date() }
  };
};

// Send media message
export const sendMediaMessage = async (userId: string, mediaType: string, mediaId: string, caption: string) => {
  await delay(1500);
  return {
    messageId: `media-${Date.now()}`,
    content: '',
    sender: 'bot',
    timestamp: new Date(),
    status: { sent: true, delivered: false, read: false, failed: false, timestamp: new Date() },
    mediaId,
    type: mediaType,
    caption
  };
};

// Create new conversation
export const createConversation = async (phoneNumber: string) => {
  await delay(1000);
  return {
    id: phoneNumber,
    phoneNumber,
    lastActive: new Date(),
    messageCount: 0,
    isOnline: false,
    lastMessage: ''
  };
};

// Create distribution list
export const createDistributionList = async (name: string, members: string[]) => {
  await delay(1000);
  return {
    id: `list-${Date.now()}`,
    name,
    members,
    createdAt: new Date()
  };
};
