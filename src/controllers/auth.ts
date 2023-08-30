import {Request, Response, NextFunction} from 'express';
import {StatusCodes} from 'http-status-codes';
import User from '../models/User';
import {IAuthenticatedUser, IUser} from '../interfaces';
import {BadRequestError, UnauthenticatedError} from '../errors';

declare global {
  namespace Express {
    interface Request {
      user?: IAuthenticatedUser;
    }
  }
}

export const register = async (req: Request, res: Response) => {
  const user: IUser = await User.create({...req.body});
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({
    user: {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      location: user.location,
      token,
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const {email, password} = req.body;
  if (!email || !password) {
    throw new BadRequestError('Please provide valid email and password');
  }
  const user: IUser = await User.findOne({email: email});
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials');
  }
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  res.status(StatusCodes.OK).json({
    user: {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      location: user.location,
      token: user.createJWT(),
    },
  });
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.user);
  const {email, lastName, location, name} = req.body;

  if (!email || !lastName || !location || !name) {
    throw new BadRequestError('Please provide valid information');
  }

  if (!req.user) {
    throw new UnauthenticatedError('Authentication Failed');
  }
  const user = await User.findById(req.user.userId);

  // as this is an authenticated request we may not need to check if the user exists

  user.name = name;
  user.email = email;
  user.lastName = lastName;
  user.location = location;

  // runs the mongoose hooks
  await user.save();

  res.status(StatusCodes.CREATED).json({
    user: {
      name: user.name,
      lastName: user.lastName,
      email: user.email,
      location: user.location,
      token: user.createJWT(),
    },
  });
};
