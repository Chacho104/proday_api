import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../models/http-error";
import { PrismaClient } from "@prisma/client";
import { matchedData, validationResult } from "express-validator";

const prisma = new PrismaClient();

// Create a task
export const createTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore since we know there's a userId from decoded token and this route is protected by checkAuth middleware
  const userId = req.userData.userId;

  // Validate user id - not necessary since this route is protected, but doesn't hurt
  if (!userId) {
    const error = new HttpError(
      "Authentication is required to create task.",
      401
    );
    return next(error);
  }

  // Extract and validate data coming in through the request body
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const error = new HttpError(
      "Tried to create a task with invalid inputs. Please try again!",
      400
    );
    return next(error);
  }

  const data = matchedData(req);

  const { title, urgency, importance, dueDate, type } = data;

  let newTask;

  try {
    newTask = await prisma.task.create({
      data: {
        userId,
        title,
        urgency,
        importance,
        dueDate,
        type,
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not create the task, please try again!",
      500
    );
    return next(error);
  }

  res.status(201).json({ data: newTask });
};

// Get All Tasks
export const getAllTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore since we know there's a userId from decoded token and this route is protected by checkAuth middleware
  const userId = req.userData.userId;

  // Validate user id - not necessary since this route is protected, but doesn't hurt
  if (!userId) {
    const error = new HttpError(
      "Authentication is required to access this resource.",
      401
    );
    return next(error);
  }

  // Access query parameters for pagination
  const page = Number(req.query.page) || 1; // Default to page 1
  const pageSize = Number(req.query.pageSize) || 5; // Default to 5 items per page

  // Get count of all tasks
  let totalCount;
  try {
    totalCount = await prisma.task.count({ where: { userId: userId } });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later.",
      500
    );
    return next(error);
  }

  // Get count of completed tasks
  let completedCount;
  try {
    completedCount = await prisma.task.count({
      where: { userId: userId, completed: true },
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later.",
      500
    );
    return next(error);
  }

  // Get tasks based on pagination params passed in
  let tasks;
  try {
    tasks = await prisma.task.findMany({
      take: pageSize,
      skip: (page - 1) * pageSize,
      orderBy: { createdAt: "desc" },
      include: { subTasks: { include: { subTaskItems: true } } },
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later.",
      500
    );
    return next(error);
  }

  if (!tasks) {
    const error = new HttpError("Could not fetch tasks!", 400);
    return next(error);
  }

  res.status(200).json({
    tasks: tasks,
    total: totalCount,
    completed: completedCount,
  });
};

// Get details of a selected task using the taskId
export const getTaskDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore since we know there's a userId from decoded token and this route is protected by checkAuth middleware
  const userId = req.userData.userId;

  // Validate user id - not necessary since this route is protected, but doesn't hurt
  if (!userId) {
    const error = new HttpError(
      "Authentication is required to access this resource.",
      401
    );
    return next(error);
  }

  const taskId = req.params.taskId;

  // Validate existence of taskId
  if (!taskId) {
    const error = new HttpError(
      "Task id is required to access this resource.",
      400
    );
    return next(error);
  }

  let task;
  try {
    task = await prisma.task.findUnique({
      where: { id: taskId, userId: userId },
    });
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find the task!",
      500
    );
    return next(error);
  }

  if (!task) {
    const error = new HttpError(
      "Could not find the task for the provided task id!",
      404
    );
    return next(error);
  }

  res.status(200).json({ data: task });
};

// Update a task
export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore since we know there's a userId from decoded token and this route is protected by checkAuth middleware
  const userId = req.userData.userId;

  // Validate user id - not necessary since this route is protected, but doesn't hurt
  if (!userId) {
    const error = new HttpError(
      "Authentication is required to update task.",
      401
    );
    return next(error);
  }

  const taskId = req.params.taskId;

  // Validate existence of taskId
  if (!taskId) {
    const error = new HttpError("Task id is required to update task.", 400);
    return next(error);
  }

  // Extract and validate data coming in through the request body
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const error = new HttpError(
      "Tried to create a task with invalid inputs. Please try again!",
      400
    );
    return next(error);
  }

  const data = matchedData(req);

  const { title, urgency, importance, dueDate, type, completed } = data;

  try {
    await prisma.task.update({
      where: { id: taskId, userId },
      data: {
        title,
        urgency,
        importance,
        dueDate,
        type,
        completed,
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not update the task, please try again!",
      500
    );
    return next(error);
  }
  res.status(200).json({ message: "Task successfully updated!" });
};

// Delete a task
export const deleteTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore since we know there's a userId from decoded token and this route is protected by checkAuth middleware
  const userId = req.userData.userId;

  // Validate user id - not necessary since this route is protected, but doesn't hurt
  if (!userId) {
    const error = new HttpError(
      "Authentication is required to delete task.",
      401
    );
    return next(error);
  }

  const taskId = req.params.taskId;

  // Validate existence of taskId
  if (!taskId) {
    const error = new HttpError("Task id is required to delete task.", 400);
    return next(error);
  }

  try {
    await prisma.task.delete({ where: { id: taskId, userId } });
  } catch (err) {
    const error = new HttpError(
      "Could not delete the task, please try again!",
      500
    );
    return next(error);
  }
  res.status(200).json({ message: "Task successfully deleted!" });
};
