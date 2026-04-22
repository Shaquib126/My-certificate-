import express from 'express';
import { uploadDocument, getAllDocuments, deleteDocument, updateDocument } from '../controllers/documentController';
import { requireAuth } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = express.Router();

// Apply requireAuth middleware to all document routes
router.use(requireAuth);

router.post('/upload', upload.single('file'), uploadDocument);
router.get('/', getAllDocuments);
router.delete('/:id', deleteDocument);
router.patch('/:id', updateDocument);

export default router;
