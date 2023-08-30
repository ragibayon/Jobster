import {Router} from 'express';
import {login, register, updateUser} from '../controllers/auth';
import {authenticateUser} from '../middleware/authentication';
import {isTestUser} from '../middleware/testUser';
const rateLimiter = require('express-rate-limit');

const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: {
    msg: 'Too many request from this IP, please try again after 15 minutes.',
  },
});

const router = Router();

router.route('/register').post(apiLimiter, register);
router.route('/login').post(apiLimiter, login);
router.route('/updateUser').patch(authenticateUser, isTestUser, updateUser);
export default router;
