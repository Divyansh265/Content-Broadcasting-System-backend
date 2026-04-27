import prisma from '../config/prisma.js';
import path from 'path';

export const uploadContent = async ({ title, description, subject, start_time, end_time, rotation_duration }, file, userId) => {
  return prisma.content.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      subject: subject.trim().toLowerCase(),
      file_path: file.path,
      file_type: path.extname(file.originalname).toLowerCase().replace('.', ''),
      file_size: file.size,
      uploaded_by: userId,
      start_time: start_time ? new Date(start_time) : null,
      end_time: end_time ? new Date(end_time) : null,
      rotation_duration: rotation_duration ? parseInt(rotation_duration) : null,
    },
  });
};

export const getMyContent = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where: { uploaded_by: userId },
      orderBy: { created_at: 'desc' },
      skip,
      take: limit,
    }),
    prisma.content.count({ where: { uploaded_by: userId } }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

export const getPendingContent = async ({ page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.content.findMany({
      where: { status: 'pending' },
      include: { uploader: { select: { id: true, name: true, email: true } } },
      orderBy: { created_at: 'asc' },
      skip,
      take: limit,
    }),
    prisma.content.count({ where: { status: 'pending' } }),
  ]);
  return { items, total, page, limit, pages: Math.ceil(total / limit) };
};

export const getContentById = async (contentId, userId) => {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) {
    const err = new Error('Content not found');
    err.statusCode = 404;
    throw err;
  }
  if (content.uploaded_by !== userId) {
    const err = new Error('Access denied: insufficient permissions');
    err.statusCode = 403;
    throw err;
  }
  return content;
};

export const approveContent = async (contentId, principalId) => {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) {
    const err = new Error('Content not found');
    err.statusCode = 404;
    throw err;
  }
  if (content.status !== 'pending') {
    const err = new Error(`Content is already ${content.status}`);
    err.statusCode = 400;
    throw err;
  }

  return prisma.content.update({
    where: { id: contentId },
    data: { status: 'approved', approved_by: principalId, approved_at: new Date(), rejection_reason: null },
  });
};

export const rejectContent = async (contentId, principalId, reason) => {
  const content = await prisma.content.findUnique({ where: { id: contentId } });
  if (!content) {
    const err = new Error('Content not found');
    err.statusCode = 404;
    throw err;
  }
  if (content.status !== 'pending') {
    const err = new Error(`Content is already ${content.status}`);
    err.statusCode = 400;
    throw err;
  }

  return prisma.content.update({
    where: { id: contentId },
    data: { status: 'rejected', approved_by: principalId, approved_at: new Date(), rejection_reason: reason.trim() },
  });
};
