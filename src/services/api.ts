
// API service with proper endpoints based on the Swagger documentation

const API_BASE_URL = 'http://localhost:3000'; // Can be changed to production URL

// Helper to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'An error occurred');
  }
  return response.json();
};

// Get all conversations
export const getConversations = async () => {
  const response = await fetch(`${API_BASE_URL}/api/conversations`);
  return handleResponse(response);
};

// Get conversation messages
export const getMessages = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/messages/${userId}`);
  return handleResponse(response);
};

// Send a message
export const sendMessage = async (userId: string, message: string) => {
  const response = await fetch(`${API_BASE_URL}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, message })
  });
  return handleResponse(response);
};

// Delete conversation history
export const deleteConversationHistory = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/conversations/${userId}/history`, {
    method: 'DELETE'
  });
  return handleResponse(response);
};

// Get templates
export const getTemplates = async () => {
  const response = await fetch(`${API_BASE_URL}/api/templates`);
  return handleResponse(response);
};

// Send template message
export const sendTemplateMessage = async (templateName: string, recipient: string, variables: any) => {
  const response = await fetch(`${API_BASE_URL}/api/templates/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      templateName, 
      recipient, 
      variables 
    })
  });
  return handleResponse(response);
};

// Upload media
export const uploadMedia = async (file: File, type: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);
  
  const response = await fetch(`${API_BASE_URL}/api/media/upload`, {
    method: 'POST',
    body: formData
  });
  return handleResponse(response);
};

// Send media message
export const sendMediaMessage = async (recipientId: string, mediaType: string, mediaId: string, caption: string = '') => {
  const response = await fetch(`${API_BASE_URL}/api/media/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      recipientId, 
      mediaType, 
      mediaId, 
      caption 
    })
  });
  return handleResponse(response);
};

// Get appointments
export const getAppointments = async (page: number = 0, limit: number = 20) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments?page=${page}&limit=${limit}`);
  return handleResponse(response);
};

// Get appointments for a specific user
export const getUserAppointments = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments/user/${userId}`);
  return handleResponse(response);
};

// Create a new appointment
export const createAppointment = async (appointmentData: any) => {
  const response = await fetch(`${API_BASE_URL}/api/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(appointmentData)
  });
  return handleResponse(response);
};

// Get global metrics
export const getMetrics = async () => {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  return handleResponse(response);
};

// Get NPS statistics
export const getNpsStats = async (startDate?: string, endDate?: string) => {
  let url = `${API_BASE_URL}/api/nps/stats`;
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  const response = await fetch(url);
  return handleResponse(response);
};

// Create a new conversation (not directly specified in Swagger, but implied)
export const createConversation = async (phoneNumber: string) => {
  // This is a placeholder since the Swagger doesn't specify a direct endpoint
  // In a real implementation, you might use a different approach or endpoint
  const conversation = {
    id: phoneNumber,
    phoneNumber,
    lastActive: new Date(),
    messageCount: 0,
    isOnline: false,
    lastMessage: ''
  };
  return conversation;
};

// Health check
export const getSystemHealth = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(response);
};
