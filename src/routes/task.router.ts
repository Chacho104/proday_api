import { Router } from "express";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";

const taskRouter = Router();

// GET /tasks
taskRouter.get("/tasks", getAllTasks);

// GET /tasks/:taskId
taskRouter.get("/tasks/:taskId", getTaskById);

// POST /tasks
taskRouter.post('/tasks', createTask)

// PUT /tasks/:taskId
taskRouter.put("/tasks/:taskId", updateTask);

// DELETE /tasks/:taskId
taskRouter.delete("/tasks/:taskId", deleteTask);

export default taskRouter;
