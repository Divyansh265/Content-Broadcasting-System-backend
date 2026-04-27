import * as broadcastService from '../services/broadcast.service.js';
import prisma from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getLiveContent = async (req, res, next) => {
  try {
    const { teacherId } = req.params;

    const teacher = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { id: true, role: true },
    });

    if (!teacher || teacher.role !== 'teacher') {
      return sendError(res, 'Teacher not found', 404);
    }

    const result = await broadcastService.getLiveContent(teacherId);
    return sendSuccess(res, result, 'Live content fetched');
  } catch (err) {
    next(err);
  }
};
