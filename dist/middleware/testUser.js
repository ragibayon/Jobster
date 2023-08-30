"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTestUser = void 0;
const errors_1 = require("../errors");
const isTestUser = (req, res, next) => {
    var _a;
    if ((_a = req.user) === null || _a === void 0 ? void 0 : _a.testUser) {
        throw new errors_1.BadRequestError('Test user can not perform this action');
    }
    next(); // if not test user go to next middleware
};
exports.isTestUser = isTestUser;
