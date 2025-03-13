
// API service that uses the routes defined in the Swagger documentation

// Base URL for the API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.croisieres.fr' 
  : 'http://localhost:3000';

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Error: ${response.status}`);
  }
  return response.json();
};

// Get all conversations
export const getConversations = async () => {
  const response = await fetch(`${API_BASE_URL}/api/conversations`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// Get conversation messages
export const getMessages = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/messages/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// Send a message
export const sendMessage = async (userId: string, message: string) => {
  const response = await fetch(`${API_BASE_URL}/api/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId, message }),
  });
  const data = await handleResponse(response);
  return {
    messageId: data.messageId,
    content: message,
    sender: 'bot',
    timestamp: new Date(),
    status: { 
      sent: true, 
      delivered: false, 
      read: false, 
      failed: false, 
      timestamp: new Date() 
    }
  };
};

// Delete conversation history
export const deleteConversationHistory = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/conversations/${userId}/history`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// Send template message
export const sendTemplateMessage = async (templateName: string, recipient: string, variables: any) => {
  const response = await fetch(`${API_BASE_URL}/api/templates/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      templateName,
      recipient,
      variables
    }),
  });
  return handleResponse(response);
};

// Get available templates
export const getTemplates = async () => {
  const response = await fetch(`${API_BASE_URL}/api/templates`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// Upload media file
export const uploadMedia = async (file: File, mediaType: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', mediaType);

  const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
};

// Send media message
export const sendMediaMessage = async (
  recipientId: string, 
  mediaType: string, 
  mediaId: string, 
  caption: string = '',
  filename: string = ''
) => {
  const response = await fetch(`${API_BASE_URL}/api/media/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      recipientId,
      mediaType,
      mediaId,
      caption,
      filename
    }),
  });
  return handleResponse(response);
};

// Create new conversation
export const createConversation = async (phoneNumber: string) => {
  // This is a mock since the Swagger doesn't explicitly have a create conversation endpoint
  // In a real implementation, this might be part of the first message sent to a new number
  const response = await sendMessage(phoneNumber, "");
  return {
    id: phoneNumber,
    phoneNumber,
    lastActive: new Date(),
    messageCount: 0,
    isOnline: false,
    lastMessage: ''
  };
};

// Get metrics and statistics
export const getMetrics = async () => {
  const response = await fetch(`${API_BASE_URL}/api/metrics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// Get NPS statistics
export const getNpsStats = async (startDate?: string, endDate?: string) => {
  let url = `${API_BASE_URL}/api/nps/stats`;
  
  if (startDate || endDate) {
    url += '?';
    if (startDate) url += `startDate=${startDate}`;
    if (startDate && endDate) url += '&';
    if (endDate) url += `endDate=${endDate}`;
  }
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// Get appointments
export const getAppointments = async (page: number = 0, limit: number = 20) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments?page=${page}&limit=${limit}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// Get user appointments
export const getUserAppointments = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments/user/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// Create appointment
export const createAppointment = async (
  userId: string,
  appointmentDate: string,
  appointmentTime: string,
  userName: string,
  description: string = '',
  notifyUser: boolean = true
) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      appointmentDate,
      appointmentTime,
      userName,
      description,
      notifyUser
    }),
  });
  return handleResponse(response);
};

// Check system health
export const checkHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};
