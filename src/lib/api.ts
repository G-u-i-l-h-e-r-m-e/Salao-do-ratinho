// URL base da API externa (Render)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api-salao-do-ratinho.onrender.com';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro de conexão com a API',
    };
  }
}

export const api = {
  // Clients
  getClients: () => apiRequest<any[]>('/api/clients'),
  getClient: (id: string) => apiRequest<any>(`/api/clients/${id}`),
  createClient: (data: any) =>
    apiRequest<any>('/api/clients', { method: 'POST', body: JSON.stringify(data) }),
  updateClient: (id: string, data: any) =>
    apiRequest<any>(`/api/clients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteClient: (id: string) =>
    apiRequest<void>(`/api/clients/${id}`, { method: 'DELETE' }),

  // Services
  getServices: () => apiRequest<any[]>('/api/services'),
  createService: (data: any) =>
    apiRequest<any>('/api/services', { method: 'POST', body: JSON.stringify(data) }),
  updateService: (id: string, data: any) =>
    apiRequest<any>(`/api/services/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteService: (id: string) =>
    apiRequest<void>(`/api/services/${id}`, { method: 'DELETE' }),

  // Appointments
  getAppointments: (date?: string) =>
    apiRequest<any[]>(`/api/appointments${date ? `?date=${date}` : ''}`),
  createAppointment: (data: any) =>
    apiRequest<any>('/api/appointments', { method: 'POST', body: JSON.stringify(data) }),
  updateAppointment: (id: string, data: any) =>
    apiRequest<any>(`/api/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAppointment: (id: string) =>
    apiRequest<void>(`/api/appointments/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiRequest<any[]>(`/api/transactions${query ? `?${query}` : ''}`);
  },
  getTransactionsSummary: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const query = params.toString();
    return apiRequest<any>(`/api/transactions/summary${query ? `?${query}` : ''}`);
  },
  createTransaction: (data: any) =>
    apiRequest<any>('/api/transactions', { method: 'POST', body: JSON.stringify(data) }),
  updateTransaction: (id: string, data: any) =>
    apiRequest<any>(`/api/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTransaction: (id: string) =>
    apiRequest<void>(`/api/transactions/${id}`, { method: 'DELETE' }),
};
