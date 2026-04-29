import { Router } from 'express';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { validate } from '../../core/middleware/validate';
import { UserIndexRequestSchema, UserShowRequestSchema } from './user.types';
import db from '../../core/db/knex';

const router = Router();
const repository = new UserRepository(db);
const service = new UserService(repository);
const controller = new UserController(service);

router.get('/', validate(UserIndexRequestSchema, 'query'), controller.getUsers);
router.get('/:id/workload', validate(UserShowRequestSchema, 'params'), controller.getWorkload);

export default router;
