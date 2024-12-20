import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";

const taskClient = new PrismaClient().task;

// Get All Tasks
export const getAllTasks = async (req: Request, res: Response) => {
  try {
    // Access query parameters for pagination
    const page = Number(req.query.page) || 1; // Default to page 1
    const pageSize = Number(req.query.pageSize) || 5; // Default to 5 items per page

    // Fetch total count of tasks
    const totalCount = await taskClient.count();

    // Fetch total count of completed tasks
    const completedCount = await taskClient.count({
      where: { completed: true },
    });

    // Fetch tasks with pagination
    const allTasks = await taskClient.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: {
        createdAt: "desc", // Order tasks by date of creation
      },
    });
    res
      .status(200)
      .json({ tasks: allTasks, total: totalCount, completed: completedCount });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get single task by taskId
export const getTaskById = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.taskId;
    const task = await taskClient.findUnique({
      where: {
        id: taskId,
      },
    });
    res.status(200).json({ data: task });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Create a task
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Extract and validate data coming in through the request body
    const { title, color } = req.body;

    if (!title || typeof title !== "string") {
      res
        .status(400)
        .json({ error: "Title is required and must be a string." });
      return;
    }

    if (!color || typeof color !== "string") {
      res
        .status(400)
        .json({ error: "Color is required and must be a string." });
      return;
    }

    const task = await taskClient.create({
      data: { title, color },
    });

    res.status(201).json({ data: task });
  } catch (error: any) {
    next(error); // Pass the error to the error-handling middleware
  }
};

// Update a task
export const updateTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.taskId;
    // Extract and validate data coming in through the request body
    const { title, color, completed } = req.body;
    if (!title || typeof title !== "string") {
      res
        .status(400)
        .json({ error: "Title is required and must be a string." });
      return;
    }

    if (!color || typeof color !== "string") {
      res
        .status(400)
        .json({ error: "Color is required and must be a string." });
      return;
    }
    const task = await taskClient.update({
      where: {
        id: taskId,
      },
      data: {
        title,
        color,
        completed,
      },
    });
    res.status(200).json({ data: task });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a task
export const deleteTask = async (req: Request, res: Response) => {
  try {
    const taskId = req.params.taskId;
    const task = await taskClient.delete({
      where: {
        id: taskId,
      },
    });
    res.status(200).json({ data: {} });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
