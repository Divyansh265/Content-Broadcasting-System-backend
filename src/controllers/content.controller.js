import * as contentService from '../services/content.service.js';
import { sendSuccess } from '../utils/response.js';

export const uploadContent = async (req, res, next) => {
  try {
    const content = await contentService.uploadContent(req.body, req.file, req.user.id);
    return sendSuccess(res, content, 'Content uploaded successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const getMyContent = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const result = await contentService.getMyContent(req.user.id, { page, limit });
    return sendSuccess(res, result, 'Content fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const getContentById = async (req, res, next) => {
  try {
    const content = await contentService.getContentById(req.params.id, req.user.id);
    return sendSuccess(res, content, 'Content fetched successfully');
  } catch (err) {
    next(err);
  }
};

export const getPendingContent = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const result = await contentService.getPendingContent({ page, limit });
    return sendSuccess(res, result, 'Pending content fetched');
  } catch (err) {
    next(err);
  }
};

export const approveContent = async (req, res, next) => {
  try {
    const content = await contentService.approveContent(req.params.id, req.user.id);
    return sendSuccess(res, content, 'Content approved');
  } catch (err) {
    next(err);
  }
};

export const rejectContent = async (req, res, next) => {
  try {
    const content = await contentService.rejectContent(req.params.id, req.user.id, req.body.reason);
    return sendSuccess(res, content, 'Content rejected');
  } catch (err) {
    next(err);
  }
};
