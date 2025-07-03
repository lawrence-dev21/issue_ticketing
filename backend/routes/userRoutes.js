import { Router } from 'express';
import { genSalt, hash } from 'bcryptjs';
import db from '../db.js';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware from '../middleware/authMiddleware.js';

const router = Router();

// Middleware to check if user is admin
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Access denied. Admin role required.' });
    }
};

// @route   POST api/users
// @desc    Create a new user (Admin only)
// @access  Private (Admin)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ message: 'All fields are required: name, email, password, role' });
  }
  if (role !== 'ADMIN' && role !== 'OFFICER') {
    return res.status(400).json({ message: 'Invalid role. Must be ADMIN or OFFICER.' });
  }


  try {
    // Check if user already exists
    const [existingUsers] = await db.query('SELECT email FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt = await genSalt(10);
    const hashedPassword = await hash(password, salt);
    
    const userId = uuidv4();

    // Insert user into database
    await db.query('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', 
                   [userId, name, email, hashedPassword, role]);

    // Respond with new user (excluding password)
    res.status(201).json({ id: userId, name, email, role });

  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).send('Server error while creating user');
  }
});

// @route   GET api/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email, role, createdAt FROM users ORDER BY createdAt DESC');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).send('Server error while fetching users');
  }
});

// @route   PUT api/users/:id
// @desc    Update a user's name, email, or role (Admin only)
// @access  Private (Admin)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    return res.status(400).json({ message: 'All fields are required: name, email, role' });
  }

  try {
    // update user in DB
    await db.query(
      'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?',
      [name, email, role, id]
    );
    res.status(200).json({ message: 'User updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).send('Server error while updating user');
  }
});

// @route   DELETE api/users/:id
// @desc    Delete a user (Admin only)
// @access  Private (Admin)
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).send('Server error while deleting user');
  }
});


export default router;
