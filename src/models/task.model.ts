// Model/service layer that interacts with the database

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get All Tasks model
export const getAllTasks = async (page: number, pageSize: number) => {
  // Get count of all and completed tasks
  const totalCount = await prisma.task.count();
  const completedCount = await prisma.task.count({
    where: { completed: true },
  });
  // Get tasks based on pagination params passed in
  const tasks = await prisma.task.findMany({
    take: pageSize,
    skip: (page - 1) * pageSize,
    orderBy: { createdAt: "desc" },
  });
  return { tasks, totalCount, completedCount };
};

// Get single task by taskId model
export const getTaskById = async (taskId: string) => {
  return await prisma.task.findUnique({ where: { id: taskId } });
};

// Create a task model
export const createTask = async (title: string, color: string) => {
  return await prisma.task.create({ data: { title, color } });
};

// Update a task model
export const updateTask = async (
  taskId: string,
  title: string,
  color: string,
  completed?: boolean
) => {
  return await prisma.task.update({
    where: { id: taskId },
    data: { title, color, completed },
  });
};

// Delete a task model
export const deleteTask = async (taskId: string) => {
  return await prisma.task.delete({ where: { id: taskId } });
};
