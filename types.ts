
export enum UserRole {
  ADMIN = 'ADMIN',
  OFFICER = 'OFFICER',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Only for creation/storage, not exposed broadly
}

export enum TicketStatus {
  NEW = 'NEW', // Submitted by user, pending admin assignment
  ASSIGNED = 'ASSIGNED', // Assigned to an officer
  IN_PROGRESS = 'IN_PROGRESS', // Officer is actively working on it
  RESOLVED = 'RESOLVED', // Issue resolved
  OVERDUE = 'OVERDUE', // Past due date and not resolved
}

export interface Ticket {
  id: string;
  requesterName: string;
  requesterEmail: string;
  phone: string;
  department: string;
  issueDescription: string;
  attachmentName?: string; // Name of the attached file
  status: TicketStatus;
  createdAt: number; // Timestamp
  updatedAt: number; // Timestamp
  assignedToUserId?: string;
  assignedToUserName?: string; // For display convenience
  resolutionDetails?: string;
  dueDate?: number; // Timestamp for overdue calculation
}

export interface Department {
  id: string;
  name: string;
}
