
// API service aligned with the Swagger documentation

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

// -------------------- Conversations API ----------------------

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

// -------------------- Messages API ----------------------

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
  return handleResponse(response);
};

// Check message status
export const checkMessageStatus = async (messageId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/messages/status/${messageId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// Mark message as read
export const markMessageAsRead = async (messageId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/messages/read/${messageId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// -------------------- Media API ----------------------

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

// Download media
export const downloadMedia = async (mediaId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/media/${mediaId}/download`, {
    method: 'GET',
  });
  return response;
};

// Get media info
export const getMediaInfo = async (mediaId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/media/${mediaId}/info`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// -------------------- Templates API ----------------------

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

// -------------------- Appointments API ----------------------

// Get all appointments
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

// Get appointment details
export const getAppointmentDetails = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
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

// Update appointment
export const updateAppointment = async (
  id: number,
  data: {
    appointmentDate?: string;
    appointmentTime?: string;
    userName?: string;
    description?: string;
    notifyUser?: boolean;
  }
) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

// Cancel appointment
export const cancelAppointment = async (id: number, notifyUser: boolean = true) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments/${id}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ notifyUser }),
  });
  return handleResponse(response);
};

// Send appointment reminder
export const sendAppointmentReminder = async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments/${id}/remind`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// Get available appointment slots
export const getAppointmentSlots = async (date: string) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments/slots/${date}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// -------------------- NPS API ----------------------

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

// Get NPS feedbacks
export const getNpsFeedbacks = async (category?: string, limit: number = 100) => {
  let url = `${API_BASE_URL}/api/nps/feedbacks?limit=${limit}`;
  if (category) url += `&category=${category}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// Trigger NPS survey
export const triggerNpsSurvey = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/nps/trigger/${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// Get user NPS responses
export const getUserNpsResponses = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/nps/user/${userId}/responses`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return handleResponse(response);
};

// -------------------- Metrics & System API ----------------------

// Get metrics
export const getMetrics = async () => {
  const response = await fetch(`${API_BASE_URL}/api/metrics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
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

// Create new conversation (mock since there's no specific endpoint for this)
export const createConversation = async (phoneNumber: string) => {
  // In a real implementation, this would use the first message sent to a new number
  // to create the conversation
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
