import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../models/http-error";
import { matchedData, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a sub-task for a specific parent task using parentTaskId
export const createSubTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  //@ts-ignore
  const userId = req.userData.userId;
  if (!userId) {
    const error = new HttpError(
      "Authentication is required to create a sub-task.",
      401
    );
    return next(error);
  }

  const parentTaskId = req.params.taskId;

  if (!parentTaskId) {
    const error = new HttpError(
      "You are trying to create a sub-task without a parent task. Please create a task instead!",
      400
    );
    return next(error);
  }

  // Confirm a parent task with provided parentTaskId exists before creating sub-task
  // Just so we don't create a sub-task with a non-existing parent task
  let existingParentTask;
  try {
    existingParentTask = await prisma.task.findUnique({
      where: { id: parentTaskId, userId },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not create the sub-task. Please try again!",
      500
    );
    return next(error);
  }

  if (!existingParentTask) {
    const error = new HttpError(
      "Could not create a sub-task without a valid parent task!",
      400
    );
    return next(error);
  }

  // Now we can try create the sub-task
  // Use express-validator to validate/sanitize user input
  const result = validationResult(req);

  if (!result.isEmpty()) {
    const error = new HttpError(
      "Tried to create a sub-task with invalid inputs. Please try again!",
      400
    );
    return next(error);
  }

  const data = matchedData(req);

  const { title } = data;

  let newSubTask;

  try {
    newSubTask = await prisma.subTask.create({
      data: {
        userId,
        taskId: parentTaskId,
        title,
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not create the sub-task. Please try again!",
      500
    );
    return next(error);
  }

  res.status(201).json({ data: newSubTask });
};

// Get all sub-tasks for a specific parent task using parentTaskId
export const getAllSubTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // @ts-ignore
  const userId = req.userData.userId;

  if (!userId) {
    const error = new HttpError(
      "Authentication is required to get sub-tasks",
      401
    );
    return next(error);
  }

  const parentTaskId = req.params.taskId;

  if (!parentTaskId) {
    const error = new HttpError(
      "Tried to get sub-tasks for an unknown parent task!",
      400
    );
    return next(error);
  }

  let subTasks;

  try {
    subTasks = await prisma.subTask.findMany({
      where: { userId, taskId: parentTaskId },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not fetch sub-tasks. Please try again!",
      500
    );
    return next(error);
  }

  res.status(200).json({ data: subTasks });
};

// Get details of a selcted sub-task using the parentTaskId and subTaskId

export const getSubTaskDetails = async (
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

  const { taskId, subTaskId } = req.params;

  if (!taskId && !subTaskId) {
    const error = new HttpError(
      "Parent and child task Ids are required to perform this action!",
      400
    );
    return next(error);
  }

  let subTaskDetails;

  try {
    subTaskDetails = await prisma.subTask.findUnique({
      where: { id: subTaskId, userId, taskId },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not fetch sub-task. Please try again!",
      500
    );
    return next(error);
  }

  res.status(200).json({ data: subTaskDetails });
};

// Update a sub-task (use subTaskId as id and taskId as parentTaskId)

export const updateSubTask = async (
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

  const { taskId, subTaskId } = req.params;

  if (!taskId && !subTaskId) {
    const error = new HttpError(
      "Parent and child task Ids are required to perform this action!",
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

  const { title, completed } = data;

  try {
    await prisma.subTask.update({
      where: { id: subTaskId, userId, taskId },
      data: {
        title,
        completed,
      },
    });

    // Logic for auto updating the completion status of a task
    // based on completion status of sub-tasks below it

    // Get sub-tasks under the task with the given id
    const siblingSubTasks = await prisma.subTask.findMany({
      where: { taskId },
      include: { subTaskItems: true },
    });

    // Check if sub-tasks and task items are complete

    const allSiblingSubTasksComplete = siblingSubTasks.every(
      (task) =>
        task.completed === true &&
        task.subTaskItems.every((item) => item.completed === true)
    );

    // If all sub-tasks and task items are complete, mark task as complete
    if (allSiblingSubTasksComplete) {
      await prisma.task.update({
        where: { id: taskId, userId },
        data: { completed: allSiblingSubTasksComplete },
      });
    } else {
      await prisma.task.update({
        where: { id: taskId, userId },
        data: { completed: false },
      });
    }
  } catch (err) {
    const error = new HttpError(
      "Could not update sub-task. Please try again!",
      500
    );
    return next(error);
  }

  res.status(200).json({ message: "Sub-task successfully updated!" });
};

// Delete a sub-task
export const deleteSubTask = async (
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

  const { taskId, subTaskId } = req.params;

  // Validate existence of taskId
  if (!taskId && !subTaskId) {
    const error = new HttpError(
      "Task and sub-task ids are required to delete sub-task.",
      400
    );
    return next(error);
  }

  try {
    await prisma.subTask.delete({
      where: { id: subTaskId, userId, taskId },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not delete the sub-task, please try again!",
      500
    );
    return next(error);
  }
  res.status(200).json({ message: "Sub-task successfully deleted!" });
};
