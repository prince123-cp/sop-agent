import express from 'express';
import upload from '../utils/multerConfig.js';
import { uploadSop, getSopList, updateSop, deleteSop } from '../controllers/sopController.js';
import adminAuth from '../middleware/auth.js';

const router = express.Router();
console.log('sopRoutes loaded');

// POST /api/sop/upload
router
  .route('/upload')
  .post(adminAuth, upload.single('pdf'), uploadSop)
  .all((req, res) => {
    res.status(405).json({
      message: 'Ye endpoint sirf POST method leta hai.',
    });
  });

// GET /api/sop/list
router
  .route('/list')
  .get(adminAuth, getSopList)
  .all((req, res) => {
    res.status(405).json({
      message: 'Ye endpoint sirf GET method leta hai.',
    });
  });

// PATCH, DELETE /api/sop/:id
router
  .route('/:id')
  .patch(adminAuth, updateSop)
  .delete(adminAuth, deleteSop)
  .all((req, res) => {
    res.status(405).json({
      message: 'Ye endpoint sirf PATCH aur DELETE method leta hai.',
    });
  });

export default router;
