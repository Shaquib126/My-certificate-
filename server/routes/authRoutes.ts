import express from 'express';
import { registerUser, loginUser, logoutUser, getMe } from '../controllers/authController';
import { requireAuth } from '../middleware/authMiddleware';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.get('/me', requireAuth, getMe);

export default router;
