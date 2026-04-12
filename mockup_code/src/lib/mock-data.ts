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

export const mockUsers: User[] = [
  { id: '1', name: 'Admin User', email: 'admin@vms.org', role: 'admin', securityQuestion: 'What is your pet name?', securityAnswer: 'buddy' },
  { id: '2', name: 'Green Earth Foundation', email: 'org@greenearth.org', role: 'organization', organization: 'Green Earth Foundation', securityQuestion: 'What city were you born in?', securityAnswer: 'portland' },
  { id: '3', name: 'Jane Volunteer', email: 'jane@email.com', role: 'volunteer', securityQuestion: 'What is your favorite color?', securityAnswer: 'green' },
];

export const mockOrganizations: Organization[] = [
  { id: 'org1', name: 'Green Earth Foundation', email: 'org@greenearth.org', status: 'approved', createdAt: '2024-01-15' },
  { id: 'org2', name: 'River Cleanup Initiative', email: 'contact@rivercleanup.org', status: 'pending', documentUrl: 'verification.pdf', createdAt: '2024-03-20' },
  { id: 'org3', name: 'Urban Garden Project', email: 'info@urbangarden.org', status: 'pending', createdAt: '2024-04-01' },
  { id: 'org4', name: 'Wildlife Preserve Society', email: 'hello@wildlife.org', status: 'rejected', rejectionMessage: 'Incomplete documentation provided.', createdAt: '2024-02-10' },
];

export const mockOpportunities: Opportunity[] = [
  { id: 'opp1', title: 'Beach Cleanup Drive', description: 'Help us clean the coastline and protect marine life. Gloves and bags provided.', date: '2024-05-15', time: '08:00 AM', city: 'Santa Monica', location: 'Santa Monica Pier', organizationId: 'org1', organizationName: 'Green Earth Foundation', published: true, applicants: ['3'] },
  { id: 'opp2', title: 'Tree Planting Weekend', description: 'Join our tree planting initiative. We aim to plant 500 trees in the local park.', date: '2024-06-01', time: '09:00 AM', city: 'Portland', location: 'Forest Park', organizationId: 'org1', organizationName: 'Green Earth Foundation', published: true, applicants: [] },
  { id: 'opp3', title: 'Community Garden Setup', description: 'Help set up raised beds and irrigation for the new community garden.', date: '2024-05-20', time: '10:00 AM', city: 'Austin', location: 'East Austin Community Center', organizationId: 'org1', organizationName: 'Green Earth Foundation', published: false, applicants: [] },
];

export const mockForumMessages: ForumMessage[] = [
  { id: 'fm1', title: 'Welcome to the Forum!', message: 'This is the official forum for Green Earth Foundation. Share your thoughts and ideas here.', authorName: 'Green Earth Foundation', authorRole: 'organization', organizationId: 'org1', createdAt: '2024-04-01T10:00:00' },
  { id: 'fm2', title: 'Great experience at the beach cleanup!', message: 'Had an amazing time volunteering last weekend. The team was very organized and friendly.', authorName: 'Jane Volunteer', authorRole: 'volunteer', organizationId: 'org1', createdAt: '2024-04-05T14:30:00' },
  { id: 'fm3', title: 'Upcoming events announcement', message: 'We have exciting new opportunities coming up in May. Stay tuned for more details!', authorName: 'Green Earth Foundation', authorRole: 'organization', organizationId: 'org1', createdAt: '2024-04-08T09:15:00' },
];

export const mockBlogPosts: BlogPost[] = [
  { id: 'bp1', title: 'The Impact of Volunteering on Communities', content: 'Volunteering has a profound impact on local communities. From environmental conservation to social welfare, volunteers drive meaningful change every day. Studies show that communities with active volunteer programs experience better outcomes in health, education, and environmental sustainability.\n\nOur organization has seen firsthand how dedicated volunteers transform neighborhoods. Last year alone, our volunteers planted over 2,000 trees, cleaned 15 miles of coastline, and mentored 200 youth in environmental science programs.', authorName: 'Green Earth Foundation', organizationId: 'org1', organizationName: 'Green Earth Foundation', createdAt: '2024-03-15' },
  { id: 'bp2', title: '5 Ways to Start Volunteering Today', content: 'Getting started with volunteering is easier than you think. Here are five simple ways to begin making a difference in your community:\n\n1. Sign up on our platform and browse available opportunities\n2. Start small — even a few hours a month can make a big impact\n3. Find causes that align with your passions and skills\n4. Invite friends and family to join you\n5. Track your progress and celebrate milestones', authorName: 'Green Earth Foundation', organizationId: 'org1', organizationName: 'Green Earth Foundation', createdAt: '2024-04-02' },
];

export const mockCertificates: Certificate[] = [
  { id: 'cert1', volunteerName: 'Jane Volunteer', activityTitle: 'Beach Cleanup Drive', completedDate: '2024-05-15', status: 'completed' },
  { id: 'cert2', volunteerName: 'Jane Volunteer', activityTitle: 'Tree Planting Weekend', completedDate: '2024-06-01', status: 'pending' },
];
