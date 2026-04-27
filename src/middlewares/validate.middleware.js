import { sendError } from '../utils/response.js';

export const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return sendError(res, 'name, email, and password are required', 400);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return sendError(res, 'Invalid email format', 400);
  }
  if (password.length < 6) {
    return sendError(res, 'Password must be at least 6 characters', 400);
  }
  if (role && !['principal', 'teacher'].includes(role)) {
    return sendError(res, 'Role must be principal or teacher', 400);
  }
  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return sendError(res, 'email and password are required', 400);
  }
  next();
};

export const validateContentUpload = (req, res, next) => {
  const { title, subject, start_time, end_time, rotation_duration } = req.body;
  if (!title || !title.trim()) {
    return sendError(res, 'title is required', 400);
  }
  if (!subject || !subject.trim()) {
    return sendError(res, 'subject is required', 400);
  }
  if (!req.file) {
    return sendError(res, 'file is required', 400);
  }
  if (start_time && isNaN(Date.parse(start_time))) {
    return sendError(res, 'start_time must be a valid ISO 8601 date', 400);
  }
  if (end_time && isNaN(Date.parse(end_time))) {
    return sendError(res, 'end_time must be a valid ISO 8601 date', 400);
  }
  if (start_time && end_time && new Date(end_time) <= new Date(start_time)) {
    return sendError(res, 'end_time must be after start_time', 400);
  }
  if (rotation_duration !== undefined && rotation_duration !== '') {
    const rd = parseInt(rotation_duration);
    if (isNaN(rd) || rd < 1) {
      return sendError(res, 'rotation_duration must be a positive integer (minutes)', 400);
    }
  }
  next();
};

export const validateRejection = (req, res, next) => {
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return sendError(res, 'rejection reason is required', 400);
  }
  next();
};
