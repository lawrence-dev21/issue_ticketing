import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { Ticket, User, TicketStatus, UserRole } from '../types';
import { API_BASE_URL } from '../constants';
import { AuthContext } from './AuthContext'; // For token

interface DataState {
  tickets: Ticket[];
  users: User[];
  loadingTickets: boolean;
  loadingUsers: boolean;
}

interface DataContextType extends DataState {
  addTicket: (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'dueDate'>) => Promise<Ticket | null>;
  assignTicket: (ticketId: string, officerId: string) => Promise<boolean>;
  resolveTicket: (ticketId: string, resolutionDetails: string) => Promise<boolean>;
  delegateTicket: (ticketId: string, newOfficerId: string) => Promise<boolean>;
  addUser: (userData: Omit<User, 'id'>) => Promise<User | null>;
  updateUser: (id: string, updatedData: Partial<User>) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
  getOfficers: () => User[];
  fetchTickets: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  updateTicketOverdueStatus: () => void; // This might need backend logic or careful frontend handling
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authContext = useContext(AuthContext);
  const token = authContext?.token;

  const [state, setState] = useState<DataState>({
    tickets: [],
    users: [],
    loadingTickets: true,
    loadingUsers: true,
  });

  // const getAuthHeaders = useCallback(() => {
  //   return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  // }, [token]);
  const getAuthHeaders = useCallback((): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}, [token]);

  const fetchTickets = useCallback(async () => {
    if (!token) { // Don't fetch if not logged in / no token
        setState(s => ({ ...s, tickets: [], loadingTickets: false }));
        return;
    }
    setState(s => ({ ...s, loadingTickets: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, { headers: getAuthHeaders() });
      if (response.ok) {
        const ticketsData = await response.json();
        setState(s => ({ ...s, tickets: ticketsData, loadingTickets: false }));
      } else {
        throw new Error('Failed to fetch tickets');
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setState(s => ({ ...s, loadingTickets: false }));
    }
  }, [token, getAuthHeaders]);

  const fetchUsers = useCallback(async () => {
     if (!token) { // Don't fetch if not logged in / no token
        setState(s => ({ ...s, users: [], loadingUsers: false }));
        return;
    }
    setState(s => ({ ...s, loadingUsers: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/users`, { headers: getAuthHeaders() });
      if (response.ok) {
        const usersData = await response.json();
        setState(s => ({ ...s, users: usersData, loadingUsers: false }));
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setState(s => ({ ...s, loadingUsers: false }));
    }
  }, [token, getAuthHeaders]);

  useEffect(() => {
    if (token) { // Only fetch data if token exists (user is potentially logged in)
        fetchTickets();
        fetchUsers();
    } else { // Clear data if token is removed (logout)
        setState({ tickets: [], users: [], loadingTickets: false, loadingUsers: false });
    }
  }, [token, fetchTickets, fetchUsers]);


  // Simplified: Overdue status should ideally be calculated/updated by backend or on fetch.
  // This frontend version is less robust.
  const updateTicketOverdueStatus = useCallback(() => {
    setState(currentState => {
        const updatedTickets = currentState.tickets.map(ticket => {
            if (ticket.status !== TicketStatus.RESOLVED && ticket.dueDate && Date.now() > new Date(ticket.dueDate).getTime()) {
                if (ticket.status !== TicketStatus.OVERDUE) {
                    return { ...ticket, status: TicketStatus.OVERDUE };
                }
            }
            return ticket;
        });
        // Only update state if there are actual changes to avoid infinite loops if this affects rendering
        if (JSON.stringify(updatedTickets) !== JSON.stringify(currentState.tickets)) {
            return { ...currentState, tickets: updatedTickets };
        }
        return currentState;
    });
  }, []);


  useEffect(() => {
    // Periodically check for overdue tickets (client-side approximation)
    // A better approach is server-side calculation or on-fetch update.
    const interval = setInterval(updateTicketOverdueStatus, 60 * 1000); // Check every minute
    return () => clearInterval(interval);
  }, [updateTicketOverdueStatus]);


  const addTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'dueDate'>): Promise<Ticket | null> => {
    try {
      // Note: Public ticket submission might not require auth token. Adjust backend if so.
      // For now, assuming it uses same API structure.
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        method: 'POST',
        headers: getAuthHeaders(), // May not need auth for public submission
        body: JSON.stringify(ticketData),
      });
      if (response.ok) {
        const newTicket = await response.json();
        fetchTickets(); // Re-fetch all tickets
        return newTicket;
      }
      return null;
    } catch (error) {
      console.error('Error adding ticket:', error);
      return null;
    }
  };

  const assignTicket = async (ticketId: string, officerId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/assign`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ officerId }),
      });
      if (response.ok) {
        fetchTickets(); // Re-fetch
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error assigning ticket:', error);
      return false;
    }
  };

  const resolveTicket = async (ticketId: string, resolutionDetails: string): Promise<boolean> => {
     try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/resolve`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ resolutionDetails }),
      });
      if (response.ok) {
        fetchTickets(); // Re-fetch
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error resolving ticket:', error);
      return false;
    }
  };

  const delegateTicket = async (ticketId: string, newOfficerId: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}/delegate`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ newOfficerId }),
      });
      if (response.ok) {
        fetchTickets(); // Re-fetch
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error delegating ticket:', error);
      return false;
    }
  };

  const addUser = async (userData: Omit<User, 'id'>): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(userData),
      });
      if (response.ok) {
        const newUser = await response.json();
        fetchUsers(); // Re-fetch
        return newUser;
      }
      const errorData = await response.json();
      alert(errorData.message || 'Failed to add user.');
      return null;
    } catch (error) {
      console.error('Error adding user:', error);
      alert('An unexpected error occurred while adding the user.');
      return null;
    }
  };
  
  const getOfficers = useCallback(() => {
    return state.users.filter(user => user.role === UserRole.OFFICER);
  }, [state.users]);

  const updateUser = async (id: string, updatedData: Partial<User>): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updatedData),
    });
    console.log(updatedData)
    if (response.ok) {
      fetchUsers(); // Refresh list
      return true;

    }
    return false;
  } catch (error) {
    console.error('Error updating user:', error);
    return false;
  }
};

const deleteUser = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      fetchUsers(); // Refresh list
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};


  return (
    <DataContext.Provider value={{ ...state, addTicket, assignTicket, resolveTicket, delegateTicket, addUser, updateUser, deleteUser, getOfficers, fetchTickets, fetchUsers, updateTicketOverdueStatus }}>
      {children}
    </DataContext.Provider>
  );
};
