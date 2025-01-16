// Register all routes for task items and their related controller call back functions
import { Router } from "express";
import checkAuth from "../../middleware/check-auth";
import {
  createSubTaskItem,
  deleteSubTaskItem,
  getAllSubTaskItems,
  getSubTaskItemDetails,
  updateSubTaskItem,
} from "../../controllers/tasks/sub-task-items";
import { checkSchema } from "express-validator";
import { taskItemValidationSchema } from "../../lib/validationSchemas";

const taskItemsRouter = Router();

// Register auth middleware to protect all the routes below, cannot be accessed without authentication
taskItemsRouter.use(checkAuth);

// CRUD Endpoints for sub-task items: these manage items under a specific sub-task

// POST /api/tasks/:subTaskId/items
taskItemsRouter.post(
  "/api/tasks/:subTaskId/items",
  checkSchema(taskItemValidationSchema),
  createSubTaskItem
); // Add an item to a specific sub-task

// GET /api/tasks/:subTaskId/items
taskItemsRouter.get("/api/tasks/:subTaskId/items", getAllSubTaskItems); // Get all items for a specific sub-task

// GET /api/tasks/:subTaskId/items/:itemId
taskItemsRouter.get(
  "/api/tasks/:subTaskId/items/:itemId",
  getSubTaskItemDetails
); // Get details of specific sub-task item

// PATCH /api/tasks/:subTaskId/items/:itemId
taskItemsRouter.patch(
  "/api/tasks/:subTaskId/items/:itemId",
  checkSchema(taskItemValidationSchema),
  updateSubTaskItem
); // Update a sub-task item's details or completion status

// DELETE /api/tasks/:subTaskId/items/:itemId
taskItemsRouter.delete(
  "/api/tasks/:subTaskId/items/:itemId",
  deleteSubTaskItem
); // Delete a specific sub-task item

export default taskItemsRouter;
