import * as authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

export const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return sendSuccess(res, result, 'Registration successful', 201);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};
