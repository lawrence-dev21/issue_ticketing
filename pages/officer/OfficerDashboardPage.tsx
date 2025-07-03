
import React, { useState, useMemo, FormEvent } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { Ticket, TicketStatus, User, UserRole } from '../../types';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Modal from '../../components/common/Modal';
import Card from '../../components/common/Card';
import { formatDistanceToNow } from 'date-fns';
import { Edit3Icon, CheckCircleIcon, AlertTriangleIcon, UsersIcon } from '../../components/icons/LucideIcons';

const OfficerDashboardPage: React.FC = () => {
  const { tickets, users, resolveTicket, delegateTicket, getOfficers, updateTicketOverdueStatus } = useData();
  const { user } = useAuth();

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [actionType, setActionType] = useState<'resolve' | 'delegate' | null>(null);
  
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [delegationOfficerId, setDelegationOfficerId] = useState<string>('');
  const [formError, setFormError] = useState('');

  React.useEffect(() => {
    updateTicketOverdueStatus();
  }, [tickets, updateTicketOverdueStatus]);


  const officers = useMemo(() => getOfficers().filter(o => o.id !== user?.id), [getOfficers, user]);

  const myTickets = useMemo(() => {
    if (!user) return [];
    return tickets
      .filter(ticket => ticket.assignedToUserId === user.id && ticket.status !== TicketStatus.RESOLVED)
      .sort((a, b) => {
        // Prioritize overdue, then by creation date
        const now = Date.now();
        const aIsOverdue = a.dueDate && now > a.dueDate;
        const bIsOverdue = b.dueDate && now > b.dueDate;
        if (aIsOverdue && !bIsOverdue) return -1;
        if (!aIsOverdue && bIsOverdue) return 1;
        return b.createdAt - a.createdAt;
      });
  }, [tickets, user]);

  const resolvedTickets = useMemo(() => {
    if (!user) return [];
    return tickets
      .filter(ticket => ticket.assignedToUserId === user.id && ticket.status === TicketStatus.RESOLVED)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [tickets, user]);

  const handleActionClick = (ticket: Ticket, type: 'resolve' | 'delegate') => {
    setSelectedTicket(ticket);
    setActionType(type);
    setResolutionDetails('');
    setFormError('');
    if (type === 'delegate' && officers.length > 0) {
      setDelegationOfficerId(officers[0].id);
    } else if (type === 'delegate' && officers.length === 0){
      setFormError("No other officers available to delegate to.");
    }
  };

  const handleSubmitAction = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedTicket) return;

    if (actionType === 'resolve') {
      if (!resolutionDetails.trim()) {
        setFormError('Resolution details are required.');
        return;
      }
      resolveTicket(selectedTicket.id, resolutionDetails);
    } else if (actionType === 'delegate') {
      if (!delegationOfficerId) {
        setFormError('Please select an officer to delegate to.');
        return;
      }
      if (officers.length === 0) {
         setFormError('No other officers available to delegate to.');
         return;
      }
      delegateTicket(selectedTicket.id, delegationOfficerId);
    }
    
    setSelectedTicket(null);
    setActionType(null);
  };
  
  const getStatusBadgeColor = (status: TicketStatus, dueDate?: number) => {
    const now = Date.now();
    if (status !== TicketStatus.RESOLVED && dueDate && now > dueDate) {
        return 'bg-red-100 text-red-700'; // Overdue
    }
    switch (status) {
      case TicketStatus.NEW: return 'bg-blue-100 text-blue-700';
      case TicketStatus.ASSIGNED: return 'bg-indigo-100 text-indigo-700';
      case TicketStatus.IN_PROGRESS: return 'bg-purple-100 text-purple-700';
      case TicketStatus.RESOLVED: return 'bg-green-100 text-green-700';
      case TicketStatus.OVERDUE: return 'bg-red-100 text-red-700'; // Explicit overdue status
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  
  const renderTicketCard = (ticket: Ticket, isResolvedList: boolean = false) => (
    <Card key={ticket.id} className="mb-4 transform hover:scale-[1.01] transition-transform duration-200">
      <div className="flex flex-col sm:flex-row justify-between sm:items-start">
        <div>
          <h4 className="text-lg font-semibold text-ministry-blue">{ticket.issueDescription.substring(0, 80)}{ticket.issueDescription.length > 80 ? '...' : ''}</h4>
          <p className="text-xs text-gray-500">
            From: {ticket.requesterName} ({ticket.requesterEmail}) | Dept: {ticket.department}
          </p>
          <p className="text-xs text-gray-500" title={new Date(ticket.createdAt).toLocaleString()}>
            Submitted: {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
          </p>
          {ticket.dueDate && ticket.status !== TicketStatus.RESOLVED && (
            <p className={`text-xs ${Date.now() > ticket.dueDate ? 'text-red-600 font-semibold' : 'text-gray-500'}`} title={new Date(ticket.dueDate).toLocaleString()}>
              Due: {formatDistanceToNow(new Date(ticket.dueDate), { addSuffix: true })}
            </p>
          )}
        </div>
        <div className="mt-3 sm:mt-0 sm:ml-4 flex flex-col items-start sm:items-end space-y-2">
          <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(ticket.status, ticket.dueDate)}`}>
            {ticket.status === TicketStatus.OVERDUE || (ticket.status !== TicketStatus.RESOLVED && ticket.dueDate && Date.now() > ticket.dueDate) ? 'OVERDUE' : ticket.status}
          </span>
          {!isResolvedList && (
            <div className="flex space-x-2">
              <Button onClick={() => handleActionClick(ticket, 'resolve')} size="sm" variant="success" title="Mark as Resolved">
                <CheckCircleIcon size={16} className="mr-1"/> Resolve
              </Button>
              <Button onClick={() => handleActionClick(ticket, 'delegate')} size="sm" variant="secondary" title="Delegate to another Officer" disabled={officers.length === 0}>
                 <UsersIcon size={16} className="mr-1"/> Delegate
              </Button>
            </div>
          )}
        </div>
      </div>
      {isResolvedList && ticket.resolutionDetails && (
         <p className="mt-2 text-sm text-gray-600 bg-green-50 p-2 rounded-md"><strong>Resolution:</strong> {ticket.resolutionDetails}</p>
      )}
       {ticket.attachmentName && (
          <p className="mt-2 text-xs text-gray-500">Attachment: {ticket.attachmentName}</p>
      )}
    </Card>
  );


  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-1">My Assigned Tickets ({myTickets.length})</h2>
        <p className="text-sm text-gray-600">Manage issues assigned to you. Resolve them promptly or delegate if necessary.</p>
      </div>

      {myTickets.length === 0 ? (
        <Card>
            <div className="text-center py-8">
                <CheckCircleIcon className="mx-auto text-ministry-green mb-3" size={48} />
                <p className="text-xl font-semibold text-gray-700">All caught up!</p>
                <p className="text-gray-500">You have no active tickets assigned to you.</p>
            </div>
        </Card>
      ) : (
        <div>{myTickets.map(ticket => renderTicketCard(ticket))}</div>
      )}

      {resolvedTickets.length > 0 && (
         <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-3 mt-10">Recently Resolved Tickets ({resolvedTickets.length})</h3>
            <div>{resolvedTickets.slice(0,5).map(ticket => renderTicketCard(ticket, true))}</div> {/* Show last 5 resolved */}
        </div>
      )}

      <Modal 
        isOpen={!!selectedTicket && !!actionType} 
        onClose={() => {setSelectedTicket(null); setActionType(null); setFormError('');}} 
        title={actionType === 'resolve' ? 'Resolve Ticket' : 'Delegate Ticket'}
        size="lg"
      >
        {selectedTicket && (
          <form onSubmit={handleSubmitAction} className="space-y-4">
            {formError && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded-md text-sm">{formError}</div>}
            <p className="text-sm"><span className="font-semibold">Issue:</span> {selectedTicket.issueDescription}</p>
            <p className="text-sm"><span className="font-semibold">Requester:</span> {selectedTicket.requesterName}</p>
            
            {actionType === 'resolve' && (
              <Textarea 
                label="Resolution Details" 
                value={resolutionDetails} 
                onChange={e => setResolutionDetails(e.target.value)} 
                required 
                placeholder="Describe how the issue was resolved..."
              />
            )}

            {actionType === 'delegate' && (
              officers.length > 0 ? (
                <Select 
                  label="Delegate to Officer" 
                  value={delegationOfficerId} 
                  onChange={e => setDelegationOfficerId(e.target.value)}
                  required
                >
                  <option value="">Select an officer...</option>
                  {officers.map(officer => (
                    <option key={officer.id} value={officer.id}>{officer.name} ({officer.email})</option>
                  ))}
                </Select>
              ) : (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-md">There are no other officers available to delegate this ticket to.</p>
              )
            )}

            <div className="flex justify-end space-x-3 pt-3">
              <Button type="button" variant="secondary" onClick={() => {setSelectedTicket(null); setActionType(null); setFormError('');}}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={actionType === 'delegate' && officers.length === 0}>
                {actionType === 'resolve' ? 'Confirm Resolution' : 'Confirm Delegation'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default OfficerDashboardPage;
