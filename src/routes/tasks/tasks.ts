// Register all routes for tasks and their related controller call backs
import { Router } from "express";
import { checkSchema } from "express-validator";

import checkAuth from "../../middleware/check-auth";
import {
  createTask,
  deleteTask,
  getAllTasks,
  getTaskDetails,
  updateTask,
} from "../../controllers/tasks/tasks";
import { taskValidationSchema } from "../../lib/validationSchemas";

const tasksRouter = Router();

// Register middleware to protect all the routes below, cannot be accessed without authentication
tasksRouter.use(checkAuth);

// CRUD Endpoints for tasks: these handle top-level tasks

// POST /api/tasks
tasksRouter.post("/api/tasks", checkSchema(taskValidationSchema), createTask);

// GET /api/tasks
tasksRouter.get("/api/tasks", getAllTasks);

// GET /api/tasks/:taskId
tasksRouter.get("/api/tasks/:taskId", getTaskDetails);

// PATCH /api/tasks/:taskId
tasksRouter.patch(
  "/api/tasks/:taskId",
  checkSchema(taskValidationSchema),
  updateTask
);

// DELETE /api/tasks/:taskId
tasksRouter.delete("/api/tasks/:taskId", deleteTask);

export default tasksRouter;
