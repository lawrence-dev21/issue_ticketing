import { Router } from 'express';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
const { sign } = jwt;
// import { sign } from 'jsonwebtoken';
import db from '../db.js'; // MySQL pool
import { v4 as uuidv4 } from 'uuid'; // For consistency if needed, though DB might auto-gen IDs
import authMiddleware from '../middleware/authMiddleware.js';


const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if user exists
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // Check password
    const isMatch = await compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // User matched, create JWT payload
    const payload = {
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email
      },
    };

    sign(
      payload,
      JWT_SECRET,
      { expiresIn: '5h' }, // Token expires in 5 hours
      (err, token) => {
        if (err) throw err;
        // Return user info (without password) and token
        const { password, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error during login');
  }
});


// @route   GET api/auth/me
// @desc    Get current logged-in user
// @access  Private
router.get('/me', authMiddleware, async (req, res) => {
    try {
        // req.user is set by authMiddleware and contains id, role
        const [users] = await db.query('SELECT id, name, email, role FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(users[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});


export default router;
