import {Request, Response, NextFunction} from 'express';
import {ZodSchema, ZodError, z} from 'zod';

export const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({error: error.errors});
            } else {
                res.status(500).json({error: 'An unexpected error occurred'});
            }
        }
    };
};

export const userSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(8),
});

export const taskSchema = z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    status: z.enum(['to-do', 'in progress', 'blocked', 'done']),
    assignedTo: z.string().length(24).optional(),
    finishedBy: z.date().optional(),
});