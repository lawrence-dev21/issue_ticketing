import express, { json } from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import { genSalt, hash } from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

import db from './db.js'; // MySQL pool
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';

config(); // Load environment variables from .env file

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(json()); // To parse JSON request bodies

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);

// Simple health check route
app.get('/', (req, res) => {
  res.send('ICT Ticketing System Backend is running!');
});


// Seed initial admin user if users table is empty
const seedInitialAdmin = async () => {
  try {
    const [users] = await db.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      console.log('No users found. Seeding initial admin user...');
      const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@ministry.gov.ag';
      const adminName = process.env.INITIAL_ADMIN_NAME || 'Admin User';
      let adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'password';
      
      // Ensure password exists, even if empty string, to avoid bcrypt error
      if (adminPassword === undefined || adminPassword === null) {
          adminPassword = 'defaultSecurePassword'; // Fallback if not set
          console.warn('INITIAL_ADMIN_PASSWORD not set, using a default. Please set it in .env');
      }


      const salt = await genSalt(10);
      const hashedPassword = await hash(adminPassword, salt);
      const adminId = uuidv4();

      await db.query(
        'INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
        [adminId, adminName, adminEmail, hashedPassword, 'ADMIN']
      );
      console.log(`Initial admin user (${adminEmail}) created successfully.`);
    } else {
      console.log('Users table is not empty. Skipping admin seed.');
    }
  } catch (error) {
    console.error('Error seeding initial admin user:', error);
  }
};


const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  // Attempt to connect to DB to confirm it's up and then seed.
  db.query('SELECT 1')
    .then(() => {
      console.log('Database connection successful for seeding check.');
      seedInitialAdmin();
    })
    .catch(err => {
      console.error('Failed to connect to database for seeding check. Backend might not function correctly.', err);
    });
});
