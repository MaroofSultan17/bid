import { Router } from 'express';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { BidRepository } from './bid.repository';
import { validate } from '../../core/middleware/validate';
import { BidCreateRequestSchema } from './bid.types';
import db from '../../core/db/knex';

const router = Router();
const repository = new BidRepository(db);
const service = new BidService(repository);
const controller = new BidController(service);

router.post('/task/:taskId', validate(BidCreateRequestSchema), controller.createBid);
router.get('/task/:taskId', controller.getBidsForTask);

export default router;
