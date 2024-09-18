import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: any;

}

export const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({message: 'No token, authorization denied'});
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({message: 'Invalid token'});
    }
};