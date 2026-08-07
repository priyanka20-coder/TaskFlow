import express from 'express';
const router = express.Router();
import {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    toggleTask,
    getStats,
} from '../controller/taskController.js';
import protect from '../middleware/authMiddleware.js';
router.use(protect);
router.get('/stats', getStats);
router.route('/').get(getTasks).post(createTask);
router.route('/:id').get(getTask).put(updateTask).delete(deleteTask);
router.patch('/:id/toggle', toggleTask);
export default router;