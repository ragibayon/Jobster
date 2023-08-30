"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.login = exports.register = void 0;
const http_status_codes_1 = require("http-status-codes");
const User_1 = __importDefault(require("../models/User"));
const errors_1 = require("../errors");
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User_1.default.create(Object.assign({}, req.body));
    const token = user.createJWT();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        user: {
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            location: user.location,
            token,
        },
    });
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new errors_1.BadRequestError('Please provide valid email and password');
    }
    const user = yield User_1.default.findOne({ email: email });
    if (!user) {
        throw new errors_1.UnauthenticatedError('Invalid Credentials');
    }
    const isPasswordCorrect = yield user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new errors_1.UnauthenticatedError('Invalid Credentials');
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({
        user: {
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            location: user.location,
            token: user.createJWT(),
        },
    });
});
exports.login = login;
const updateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.user);
    const { email, lastName, location, name } = req.body;
    if (!email || !lastName || !location || !name) {
        throw new errors_1.BadRequestError('Please provide valid information');
    }
    if (!req.user) {
        throw new errors_1.UnauthenticatedError('Authentication Failed');
    }
    const user = yield User_1.default.findById(req.user.userId);
    // as this is an authenticated request we may not need to check if the user exists
    user.name = name;
    user.email = email;
    user.lastName = lastName;
    user.location = location;
    // runs the mongoose hooks
    yield user.save();
    res.status(http_status_codes_1.StatusCodes.CREATED).json({
        user: {
            name: user.name,
            lastName: user.lastName,
            email: user.email,
            location: user.location,
            token: user.createJWT(),
        },
    });
});
exports.updateUser = updateUser;
