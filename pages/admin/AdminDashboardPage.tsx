
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
  // state to handle assigning tickets 
  const [selectedTicketToAssign, setSelectedTicketToAssign] = useState<Ticket | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('');
   // pagination states 
  const [unassignedPage, setUnassignedPage] = useState(1);
  const [allTicketsPage, setAllTicketsPage] = useState(1);
  const itemsPerPage = 10;
  //search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAllQuery, setSearchAllQuery] = useState('');
  const[statusFilter, setStatusFilter] = useState(''); // for unassigned 
  const[allStatusFilter, setAllStatusFilter] = useState(''); // for all tickets 


// update overdue ticket status whenever tickets change 
  React.useEffect(() => {
    updateTicketOverdueStatus();
  }, [tickets, updateTicketOverdueStatus]);


  // reset pagination when new ticket data is loaded 
  React.useEffect(() => {
  setUnassignedPage(1);
  setAllTicketsPage(1);
}, [tickets]);
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

   // get unassigned tickets (NEW or OVERDUE and not assigned yet)
  const unassignedTickets = useMemo(() => {
    return tickets.filter(ticket => ticket.status === TicketStatus.NEW || ticket.status === TicketStatus.OVERDUE && !ticket.assignedToUserId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [tickets]);

  // called when user clicks "Assign" button
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
  // Filtered unassigned tickets by search query
  const filteredUnassignedTickets = useMemo(() => {
  return unassignedTickets.filter(ticket =>
    (statusFilter === '' || ticket.status === statusFilter) &&
    (
      ticket.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.issueDescription.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
}, [unassignedTickets, searchQuery, statusFilter]);

// Filtered all tickets by search query
const filteredAllTickets = useMemo(() => {
  return tickets.filter(ticket =>
    (allStatusFilter === '' || ticket.status === allStatusFilter) &&
    (
      ticket.requesterName.toLowerCase().includes(searchAllQuery.toLowerCase()) ||
      ticket.phone?.toLowerCase().includes(searchAllQuery.toLowerCase()) ||
      ticket.issueDescription.toLowerCase().includes(searchAllQuery.toLowerCase())
    )
  );
}, [tickets, searchAllQuery, allStatusFilter]);

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

      {/* search input fields*/}
      <div className="flex justify-between mb-2">
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
  >
    <option value="">All Statuses</option>
    {Object.values(TicketStatus).map(status => (
      <option key={status} value={status}>{status}</option>
    ))}
  </select>

  <input
    type="text"
    placeholder="Search by requester, phone, issue..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
  />
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
                {/* only show 10 per page using slice */}
               {filteredUnassignedTickets
                .slice((unassignedPage - 1) * itemsPerPage, unassignedPage * itemsPerPage)
                .map(ticket => (
               <tr key={ticket.id} className="hover:bg-gray-50">

     {/* Display each column of tickets here....*/}           
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
{/* Pagination controls for unassigned Tickets*/}
      <div className="flex justify-between items-center mt-4">
  <Button
    variant="secondary"
    onClick={() => setUnassignedPage(prev => Math.max(prev - 1, 1))}
    disabled={unassignedPage === 1}
  >
    Previous
  </Button>
  <span className="text-sm text-gray-600">
    Page {unassignedPage} of {Math.ceil(filteredUnassignedTickets.length / itemsPerPage)}
  </span>
  <Button
    variant="secondary"
    onClick={() =>
      setUnassignedPage(prev =>
        prev < Math.ceil(unassignedTickets.length / itemsPerPage) ? prev + 1 : prev
      )
    }
    disabled={unassignedPage === Math.ceil(unassignedTickets.length / itemsPerPage)}
  >
    Next
  </Button>
</div>

    {/* search input fields*/}
    <div className="flex justify-between mb-2">
  <select
    value={allStatusFilter}
    onChange={(e) => setAllStatusFilter(e.target.value)}
    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
  >
    <option value="">All Statuses</option>
    {Object.values(TicketStatus).map(status => (
      <option key={status} value={status}>{status}</option>
    ))}
  </select>

  <input
    type="text"
    placeholder="Search all tickets..."
    value={searchAllQuery}
    onChange={(e) => setSearchAllQuery(e.target.value)}
    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
  />
</div>

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
                 {filteredAllTickets
              .slice((allTicketsPage - 1) * itemsPerPage, allTicketsPage * itemsPerPage)
              .map(ticket => (
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

       {/* Pagination for All Tickets */}
        <div className="flex justify-between items-center mt-4">
  <Button
    variant="secondary"
    onClick={() => setAllTicketsPage(prev => Math.max(prev - 1, 1))}
    disabled={allTicketsPage === 1}
  >
    Previous
  </Button>
  <span className="text-sm text-gray-600">
    Page {allTicketsPage} of {Math.ceil(filteredAllTickets.length / itemsPerPage)}
  </span>
  <Button
    variant="secondary"
    onClick={() =>
      setAllTicketsPage(prev =>
        prev < Math.ceil(filteredAllTickets.length / itemsPerPage) ? prev + 1 : prev
      )
    }
    disabled={allTicketsPage === Math.ceil(filteredAllTickets.length / itemsPerPage)}
  >
    Next
  </Button>
</div>

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
