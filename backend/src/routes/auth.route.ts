import express, { Request, Response, Router } from 'express';
import { login, logout, signup, updateProfile } from '../controllers/auth.controller';
import { arcjetProtection } from '../middleware/arcjet.middleware';
import { protectRoute } from '../middleware/auth.middleware';
import { AuthenticatedRequest } from '../types/index';

const router: Router = express.Router();

router.use(arcjetProtection);

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

router.put('/update-profile', protectRoute, updateProfile);

router.get('/check', protectRoute, (req: Request, res: Response) => {
  res.status(200).json((req as AuthenticatedRequest).user);
});

export default router;
