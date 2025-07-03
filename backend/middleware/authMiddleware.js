import jwt from 'jsonwebtoken';
const { verify } = jwt;
import { config } from 'dotenv';

config();

const JWT_SECRET = process.env.JWT_SECRET;

export default function (req, res, next) {
  // Get token from header
  const authHeader = req.header('Authorization');

  // Check if not token
  if (!authHeader) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    // Check if the token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ msg: 'Token is not valid (Bearer format expected)' });
    }
    const token = authHeader.split(' ')[1]; // Extract token part

    const decoded = verify(token, JWT_SECRET);
    req.user = decoded.user; // Add user from payload (should contain id, role)
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
