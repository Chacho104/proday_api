import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../models/http-error";
import { matchedData, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a task item for a specific task using the parentId
export const createTaskItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore
  const userId = req.userData.userId;
  if (!userId) {
    const error = new HttpError(
      "Authentication is required to create a task item.",
      401
    );
    return next(error);
  }

  const parentId = req.params.parentId;

  if (!parentId) {
    const error = new HttpError(
      "You are trying to create a task item without a valid parent. Please create a task/sub-task first!",
      400
    );
    return next(error);
  }

  // Now we can try create the sub-task
  // Use express-validator to validate/sanitize user input
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const error = new HttpError(
      "Tried to create a task item with invalid inputs. Please try again!",
      400
    );
    console.log(result.array());
    return next(error);
  }

  const data = matchedData(req);

  const { title, parentType } = data;

  // Confirm a task/sub-task with provided parentId exists before creating task item
  // Just so we don't create a task item for a non-existing task/sub-task
  let parentExists;
  try {
    if (parentType === "Task") {
      parentExists = await prisma.task.findUnique({
        where: { id: parentId },
      });
    }

    parentExists = await prisma.subTask.findUnique({ where: { id: parentId } });
  } catch (err) {
    const error = new HttpError(
      "Could not create the task item. Please try again!",
      500
    );
    return next(error);
  }

  if (!parentExists) {
    const error = new HttpError(
      "Could not create a task item without a valid task or sub-task!",
      400
    );
    return next(error);
  }

  let newTaskItem;

  try {
    if (parentType === "TASK") {
      newTaskItem = await prisma.taskItem.create({
        data: { title, userId, taskId: parentId, parentType },
      });
    }
    newTaskItem = await prisma.taskItem.create({
      data: { title, userId, subTaskId: parentId, parentType },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not create the task item. Please try again!",
      500
    );
    console.log(err);
    return next(error);
  }

  res.status(201).json({ data: newTaskItem });
};

// Get all task items for a specific parent task/sub-task using parent's Id
export const getAllTaskItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req.userData.userId;

  if (!userId) {
    const error = new HttpError(
      "Authentication is required to get task items.",
      401
    );
    return next(error);
  }

  const parentId = req.params.parentId;

  if (!parentId) {
    const error = new HttpError(
      "Tried to get task items for an unknown task/sub-task!",
      400
    );
    return next(error);
  }

  let taskItems;

  try {
    taskItems = await prisma.taskItem.findMany({
      where: { userId, OR: [{ taskId: parentId }, { subTaskId: parentId }] },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not fetch task items. Please try again!",
      500
    );
    return next(error);
  }

  res.status(200).json({ data: taskItems });
};

// Get details of a selcted task item using the taskId and itemId

export const getTaskItemDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req.userData.userId;

  if (!userId) {
    const error = new HttpError(
      "Authentication is required to get sub-task!",
      401
    );
    return next(error);
  }

  const { parentId, itemId } = req.params;

  if (!parentId && !itemId) {
    const error = new HttpError(
      "Parent and task item Ids are required to perform this action!",
      400
    );
    return next(error);
  }

  let taskItemDetails;

  try {
    taskItemDetails = await prisma.taskItem.findUnique({
      where: {
        id: itemId,
        userId,
        OR: [{ taskId: parentId }, { subTaskId: parentId }],
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not fetch task item. Please try again!",
      500
    );
    return next(error);
  }

  res.status(200).json({ data: taskItemDetails });
};

// Update a task item

export const updateTaskItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req.userData.userId;

  if (!userId) {
    const error = new HttpError(
      "Authentication is required to update sub-task!",
      401
    );
    return next(error);
  }

  const { parentId, itemId } = req.params;

  if (!parentId && !itemId) {
    const error = new HttpError(
      "Parent and task item Ids are required to perform this action!",
      400
    );
    return next(error);
  }

  // Use express-validator to validate/sanitize user input
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const error = new HttpError(
      "Tried to update a sub-task with invalid inputs. Please try again!",
      400
    );
    return next(error);
  }

  const data = matchedData(req);

  const { title, completed, parentType } = data;

  try {
    await prisma.taskItem.update({
      where: {
        id: itemId,
        userId,
        OR: [{ taskId: parentId }, { subTaskId: parentId }],
      },
      data: {
        title,
        completed,
        parentType,
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not update task item. Please try again!",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Task item successfully updated!" });
};

// Delete a task item
export const deleteTaskItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore
  const userId = req.userData.userId;

  // Validate user id - not necessary since this route is protected, but doesn't hurt
  if (!userId) {
    const error = new HttpError(
      "Authentication is required to delete sub-task.",
      401
    );
    return next(error);
  }

  const { parentId, itemId } = req.params;

  // Validate existence of taskId
  if (!parentId && !itemId) {
    const error = new HttpError(
      "Task and task item Ids are reuired to perform this action!",
      400
    );
    return next(error);
  }

  try {
    await prisma.taskItem.delete({
      where: {
        id: itemId,
        userId,
        OR: [{ taskId: parentId, subTaskId: parentId }],
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not delete the task item, please try again!",
      500
    );
    return next(error);
  }
  res.status(200).json({ message: "Task item successfully deleted!" });
};
