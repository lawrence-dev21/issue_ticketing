import { Department } from './types';

export const APP_TITLE = "Ministry of Agriculture ICT Ticketing System";
export const API_BASE_URL = 'http://localhost:3001/api'; // Backend API URL

export const MOCK_DEPARTMENTS: Department[] = [
  { id: 'dept_it', name: 'Information Technology' },
  { id: 'dept_hr', name: 'Human Resources' },
  { id: 'dept_finance', name: 'Finance' },
  { id: 'dept_ops', name: 'Operations' },
  { id: 'dept_planning', name: 'Planning & Development' },
  { id: 'dept_research', name: 'Research & Extension' },
  { id: 'dept_crops', name: 'Crop Management' },
];


export const TICKET_DUE_SLA_DAYS = 3; // Tickets are due in 3 days
