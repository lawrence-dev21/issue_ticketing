import { Router } from 'express';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware from '../middleware/authMiddleware.js'; // For protected routes

const router = Router();

const TICKET_DUE_SLA_DAYS = 3; // Consistent with frontend constant

// Middleware to check if user is admin or officer (for most ticket operations)
const staffOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'OFFICER')) {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Staff role required.' });
    }
};
// Middleware to check if user is admin (for assignment)
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
};


// @route   POST api/tickets
// @desc    Create a new ticket
// @access  Public (or protected if login is required for submission)
// For this iteration, let's assume public submission, so no authMiddleware here.
// If auth is needed: router.post('/', authMiddleware, async (req, res) => {
router.post('/', async (req, res) => {
  const { requesterName, requesterEmail,phone, department, issueDescription, attachmentName } = req.body;

  if (!requesterName || !requesterEmail || !phone || !department || !issueDescription) {
    return res.status(400).json({ message: 'Requester name, email, phone, department, and issue description are required' });
  }

  try {
    const ticketId = uuidv4();
    const createdAt = new Date();
    const dueDate = new Date(createdAt.getTime() + TICKET_DUE_SLA_DAYS * 24 * 60 * 60 * 1000);

    await db.query(
      'INSERT INTO tickets (id, requesterName, requesterEmail, phone, department, issueDescription, attachmentName, status, createdAt, updatedAt, dueDate) VALUES (?, ?, ?,?,?, ?, ?, ?, ?, ?, ?)',
      [ticketId, requesterName, requesterEmail, phone, department, issueDescription, attachmentName || null, 'NEW', createdAt, createdAt, dueDate]
    );
    
    // Fetch the created ticket to return it
    const [newTicket] = await db.query('SELECT * FROM tickets WHERE id = ?', [ticketId]);
    res.status(201).json(newTicket[0]);

  } catch (err) {
    console.error('Error creating ticket:', err.message);
    res.status(500).send('Server error while creating ticket');
  }
});

// @route   GET api/tickets
// @desc    Get all tickets (for Admin/Officer)
// @access  Private (Staff)
router.get('/', authMiddleware, staffOnly, async (req, res) => {
  try {
    // Admins see all, Officers might see only their assigned or all depending on policy
    // For now, let all staff see all tickets, frontend can filter.
    const [tickets] = await db.query('SELECT * FROM tickets ORDER BY createdAt DESC');
    
    // Simple overdue check on fetch
    const now = Date.now();
    const processedTickets = tickets.map(ticket => {
        if (ticket.status !== 'RESOLVED' && ticket.dueDate && now > new Date(ticket.dueDate).getTime()) {
            if (ticket.status !== 'OVERDUE') { // Only update if not already marked OVERDUE
                // This is a soft update for display, for persistent update, a separate mechanism or trigger would be better.
                // Or update in DB here if critical:
                // db.query('UPDATE tickets SET status = ?, updatedAt = NOW() WHERE id = ? AND status != ?', ['OVERDUE', ticket.id, 'OVERDUE']);
                return { ...ticket, status: 'OVERDUE' };
            }
        }
        return ticket;
    });
    res.json(processedTickets);
  } catch (err) {
    console.error('Error fetching tickets:', err.message);
    res.status(500).send('Server error while fetching tickets');
  }
});


// @route   PUT api/tickets/:id/assign
// @desc    Assign a ticket to an officer (Admin only)
// @access  Private (Admin)
router.put('/:id/assign', authMiddleware, adminOnly, async (req, res) => {
  const { officerId } = req.body;
  const ticketId = req.params.id;

  if (!officerId) {
    return res.status(400).json({ message: 'Officer ID is required for assignment' });
  }

  try {
    const [officers] = await db.query('SELECT name FROM users WHERE id = ? AND role = ?', [officerId, 'OFFICER']);
    if (officers.length === 0) {
      return res.status(404).json({ message: 'Officer not found or invalid role' });
    }
    const officerName = officers[0].name;

    const [result] = await db.query(
      'UPDATE tickets SET assignedToUserId = ?, assignedToUserName = ?, status = ?, updatedAt = NOW() WHERE id = ?',
      [officerId, officerName, 'ASSIGNED', ticketId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.json({ message: 'Ticket assigned successfully' });
  } catch (err) {
    console.error('Error assigning ticket:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tickets/:id/resolve
// @desc    Resolve a ticket (Assigned Officer or Admin)
// @access  Private (Staff)
router.put('/:id/resolve', authMiddleware, staffOnly, async (req, res) => {
  const { resolutionDetails } = req.body;
  const ticketId = req.params.id;
  const resolverUserId = req.user.id; // User performing the action

  if (!resolutionDetails) {
    return res.status(400).json({ message: 'Resolution details are required' });
  }

  try {
    // Optional: Check if the user is assigned or is an admin
    const [tickets] = await db.query('SELECT assignedToUserId FROM tickets WHERE id = ?', [ticketId]);
    if (tickets.length === 0) {
        return res.status(404).json({ message: 'Ticket not found' });
    }
    // Allow if admin OR if the ticket is assigned to the current officer
    if (req.user.role !== 'ADMIN' && tickets[0].assignedToUserId !== resolverUserId) {
        return res.status(403).json({ message: 'Not authorized to resolve this ticket' });
    }

    const [result] = await db.query(
      'UPDATE tickets SET status = ?, resolutionDetails = ?, updatedAt = NOW() WHERE id = ?',
      ['RESOLVED', resolutionDetails, ticketId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ticket not found or no change made' });
    }
    res.json({ message: 'Ticket resolved successfully' });
  } catch (err) {
    console.error('Error resolving ticket:', err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/tickets/:id/delegate
// @desc    Delegate a ticket to another officer (Assigned Officer or Admin)
// @access  Private (Staff)
router.put('/:id/delegate', authMiddleware, staffOnly, async (req, res) => {
  const { newOfficerId } = req.body;
  const ticketId = req.params.id;
  const delegatorUserId = req.user.id;

  if (!newOfficerId) {
    return res.status(400).json({ message: 'New Officer ID is required for delegation' });
  }
  if (newOfficerId === delegatorUserId && req.user.role !== 'ADMIN') { // Admin can re-assign to same if they want
    return res.status(400).json({ message: 'Cannot delegate ticket to yourself.'});
  }


  try {
    // Optional: Check if user is authorized (current assignee or admin)
     const [currentTicket] = await db.query('SELECT assignedToUserId FROM tickets WHERE id = ?', [ticketId]);
    if (currentTicket.length === 0) {
        return res.status(404).json({ message: 'Ticket not found' });
    }
    if (req.user.role !== 'ADMIN' && currentTicket[0].assignedToUserId !== delegatorUserId) {
        return res.status(403).json({ message: 'Not authorized to delegate this ticket' });
    }

    const [newOfficers] = await db.query('SELECT name FROM users WHERE id = ? AND role = ?', [newOfficerId, 'OFFICER']);
    if (newOfficers.length === 0) {
      return res.status(404).json({ message: 'New officer not found or invalid role' });
    }
    const newOfficerName = newOfficers[0].name;


    const [result] = await db.query(
      'UPDATE tickets SET assignedToUserId = ?, assignedToUserName = ?, status = ?, updatedAt = NOW() WHERE id = ?',
      [newOfficerId, newOfficerName, 'ASSIGNED', ticketId]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Ticket not found or no change made' });
    }
    res.json({ message: 'Ticket delegated successfully' });
  } catch (err) {
    console.error('Error delegating ticket:', err.message);
    res.status(500).send('Server error');
  }
});


export default router;
