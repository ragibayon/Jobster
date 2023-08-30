"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const authentication_1 = require("../middleware/authentication");
const testUser_1 = require("../middleware/testUser");
const rateLimiter = require('express-rate-limit');
const apiLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        msg: 'Too many request from this IP, please try again after 15 minutes.',
    },
});
const router = (0, express_1.Router)();
router.route('/register').post(apiLimiter, auth_1.register);
router.route('/login').post(apiLimiter, auth_1.login);
router.route('/updateUser').patch(authentication_1.authenticateUser, testUser_1.isTestUser, auth_1.updateUser);
exports.default = router;
