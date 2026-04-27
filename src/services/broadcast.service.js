import path from 'path';
import prisma from '../config/prisma.js';

const DEFAULT_ROTATION_MINUTES = 5;

export const getLiveContent = async (teacherId) => {
  const now = new Date();

  const approvedContent = await prisma.content.findMany({
    where: {
      uploaded_by: teacherId,
      status: 'approved',
      start_time: { lte: now },
      end_time: { gte: now },
    },
    orderBy: { created_at: 'asc' },
  });

  if (approvedContent.length === 0) {
    return { message: 'No content available', subjects: {} };
  }

  const bySubject = {};
  for (const item of approvedContent) {
    if (!bySubject[item.subject]) bySubject[item.subject] = [];
    bySubject[item.subject].push(item);
  }

  const result = {};
  for (const [subject, items] of Object.entries(bySubject)) {
    const active = resolveActiveContent(items, now);
    if (active) result[subject] = sanitizeContent(active);
  }

  if (Object.keys(result).length === 0) {
    return { message: 'No content available', subjects: {} };
  }

  return { subjects: result };
};


const resolveActiveContent = (items, now) => {
  if (items.length === 0) return null;
  if (items.length === 1) return items[0];

  const slots = items.map((item) => ({
    item,
    duration: (item.rotation_duration || DEFAULT_ROTATION_MINUTES) * 60 * 1000,
  }));

  const totalCycle = slots.reduce((sum, s) => sum + s.duration, 0);

  const anchor = items[0].start_time
    ? new Date(items[0].start_time).getTime()
    : new Date(items[0].created_at).getTime();

  const elapsed = (now.getTime() - anchor) % totalCycle;

  let cursor = 0;
  for (const slot of slots) {
    cursor += slot.duration;
    if (elapsed < cursor) return slot.item;
  }

  return items[0];
};

const sanitizeContent = (content) => {
  const { file_path, uploaded_by, approved_by, rejection_reason, ...safe } = content;
  safe.file_url = `/uploads/${path.basename(file_path)}`;
  return safe;
};
