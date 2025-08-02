export interface Technician {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'senior_tech' | 'tech';
  avatar?: string;
  status?: 'active' | 'pending' | 'inactive';
  invitedAt?: Date;
  inviteToken?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  company?: string;
}

export interface Job {
  id: string;
  jobNumber: string;
  title: string;
  description: string;
  customerId: string;
  technicianIds: string[];
  start_time?: string;  // ✅ changed from startTime: Date
  end_time?: string;    // ✅ changed from endTime: Date
  status: 'assigned' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  location?: string;
  quoteNumber?: string;
}


export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'senior_tech' | 'tech';
  avatar?: string;
  status?: 'active' | 'pending' | 'inactive';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface InviteData {
  email: string;
  name: string;
  role: 'admin' | 'senior_tech' | 'tech';
}