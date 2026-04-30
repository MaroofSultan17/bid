import { Router } from 'express';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';
import { AssignService } from './assign.service';
import { UserRepository } from '../users/user.repository';
import { BidRepository } from '../bids/bid.repository';
import { validate } from '../../core/middleware/validate';
import {
    TaskCreateRequestSchema,
    TaskStatusUpdateRequestSchema,
    TaskAssignRequestSchema,
} from './task.types';
import { sseManager } from '../../core/sse/sse.manager';
import bidRoutes from '../bids/bid.routes';
import db from '../../core/db/knex';

const router = Router();
const taskRepo = new TaskRepository(db);
const userRepo = new UserRepository(db);
const bidRepo = new BidRepository(db);

const taskService = new TaskService(taskRepo);
const assignService = new AssignService(db, taskRepo, bidRepo, userRepo);
const controller = new TaskController(taskService, assignService);

router.post('/', validate(TaskCreateRequestSchema), controller.createTask);
router.get('/', controller.getTasks);
router.get('/:id', controller.getTask);
router.patch('/:id/status', validate(TaskStatusUpdateRequestSchema), controller.advanceStatus);
router.post('/:id/assign', validate(TaskAssignRequestSchema), controller.assignTask);

router.get('/:id/events', (req, res) => {
    sseManager.subscribe(req.params.id, res);
});

router.use('/:id/bids', bidRoutes);

export default router;
