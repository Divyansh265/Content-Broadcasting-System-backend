import { Router } from 'express';
import * as contentController from '../controllers/content.controller.js';
import * as broadcastController from '../controllers/broadcast.controller.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import upload from '../config/multer.js';
import { handleMulterError } from '../middlewares/error.middleware.js';
import { validateContentUpload, validateRejection } from '../middlewares/validate.middleware.js';

const router = Router();

router.get('/live/:teacherId', broadcastController.getLiveContent);

router.post(
  '/upload',
  authenticate,
  authorize('teacher'),
  (req, res, next) => upload.single('file')(req, res, (err) => {
    if (err) {
      req.resume();
      return handleMulterError(err, req, res, next);
    }
    next();
  }),
  validateContentUpload,
  contentController.uploadContent
);

router.get('/my', authenticate, authorize('teacher'), contentController.getMyContent);
router.get('/my/:id', authenticate, authorize('teacher'), contentController.getContentById);

router.get('/pending', authenticate, authorize('principal'), contentController.getPendingContent);
router.patch('/:id/approve', authenticate, authorize('principal'), contentController.approveContent);
router.patch('/:id/reject', authenticate, authorize('principal'), validateRejection, contentController.rejectContent);

export default router;
