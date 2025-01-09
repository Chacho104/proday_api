// Register all routes for task items and their related controller call back functions
import { Router } from "express";
import checkAuth from "../../middleware/check-auth";
import {
  createTaskItem,
  deleteTaskItem,
  getAllTaskItems,
  getTaskItemDetails,
  updateTaskItem,
} from "../../controllers/tasks/task-items";
import { checkSchema } from "express-validator";
import { taskItemValidationSchema } from "../../lib/validationSchemas";

const taskItemsRouter = Router();

// Register auth middleware to protect all the routes below, cannot be accessed without authentication
taskItemsRouter.use(checkAuth);

// CRUD Endpoints for task items: these manage items under a specific task or sub-task

// POST /api/tasks/:parentId/items
taskItemsRouter.post(
  "/api/tasks/:parentId/items",
  checkSchema(taskItemValidationSchema),
  createTaskItem
); // Add an item to a specific task or sub-task

// GET /api/tasks/:parentId/items
taskItemsRouter.get("/api/tasks/:parentId/items", getAllTaskItems); // Get all items for a specific task or sub-task

// GET /api/tasks/:parentId/items/:itemId
taskItemsRouter.get("/api/tasks/:parentId/items/:itemId", getTaskItemDetails); // Get details of specific task item

// PATCH /api/tasks/:parentId/items/:itemId
taskItemsRouter.patch(
  "/api/tasks/:parentId/items/:itemId",
  checkSchema(taskItemValidationSchema),
  updateTaskItem
); // Update a task item's details or completion status

// DELETE /api/tasks/:parentId/items/:itemId
taskItemsRouter.delete("/api/tasks/:parentId/items/:itemId", deleteTaskItem); // Delete a specific task item

export default taskItemsRouter;
