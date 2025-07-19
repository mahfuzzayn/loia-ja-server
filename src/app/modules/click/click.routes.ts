import { Router } from 'express';
import { clickController } from './click.controller';

const router = Router();

// Define routes
router.get('/', clickController.getAll);

export default router;
