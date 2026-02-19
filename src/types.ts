export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  leadType: 'appointment' | 'emergency' | 'question'; // Type de demande
  status: 'phone-unconfirmed' | 'phone-confirmed' | 'canceled' | 'no-show' | 'completed';
  description?: string;
  calendarUrl?: string;
  calendarId?: string;
  rescheduleUrl?: string;
  cancelUrl?: string;
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
