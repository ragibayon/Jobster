import {NextFunction, Request, Response} from 'express';
import {BadRequestError} from '../errors';

export const isTestUser = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.testUser) {
    throw new BadRequestError('Test user can not perform this action');
  }
  next(); // if not test user go to next middleware
};
