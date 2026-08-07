/**
 * UI display contracts. Data ahora viene de Supabase via hooks en src/lib/queries/.
 * Tipos mantenidos para compatibilidad con componentes existentes.
 */

export type UserRole = 'admin' | 'organization' | 'volunteer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  organization?: string;
  securityQuestion?: string;
  securityAnswer?: string;
}

export interface Organization {
  id: string;
  name: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  documentUrl?: string;
  rejectionMessage?: string;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  city: string;
  location: string;
  organizationId: string;
  organizationName: string;
  published: boolean;
  applicants: string[];
}

export interface ForumMessage {
  id: string;
  title: string;
  message: string;
  authorName: string;
  authorRole: UserRole;
  organizationId: string;
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  authorName: string;
  organizationId: string;
  organizationName: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  volunteerName: string;
  activityTitle: string;
  completedDate: string;
  status: 'completed' | 'pending';
}
