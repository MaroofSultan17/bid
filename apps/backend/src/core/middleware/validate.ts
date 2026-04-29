import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate = (schema: AnyZodObject, source: 'body' | 'query' | 'params' = 'body') => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (source === 'body') {
                req.body = await schema.parseAsync(req.body);
            } else if (source === 'query') {
                req.query = await schema.parseAsync(req.query);
            } else if (source === 'params') {
                req.params = await schema.parseAsync(req.params);
            }
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                return next(error);
            }
            return next(error);
        }
    };
};

export const validateAll = (schema: AnyZodObject) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            req.body = parsed.body;
            req.query = parsed.query;
            req.params = parsed.params;
            return next();
        } catch (error) {
            if (error instanceof ZodError) {
                return next(error);
            }
            return next(error);
        }
    };
};
