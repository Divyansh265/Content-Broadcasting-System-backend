import bcrypt from 'bcryptjs';
import prisma from '../config/prisma.js';
import { signToken } from '../utils/jwt.js';

export const register = async ({ name, email, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password_hash, role: role || 'teacher' },
    select: { id: true, name: true, email: true, role: true, created_at: true },
  });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  return { user, token };
};

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
};
