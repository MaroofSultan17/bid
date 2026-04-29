import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import db from '../../core/db/knex';

const router = Router();
const repository = new DashboardRepository(db);
const service = new DashboardService(repository);
const controller = new DashboardController(service);

router.get('/stats', controller.getStats);

export default router;
