
import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { Ticket, TicketStatus } from '../../types';
import Button from '../../components/common/Button';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import Card from '../../components/common/Card';
import StatsCard from '../../components/admin/StatsCard';
import { TicketIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon, UsersIcon } from '../../components/icons/LucideIcons'; // Assuming some icons
import { formatDistanceToNow } from 'date-fns';


const AdminDashboardPage: React.FC = () => {
  const { tickets, assignTicket, getOfficers, updateTicketOverdueStatus } = useData();
  const [selectedTicketToAssign, setSelectedTicketToAssign] = useState<Ticket | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');

  React.useEffect(() => {
    updateTicketOverdueStatus();
  }, [tickets, updateTicketOverdueStatus]);


  const officers = useMemo(() => getOfficers(), [getOfficers]);

  const stats = useMemo(() => {
    const now = Date.now();
    const unresolvedTickets = tickets.filter(t => t.status !== TicketStatus.RESOLVED);
    const overdueCount = unresolvedTickets.filter(t => t.dueDate && now > t.dueDate).length;

    return {
      total: tickets.length,
      resolved: tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
      pendingAssignment: tickets.filter(t => t.status === TicketStatus.NEW).length,
      inProgress: tickets.filter(t => t.status === TicketStatus.ASSIGNED || t.status === TicketStatus.IN_PROGRESS).length,
      overdue: overdueCount,
    };
  }, [tickets]);

  const unassignedTickets = useMemo(() => {
    return tickets.filter(ticket => ticket.status === TicketStatus.NEW || ticket.status === TicketStatus.OVERDUE && !ticket.assignedToUserId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [tickets]);

  const handleAssignClick = (ticket: Ticket) => {
    setSelectedTicketToAssign(ticket);
    if (officers.length > 0) {
      setSelectedOfficerId(officers[0].id);
    }
  };

  const handleConfirmAssignment = () => {
    if (selectedTicketToAssign && selectedOfficerId) {
      assignTicket(selectedTicketToAssign.id, selectedOfficerId);
      setSelectedTicketToAssign(null);
      setSelectedOfficerId('');
    }
  };

  const getStatusBadgeColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.NEW: return 'bg-blue-100 text-blue-700';
      case TicketStatus.ASSIGNED: return 'bg-indigo-100 text-indigo-700';
      case TicketStatus.IN_PROGRESS: return 'bg-purple-100 text-purple-700';
      case TicketStatus.RESOLVED: return 'bg-green-100 text-green-700';
      case TicketStatus.OVERDUE: return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        <StatsCard title="Total Issues" value={stats.total} icon={<TicketIcon size={24} />} colorClass="bg-blue-500" />
        <StatsCard title="Resolved" value={stats.resolved} icon={<CheckCircleIcon size={24} />} colorClass="bg-green-500" />
        <StatsCard title="Pending Assignment" value={stats.pendingAssignment} icon={<ClockIcon size={24} />} colorClass="bg-yellow-500" />
        <StatsCard title="In Progress" value={stats.inProgress} icon={<UsersIcon size={24} />} colorClass="bg-indigo-500" />
        <StatsCard title="Overdue" value={stats.overdue} icon={<AlertTriangleIcon size={24} />} colorClass="bg-red-500" />
      </div>

      {/* Unassigned Tickets Table */}
      <Card title="Tickets Awaiting Assignment">
        {unassignedTickets.length === 0 ? (
          <p className="text-gray-500">No tickets are currently awaiting assignment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue (Snippet)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {unassignedTickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
  <td className="px-4 py-3 whitespace-nowrap">
    <div className="text-sm font-medium text-gray-900">{ticket.requesterName}</div>
    <div className="text-xs text-gray-500">{ticket.requesterEmail}</div>
  </td>
  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
    {ticket.phone }
  </td>
  <td className="px-4 py-3">
    <p className="text-sm text-gray-700 max-w-xs truncate" title={ticket.issueDescription}>
      {ticket.issueDescription}
    </p>
  </td>
  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{ticket.department}</td>
  <td className="px-4 py-3 whitespace-nowrap">
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(ticket.status)}`} >
      {ticket.status}
    </span>
  </td>
  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500" title={new Date(ticket.createdAt).toLocaleString()}>
    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
  </td>
  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
    <Button onClick={() => handleAssignClick(ticket)} size="sm" variant="primary" disabled={officers.length === 0}>
      {officers.length === 0 ? 'No Officers' : 'Assign'}
    </Button>
  </td>
</tr>

                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card title="All Tickets">
        {tickets.length === 0 ? (
          <p className="text-gray-500">No tickets found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                   <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map(ticket => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
  <td className="px-4 py-3 whitespace-nowrap">
    <div className="text-sm font-medium text-gray-900">{ticket.requesterName}</div>
    <div className="text-xs text-gray-500">{ticket.requesterEmail}</div>
  </td>
  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
    {ticket.phone }
  </td>
  <td className="px-4 py-3">
    <p className="text-sm text-gray-700 max-w-xs truncate" title={ticket.issueDescription}>
      {ticket.issueDescription}
    </p>
  </td>
  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{ticket.department}</td>
  <td className="px-4 py-3 whitespace-nowrap">
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(ticket.status)}`} >
      {ticket.status}
    </span>
  </td>
  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500" title={new Date(ticket.createdAt).toLocaleString()}>
    {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
  </td>
  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                      {ticket.assignedToUserName || 'Unassigned'}
                    </td>
</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Assignment Modal */}
      <Modal isOpen={!!selectedTicketToAssign} onClose={() => setSelectedTicketToAssign(null)} title="Assign Ticket">
        {selectedTicketToAssign && (
          <div className="space-y-4">
            <p><span className="font-semibold">Issue:</span> {selectedTicketToAssign.issueDescription.substring(0, 100)}...</p>
            <p><span className="font-semibold">Requester:</span> {selectedTicketToAssign.requesterName}</p>
            <Select
              label="Assign to Officer"
              value={selectedOfficerId}
              onChange={(e) => setSelectedOfficerId(e.target.value)}
            >
              {officers.map(officer => (
                <option key={officer.id} value={officer.id}>{officer.name} ({officer.email})</option>
              ))}
            </Select>
            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="secondary" onClick={() => setSelectedTicketToAssign(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmAssignment} disabled={!selectedOfficerId}>Confirm Assignment</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
