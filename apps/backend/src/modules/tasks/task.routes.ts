import { Router } from 'express';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskRepository } from './task.repository';
import { AssignService } from './assign.service';
import { UserRepository } from '../users/user.repository';
import { BidRepository } from '../bids/bid.repository';
import { validate } from '../../core/middleware/validate';
import { TaskCreateRequestSchema, TaskStatusUpdateRequestSchema } from './task.types';
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
router.post('/:id/assign', controller.assignTask);

export default router;
