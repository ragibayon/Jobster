import {Router} from 'express';
import {
  getAllJobs,
  createJob,
  getJob,
  deleteJob,
  updateJob,
  showStats,
} from '../controllers/jobs';
import {isTestUser} from '../middleware/testUser';

const router = Router();

router.route('/').get(getAllJobs).post(isTestUser, createJob);
router.route('/stats').get(showStats);
router
  .route('/:id')
  .get(getJob)
  .delete(isTestUser, deleteJob)
  .patch(isTestUser, updateJob);

export default router;
