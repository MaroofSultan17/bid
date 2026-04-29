import { Request, Response, NextFunction } from 'express';
import { BidService } from './bid.service';
import { ApiResponse, FlashMessageType } from '../../core/types';

export class BidController {
    constructor(private bidService: BidService) {}

    createBid = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bid = await this.bidService.createBid(req.params.taskId, req.body);
            const response: ApiResponse<typeof bid> = {
                status: 'success',
                data: bid,
                flash: { type: FlashMessageType.SUCCESS, text: 'Bid placed successfully' },
            };
            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    };

    getBidsForTask = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const bids = await this.bidService.getBidsForTask(req.params.taskId);
            const response: ApiResponse<typeof bids> = {
                status: 'success',
                data: bids,
            };
            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };
}
