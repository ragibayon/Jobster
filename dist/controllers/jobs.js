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
exports.showStats = exports.deleteJob = exports.updateJob = exports.createJob = exports.getJob = exports.getAllJobs = void 0;
const Job_1 = __importDefault(require("../models/Job"));
const mongoose_1 = require("mongoose");
const moment_1 = __importDefault(require("moment"));
const http_status_codes_1 = require("http-status-codes");
const errors_1 = require("../errors");
const getAllJobs = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    // jobs?status=all&jobType=all&sort=latest&page=1
    const { status, jobType, sort, search } = req.query;
    let queryObj = { createdBy: req.user.userId };
    if (status && status !== 'all') {
        queryObj.status = status;
    }
    if (status && jobType !== 'all') {
        queryObj.jobType = jobType;
    }
    if (search) {
        queryObj.position = {
            $regex: search.toString(),
            $options: 'i',
        };
    }
    let jobQuery = Job_1.default.find(queryObj);
    let sortStr;
    if (sort === 'latest') {
        sortStr = '-createdAt';
    }
    if (sort === 'oldest') {
        sortStr = 'createdAt';
    }
    if (sort === 'a-z') {
        sortStr = 'position';
    }
    if (sort === 'z-a') {
        sortStr = '-position';
    }
    jobQuery = jobQuery.sort(sortStr);
    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    jobQuery = jobQuery.skip(skip).limit(limit);
    const jobs = yield jobQuery;
    const totalJobs = yield Job_1.default.countDocuments(queryObj);
    const numOfPages = Math.ceil(totalJobs / limit);
    res.status(http_status_codes_1.StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
});
exports.getAllJobs = getAllJobs;
const getJob = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const jobId = req.params.id;
    const job = yield Job_1.default.findOne({ _id: jobId, createdBy: req.user.userId });
    if (!job) {
        throw new errors_1.NotFoundError(`No Job found with id ${jobId}`);
    }
    res.status(http_status_codes_1.StatusCodes.OK).json({ job });
});
exports.getJob = getJob;
const createJob = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { company, position } = req.body;
    if (!company || !position) {
        throw new errors_1.BadRequestError('Please provide company and position');
    }
    const newJob = {
        company,
        position,
        createdBy: req.user.userId,
    };
    const job = yield Job_1.default.create(newJob);
    res.status(http_status_codes_1.StatusCodes.CREATED).json({ job });
});
exports.createJob = createJob;
const updateJob = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const jobId = req.params.id;
    const { company, position } = req.body;
    if (company === '' || position == '') {
        throw new errors_1.BadRequestError('Please provide valid company or position');
    }
    const job = yield Job_1.default.findOneAndUpdate({
        _id: jobId,
        createdBy: req.user.userId,
    }, Object.assign({}, req.body), {
        runValidators: true,
        new: true,
    });
    if (!job) {
        throw new errors_1.NotFoundError(`No Job found with id ${jobId}`);
    }
    res.status(http_status_codes_1.StatusCodes.CREATED).json({ job });
});
exports.updateJob = updateJob;
const deleteJob = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const jobId = req.params.id;
    const userId = req.user.userId;
    const job = yield Job_1.default.findByIdAndRemove({ _id: jobId, createdBy: userId });
    if (!job) {
        throw new errors_1.NotFoundError(`No Job found with id ${jobId}`);
    }
    res.sendStatus(http_status_codes_1.StatusCodes.NO_CONTENT);
});
exports.deleteJob = deleteJob;
const showStats = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const stats = yield Job_1.default.aggregate([
        { $match: { createdBy: mongoose_1.Types.ObjectId(req.user.userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } }, // group based on status and count total types
    ]);
    const reducedStats = stats.reduce((acc, curr) => {
        const { _id: title, count } = curr;
        acc[title] = count;
        return acc;
    }, {});
    const defaultStats = {
        pending: reducedStats.pending || 0,
        interview: reducedStats.interview || 0,
        declined: reducedStats.declined || 0,
    };
    const monthlyApplicationsAgg = yield Job_1.default.aggregate([
        {
            $match: { createdBy: mongoose_1.Types.ObjectId(req.user.userId) },
        },
        {
            $group: {
                _id: {
                    year: { $year: '$createdAt' },
                    month: { $month: '$createdAt' },
                },
                count: { $sum: 1 },
            },
        },
        {
            $sort: {
                '_id.year': -1,
                '_id.month': -1,
            },
        },
        {
            $limit: 6,
        },
    ]);
    const monthlyApplications = monthlyApplicationsAgg
        .map((item) => {
        const { _id: { year, month }, count, } = item;
        const date = (0, moment_1.default)()
            .month(month - 1)
            .year(year)
            .format('MMM Y');
        return { date, count };
    })
        .reverse();
    console.log(monthlyApplications);
    console.log(reducedStats);
    res.status(http_status_codes_1.StatusCodes.OK).json({
        defaultStats,
        monthlyApplications,
    });
});
exports.showStats = showStats;
