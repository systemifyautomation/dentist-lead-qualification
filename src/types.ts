export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  practiceName: string;
  practiceSize: string;
  currentChallenges: string;
  budget: string;
  timeline: string;
  notes: string;
  status: 'new' | 'contacted' | 'qualified' | 'unqualified';
  createdAt: string;
}

export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: string;
}
