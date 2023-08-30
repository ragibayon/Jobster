"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const jobSchema = new mongoose_1.Schema({
    company: {
        type: String,
        required: [true, 'Please provide company name'],
        maxlength: 50,
    },
    position: {
        type: String,
        required: [true, 'Please provide position'],
        maxlength: 100,
    },
    status: {
        type: String,
        enum: ['interview', 'declined', 'pending'],
        default: 'pending',
    },
    jobLocation: {
        type: String,
        required: [true, 'Please provide position'],
        default: 'my city',
        maxlength: 100,
    },
    jobType: {
        type: String,
        enum: ['full-time', 'part-time', 'remote', 'internship'],
        default: 'full-time',
    },
    createdBy: {
        type: mongoose_1.Types.ObjectId,
        ref: 'User',
        required: [true, 'please provide an user'],
    },
}, { timestamps: true });
const Job = (0, mongoose_1.model)('Job', jobSchema);
exports.default = Job;
