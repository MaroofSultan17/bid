import { Router } from 'express';
import { BidController } from './bid.controller';
import { BidService } from './bid.service';
import { BidRepository } from './bid.repository';
import { validate } from '../../core/middleware/validate';
import { BidCreateRequestSchema } from './bid.types';
import db from '../../core/db/knex';

const router = Router({ mergeParams: true });
const repository = new BidRepository(db);
const service = new BidService(repository);
const controller = new BidController(service);

router.post('/', validate(BidCreateRequestSchema), controller.createBid);
router.get('/', controller.getBidsForTask);

export default router;
