// Register all routes for sub-tasks and their related controller call back functions
import { Router } from "express";
import { checkSchema } from "express-validator";

import checkAuth from "../../middleware/check-auth";
import { subTaskValidationSchema } from "../../lib/validationSchemas";
import {
  createSubTask,
  deleteSubTask,
  getAllSubTasks,
  getSubTaskDetails,
  updateSubTask,
} from "../../controllers/tasks/sub-tasks";

const subTasksRouter = Router();

// Register auth middleware to protect all the routes below, cannot be accessed without authentication
subTasksRouter.use(checkAuth);

// CRUD Endpoints for sub-tasks: these manage sub-tasks under a specific parent task

// POST /api/tasks/:taskId/sub-tasks
subTasksRouter.post(
  "/api/tasks/:taskId/sub-tasks",
  checkSchema(subTaskValidationSchema),
  createSubTask
); // Create a new sub-task under the given task

// GET /api/tasks/:taskId/sub-tasks
subTasksRouter.get("/api/tasks/:taskId/sub-tasks", getAllSubTasks); // Get all sub-tasks for a specific task

// GET /api/tasks/:taskId/sub-tasks/:subTaskId
subTasksRouter.get(
  "/api/tasks/:taskId/sub-tasks/:subTaskId",
  getSubTaskDetails
); // Get details of a specific sub-task

// PATCH /api/tasks/:taskId/sub-tasks/:subTaskId
subTasksRouter.patch(
  "/api/tasks/:taskId/sub-tasks/:subTaskId",
  checkSchema(subTaskValidationSchema),
  updateSubTask
); // Update a sub-task (e.g title, completion status)

// DELETE /api/tasks/:taskId/sub-tasks/:subTaskId
subTasksRouter.delete("/api/tasks/:taskId/sub-tasks/:subTaskId", deleteSubTask);

export default subTasksRouter;
