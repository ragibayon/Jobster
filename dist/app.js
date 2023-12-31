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
// import required packages
const express_1 = __importDefault(require("express"));
require('dotenv').config();
require('express-async-errors');
const jobs_1 = __importDefault(require("./routes/jobs"));
const auth_1 = __importDefault(require("./routes/auth"));
const connect_1 = __importDefault(require("./db/connect"));
const helmet_1 = __importDefault(require("helmet"));
const xss = require('xss-clean');
const path = require('path');
// error handler
const not_found_1 = __importDefault(require("./middleware/not-found"));
const error_handler_1 = __importDefault(require("./middleware/error-handler"));
// auth middleware
const authentication_1 = require("./middleware/authentication");
const app = (0, express_1.default)();
// api limiter
app.set('trust proxy', 1);
// serving frontend
app.use(express_1.default.static(path.resolve(__dirname, '../client/build')));
// parser
app.use(express_1.default.json());
// express security
app.use((0, helmet_1.default)());
app.use(xss());
// routes
app.use('/api/v1/auth', auth_1.default);
app.use('/api/v1/jobs', authentication_1.authenticateUser, jobs_1.default);
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});
app.use(not_found_1.default);
app.use(error_handler_1.default);
const port = process.env.PORT || 3000;
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, connect_1.default)(process.env.MONGODB_URI);
        app.listen(port, () => console.log(`Server is listening on port ${port}...`));
    }
    catch (error) {
        console.log(error);
    }
});
start();
