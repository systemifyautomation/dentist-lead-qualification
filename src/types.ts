export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  leadType: 'appointment' | 'emergency' | 'question'; // Type de demande
  status: 'new' | 'contacted' | 'qualified' | 'scheduled' | 'no-show' | 'completed';
  description?: string;
  reminderSent?: boolean;
  reminderDate?: string;
  dateVisite?: string;
  updatedAt?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}
