import {Document} from 'mongoose';

export interface IUser extends Document {
  name: string;
  lastName: string;
  location: string;
  email: string;
  password: string;
  createJWT: () => string;
  comparePassword: (candidatePassword: string) => boolean;
}
