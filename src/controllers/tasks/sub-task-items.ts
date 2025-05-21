import { NextFunction, Request, Response } from "express";
import { HttpError } from "../../models/http-error";
import { matchedData, validationResult } from "express-validator";

import { PrismaClient } from "../../../dist/generated/prisma";

const prisma = new PrismaClient();

// Create a task item for a specific task using the parentId
export const createSubTaskItem = async (
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

  const subTaskId = req.params.subTaskId;

  if (!subTaskId) {
    const error = new HttpError(
      "You are trying to create a task item without a valid parent. Please create a sub-task first!",
      400
    );
    return next(error);
  }

  // Now we can try create the sub-task item
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

  const { title } = data;

  // Confirm a sub-task with provided subTaskId exists before creating task item
  // Just so we don't create a task item for a non-existing sub-task
  let parentSubTaskExists;
  try {
    parentSubTaskExists = await prisma.subTask.findUnique({
      where: { id: subTaskId },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not create the task item. Please try again!",
      500
    );
    return next(error);
  }

  if (!parentSubTaskExists) {
    const error = new HttpError(
      "Could not create a task item without a valid sub-task!",
      400
    );
    return next(error);
  }

  let newSubTaskItem;

  try {
    newSubTaskItem = await prisma.subTaskItem.create({
      data: { title, userId, subTaskId },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not create the task item. Please try again!",
      500
    );
    console.log(err);
    return next(error);
  }

  res
    .status(201)
    .json({ message: "Success! You have created a new sub-task." });
};

// Get all task items for a specific parent task/sub-task using parent's Id
export const getAllSubTaskItems = async (
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

  const subTaskId = req.params.subTaskId;

  if (!subTaskId) {
    const error = new HttpError(
      "Tried to get sub-task items for an unknown sub-task!",
      400
    );
    return next(error);
  }

  let subTaskItems;

  try {
    subTaskItems = await prisma.subTaskItem.findMany({
      where: { userId, subTaskId },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not fetch sub-task items. Please try again!",
      500
    );
    return next(error);
  }

  res.status(200).json({ data: subTaskItems });
};

// Get details of a selcted task item using the taskId and itemId

export const getSubTaskItemDetails = async (
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

  const { subTaskId, itemId } = req.params;

  if (!subTaskId && !itemId) {
    const error = new HttpError(
      "Sub-task and sub-task item Ids are required to perform this action!",
      400
    );
    return next(error);
  }

  let subTaskItemDetails;

  try {
    subTaskItemDetails = await prisma.subTaskItem.findUnique({
      where: {
        id: itemId,
        userId,
        subTaskId,
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not fetch sub-task item. Please try again!",
      500
    );
    return next(error);
  }

  res.status(200).json({ data: subTaskItemDetails });
};

// Update a task item

export const updateSubTaskItem = async (
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

  const { subTaskId, itemId } = req.params;

  if (!subTaskId && !itemId) {
    const error = new HttpError(
      "Sub-task and sub-task item Ids are required to perform this action!",
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
    await prisma.subTaskItem.update({
      where: {
        id: itemId,
        userId,
        subTaskId,
      },
      data: {
        title,
        completed,
      },
    });

    // Logic for auto-updating a sub-task based on the completion status of sub-task items under it

    // Get all sibling sub-task items under given sub-task
    const siblingSubTaskItems = await prisma.subTaskItem.findMany({
      where: { subTaskId },
    });

    // Use the every method to check status of all sibling sub-task items
    // This method returns true if all siblings are completed, otherwise it returns false
    const allSiblingSubTaskItemsComplete = siblingSubTaskItems?.every(
      (item) => item.completed === true
    );

    // If all siblings are completed, find the parent sub-task and mark it as complete as well
    if (allSiblingSubTaskItemsComplete) {
      await prisma.subTask.update({
        where: { id: subTaskId, userId },
        data: { completed: true },
      });
    } else {
      await prisma.subTask.update({
        where: { id: subTaskId, userId },
        data: { completed: false },
      });
    }

    // Check if siblings of this sub-task are complete and complete the task
    const parentSubTask = await prisma.subTask.findUnique({
      where: { id: subTaskId },
    });

    const parentTaskId = parentSubTask?.taskId;

    const siblingSubTasks = await prisma.subTask.findMany({
      where: { taskId: parentTaskId },
    });

    const allSiblingSubTasksComplete = siblingSubTasks.every(
      (task) => task.completed === true
    );

    // If all siblings are completed, find the parent sub-task and mark it as complete as well
    if (allSiblingSubTasksComplete) {
      await prisma.task.update({
        where: { id: parentTaskId, userId },
        data: { completed: true },
      });
    } else {
      await prisma.task.update({
        where: { id: parentTaskId, userId },
        data: { completed: false },
      });
    }
  } catch (err) {
    const error = new HttpError(
      "Could not update task item. Please try again!",
      500
    );
    return next(error);
  }

  res
    .status(200)
    .json({ message: "Success! The sub-task item has been updated!" });
};

// Delete a task item
export const deleteSubTaskItem = async (
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

  const { subTaskId, itemId } = req.params;

  // Validate existence of taskId
  if (!subTaskId && !itemId) {
    const error = new HttpError(
      "Sub-task and sub-task item Ids are reuired to perform this action!",
      400
    );
    return next(error);
  }

  try {
    await prisma.subTaskItem.delete({
      where: {
        id: itemId,
        userId,
        subTaskId,
      },
    });
  } catch (err) {
    const error = new HttpError(
      "Could not delete the sub-task item, please try again!",
      500
    );
    return next(error);
  }
  res
    .status(200)
    .json({ message: "Success! The Sub-task item has been deleted!" });
};
