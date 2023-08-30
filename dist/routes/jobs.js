"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jobs_1 = require("../controllers/jobs");
const testUser_1 = require("../middleware/testUser");
const router = (0, express_1.Router)();
router.route('/').get(jobs_1.getAllJobs).post(testUser_1.isTestUser, jobs_1.createJob);
router.route('/stats').get(jobs_1.showStats);
router
    .route('/:id')
    .get(jobs_1.getJob)
    .delete(testUser_1.isTestUser, jobs_1.deleteJob)
    .patch(testUser_1.isTestUser, jobs_1.updateJob);
exports.default = router;
