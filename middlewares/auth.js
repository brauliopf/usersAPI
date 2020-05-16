import jwt from 'jsonwebtoken';
import ErrorResponse from "../utils/errorResponse"
import { User } from '../models'

export const identify = async (req, res, next) => {
  let token;

  // Get token from Bearer token in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
    token = req.headers.authorization.split(' ')[1];

  if (!token)
    return next();

  // Verify token && Populate request with user data
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // decrypt user_id using stored secret
    req.user = await User.findById(decoded.id); // populate request object with the user data
    return next();
  } catch (err) {
    return next();
  }
};

// @desc    Authenticate routes - Identify users immmediatelly before routing a request
// @require ––
// @out     Add user Object to the request (@req.user)
export const authenticate = async (req, res, next) => {
  if (!req.user) throw new ErrorResponse('User not authorized to access this route | Invalid token', 401);
  next();
};

// @desc    Grant access to specific roles
// @require Array(roles), req.user
// @out     Verify if user role is included in roles allowed
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ErrorResponse(`User role ${req.user.role} is not authorized to access this route`, 403);
    }
    next();
  };
}; 